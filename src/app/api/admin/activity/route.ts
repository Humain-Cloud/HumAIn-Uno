import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/activity - Generate synthetic activity log from data
export async function GET() {
  try {
    const activities: Array<{
      id: string
      type: string
      description: string
      timestamp: string
      icon: string
    }> = []

    // 1. Recent knowledge agent creations
    const recentKBAgents = await db.knowledgeAgent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, framework: true, createdAt: true },
    })

    for (const agent of recentKBAgents) {
      activities.push({
        id: `kb-${agent.id}`,
        type: 'agent_created',
        description: `Knowledge agent "${agent.name}" added${agent.framework ? ` (${agent.framework})` : ''}`,
        timestamp: agent.createdAt.toISOString(),
        icon: 'Bot',
      })
    }

    // 2. Recent user agent creations
    const recentUserAgents = await db.agent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, framework: true, createdAt: true, creator: { select: { name: true } } },
    })

    for (const agent of recentUserAgents) {
      activities.push({
        id: `ua-${agent.id}`,
        type: 'agent_created',
        description: `User agent "${agent.name}" created by ${agent.creator?.name || 'unknown'}${agent.framework ? ` using ${agent.framework}` : ''}`,
        timestamp: agent.createdAt.toISOString(),
        icon: 'Users',
      })
    }

    // 3. Featured agents
    const featuredAgents = await db.knowledgeAgent.findMany({
      where: { featured: true },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      select: { id: true, name: true, updatedAt: true },
    })

    for (const agent of featuredAgents) {
      activities.push({
        id: `feat-${agent.id}`,
        type: 'agent_featured',
        description: `"${agent.name}" was featured`,
        timestamp: agent.updatedAt.toISOString(),
        icon: 'Star',
      })
    }

    // 4. Simulated system events
    const now = new Date()
    const systemEvents = [
      {
        id: 'sys-index-1',
        type: 'knowledge_indexed',
        description: 'Knowledge base indexed — 105 agents processed',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        icon: 'Database',
      },
      {
        id: 'sys-deploy-1',
        type: 'system',
        description: 'Platform deployed successfully (v2.1.0)',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        icon: 'Rocket',
      },
      {
        id: 'sys-user-1',
        type: 'user_signed_up',
        description: 'New user registered (admin@humain-uno.dev)',
        timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        icon: 'UserPlus',
      },
      {
        id: 'sys-index-2',
        type: 'knowledge_indexed',
        description: 'Knowledge base re-indexed — 3 new agents found',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        icon: 'Database',
      },
      {
        id: 'sys-backup-1',
        type: 'system',
        description: 'Database backup completed',
        timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
        icon: 'HardDrive',
      },
    ]

    activities.push(...systemEvents)

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('[admin/activity] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity log' },
      { status: 500 }
    )
  }
}
