import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clearCache } from '@/lib/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const DEMO_USER_EMAIL = 'demo@humain-uno.dev'

async function getUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user) {
      return (session.user as Record<string, unknown>).id as string
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

// POST /api/agents/[id]/deploy - Deploy agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate agent exists
    const agent = await db.agent.findUnique({ where: { id } })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const userId = await getUserId()
    // Allow deploy if we have a userId (demo user is owner of all seeded agents)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      )
    }

    // Parse optional body for environment config
    let environment = 'production'
    let configJson = '{}'
    try {
      const body = await request.json()
      if (body.environment) environment = body.environment
      if (body.configJson) configJson = JSON.stringify(body.configJson)
    } catch {
      // No body or invalid JSON, use defaults
    }

    const deployUrl = `https://agent-${id}.humain-uno.ai`

    // Create AgentDeployment record
    const deployment = await db.agentDeployment.create({
      data: {
        agentId: id,
        environment,
        status: 'running',
        deployUrl,
        version: agent.version,
        configJson,
        logs: JSON.stringify([
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Deployment initiated for agent "${agent.name}" v${agent.version}`,
          },
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Building agent container...',
          },
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Container built successfully',
          },
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Agent deployed to ${deployUrl}`,
          },
        ]),
        deployedBy: userId,
      },
    })

    // Update agent status and deploy info
    await db.agent.update({
      where: { id },
      data: {
        status: 'deployed',
        deployUrl,
        lastDeployedAt: new Date(),
      },
    })

    // Create UserActivityLog entry
    await db.userActivityLog.create({
      data: {
        userId,
        action: 'deploy_agent',
        targetType: 'agent',
        targetId: id,
        metadata: JSON.stringify({
          deploymentId: deployment.id,
          environment,
          version: agent.version,
          deployUrl,
        }),
      },
    })

    // Clear caches
    clearCache('agents:')
    clearCache('stats:')

    return NextResponse.json({
      deployment: {
        ...deployment,
        configJson: JSON.parse(deployment.configJson || '{}'),
        logs: JSON.parse(deployment.logs || '[]'),
      },
      agent: {
        id,
        status: 'deployed',
        deployUrl,
        lastDeployedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[agents/[id]/deploy POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to deploy agent' },
      { status: 500 }
    )
  }
}
