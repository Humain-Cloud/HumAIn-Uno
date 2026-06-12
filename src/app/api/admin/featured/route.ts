import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/featured - Get featured agents (top 6)
export async function GET() {
  try {
    // First, get explicitly featured agents
    const featuredAgents = await db.knowledgeAgent.findMany({
      where: { featured: true },
      orderBy: { name: 'asc' },
      take: 6,
    })

    // If fewer than 6 featured, fill with top agents by recency
    if (featuredAgents.length < 6) {
      const remaining = 6 - featuredAgents.length
      const featuredIds = featuredAgents.map(a => a.id)
      const additionalAgents = await db.knowledgeAgent.findMany({
        where: {
          id: { notIn: featuredIds },
          framework: { not: null },
        },
        orderBy: { createdAt: 'desc' },
        take: remaining,
      })
      featuredAgents.push(...additionalAgents)
    }

    return NextResponse.json({ agents: featuredAgents })
  } catch (error) {
    console.error('[admin/featured] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured agents' },
      { status: 500 }
    )
  }
}

// POST /api/admin/featured - Toggle featured status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, featured } = body as { agentId: string; featured: boolean }

    if (!agentId || typeof featured !== 'boolean') {
      return NextResponse.json(
        { error: 'agentId and featured (boolean) are required' },
        { status: 400 }
      )
    }

    // Check max 6 featured
    if (featured) {
      const currentFeaturedCount = await db.knowledgeAgent.count({
        where: { featured: true },
      })
      if (currentFeaturedCount >= 6) {
        return NextResponse.json(
          { error: 'Maximum 6 featured agents allowed. Remove one first.' },
          { status: 400 }
        )
      }
    }

    const agent = await db.knowledgeAgent.update({
      where: { id: agentId },
      data: { featured },
    })

    return NextResponse.json({ success: true, agent })
  } catch (error) {
    console.error('[admin/featured] Error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle featured status' },
      { status: 500 }
    )
  }
}
