import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCached, setCache, clearCache } from '@/lib/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const DEMO_USER_EMAIL = 'demo@humain-uno.dev'

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

// GET /api/agents/[id] - Get single agent with relations
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cacheKey = `agents:${id}`
    const cached = getCached<any>(cacheKey)
    if (cached) return NextResponse.json(cached)

    const agent = await db.agent.findUnique({
      where: { id },
      include: {
        category: true,
        creator: {
          select: { id: true, name: true, email: true, image: true, role: true, bio: true },
        },
        parent: {
          select: { id: true, name: true, description: true },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        _count: {
          select: { starredBy: true, comments: true, children: true },
        },
      },
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Check access: if private, only creator can see
    if (agent.privacy === 'PRIVATE') {
      const userId = await getUserId()
      if (userId !== agent.creatorId) {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        )
      }
    }

    const parsed = {
      ...agent,
      tags: JSON.parse(agent.tags || '[]'),
    }

    setCache(cacheKey, parsed)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[agents/[id] GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    )
  }
}

// PUT /api/agents/[id] - Update agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check ownership
    const existing = await db.agent.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const userId = await getUserId()
    if (!userId || userId !== existing.creatorId) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only edit your own agents' },
        { status: 403 }
      )
    }

    // Build update data
    const updateData: any = {}
    const allowedFields = [
      'name', 'description', 'categoryId', 'readme', 'code',
      'framework', 'llm', 'industry', 'difficulty', 'language', 'privacy',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Handle tags separately (JSON stringify)
    if (body.tags !== undefined) {
      updateData.tags = JSON.stringify(body.tags)
    }

    const agent = await db.agent.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        creator: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
    })

    // Clear caches
    clearCache('agents:')
    clearCache('stats:')

    const parsed = {
      ...agent,
      tags: JSON.parse(agent.tags || '[]'),
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[agents/[id] PUT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    )
  }
}

// DELETE /api/agents/[id] - Delete agent
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check ownership
    const existing = await db.agent.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const userId = await getUserId()
    if (!userId || userId !== existing.creatorId) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only delete your own agents' },
        { status: 403 }
      )
    }

    await db.agent.delete({ where: { id } })

    // Clear caches
    clearCache('agents:')
    clearCache('stats:')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[agents/[id] DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    )
  }
}
