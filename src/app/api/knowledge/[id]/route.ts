import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCached, setCache } from '@/lib/cache'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cacheKey = `knowledge:${id}`
    const cached = getCached<any>(cacheKey)
    if (cached) return NextResponse.json(cached)

    const agent = await db.knowledgeAgent.findUnique({ where: { id } })

    if (!agent) {
      return NextResponse.json(
        { error: 'Knowledge agent not found' },
        { status: 404 }
      )
    }

    // Parse JSON string fields - include full readme and codeSnippet
    const parsed = {
      ...agent,
      tools: JSON.parse(agent.tools || '[]'),
      models: JSON.parse(agent.models || '[]'),
      tags: JSON.parse(agent.tags || '[]'),
    }

    setCache(cacheKey, parsed)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[knowledge/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge agent' },
      { status: 500 }
    )
  }
}
