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
      userAgentCount,
      knowledgeAgentCount,
      categoriesCount,
    ] = await Promise.all([
      db.agent.count(),
      db.knowledgeAgent.count(),
      db.category.count(),
    ])

    const totalAgents = userAgentCount + knowledgeAgentCount

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

    // Count frameworks (normalize case)
    const frameworkMap = new Map<string, number>()
    for (const { framework } of [...knowledgeFrameworks, ...userFrameworks]) {
      if (framework) {
        const normalized = framework.charAt(0).toUpperCase() + framework.slice(1).toLowerCase()
        frameworkMap.set(normalized, (frameworkMap.get(normalized) || 0) + 1)
      }
    }

    const topFrameworks = Array.from(frameworkMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get industry distribution from knowledge agents
    const knowledgeIndustries = await db.knowledgeAgent.findMany({
      where: { industry: { not: null } },
      select: { industry: true },
    })

    const userIndustries = await db.agent.findMany({
      where: { industry: { not: null } },
      select: { industry: true },
    })

    // Normalize industry names
    const industryMap = new Map<string, number>()
    for (const { industry } of [...knowledgeIndustries, ...userIndustries]) {
      if (industry) {
        const normalized = industry.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        industryMap.set(normalized, (industryMap.get(normalized) || 0) + 1)
      }
    }

    const topIndustries = Array.from(industryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get difficulty distribution
    const knowledgeDifficulties = await db.knowledgeAgent.findMany({
      where: { difficulty: { not: null } },
      select: { difficulty: true },
    })

    const difficultyMap = new Map<string, number>()
    for (const { difficulty } of knowledgeDifficulties) {
      if (difficulty) {
        difficultyMap.set(difficulty, (difficultyMap.get(difficulty) || 0) + 1)
      }
    }

    const difficultyDistribution = Array.from(difficultyMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const result = {
      totalAgents,
      knowledgeAgents: knowledgeAgentCount,
      userAgentCount,
      categories: categoriesCount,
      frameworks: frameworkMap.size,
      industries: industryMap.size,
      topFrameworks,
      topIndustries,
      difficultyDistribution,
    }

    setCache(cacheKey, result, 60 * 1000)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[stats] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
