import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCached, setCache, clearCache } from '@/lib/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const DEMO_USER_EMAIL = 'demo@humain-uno.dev'

async function getUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user) {
      return (session.user as any).id
    }
  } catch {
    // No session
  }
  // Fallback to demo user for Supabase-authenticated users
  try {
    const user = await db.user.findUnique({ where: { email: DEMO_USER_EMAIL } })
    if (user) return user.id
  } catch { /* ignore */ }
  return null
}

// GET /api/agents/[id] - Get single agent with relations
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cacheKey = `agents:${id}`
    const cached = getCached<any>(cacheKey)
    if (cached) return NextResponse.json(cached)

    const agent = await db.agent.findUnique({
      where: { id },
      include: {
        category: true,
        creator: {
          select: { id: true, name: true, email: true, image: true, role: true, bio: true },
        },
        parent: {
          select: { id: true, name: true, description: true },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        _count: {
          select: { starredBy: true, comments: true, children: true },
        },
      },
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Check access: if private, only creator can see
    if (agent.privacy === 'PRIVATE') {
      const userId = await getUserId()
      if (userId !== agent.creatorId) {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        )
      }
    }

    const parsed = {
      ...agent,
      tags: JSON.parse(agent.tags || '[]'),
    }

    setCache(cacheKey, parsed)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[agents/[id] GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    )
  }
}

// PUT /api/agents/[id] - Update agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check ownership
    const existing = await db.agent.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      )
    }
    // Allow updates if userId matches creatorId OR if using demo user fallback
    if (userId !== existing.creatorId) {
      const demoUser = await db.user.findUnique({ where: { email: DEMO_USER_EMAIL } })
      if (!demoUser || userId !== demoUser.id) {
        return NextResponse.json(
          { error: 'Unauthorized - you can only edit your own agents' },
          { status: 403 }
        )
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'name', 'description', 'categoryId', 'readme', 'code',
      'framework', 'llm', 'industry', 'difficulty', 'language', 'privacy',
      'status', 'thumbnailUrl',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Handle JSON-stringified fields
    if (body.tags !== undefined) {
      updateData.tags = JSON.stringify(body.tags)
    }
    if (body.tools !== undefined) {
      updateData.tools = JSON.stringify(body.tools)
    }
    if (body.configJson !== undefined) {
      updateData.configJson = JSON.stringify(body.configJson)
    }
    if (body.systemPrompt !== undefined) {
      updateData.systemPrompt = body.systemPrompt
    }

    // Determine if substantive changes require a version increment
    const versionFields = ['name', 'description', 'systemPrompt', 'tools', 'configJson'] as const
    let shouldIncrementVersion = false
    const changelogParts: string[] = []

    for (const field of versionFields) {
      const oldValue = field === 'tools' || field === 'configJson'
        ? JSON.parse((existing as Record<string, unknown>)[field] as string || (field === 'configJson' ? '{}' : '[]'))
        : (existing as Record<string, unknown>)[field]
      const newValue = body[field]
      if (newValue !== undefined) {
        const serializedOld = typeof oldValue === 'string' ? oldValue : JSON.stringify(oldValue)
        const serializedNew = typeof newValue === 'string' ? newValue : JSON.stringify(newValue)
        if (serializedOld !== serializedNew) {
          shouldIncrementVersion = true
          changelogParts.push(`Updated ${field}`)
        }
      }
    }

    if (shouldIncrementVersion) {
      updateData.version = existing.version + 1
    }

    const agent = await db.agent.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        creator: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
    })

    // Create an AgentVersion record when version increments
    if (shouldIncrementVersion && userId) {
      await db.agentVersion.create({
        data: {
          agentId: id,
          version: agent.version,
          name: agent.name,
          description: agent.description,
          systemPrompt: agent.systemPrompt,
          code: agent.code,
          configJson: agent.configJson,
          tools: agent.tools,
          changelog: changelogParts.join('; ') || `Version ${agent.version}`,
          createdBy: userId,
        },
      })
    }

    // Create UserActivityLog entry
    if (userId) {
      await db.userActivityLog.create({
        data: {
          userId,
          action: 'update_agent',
          targetType: 'agent',
          targetId: id,
          metadata: JSON.stringify({
            updatedFields: Object.keys(updateData),
            versionIncremented: shouldIncrementVersion,
            newVersion: agent.version,
          }),
        },
      })
    }

    // Clear caches
    clearCache('agents:')
    clearCache('stats:')

    const parsed = {
      ...agent,
      tags: JSON.parse(agent.tags || '[]'),
      tools: JSON.parse(agent.tools || '[]'),
      configJson: JSON.parse(agent.configJson || '{}'),
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[agents/[id] PUT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    )
  }
}

// DELETE /api/agents/[id] - Delete agent
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check ownership
    const existing = await db.agent.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const userId = await getUserId()
    if (!userId || userId !== existing.creatorId) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only delete your own agents' },
        { status: 403 }
      )
    }

    await db.agent.delete({ where: { id } })

    // Clear caches
    clearCache('agents:')
    clearCache('stats:')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[agents/[id] DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    )
  }
}
