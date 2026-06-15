import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    const [models, total] = await Promise.all([
      db.lLMModel.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.lLMModel.count({ where }),
    ])

    // Parse JSON fields for each model
    const parsed = models.map(m => ({
      ...m,
      inputCapabilities: JSON.parse(m.inputCapabilities || '{}'),
      outputCapabilities: JSON.parse(m.outputCapabilities || '{}'),
      arenaCategories: JSON.parse(m.arenaCategories || '[]'),
      categoryRankings: JSON.parse(m.categoryRankings || '{}'),
      useCaseTags: JSON.parse(m.useCaseTags || '[]'),
    }))

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
