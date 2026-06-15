import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCached, setCache } from '@/lib/cache'

// GET /api/agents/[id]/analytics - Get agent analytics data
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

    const cacheKey = `agents:${id}:analytics`
    const cached = getCached<Record<string, unknown>>(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Fetch existing analytics
    let analytics = await db.agentAnalytics.findMany({
      where: { agentId: id },
      orderBy: { date: 'desc' },
    })

    // If no analytics records exist, generate 7 days of mock data
    if (analytics.length === 0) {
      const mockRecords = []
      const now = new Date()

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        const baseRequests = Math.floor(Math.random() * 80) + 20
        const errorRate = Math.random() * 0.08 // 0-8% error rate
        const errors = Math.floor(baseRequests * errorRate)

        mockRecords.push({
          agentId: id,
          date: new Date(date),
          requests: baseRequests,
          errors,
          avgLatencyMs: Math.floor(Math.random() * 300) + 100, // 100-400ms
          tokensUsed: baseRequests * (Math.floor(Math.random() * 500) + 200), // 200-700 tokens per request
          costUsd: parseFloat((baseRequests * 0.002 + Math.random() * 0.5).toFixed(4)),
          uniqueUsers: Math.floor(baseRequests * (0.3 + Math.random() * 0.4)), // 30-70% unique
        })
      }

      // Create the mock records in the database
      for (const record of mockRecords) {
        await db.agentAnalytics.create({ data: record })
      }

      analytics = await db.agentAnalytics.findMany({
        where: { agentId: id },
        orderBy: { date: 'desc' },
      })
    }

    // Compute summary
    const totalRequests = analytics.reduce((sum, a) => sum + a.requests, 0)
    const totalErrors = analytics.reduce((sum, a) => sum + a.errors, 0)
    const avgLatencyMs = analytics.length > 0
      ? Math.round(analytics.reduce((sum, a) => sum + a.avgLatencyMs, 0) / analytics.length)
      : 0
    const errorRate = totalRequests > 0 ? parseFloat((totalErrors / totalRequests).toFixed(4)) : 0
    const totalCost = parseFloat(analytics.reduce((sum, a) => sum + a.costUsd, 0).toFixed(4))
    const totalTokens = analytics.reduce((sum, a) => sum + a.tokensUsed, 0)
    const totalUniqueUsers = analytics.reduce((sum, a) => sum + a.uniqueUsers, 0)

    const result = {
      daily: analytics.map((a) => ({
        date: a.date.toISOString().split('T')[0],
        requests: a.requests,
        errors: a.errors,
        avgLatencyMs: a.avgLatencyMs,
        tokensUsed: a.tokensUsed,
        costUsd: a.costUsd,
        uniqueUsers: a.uniqueUsers,
      })),
      summary: {
        totalRequests,
        avgLatencyMs,
        errorRate,
        totalCost,
        totalTokens,
        totalUniqueUsers,
        daysTracked: analytics.length,
      },
    }

    setCache(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[agents/[id]/analytics GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
