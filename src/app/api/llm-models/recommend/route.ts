import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Use-case mapping: maps user-facing categories to arena categories + capability requirements
const USE_CASE_MAP: Record<string, {
  label: string
  description: string
  icon: string
  arenaCategories: string[]
  requiredCapabilities: { input?: string[]; output?: string[] }
  priceWeight: 'low' | 'mid' | 'any'
  extraFilter?: (m: { name: string; useCaseTags: string[] }) => boolean
}> = {
  'general-chat': {
    label: 'Text & Chat',
    description: 'Everyday conversations, answering questions, explanations',
    icon: '💬',
    arenaCategories: ['text'],
    requiredCapabilities: { output: ['text'] },
    priceWeight: 'low',
  },
  'coding': {
    label: 'Coding',
    description: 'Code generation, debugging, code review, architecture',
    icon: '💻',
    arenaCategories: ['code'],
    requiredCapabilities: { input: ['text'], output: ['text'] },
    priceWeight: 'mid',
  },
  'vision': {
    label: 'Vision',
    description: 'Image analysis, OCR, visual Q&A, diagram reading',
    icon: '👁️',
    arenaCategories: ['vision'],
    requiredCapabilities: { input: ['image'], output: ['text'] },
    priceWeight: 'mid',
  },
  'image-generation': {
    label: 'Image Generation',
    description: 'Creating and editing images from text descriptions',
    icon: '🎨',
    arenaCategories: ['text-to-image', 'image-edit'],
    requiredCapabilities: { output: ['image'] },
    priceWeight: 'any',
  },
  'video': {
    label: 'Video',
    description: 'Creating videos from text, images, or other videos',
    icon: '🎬',
    arenaCategories: ['text-to-video', 'image-to-video', 'video-to-video'],
    requiredCapabilities: { output: ['video'] },
    priceWeight: 'any',
  },
  'math-reasoning': {
    label: 'Math & Reasoning',
    description: 'Math, logic puzzles, scientific analysis, deep thinking',
    icon: '🧠',
    arenaCategories: ['text'],
    requiredCapabilities: { input: ['text'], output: ['text'] },
    priceWeight: 'mid',
    extraFilter: (m) =>
      m.name.toLowerCase().includes('thinking') ||
      m.useCaseTags.includes('high-accuracy'),
  },
  'creative-writing': {
    label: 'Creative Writing',
    description: 'Stories, poetry, marketing copy, content creation',
    icon: '✍️',
    arenaCategories: ['text'],
    requiredCapabilities: { input: ['text'], output: ['text'] },
    priceWeight: 'low',
    extraFilter: (m) => m.useCaseTags.includes('chat'),
  },
  // Legacy use cases kept for backward compatibility with Find Your Model tab
  'reasoning': {
    label: 'Complex Reasoning',
    description: 'Math, logic puzzles, scientific analysis, deep thinking',
    icon: '🧠',
    arenaCategories: ['text'],
    requiredCapabilities: { input: ['text'], output: ['text'] },
    priceWeight: 'mid',
  },
  'document-analysis': {
    label: 'Document Analysis',
    description: 'PDFs, reports, long-form content analysis and summarization',
    icon: '📄',
    arenaCategories: ['document'],
    requiredCapabilities: { input: ['text', 'file'], output: ['text'] },
    priceWeight: 'mid',
  },
  'image-editing': {
    label: 'Image Editing',
    description: 'Modifying existing images, inpainting, style transfer',
    icon: '🖼️',
    arenaCategories: ['image-edit'],
    requiredCapabilities: { input: ['image'], output: ['image'] },
    priceWeight: 'any',
  },
  'web-development': {
    label: 'Web Development',
    description: 'Building websites, frontend, fullstack applications',
    icon: '🌐',
    arenaCategories: ['code'],
    requiredCapabilities: { input: ['text'], output: ['text', 'web'] },
    priceWeight: 'mid',
  },
  'research': {
    label: 'Research & Search',
    description: 'Information retrieval, fact-checking, web search',
    icon: '🔍',
    arenaCategories: ['search'],
    requiredCapabilities: { output: ['search'] },
    priceWeight: 'low',
  },
  'agent-tasks': {
    label: 'Agentic Tasks',
    description: 'Autonomous task execution, tool use, multi-step workflows',
    icon: '🤖',
    arenaCategories: ['text', 'code'],
    requiredCapabilities: { input: ['text'], output: ['text'] },
    priceWeight: 'mid',
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { useCase, budget, priorities } = body as {
      useCase?: string
      budget?: 'free' | 'low' | 'mid' | 'high' | 'any'
      priorities?: ('accuracy' | 'speed' | 'cost' | 'context')[]
    }

    if (!useCase || !USE_CASE_MAP[useCase]) {
      return NextResponse.json(
        { error: 'Invalid use case', availableUseCases: Object.entries(USE_CASE_MAP).map(([k, v]) => ({ id: k, ...v })) },
        { status: 400 }
      )
    }

    const useCaseConfig = USE_CASE_MAP[useCase]
    const budgetMax = budget === 'free' ? 0 : budget === 'low' ? 5 : budget === 'mid' ? 25 : budget === 'high' ? 100 : Infinity
    const prio = priorities || ['accuracy']

    // Fetch all models that match the arena categories
    const models = await db.lLMModel.findMany()

    // Score and rank models for this use case
    const scored = models
      .map(m => {
        let score = 0
        const cats: string[] = JSON.parse(m.arenaCategories || '[]')
        const inpCaps: string[] = Object.keys(JSON.parse(m.inputCapabilities || '{}'))
        const outCaps: string[] = Object.keys(JSON.parse(m.outputCapabilities || '{}'))
        const rankings: Record<string, any> = JSON.parse(m.categoryRankings || '{}')
        const tags: string[] = JSON.parse(m.useCaseTags || '[]')

        // Arena category match (most important)
        const arenaMatch = useCaseConfig.arenaCategories.filter(c => cats.includes(c)).length
        score += arenaMatch * 30

        // Capability match
        const requiredInput = useCaseConfig.requiredCapabilities.input || []
        const requiredOutput = useCaseConfig.requiredCapabilities.output || []
        const inputMatch = requiredInput.filter(c => inpCaps.includes(c)).length
        const outputMatch = requiredOutput.filter(c => outCaps.includes(c)).length
        const totalRequired = requiredInput.length + requiredOutput.length
        if (totalRequired > 0) {
          score += ((inputMatch + outputMatch) / totalRequired) * 25
        }

        // Rating-based scoring (normalized)
        if (m.bestRating > 0) {
          score += (m.bestRating / 1700) * 20 // max rating ~1700
        }

        // Priority-based scoring
        if (prio.includes('accuracy') && m.bestRank <= 10) score += 10
        if (prio.includes('speed') && m.outputPricePerMillion !== null && m.outputPricePerMillion <= 5) score += 8
        if (prio.includes('cost') && m.outputPricePerMillion !== null && m.outputPricePerMillion <= 2) score += 10
        if (prio.includes('context') && m.contextLength && m.contextLength >= 128000) score += 8

        // Budget filter
        const withinBudget = budget === 'any' ||
          (budget === 'free' && m.outputPricePerMillion === null) ||
          (m.outputPricePerMillion !== null && m.outputPricePerMillion <= budgetMax)

        // Extra filter (for math-reasoning, creative-writing, etc.)
        const passesExtraFilter = useCaseConfig.extraFilter
          ? useCaseConfig.extraFilter({ name: m.name, useCaseTags: tags })
          : true

        // Calculate specific ranking for this use case's arena
        let specificRank: number | null = null
        let specificRating: number | null = null
        for (const arena of useCaseConfig.arenaCategories) {
          const rankData = rankings[arena]
          if (rankData) {
            specificRank = specificRank === null ? rankData.rank : Math.min(specificRank, rankData.rank)
            specificRating = specificRating === null ? rankData.rating : Math.max(specificRating, rankData.rating)
          }
        }

        return {
          id: m.id,
          name: m.name,
          organization: m.organization,
          arenaKey: m.arenaKey,
          license: m.license,
          bestRating: m.bestRating,
          bestRank: m.bestRank,
          totalVotes: m.totalVotes,
          inputPricePerMillion: m.inputPricePerMillion,
          outputPricePerMillion: m.outputPricePerMillion,
          contextLength: m.contextLength,
          inputCapabilities: inpCaps,
          outputCapabilities: outCaps,
          arenaCategories: cats,
          useCaseTags: tags,
          specificRank,
          specificRating,
          score,
          withinBudget,
          passesExtraFilter,
        }
      })
      .filter(m => m.withinBudget && m.passesExtraFilter && m.score > 10) // Only show relevant models
      .sort((a, b) => b.score - a.score)

    // Take top 20 recommendations
    const recommendations = scored.slice(0, 20).map(({ passesExtraFilter, ...rest }) => rest)

    return NextResponse.json({
      useCase: { id: useCase, ...useCaseConfig },
      budget,
      priorities: prio,
      totalMatched: scored.length,
      recommendations,
    })
  } catch (error) {
    console.error('[LLM Models Recommend API] Error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}

// GET /api/llm-models/recommend — Get available use cases
export async function GET() {
  return NextResponse.json({
    useCases: Object.entries(USE_CASE_MAP).map(([id, v]) => ({
      id,
      label: v.label,
      description: v.description,
      icon: v.icon,
    })),
  })
}
