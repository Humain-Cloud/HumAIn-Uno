import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/llm-models/sync — Sync models from Arena.ai leaderboard
export async function POST() {
  const startTime = Date.now()
  const syncLog = {
    source: 'arena.ai',
    syncType: 'full' as const,
    status: 'success' as string,
    modelsAdded: 0,
    modelsUpdated: 0,
    modelsRemoved: 0,
    errors: [] as string[],
  }

  try {
    // Use z-ai-web-dev-sdk to fetch the Arena.ai leaderboard
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const result = await zai.functions.invoke('page_reader', {
      url: 'https://arena.ai/leaderboard/',
    })

    if (!result?.data?.html) {
      throw new Error('Failed to fetch Arena.ai leaderboard page')
    }

    const html = result.data.html

    // Extract RSC push chunks containing leaderboard data
    const scriptRegex = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g
    let match
    let allEntries: any[] = []
    let allInitialModels: any[] = []
    let allArenaSlugs: string[] = []

    while ((match = scriptRegex.exec(html)) !== null) {
      const chunk = match[1]
      if (!chunk.includes('modelDisplayName') && !chunk.includes('initialModels')) continue

      let decoded: string
      try {
        decoded = chunk.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      } catch {
        decoded = chunk
      }

      // Extract model entries
      const entryPattern = /\{"rank":(\d+),"rankUpper":(\d+),"rankLower":(\d+),"modelKey":"([^"]+)","modelDisplayName":"([^"]+)","rating":([\d.]+),"ratingUpper":[\d.]+,"ratingLower":[\d.]+,"votes":(\d+),"modelOrganization":"([^"]*)","modelUrl":"([^"]*)","license":"([^"]*)","inputPricePerMillion":([^,]*),"outputPricePerMillion":([^,]*),"contextLength":([^,}]*),"pricePerImage":([^,]*),"pricePerSecond":([^,]*),"releaseType":([^}]*)\}/g

      let entryMatch
      while ((entryMatch = entryPattern.exec(decoded)) !== null) {
        const [, rank, , , key, name, rating, votes, org, url, license, inpP, outP, ctx, imgP, secP, relType] = entryMatch
        allEntries.push({
          rank: parseInt(rank),
          key,
          name,
          rating: parseFloat(rating),
          votes: parseInt(votes),
          organization: org,
          url: url || null,
          license: license || 'Unknown',
          inputPricePerMillion: inpP === 'null' ? null : parseFloat(inpP),
          outputPricePerMillion: outP === 'null' ? null : parseFloat(outP),
          contextLength: ctx === 'null' ? null : parseInt(ctx),
          pricePerImage: imgP === 'null' ? null : parseFloat(imgP),
          pricePerSecond: secP === 'null' ? null : parseFloat(secP),
          releaseType: relType === 'null' ? null : relType,
        })
      }

      // Extract arena slugs
      const arenaPattern = /"arenaSlug":"([^"]+)"/g
      let arenaMatch
      while ((arenaMatch = arenaPattern.exec(decoded)) !== null) {
        if (!allArenaSlugs.includes(arenaMatch[1])) {
          allArenaSlugs.push(arenaMatch[1])
        }
      }

      // Extract initial models for capabilities
      if (decoded.includes('"initialModels"')) {
        try {
          const idx = decoded.indexOf('"initialModels"')
          const arrStart = decoded.indexOf('[', idx)
          let depth = 0
          let arrEnd = arrStart
          for (let j = arrStart; j < Math.min(arrStart + 500000, decoded.length); j++) {
            if (decoded[j] === '[') depth++
            else if (decoded[j] === ']') {
              depth--
              if (depth === 0) { arrEnd = j + 1; break }
            }
          }
          const modelsArr = JSON.parse(decoded.substring(arrStart, arrEnd))
          allInitialModels = modelsArr
        } catch (e) {
          syncLog.errors.push(`Failed to parse initialModels: ${e}`)
        }
      }
    }

    // Build capabilities map from initialModels
    const capabilitiesMap: Record<string, { input: string[]; output: string[]; userSelectable: boolean; provider: string }> = {}
    for (const m of allInitialModels) {
      const pname = m.publicName || m.name || ''
      const caps = m.capabilities || {}
      const inp = caps.inputCapabilities || {}
      const out = caps.outputCapabilities || {}

      const inputTypes: string[] = []
      const outputTypes: string[] = []
      for (const [k, v] of Object.entries(inp)) {
        if (v && v !== false) inputTypes.push(k)
      }
      for (const [k, v] of Object.entries(out)) {
        if (v && v !== false) outputTypes.push(k)
      }

      capabilitiesMap[pname] = {
        input: inputTypes,
        output: outputTypes,
        userSelectable: m.userSelectable || false,
        provider: m.provider || '',
      }
    }

    // Group entries by model key to consolidate arena categories
    const modelMap = new Map<string, {
      key: string
      name: string
      organization: string
      url: string | null
      license: string
      inputPricePerMillion: number | null
      outputPricePerMillion: number | null
      contextLength: number | null
      pricePerImage: number | null
      pricePerSecond: number | null
      releaseType: string | null
      bestRank: number
      bestRating: number
      totalVotes: number
      arenaCategories: Set<string>
      categoryRankings: Record<string, { rank: number; rating: number; votes: number }>
    }>()

    for (const entry of allEntries) {
      const existing = modelMap.get(entry.key)
      if (!existing) {
        modelMap.set(entry.key, {
          ...entry,
          totalVotes: entry.votes,
          arenaCategories: new Set<string>(),
          categoryRankings: {},
        })
      } else {
        if (entry.rank < existing.bestRank) existing.bestRank = entry.rank
        if (entry.rating > existing.bestRating) existing.bestRating = entry.rating
        existing.totalVotes += entry.votes
      }
    }

    // We need to map entries to their arena categories
    // Re-parse to find which arena each entry belongs to
    // Since we can't easily map entries to their parent arena from regex,
    // we'll use a heuristic: match by model key in the decoded string context

    // For now, we'll assign arenas based on capabilities
    for (const [key, model] of modelMap) {
      const caps = capabilitiesMap[key] || capabilitiesMap[model.name] || { input: [], output: [], userSelectable: false, provider: '' }

      // Assign arena categories based on capabilities
      if (caps.output.includes('text')) {
        model.arenaCategories.add('text')
      }
      if (caps.input.includes('image') && caps.output.includes('text')) {
        model.arenaCategories.add('vision')
      }
      if (caps.input.includes('file') && caps.output.includes('text')) {
        model.arenaCategories.add('document')
      }
      if (caps.output.includes('image')) {
        model.arenaCategories.add('text-to-image')
        if (caps.input.includes('image')) {
          model.arenaCategories.add('image-edit')
        }
      }
      if (caps.output.includes('video')) {
        model.arenaCategories.add('text-to-video')
      }
      if (caps.output.includes('search')) {
        model.arenaCategories.add('search')
      }
      if (caps.output.includes('web')) {
        model.arenaCategories.add('code')
      }
    }

    // Also check arena slugs from the parsed data to assign based on the entry's position
    // Use a simpler approach: assign all known arenas based on what's available
    const ARENA_MAP: Record<string, string[]> = {
      text: ['text'],
      code: ['code'],
      vision: ['vision'],
      document: ['document'],
      'text-to-image': ['text-to-image'],
      'image-edit': ['image-edit'],
      'text-to-video': ['text-to-video'],
      search: ['search'],
    }

    // Derive use-case tags from capabilities and rankings
    function deriveUseCaseTags(model: typeof modelMap extends Map<string, infer V> ? V : never, caps: { input: string[]; output: string[] }): string[] {
      const tags: string[] = []
      const cats = model.arenaCategories

      if (cats.has('text') || caps.output.includes('text')) tags.push('chat')
      if (cats.has('code')) tags.push('coding')
      if (model.bestRank <= 10) tags.push('top-rated')
      if (model.outputPricePerMillion !== null && model.outputPricePerMillion <= 2) tags.push('budget-friendly')
      if (model.contextLength && model.contextLength >= 128000) tags.push('long-context')
      if (caps.input.includes('image')) tags.push('vision')
      if (caps.output.includes('image')) tags.push('image-gen')
      if (caps.output.includes('video')) tags.push('video-gen')
      if (caps.output.includes('web')) tags.push('web-dev')
      if (caps.input.includes('file')) tags.push('document-analysis')
      if (caps.output.includes('search')) tags.push('search')
      if (model.bestRating >= 1500) tags.push('high-accuracy')
      if (model.license === 'MIT' || model.license === 'Apache 2.0') tags.push('open-source')

      return [...new Set(tags)]
    }

    // Upsert models into database
    for (const [key, model] of modelMap) {
      const caps = capabilitiesMap[key] || capabilitiesMap[model.name] || { input: [], output: [], userSelectable: false, provider: '' }
      const useCaseTags = deriveUseCaseTags(model, caps)

      const existing = await db.lLMModel.findUnique({ where: { arenaKey: key } })

      const data = {
        name: model.name,
        organization: model.organization,
        provider: caps.provider || null,
        license: model.license,
        modelUrl: model.url,
        bestRank: model.bestRank,
        bestRating: model.bestRating,
        totalVotes: model.totalVotes,
        inputPricePerMillion: model.inputPricePerMillion,
        outputPricePerMillion: model.outputPricePerMillion,
        contextLength: model.contextLength,
        pricePerImage: model.pricePerImage,
        pricePerSecond: model.pricePerSecond,
        inputCapabilities: JSON.stringify(caps.input.reduce((acc, k) => ({ ...acc, [k]: true }), {})),
        outputCapabilities: JSON.stringify(caps.output.reduce((acc, k) => ({ ...acc, [k]: true }), {})),
        arenaCategories: JSON.stringify([...model.arenaCategories]),
        categoryRankings: JSON.stringify(model.categoryRankings),
        useCaseTags: JSON.stringify(useCaseTags),
        userSelectable: caps.userSelectable,
        releaseType: model.releaseType,
        lastSyncedAt: new Date(),
      }

      if (existing) {
        await db.lLMModel.update({ where: { arenaKey: key }, data })
        syncLog.modelsUpdated++
      } else {
        await db.lLMModel.create({ data: { arenaKey: key, ...data } })
        syncLog.modelsAdded++
      }
    }

    syncLog.status = 'success'
  } catch (error: any) {
    syncLog.status = 'failed'
    syncLog.errors.push(error.message || String(error))
  }

  // Log sync result
  await db.modelSyncLog.create({
    data: {
      ...syncLog,
      errors: JSON.stringify(syncLog.errors),
      completedAt: new Date(),
      duration: Date.now() - startTime,
    },
  })

  return NextResponse.json(syncLog)
}
