import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/llm-models/stats — Aggregate stats for the LLM Model Explorer
export async function GET() {
  try {
    const [
      totalModels,
      totalOrganizations,
      topRated,
      newestModels,
      orgCounts,
      licenseCounts,
      arenaCounts,
      priceRanges,
    ] = await Promise.all([
      db.lLMModel.count(),

      db.lLMModel.groupBy({
        by: ['organization'],
        _count: { organization: true },
        orderBy: { _count: { organization: 'desc' } },
      }),

      db.lLMModel.findMany({
        orderBy: { bestRating: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          organization: true,
          bestRating: true,
          bestRank: true,
          totalVotes: true,
          outputPricePerMillion: true,
          contextLength: true,
        },
      }),

      db.lLMModel.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          organization: true,
          bestRating: true,
          createdAt: true,
        },
      }),

      db.lLMModel.groupBy({
        by: ['organization'],
        _count: true,
        _avg: { bestRating: true },
        orderBy: { _count: { organization: 'desc' } },
        take: 20,
      }),

      db.lLMModel.groupBy({
        by: ['license'],
        _count: true,
        orderBy: { _count: { license: 'desc' } },
      }),

      db.lLMModel.findMany({
        select: { arenaCategories: true },
      }),

      db.lLMModel.aggregate({
        _min: { outputPricePerMillion: true, inputPricePerMillion: true },
        _max: { outputPricePerMillion: true, inputPricePerMillion: true },
        _avg: { outputPricePerMillion: true, inputPricePerMillion: true },
      }),
    ])

    // Compute arena category distribution
    const arenaDist: Record<string, number> = {}
    for (const m of arenaCounts) {
      try {
        const cats: string[] = JSON.parse(m.arenaCategories || '[]')
        for (const cat of cats) {
          arenaDist[cat] = (arenaDist[cat] || 0) + 1
        }
      } catch {}
    }

    return NextResponse.json({
      totalModels,
      totalOrganizations: totalOrganizations.length,
      topRated,
      newestModels,
      organizations: orgCounts.map(o => ({
        name: o.organization,
        modelCount: o._count,
        avgRating: Math.round((o._avg.bestRating || 0) * 100) / 100,
      })),
      licenses: licenseCounts.map(l => ({
        name: l.license,
        count: l._count,
      })),
      arenas: Object.entries(arenaDist)
        .sort(([, a], [, b]) => b - a)
        .map(([name, count]) => ({ name, count })),
      pricing: {
        input: {
          min: priceRanges._min.inputPricePerMillion,
          max: priceRanges._max.inputPricePerMillion,
          avg: Math.round((priceRanges._avg.inputPricePerMillion || 0) * 100) / 100,
        },
        output: {
          min: priceRanges._min.outputPricePerMillion,
          max: priceRanges._max.outputPricePerMillion,
          avg: Math.round((priceRanges._avg.outputPricePerMillion || 0) * 100) / 100,
        },
      },
    })
  } catch (error) {
    console.error('[LLM Models Stats API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
