import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clearCache } from '@/lib/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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

// GET /api/agents/[id]/comments - List comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))

    // Verify agent exists
    const agent = await db.agent.findUnique({ where: { id } })
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    const [total, comments] = await Promise.all([
      db.comment.count({ where: { agentId: id } }),
      db.comment.findMany({
        where: { agentId: id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      }),
    ])

    return NextResponse.json({
      data: comments,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    })
  } catch (error) {
    console.error('[agents/[id]/comments GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to list comments' },
      { status: 500 }
    )
  }
}

// POST /api/agents/[id]/comments - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Verify agent exists
    const agent = await db.agent.findUnique({ where: { id } })
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Get user ID
    let userId = await getUserId()
    if (!userId) {
      const demoUser = await getOrCreateDemoUser()
      userId = demoUser.id
    }

    const comment = await db.comment.create({
      data: {
        content: content.trim(),
        userId,
        agentId: id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    clearCache('agents:')

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('[agents/[id]/comments POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}
