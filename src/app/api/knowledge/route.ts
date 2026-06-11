import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCached, setCache } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const framework = searchParams.get('framework') || ''
    const industry = searchParams.get('industry') || ''
    const category = searchParams.get('category') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))

    const cacheKey = `knowledge:list:${q}:${framework}:${industry}:${category}:${page}:${pageSize}`
    const cached = getCached<any>(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Build where conditions
    const where: any = { AND: [] }

    if (q) {
      where.AND.push({
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { tags: { contains: q } },
        ],
      })
    }

    if (framework) {
      where.AND.push({ framework: { contains: framework } })
    }

    if (industry) {
      where.AND.push({ industry: { contains: industry } })
    }

    if (category) {
      where.AND.push({ category: { contains: category } })
    }

    if (where.AND.length === 0) delete where.AND

    const [total, data] = await Promise.all([
      db.knowledgeAgent.count({ where }),
      db.knowledgeAgent.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
        // Don't include heavy readme/codeSnippet for list view
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          tools: true,
          models: true,
          repoPath: true,
          framework: true,
          llm: true,
          industry: true,
          difficulty: true,
          language: true,
          tags: true,
          author: true,
          isCurated: true,
          sourceUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ])

    // Parse JSON string fields
    const parsed = data.map((agent) => ({
      ...agent,
      tools: JSON.parse(agent.tools || '[]'),
      models: JSON.parse(agent.models || '[]'),
      tags: JSON.parse(agent.tags || '[]'),
    }))

    const result = {
      data: parsed,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    }

    setCache(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[knowledge] Error:', error)
    return NextResponse.json(
      { error: 'Failed to list knowledge agents' },
      { status: 500 }
    )
  }
}
