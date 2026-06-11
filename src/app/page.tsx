import { db } from '@/lib/db'
import { AppLayout } from '@/components/layout/app-layout'

async function getInitialData() {
  try {
    const [
      totalAgents,
      categories,
      topFrameworks,
      topIndustries,
      difficultyDistribution,
      recentAgents,
      featuredAgents,
    ] = await Promise.all([
      db.knowledgeAgent.count(),
      db.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { agents: true } } },
      }),
      db.knowledgeAgent.groupBy({
        by: ['framework'],
        where: { framework: { not: null } },
        _count: { framework: true },
        orderBy: { _count: { framework: 'desc' } },
      }),
      db.knowledgeAgent.groupBy({
        by: ['industry'],
        where: { industry: { not: null } },
        _count: { industry: true },
        orderBy: { _count: { industry: 'desc' } },
        take: 10,
      }),
      db.knowledgeAgent.groupBy({
        by: ['difficulty'],
        where: { difficulty: { not: null } },
        _count: { difficulty: true },
      }),
      db.knowledgeAgent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true, name: true, category: true, description: true,
          framework: true, difficulty: true, industry: true,
          tags: true, tools: true, isCurated: true,
        },
      }),
      db.knowledgeAgent.findMany({
        where: { featured: true },
        take: 6,
        select: {
          id: true, name: true, category: true, description: true,
          framework: true, difficulty: true, industry: true,
          tags: true, tools: true, isCurated: true,
        },
      }),
    ])

    const userAgentCount = await db.agent.count()
    const totalCategories = categories.length
    const uniqueFrameworks = new Set(topFrameworks.map(f => f.framework).filter(Boolean))
    const categoryCounts = await db.knowledgeAgent.groupBy({ by: ['category'], _count: { category: true } })
    const categoryCountMap = new Map(categoryCounts.map(c => [c.category, c._count.category]))
    const categoriesWithCounts = categories.map(c => ({
      id: c.id, name: c.name, slug: c.slug, icon: c.icon, parentId: c.parentId,
      agentCount: c._count.agents, knowledgeAgentCount: categoryCountMap.get(c.name) || 0,
    }))

    const parseAgent = (a: any) => ({
      ...a,
      tools: typeof a.tools === 'string' ? JSON.parse(a.tools || '[]') : a.tools || [],
      tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags || [],
    })

    return {
      stats: {
        totalAgents, knowledgeAgents: totalAgents, userAgentCount,
        categories: totalCategories, frameworks: uniqueFrameworks.size,
        industries: topIndustries.length,
        topFrameworks: topFrameworks.map(f => ({ name: f.framework || 'Unknown', count: f._count.framework })),
        topIndustries: topIndustries.map(i => ({ name: i.industry || 'Unknown', count: i._count.industry })),
        difficultyDistribution: difficultyDistribution.map(d => ({ name: d.difficulty || 'Unknown', count: d._count.difficulty })),
      },
      categories: categoriesWithCounts,
      recentAgents: recentAgents.map(parseAgent),
      featuredAgents: featuredAgents.length > 0 ? featuredAgents.map(parseAgent) : recentAgents.slice(0, 6).map(parseAgent),
    }
  } catch (error) {
    console.error('Failed to prefetch data:', error)
    return null
  }
}

export default async function Home() {
  const initialData = await getInitialData()
  return <AppLayout initialData={initialData} />
}
