'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { AgentWorkspace } from '@/components/workspace/agent-workspace'
import type { AgentWorkspaceData } from '@/components/workspace/agent-workspace'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

export function AgentDetailPage() {
  const params = useParams()
  const agentId = params?.id as string
  const { setCurrentView, addRecentlyViewed } = useAppStore()

  const [agent, setAgent] = useState<AgentWorkspaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentView('detail')
  }, [setCurrentView])

  const fetchAgent = useCallback(async () => {
    if (!agentId) return
    setLoading(true)
    setError(null)
    try {
      const rawData = await api.agents.get(agentId) as Record<string, unknown>
      // Parse JSON fields that come as strings from the API
      const rawTags = rawData.tags
      const rawTools = rawData.tools
      const rawConfigJson = rawData.configJson

      const parsed: AgentWorkspaceData = {
        id: rawData.id as string,
        name: rawData.name as string,
        description: rawData.description as string,
        categoryId: rawData.categoryId as string,
        category: rawData.category as { name: string },
        creatorId: rawData.creatorId as string,
        creator: rawData.creator as { name: string | null; email: string; image: string | null },
        privacy: rawData.privacy as string,
        source: (rawData.source as string) || null,
        readme: rawData.readme as string,
        code: (rawData.code as string) || null,
        stars: rawData.stars as number,
        tags: Array.isArray(rawTags) ? rawTags as string[] : (typeof rawTags === 'string' ? JSON.parse(rawTags || '[]') : []),
        framework: (rawData.framework as string) || null,
        llm: (rawData.llm as string) || null,
        industry: (rawData.industry as string) || null,
        difficulty: (rawData.difficulty as string) || null,
        language: (rawData.language as string) || null,
        healthScore: (rawData.healthScore as number) ?? 0,
        status: (rawData.status as string) || 'draft',
        systemPrompt: (rawData.systemPrompt as string) || null,
        tools: Array.isArray(rawTools) ? rawTools as string[] : (typeof rawTools === 'string' ? JSON.parse(rawTools || '[]') : []),
        configJson: typeof rawConfigJson === 'string'
          ? JSON.parse(rawConfigJson || '{}')
          : (rawConfigJson as Record<string, unknown>) || {},
        version: (rawData.version as number) ?? 1,
        thumbnailUrl: (rawData.thumbnailUrl as string) || null,
        deployUrl: (rawData.deployUrl as string) || null,
        lastTestedAt: (rawData.lastTestedAt as string) || null,
        lastDeployedAt: (rawData.lastDeployedAt as string) || null,
        totalRequests: (rawData.totalRequests as number) ?? 0,
        avgLatencyMs: (rawData.avgLatencyMs as number) ?? 0,
        errorRate: (rawData.errorRate as number) ?? 0,
        createdAt: rawData.createdAt as string,
        updatedAt: rawData.updatedAt as string,
      }
      setAgent(parsed)
      addRecentlyViewed(agentId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent')
    } finally {
      setLoading(false)
    }
  }, [agentId, addRecentlyViewed])

  useEffect(() => {
    fetchAgent()
  }, [fetchAgent])

  const handleUpdate = useCallback((data: Partial<AgentWorkspaceData>) => {
    setAgent(prev => prev ? { ...prev, ...data } : prev)
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-48 bg-muted rounded" />
                <div className="h-4 w-72 bg-muted rounded" />
              </div>
            </div>
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
            {/* Content skeleton */}
            <div className="h-64 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-48 bg-muted rounded-lg" />
              <div className="h-48 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto p-3 rounded-full bg-rose-100 dark:bg-rose-900/30 w-fit">
            <AlertTriangle className="h-6 w-6 text-rose-600" />
          </div>
          <h2 className="text-xl font-semibold">Failed to Load Agent</h2>
          <p className="text-sm text-muted-foreground">
            {error || 'The agent could not be found or you don\'t have permission to view it.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={fetchAgent}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <AgentWorkspace agent={agent} onUpdate={handleUpdate} />
}
