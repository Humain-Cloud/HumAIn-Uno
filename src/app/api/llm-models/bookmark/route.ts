import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/llm-models/bookmark — Bookmark a model
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, modelId, note } = body

    if (!userId || !modelId) {
      return NextResponse.json({ error: 'userId and modelId are required' }, { status: 400 })
    }

    // Check if already bookmarked
    const existing = await db.modelBookmark.findUnique({
      where: { userId_modelId: { userId, modelId } },
    })

    if (existing) {
      // Update note if provided
      if (note !== undefined) {
        await db.modelBookmark.update({
          where: { id: existing.id },
          data: { note },
        })
      }
      return NextResponse.json({ bookmarked: true, id: existing.id })
    }

    const bookmark = await db.modelBookmark.create({
      data: { userId, modelId, note },
    })

    return NextResponse.json({ bookmarked: true, id: bookmark.id })
  } catch (error) {
    console.error('[LLM Models Bookmark API] Error:', error)
    return NextResponse.json({ error: 'Failed to bookmark model' }, { status: 500 })
  }
}

// DELETE /api/llm-models/bookmark — Remove bookmark
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const modelId = searchParams.get('modelId')

    if (!userId || !modelId) {
      return NextResponse.json({ error: 'userId and modelId are required' }, { status: 400 })
    }

    await db.modelBookmark.deleteMany({
      where: { userId, modelId },
    })

    return NextResponse.json({ bookmarked: false })
  } catch (error) {
    console.error('[LLM Models Bookmark API] Error:', error)
    return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 })
  }
}

// GET /api/llm-models/bookmark — Get user's bookmarked models
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const bookmarks = await db.modelBookmark.findMany({
      where: { userId },
      include: { model: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      bookmarks: bookmarks.map(b => ({
        ...b,
        model: {
          ...b.model,
          inputCapabilities: JSON.parse(b.model.inputCapabilities || '{}'),
          outputCapabilities: JSON.parse(b.model.outputCapabilities || '{}'),
          arenaCategories: JSON.parse(b.model.arenaCategories || '[]'),
          categoryRankings: JSON.parse(b.model.categoryRankings || '{}'),
          useCaseTags: JSON.parse(b.model.useCaseTags || '[]'),
        },
      })),
    })
  } catch (error) {
    console.error('[LLM Models Bookmark API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
  }
}
