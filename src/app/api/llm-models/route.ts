import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// User-facing category → filter logic mapping
const CATEGORY_FILTERS: Record<string, {
  arenaCategories?: string[]
  outputCapabilities?: string[]
  inputCapabilities?: string[]
  excludeOutputCapabilities?: string[]
  nameContains?: string
  useCaseTags?: string[]
}> = {
  'text-chat': {
    arenaCategories: ['text'],
    outputCapabilities: ['text'],
  },
  'coding': {
    arenaCategories: ['code'],
  },
  'vision': {
    arenaCategories: ['vision'],
    excludeOutputCapabilities: ['image'],
  },
  'image-generation': {
    arenaCategories: ['text-to-image', 'image-edit'],
    outputCapabilities: ['image'],
  },
  'video': {
    arenaCategories: ['text-to-video', 'image-to-video', 'video-to-video'],
    outputCapabilities: ['video'],
  },
  'math-reasoning': {
    arenaCategories: ['text'],
    nameContains: 'thinking',
    useCaseTags: ['high-accuracy'],
  },
  'creative-writing': {
    arenaCategories: ['text'],
    useCaseTags: ['chat'],
  },
}

// GET /api/llm-models — List models with filtering, sorting, pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))

    // Filters
    const search = searchParams.get('search')?.trim()
    const organization = searchParams.get('organization')?.trim()
    const license = searchParams.get('license')?.trim()
    const arena = searchParams.get('arena')?.trim() // arena category: text, code, vision, etc.
    const category = searchParams.get('category')?.trim() // user-facing category: text-chat, coding, vision, etc.
    const useCase = searchParams.get('useCase')?.trim() // coding, reasoning, creative, etc.
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const capability = searchParams.get('capability')?.trim() // text, image, video, etc.
    const userSelectable = searchParams.get('userSelectable') === 'true' ? true : undefined

    // Sorting
    const sort = searchParams.get('sort') || 'rating' // rating, rank, price-asc, price-desc, votes, name, newest
    const order = searchParams.get('order') || 'desc' // asc, desc

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { organization: { contains: search } },
        { arenaKey: { contains: search } },
      ]
    }

    if (organization) {
      const orgs = organization.split(',').map(o => o.trim()).filter(Boolean)
      if (orgs.length === 1) {
        where.organization = orgs[0]
      } else {
        where.organization = { in: orgs }
      }
    }

    if (license) {
      const licenses = license.split(',').map(l => l.trim()).filter(Boolean)
      if (licenses.length === 1) {
        where.license = licenses[0]
      } else {
        where.license = { in: licenses }
      }
    }

    if (arena) {
      where.arenaCategories = { contains: arena }
    }

    if (useCase) {
      where.useCaseTags = { contains: useCase }
    }

    if (minRating !== undefined) {
      where.bestRating = { ...where.bestRating, gte: minRating }
    }

    if (maxPrice !== undefined) {
      // Filter models where output price is <= maxPrice OR is null (free/unknown)
      where.OR = [
        { outputPricePerMillion: { lte: maxPrice } },
        { outputPricePerMillion: null },
      ]
    }

    if (capability) {
      // Capability can be in input or output
      const capConditions: any[] = [
        { inputCapabilities: { contains: capability } },
        { outputCapabilities: { contains: capability } },
      ]
      if (where.OR) {
        // Combine with AND
        where.AND = [...(where.AND || []), { OR: capConditions }]
      } else {
        where.OR = capConditions
      }
    }

    if (userSelectable !== undefined) {
      where.userSelectable = userSelectable
    }

    // Category filter — this is the new user-facing category filter
    // Since it requires complex JSON field logic, we handle it in post-processing
    const categoryFilter = category && CATEGORY_FILTERS[category] ? CATEGORY_FILTERS[category] : null

    // Build orderBy
    let orderBy: any = {}
    switch (sort) {
      case 'rating':
        orderBy = { bestRating: order === 'asc' ? 'asc' : 'desc' }
        break
      case 'rank':
        orderBy = { bestRank: order === 'desc' ? 'asc' : 'desc' } // lower rank = better
        break
      case 'price-asc':
        orderBy = { outputPricePerMillion: 'asc' }
        break
      case 'price-desc':
        orderBy = { outputPricePerMillion: 'desc' }
        break
      case 'votes':
        orderBy = { totalVotes: order === 'asc' ? 'asc' : 'desc' }
        break
      case 'name':
        orderBy = { name: order === 'desc' ? 'desc' : 'asc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      default:
        orderBy = { bestRating: 'desc' }
    }

    // If we have a category filter, we need to fetch more models and filter in-memory
    // since Prisma can't easily query JSON array contents with OR logic
    let fetchPageSize = pageSize
    let fetchPage = page
    if (categoryFilter) {
      // Fetch all models when category filtering is needed (JSON field filtering is in-memory)
      fetchPageSize = 1000
      fetchPage = 1
    }

    let models = await db.lLMModel.findMany({
      where,
      orderBy,
      skip: (fetchPage - 1) * fetchPageSize,
      take: fetchPageSize,
    })

    // Parse JSON fields
    let parsed = models.map(m => ({
      ...m,
      inputCapabilities: JSON.parse(m.inputCapabilities || '{}'),
      outputCapabilities: JSON.parse(m.outputCapabilities || '{}'),
      arenaCategories: JSON.parse(m.arenaCategories || '[]'),
      categoryRankings: JSON.parse(m.categoryRankings || '{}'),
      useCaseTags: JSON.parse(m.useCaseTags || '[]'),
    }))

    // Apply category filter in-memory
    if (categoryFilter) {
      const cf = categoryFilter
      parsed = parsed.filter(m => {
        const cats: string[] = m.arenaCategories
        const inpCaps: string[] = Object.keys(m.inputCapabilities || {})
        const outCaps: string[] = Object.keys(m.outputCapabilities || {})
        const tags: string[] = m.useCaseTags
        const nameLower = m.name.toLowerCase()

        // Must match at least one arena category
        if (cf.arenaCategories && cf.arenaCategories.length > 0) {
          const hasArenaMatch = cf.arenaCategories.some(c => cats.includes(c))
          if (!hasArenaMatch) return false
        }

        // Must have required output capabilities (at least one)
        if (cf.outputCapabilities && cf.outputCapabilities.length > 0) {
          const hasOutputMatch = cf.outputCapabilities.some(c => outCaps.includes(c))
          if (!hasOutputMatch) return false
        }

        // Must have required input capabilities (at least one)
        if (cf.inputCapabilities && cf.inputCapabilities.length > 0) {
          const hasInputMatch = cf.inputCapabilities.some(c => inpCaps.includes(c))
          if (!hasInputMatch) return false
        }

        // Must NOT have excluded output capabilities
        if (cf.excludeOutputCapabilities && cf.excludeOutputCapabilities.length > 0) {
          const hasExcludedOutput = cf.excludeOutputCapabilities.some(c => outCaps.includes(c))
          if (hasExcludedOutput) return false
        }

        // Name contains check (for math-reasoning: "thinking" models)
        if (cf.nameContains) {
          const hasNameMatch = nameLower.includes(cf.nameContains.toLowerCase())
          const hasTagMatch = cf.useCaseTags ? cf.useCaseTags.some(t => tags.includes(t)) : false
          // For categories with both nameContains and useCaseTags, match EITHER
          if (cf.useCaseTags && cf.useCaseTags.length > 0) {
            if (!hasNameMatch && !hasTagMatch) return false
          } else {
            if (!hasNameMatch) return false
          }
        } else if (cf.useCaseTags && cf.useCaseTags.length > 0) {
          // Must have at least one use case tag
          const hasTagMatch = cf.useCaseTags.some(t => tags.includes(t))
          if (!hasTagMatch) return false
        }

        return true
      })

      // Apply pagination on the filtered results
      const totalFiltered = parsed.length
      const start = (page - 1) * pageSize
      const pagedResults = parsed.slice(start, start + pageSize)

      return NextResponse.json({
        models: pagedResults,
        pagination: {
          page,
          pageSize,
          total: totalFiltered,
          totalPages: Math.ceil(totalFiltered / pageSize),
        },
      })
    }

    const total = await db.lLMModel.count({ where })

    return NextResponse.json({
      models: parsed,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('[LLM Models API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}
