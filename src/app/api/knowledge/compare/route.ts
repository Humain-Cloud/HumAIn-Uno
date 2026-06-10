import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body as { ids: string[] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of agent IDs' },
        { status: 400 }
      )
    }

    if (ids.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 agents can be compared at once' },
        { status: 400 }
      )
    }

    const agents = await db.knowledgeAgent.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        tools: true,
        models: true,
        framework: true,
        llm: true,
        industry: true,
        difficulty: true,
        language: true,
        tags: true,
        author: true,
        isCurated: true,
        sourceUrl: true,
        repoPath: true,
        createdAt: true,
      },
    })

    // Parse JSON string fields and preserve the order of requested IDs
    const parsed = ids
      .map((id) => {
        const agent = agents.find((a) => a.id === id)
        if (!agent) return null
        return {
          ...agent,
          tools: JSON.parse(agent.tools || '[]'),
          models: JSON.parse(agent.models || '[]'),
          tags: JSON.parse(agent.tags || '[]'),
          source: agent.isCurated ? 'Knowledge Base' : 'User Created',
        }
      })
      .filter(Boolean)

    return NextResponse.json({ data: parsed })
  } catch (error) {
    console.error('[knowledge/compare] Error:', error)
    return NextResponse.json(
      { error: 'Failed to compare agents' },
      { status: 500 }
    )
  }
}
