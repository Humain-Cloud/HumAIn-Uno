import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCached, setCache } from '@/lib/cache'

// GET /api/stats - Platform statistics (memory-efficient)
export async function GET() {
  try {
    const cacheKey = 'stats:platform'
    const cached = getCached<any>(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Run all count queries in parallel - these are lightweight
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

    // Use groupBy for efficient aggregation instead of loading all records
    const [knowledgeFrameworkGroups, userAgentFrameworkGroups] = await Promise.all([
      db.knowledgeAgent.groupBy({
        by: ['framework'],
        where: { framework: { not: null } },
        _count: { framework: true },
      }),
      db.agent.groupBy({
        by: ['framework'],
        where: { framework: { not: null } },
        _count: { framework: true },
      }),
    ])

    // Merge framework counts
    const frameworkMap = new Map<string, number>()
    for (const group of [...knowledgeFrameworkGroups, ...userAgentFrameworkGroups]) {
      if (group.framework) {
        const normalized = group.framework.charAt(0).toUpperCase() + group.framework.slice(1).toLowerCase()
        frameworkMap.set(normalized, (frameworkMap.get(normalized) || 0) + group._count.framework)
      }
    }

    const topFrameworks = Array.from(frameworkMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Use groupBy for industry aggregation
    const [knowledgeIndustryGroups, userAgentIndustryGroups] = await Promise.all([
      db.knowledgeAgent.groupBy({
        by: ['industry'],
        where: { industry: { not: null } },
        _count: { industry: true },
      }),
      db.agent.groupBy({
        by: ['industry'],
        where: { industry: { not: null } },
        _count: { industry: true },
      }),
    ])

    const industryMap = new Map<string, number>()
    for (const group of [...knowledgeIndustryGroups, ...userAgentIndustryGroups]) {
      if (group.industry) {
        const normalized = group.industry.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        industryMap.set(normalized, (industryMap.get(normalized) || 0) + group._count.industry)
      }
    }

    const topIndustries = Array.from(industryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Use groupBy for difficulty aggregation
    const difficultyGroups = await db.knowledgeAgent.groupBy({
      by: ['difficulty'],
      where: { difficulty: { not: null } },
      _count: { difficulty: true },
    })

    const difficultyDistribution = difficultyGroups
      .filter(g => g.difficulty)
      .map(g => ({ name: g.difficulty!, count: g._count.difficulty }))
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
