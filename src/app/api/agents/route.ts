import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCached, setCache, clearCache } from '@/lib/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Default demo user ID
const DEMO_USER_EMAIL = 'demo@humain-uno.dev'

async function getOrCreateDemoUser() {
  let user = await db.user.findUnique({ where: { email: DEMO_USER_EMAIL } })
  if (!user) {
    user = await db.user.create({
      data: { email: DEMO_USER_EMAIL, name: 'Demo User', role: 'user' },
    })
  }
  return user
}

async function getUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user) {
      return (session.user as any).id
    }
  } catch {
    // No session
  }
  return null
}

// GET /api/agents - List public agents with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const privacy = searchParams.get('privacy') || 'PUBLIC'
    const creatorId = searchParams.get('creatorId') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
    const framework = searchParams.get('framework') || ''
    const industry = searchParams.get('industry') || ''
    const category = searchParams.get('category') || ''
    const q = searchParams.get('q') || ''

    const cacheKey = `agents:list:${privacy}:${creatorId}:${sort}:${page}:${pageSize}:${framework}:${industry}:${category}:${q}`
    const cached = getCached<any>(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Build where conditions
    const where: any = { AND: [] }

    if (privacy) {
      where.AND.push({ privacy })
    }

    if (creatorId) {
      where.AND.push({ creatorId })
    }

    if (framework) {
      where.AND.push({ framework: { contains: framework } })
    }

    if (industry) {
      where.AND.push({ industry: { contains: industry } })
    }

    if (category) {
      where.AND.push({ categoryId: category })
    }

    if (q) {
      where.AND.push({
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { tags: { contains: q } },
        ],
      })
    }

    if (where.AND.length === 0) delete where.AND

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'popular') orderBy = { stars: 'desc' }
    if (sort === 'most-starred') orderBy = { stars: 'desc' }

    const [total, data] = await Promise.all([
      db.agent.count({ where }),
      db.agent.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        include: {
          category: true,
          creator: {
            select: { id: true, name: true, email: true, image: true, role: true },
          },
          _count: {
            select: { starredBy: true, comments: true },
          },
        },
      }),
    ])

    // Parse JSON string fields
    const parsed = data.map((agent) => ({
      ...agent,
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
    console.error('[agents GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to list agents' },
      { status: 500 }
    )
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      categoryId,
      readme,
      code,
      tags,
      framework,
      llm,
      industry,
      difficulty,
      language,
      privacy,
      source,
      parentId,
    } = body

    // Validate required fields
    if (!name || !description || !categoryId || !readme) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, categoryId, readme' },
        { status: 400 }
      )
    }

    // Get user ID from session or use demo user
    let userId = await getUserId()
    if (!userId) {
      const demoUser = await getOrCreateDemoUser()
      userId = demoUser.id
    }

    // Verify category exists
    const category = await db.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      )
    }

    const agent = await db.agent.create({
      data: {
        name,
        description,
        categoryId,
        creatorId: userId,
        readme,
        code: code || null,
        tags: JSON.stringify(tags || []),
        framework: framework || null,
        llm: llm || null,
        industry: industry || null,
        difficulty: difficulty || null,
        language: language || null,
        privacy: privacy || 'PRIVATE',
        source: source || 'scratch',
        parentId: parentId || null,
      },
      include: {
        category: true,
        creator: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
    })

    // Clear agent caches
    clearCache('agents:')

    const parsed = {
      ...agent,
      tags: JSON.parse(agent.tags || '[]'),
    }

    return NextResponse.json(parsed, { status: 201 })
  } catch (error) {
    console.error('[agents POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}
