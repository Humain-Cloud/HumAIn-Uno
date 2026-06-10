import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCached, setCache } from '@/lib/cache'

// GET /api/stats - Platform statistics
export async function GET() {
  try {
    const cacheKey = 'stats:platform'
    const cached = getCached<any>(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Run all count queries in parallel
    const [
      totalAgents,
      knowledgeAgents,
      categoriesCount,
    ] = await Promise.all([
      db.agent.count(),
      db.knowledgeAgent.count(),
      db.category.count(),
    ])

    const userAgentCount = totalAgents

    // Get framework distribution from knowledge agents
    const knowledgeFrameworks = await db.knowledgeAgent.findMany({
      where: { framework: { not: null } },
      select: { framework: true },
    })

    // Get framework distribution from user agents
    const userFrameworks = await db.agent.findMany({
      where: { framework: { not: null } },
      select: { framework: true },
    })

    // Count frameworks
    const frameworkMap = new Map<string, number>()
    for (const { framework } of [...knowledgeFrameworks, ...userFrameworks]) {
      if (framework) {
        frameworkMap.set(framework, (frameworkMap.get(framework) || 0) + 1)
      }
    }

    const topFrameworks = Array.from(frameworkMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get industry distribution
    const knowledgeIndustries = await db.knowledgeAgent.findMany({
      where: { industry: { not: null } },
      select: { industry: true },
    })

    const userIndustries = await db.agent.findMany({
      where: { industry: { not: null } },
      select: { industry: true },
    })

    const industryMap = new Map<string, number>()
    for (const { industry } of [...knowledgeIndustries, ...userIndustries]) {
      if (industry) {
        industryMap.set(industry, (industryMap.get(industry) || 0) + 1)
      }
    }

    const topIndustries = Array.from(industryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const result = {
      totalAgents: totalAgents + knowledgeAgents,
      knowledgeAgents,
      userAgentCount,
      categories: categoriesCount,
      frameworks: frameworkMap.size,
      topFrameworks,
      topIndustries,
    }

    setCache(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[stats] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
