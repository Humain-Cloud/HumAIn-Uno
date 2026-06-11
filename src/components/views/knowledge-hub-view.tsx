'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent, Stats } from '@/lib/types'

// Split imports
import { frameworkConfig } from '@/components/hub/shared-data'
import { HubHeader } from '@/components/hub/hub-header'
import { FrameworkTabs } from '@/components/hub/framework-tabs'
import { TrendingAgentsSection } from '@/components/hub/trending-agents-section'
import { SidebarContent } from '@/components/hub/sidebar-content'
import { AgentGridSection } from '@/components/hub/agent-grid-section'

export function KnowledgeHubView() {
  const { setCurrentView, setSelectedAgentId } = useAppStore()

  // State
  const [stats, setStats] = useState<Stats | null>(null)
  const [agents, setAgents] = useState<KnowledgeAgent[]>([])
  const [allAgents, setAllAgents] = useState<KnowledgeAgent[]>([])
  const [trendingAgents, setTrendingAgents] = useState<KnowledgeAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadingTrending, setLoadingTrending] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [selectedFramework, setSelectedFramework] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [frameworkCounts, setFrameworkCounts] = useState<Record<string, number>>({})
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [randomSpinning, setRandomSpinning] = useState(false)
  const [previewAgent, setPreviewAgent] = useState<KnowledgeAgent | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [minutesAgo, setMinutesAgo] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update "minutes ago" every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setMinutesAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 60000))
    }, 60000)
    return () => clearInterval(timer)
  }, [lastUpdated])

  // Load stats and framework counts
  useEffect(() => {
    async function loadStats() {
      try {
        const statsData = await api.stats.get() as any
        setStats(statsData)
        setLastUpdated(new Date())

        const counts: Record<string, number> = {}
        if (statsData.topFrameworks) {
          statsData.topFrameworks.forEach((fw: { name: string; count: number }) => {
            counts[fw.name.toLowerCase()] = fw.count
          })
        }
        setFrameworkCounts(counts)
      } catch (err) {
        console.error('Failed to load stats:', err)
      }
    }
    loadStats()
  }, [])

  // Cleanup retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
  }, [])

  // Load all agents for tag cloud and random picker
  useEffect(() => {
    async function loadAllAgents() {
      try {
        const data = await api.knowledge.list({ page: 1, pageSize: 200 }) as any
        const rawAgents = data?.data || data || []
        const parsed = rawAgents.map((a: any) => ({
          ...a,
          tools: typeof a.tools === 'string' ? JSON.parse(a.tools || '[]') : a.tools || [],
          models: typeof a.models === 'string' ? JSON.parse(a.models || '[]') : a.models || [],
          tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags || [],
        }))
        setAllAgents(parsed)
      } catch (err) {
        console.error('Failed to load all agents:', err)
      }
    }
    loadAllAgents()
  }, [])

  // Load trending agents (first 4 from the knowledge base)
  useEffect(() => {
    async function loadTrending() {
      try {
        const data = await api.knowledge.list({ page: 1, pageSize: 4 }) as any
        const rawAgents = data?.data || data || []
        const parsed = rawAgents.map((a: any) => ({
          ...a,
          tools: typeof a.tools === 'string' ? JSON.parse(a.tools || '[]') : a.tools || [],
          models: typeof a.models === 'string' ? JSON.parse(a.models || '[]') : a.models || [],
          tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags || [],
        }))
        setTrendingAgents(parsed)
      } catch (err) {
        console.error('Failed to load trending agents:', err)
      } finally {
        setLoadingTrending(false)
      }
    }
    loadTrending()
  }, [])

  // Compute tag frequency from all agents
  const tagFrequency = useMemo(() => {
    const freq: Record<string, number> = {}
    allAgents.forEach((agent) => {
      if (agent.tags && Array.isArray(agent.tags)) {
        agent.tags.forEach((tag: string) => {
          freq[tag] = (freq[tag] || 0) + 1
        })
      }
    })
    return Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
  }, [allAgents])

  const maxTagFreq = tagFrequency.length > 0 ? tagFrequency[0][1] : 1

  // Compute recently added agents
  const recentlyAddedAgents = useMemo(() => {
    return allAgents.slice(0, 5)
  }, [allAgents])

  // Fetch agents with auto-retry
  const fetchAgents = useCallback(async (pageNum: number, append = false, attempt = 0) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const params: any = {
        page: pageNum,
        pageSize: 24,
      }
      if (debouncedQuery) params.q = debouncedQuery
      if (selectedFramework !== 'all') params.framework = selectedFramework

      const data: any = await api.knowledge.search(params)
      let newAgents = data?.data || data || []

      const parsed = newAgents.map((a: any) => ({
        ...a,
        tools: typeof a.tools === 'string' ? JSON.parse(a.tools || '[]') : a.tools || [],
        models: typeof a.models === 'string' ? JSON.parse(a.models || '[]') : a.models || [],
        tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags || [],
      }))

      let filtered = parsed
      if (selectedTag) {
        filtered = parsed.filter((a: KnowledgeAgent) =>
          a.tags && Array.isArray(a.tags) && a.tags.includes(selectedTag)
        )
      }

      if (append) {
        setAgents((prev) => [...prev, ...filtered])
      } else {
        setAgents(filtered)
      }
      setTotal(data?.total || filtered.length)
      setHasMore(data?.hasMore !== undefined ? data.hasMore : newAgents.length >= 24)
      setError(null)
      setRetryCount(0)
    } catch (err) {
      console.error('Failed to fetch agents:', err)
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000
        setRetryCount(attempt + 1)
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
        retryTimerRef.current = setTimeout(() => {
          fetchAgents(pageNum, append, attempt + 1)
        }, delay)
      } else {
        setError('Unable to load agents. The server may be temporarily unavailable.')
        setRetryCount(0)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [debouncedQuery, selectedFramework, selectedTag])

  // Re-fetch when filters change
  useEffect(() => {
    setPage(1)
    setError(null)
    fetchAgents(1)
  }, [fetchAgents])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchAgents(nextPage, true)
  }

  const handleNav = (view: any) => {
    setCurrentView(view)
    setSelectedAgentId(null)
    window.scrollTo(0, 0)
  }

  // Random agent picker
  const handleRandomPick = () => {
    if (allAgents.length === 0) return
    setRandomSpinning(true)
    setTimeout(() => {
      const randomAgent = allAgents[Math.floor(Math.random() * allAgents.length)]
      setRandomSpinning(false)
      setSelectedAgentId(randomAgent.id)
      setCurrentView('detail')
      window.scrollTo(0, 0)
    }, 800)
  }

  return (
    <div>
      {/* Header with Stats */}
      <HubHeader
        stats={stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        randomSpinning={randomSpinning}
        onRandomPick={handleRandomPick}
        allAgentsCount={allAgents.length}
        minutesAgo={minutesAgo}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Framework Filter Tabs */}
        <FrameworkTabs
          selectedFramework={selectedFramework}
          setSelectedFramework={setSelectedFramework}
          frameworkCounts={frameworkCounts}
          totalAgents={stats?.knowledgeAgents || 0}
        />

        {/* Trending Section */}
        {!debouncedQuery && selectedFramework === 'all' && !selectedTag && (
          <TrendingAgentsSection
            trendingAgents={trendingAgents}
            loadingTrending={loadingTrending}
            onNavigate={handleNav}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Agent Grid Section */}
          <div className="flex-1 min-w-0">
            <AgentGridSection
              agents={agents}
              loading={loading}
              loadingMore={loadingMore}
              error={error}
              total={total}
              selectedFramework={selectedFramework}
              debouncedQuery={debouncedQuery}
              selectedTag={selectedTag}
              hasMore={hasMore}
              loadMore={loadMore}
              onRetry={() => {
                setError(null)
                setRetryCount(0)
                fetchAgents(1)
              }}
              onClearFilters={() => {
                setSearchQuery('')
                setSelectedFramework('all')
                setSelectedTag(null)
              }}
              previewAgent={previewAgent}
              setPreviewAgent={setPreviewAgent}
            />
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <SidebarContent
              tagFrequency={tagFrequency}
              maxTagFreq={maxTagFreq}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              recentlyAddedAgents={recentlyAddedAgents}
              stats={stats}
              onNavigate={handleNav}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}
