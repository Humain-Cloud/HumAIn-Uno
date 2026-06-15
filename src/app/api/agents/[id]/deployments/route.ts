import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCached, setCache } from '@/lib/cache'

// GET /api/agents/[id]/deployments - Get agent deployment history
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate agent exists
    const agent = await db.agent.findUnique({ where: { id } })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const cacheKey = `agents:${id}:deployments`
    const cached = getCached<Record<string, unknown>>(cacheKey)
    if (cached) return NextResponse.json(cached)

    const deployments = await db.agentDeployment.findMany({
      where: { agentId: id },
      orderBy: { deployedAt: 'desc' },
    })

    const parsed = deployments.map((d) => ({
      ...d,
      configJson: JSON.parse(d.configJson || '{}'),
      logs: JSON.parse(d.logs || '[]'),
    }))

    const result = {
      deployments: parsed,
      totalDeployments: parsed.length,
      activeDeployments: parsed.filter((d) => d.status === 'running').length,
    }

    setCache(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[agents/[id]/deployments GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deployment history' },
      { status: 500 }
    )
  }
}
