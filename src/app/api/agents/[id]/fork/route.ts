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

// POST /api/agents/[id]/fork - Fork an agent
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find the original agent
    const original = await db.agent.findUnique({
      where: { id },
      include: {
        category: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    if (!original) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Can't fork private agents (unless you own them)
    if (original.privacy === 'PRIVATE') {
      const userId = await getUserId()
      if (userId !== original.creatorId) {
        return NextResponse.json(
          { error: 'Cannot fork a private agent' },
          { status: 403 }
        )
      }
    }

    // Get user ID
    let userId = await getUserId()
    if (!userId) {
      const demoUser = await getOrCreateDemoUser()
      userId = demoUser.id
    }

    // Can't fork your own agent
    if (userId === original.creatorId) {
      return NextResponse.json(
        { error: 'You cannot fork your own agent' },
        { status: 400 }
      )
    }

    // Create the forked agent
    const forked = await db.agent.create({
      data: {
        name: `${original.name} (Fork)`,
        description: original.description,
        categoryId: original.categoryId,
        creatorId: userId,
        readme: original.readme,
        code: original.code,
        tags: original.tags, // Already a JSON string
        framework: original.framework,
        llm: original.llm,
        industry: original.industry,
        difficulty: original.difficulty,
        language: original.language,
        privacy: 'PRIVATE',
        source: 'fork',
        parentId: original.id,
      },
      include: {
        category: true,
        creator: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        parent: {
          select: { id: true, name: true, description: true },
        },
      },
    })

    // Clear caches
    clearCache('agents:')
    clearCache('stats:')

    const parsed = {
      ...forked,
      tags: JSON.parse(forked.tags || '[]'),
    }

    return NextResponse.json(parsed, { status: 201 })
  } catch (error) {
    console.error('[agents/[id]/fork] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fork agent' },
      { status: 500 }
    )
  }
}
