import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCached, setCache } from '@/lib/cache'

// GET /api/agents/[id]/versions - Get agent version history
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

    const cacheKey = `agents:${id}:versions`
    const cached = getCached<Record<string, unknown>>(cacheKey)
    if (cached) return NextResponse.json(cached)

    const versions = await db.agentVersion.findMany({
      where: { agentId: id },
      orderBy: { version: 'desc' },
    })

    const parsed = versions.map((v) => ({
      ...v,
      configJson: JSON.parse(v.configJson || '{}'),
      tools: JSON.parse(v.tools || '[]'),
    }))

    const result = {
      versions: parsed,
      currentVersion: agent.version,
      totalVersions: parsed.length,
    }

    setCache(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[agents/[id]/versions GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch version history' },
      { status: 500 }
    )
  }
}
