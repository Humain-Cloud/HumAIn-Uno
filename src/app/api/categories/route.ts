import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCached, setCache } from '@/lib/cache'

// GET /api/categories - List all categories with agent counts (including knowledge agents)
export async function GET() {
  try {
    const cacheKey = 'categories:all'
    const cached = getCached<any>(cacheKey)
    if (cached) return NextResponse.json(cached)

    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { agents: true },
        },
      },
    })

    // Also count knowledge agents by category
    const knowledgeCounts = await db.knowledgeAgent.groupBy({
      by: ['category'],
      _count: { id: true },
    })

    // Build a map of knowledge agent counts by category name (case-insensitive)
    const kbCountMap = new Map<string, number>()
    for (const kc of knowledgeCounts) {
      kbCountMap.set(kc.category.toLowerCase(), kc._count.id)
    }

    const result = categories.map((cat) => {
      const userAgentCount = cat._count.agents
      const knowledgeCount = kbCountMap.get(cat.name.toLowerCase()) || 
                            kbCountMap.get(cat.slug.toLowerCase()) || 0
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        parentId: cat.parentId,
        agentCount: userAgentCount + knowledgeCount,
        userAgentCount,
        knowledgeAgentCount: knowledgeCount,
      }
    })

    setCache(cacheKey, result, 60 * 1000)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[categories] Error:', error)
    return NextResponse.json(
      { error: 'Failed to list categories' },
      { status: 500 }
    )
  }
}
