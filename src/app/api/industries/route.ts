import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCached, setCache } from '@/lib/cache'

// GET /api/industries - List all unique industries with agent counts
export async function GET() {
  try {
    const cacheKey = 'industries:all'
    const cached = getCached<any>(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Get industries from knowledge agents
    const kbIndustries = await db.knowledgeAgent.groupBy({
      by: ['industry'],
      where: { industry: { not: null } },
      _count: { id: true },
    })

    // Get industries from user agents
    const userIndustries = await db.agent.groupBy({
      by: ['industry'],
      where: { industry: { not: null } },
      _count: { id: true },
    })

    // Merge counts
    const industryMap = new Map<string, number>()
    for (const ki of kbIndustries) {
      if (ki.industry) {
        const key = ki.industry.toLowerCase()
        industryMap.set(key, (industryMap.get(key) || 0) + ki._count.id)
      }
    }
    for (const ui of userIndustries) {
      if (ui.industry) {
        const key = ui.industry.toLowerCase()
        industryMap.set(key, (industryMap.get(key) || 0) + ui._count.id)
      }
    }

    const result = Array.from(industryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    setCache(cacheKey, result, 60 * 1000)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[industries] Error:', error)
    return NextResponse.json(
      { error: 'Failed to list industries' },
      { status: 500 }
    )
  }
}
