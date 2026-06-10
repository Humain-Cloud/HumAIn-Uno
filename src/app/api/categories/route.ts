import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCached, setCache } from '@/lib/cache'

// GET /api/categories - List all categories with agent counts
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

    const result = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      parentId: cat.parentId,
      agentCount: cat._count.agents,
    }))

    setCache(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[categories] Error:', error)
    return NextResponse.json(
      { error: 'Failed to list categories' },
      { status: 500 }
    )
  }
}
