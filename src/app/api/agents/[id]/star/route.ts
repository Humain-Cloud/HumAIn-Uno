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

// POST /api/agents/[id]/star - Toggle star/unstar
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Check if already starred
    const existingStar = await db.star.findUnique({
      where: {
        userId_agentId: { userId, agentId: id },
      },
    })

    if (existingStar) {
      // Unstar
      await db.star.delete({
        where: { id: existingStar.id },
      })

      // Decrement star count
      const updated = await db.agent.update({
        where: { id },
        data: { stars: { decrement: 1 } },
      })

      clearCache('agents:')
      clearCache('stats:')

      return NextResponse.json({
        starred: false,
        stars: updated.stars,
      })
    } else {
      // Star
      await db.star.create({
        data: { userId, agentId: id },
      })

      // Increment star count
      const updated = await db.agent.update({
        where: { id },
        data: { stars: { increment: 1 } },
      })

      clearCache('agents:')
      clearCache('stats:')

      return NextResponse.json({
        starred: true,
        stars: updated.stars,
      })
    }
  } catch (error) {
    console.error('[agents/[id]/star] Error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle star' },
      { status: 500 }
    )
  }
}
