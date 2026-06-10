'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent, Stats } from '@/lib/types'
import { AgentCard } from '@/components/agents/agent-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Bot,
  Search,
  BookOpen,
  Cpu,
  Building2,
  Layers,
  Loader2,
  ChevronDown,
  TrendingUp,
  Flame,
  GitBranch,
  Brain,
  MessageSquare,
  Zap,
  Database,
  ArrowRight,
  Filter,
  X,
  Library,
} from 'lucide-react'

// Framework configuration with colors, icons, etc.
const frameworkConfig: Record<string, {
  label: string
  color: string
  gradient: string
  shadowColor: string
  icon: React.ComponentType<{ className?: string }>
  bgLight: string
  bgDark: string
  textLight: string
  textDark: string
  barColor: string
}> = {
  all: {
    label: 'All',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-200 dark:shadow-emerald-900/30',
    icon: Layers,
    bgLight: 'bg-emerald-100',
    bgDark: 'dark:bg-emerald-900/30',
    textLight: 'text-emerald-700',
    textDark: 'dark:text-emerald-300',
    barColor: 'bg-emerald-500',
  },
  langgraph: {
    label: 'LangGraph',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    shadowColor: 'shadow-emerald-200 dark:shadow-emerald-900/30',
    icon: GitBranch,
    bgLight: 'bg-emerald-100',
    bgDark: 'dark:bg-emerald-900/30',
    textLight: 'text-emerald-700',
    textDark: 'dark:text-emerald-300',
    barColor: 'bg-emerald-500',
  },
  crewai: {
    label: 'CrewAI',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-200 dark:shadow-amber-900/30',
    icon: Brain,
    bgLight: 'bg-amber-100',
    bgDark: 'dark:bg-amber-900/30',
    textLight: 'text-amber-700',
    textDark: 'dark:text-amber-300',
    barColor: 'bg-amber-500',
  },
  autogen: {
    label: 'AutoGen',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-500',
    shadowColor: 'shadow-rose-200 dark:shadow-rose-900/30',
    icon: MessageSquare,
    bgLight: 'bg-rose-100',
    bgDark: 'dark:bg-rose-900/30',
    textLight: 'text-rose-700',
    textDark: 'dark:text-rose-300',
    barColor: 'bg-rose-500',
  },
  agno: {
    label: 'Agno',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    shadowColor: 'shadow-violet-200 dark:shadow-violet-900/30',
    icon: Zap,
    bgLight: 'bg-violet-100',
    bgDark: 'dark:bg-violet-900/30',
    textLight: 'text-violet-700',
    textDark: 'dark:text-violet-300',
    barColor: 'bg-violet-500',
  },
  llamaindex: {
    label: 'LlamaIndex',
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-500',
    shadowColor: 'shadow-teal-200 dark:shadow-teal-900/30',
    icon: Database,
    bgLight: 'bg-teal-100',
    bgDark: 'dark:bg-teal-900/30',
    textLight: 'text-teal-700',
    textDark: 'dark:text-teal-300',
    barColor: 'bg-teal-500',
  },
}

function AnimatedCounter({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const increment = target / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

function FrameworkDistributionChart({ topFrameworks }: { topFrameworks: { name: string; count: number }[] }) {
  if (!topFrameworks || topFrameworks.length === 0) return null

  const maxCount = Math.max(...topFrameworks.map((f) => f.count))

  return (
    <div className="space-y-3">
      {topFrameworks.map((fw, i) => {
        const config = frameworkConfig[fw.name.toLowerCase()] || frameworkConfig.all
        const percentage = maxCount > 0 ? (fw.count / maxCount) * 100 : 0
        return (
          <motion.div
            key={fw.name}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3"
          >
            <div className={`h-8 w-8 rounded-lg ${config.bgLight} ${config.bgDark} flex items-center justify-center shrink-0`}>
              <config.icon className={`h-4 w-4 ${config.textLight} ${config.textDark}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate">{fw.name}</span>
                <span className="text-xs text-muted-foreground font-medium ml-2">{fw.count}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${config.gradient} will-change-transform`}
                />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export function KnowledgeHubView() {
  const { setCurrentView, setSelectedAgentId } = useAppStore()

  // State
  const [stats, setStats] = useState<Stats | null>(null)
  const [agents, setAgents] = useState<KnowledgeAgent[]>([])
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load stats and framework counts
  useEffect(() => {
    async function loadStats() {
      try {
        const statsData = await api.stats.get() as any
        setStats(statsData)

        // Build framework counts from topFrameworks
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

  // Fetch agents based on filters
  const fetchAgents = useCallback(async (pageNum: number, append = false) => {
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
      const newAgents = data?.data || data || []

      // Parse JSON fields
      const parsed = newAgents.map((a: any) => ({
        ...a,
        tools: typeof a.tools === 'string' ? JSON.parse(a.tools || '[]') : a.tools || [],
        models: typeof a.models === 'string' ? JSON.parse(a.models || '[]') : a.models || [],
        tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags || [],
      }))

      if (append) {
        setAgents((prev) => [...prev, ...parsed])
      } else {
        setAgents(parsed)
      }
      setTotal(data?.total || parsed.length)
      setHasMore(data?.hasMore !== undefined ? data.hasMore : parsed.length >= 24)
    } catch (err) {
      console.error('Failed to fetch agents:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [debouncedQuery, selectedFramework])

  // Re-fetch when filters change
  useEffect(() => {
    setPage(1)
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

  // Framework tabs data
  const frameworkTabs = Object.entries(frameworkConfig).map(([key, config]) => ({
    key,
    ...config,
    count: key === 'all' ? (stats?.knowledgeAgents || 0) : (frameworkCounts[key] || 0),
  }))

  return (
    <div>
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800">
        {/* Animated background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-300/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-100 text-sm mb-6"
            >
              <Library className="h-4 w-4" />
              Curated from 500-AI-Agents-Projects
            </motion.div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-[1.1] tracking-tight gradient-text" style={{ WebkitTextFillColor: 'unset' }}>
                  Knowledge Hub
                </h1>
                <p className="text-lg sm:text-xl text-emerald-100/90 max-w-2xl leading-relaxed">
                  Explore our curated collection of 500+ AI agent templates from the open-source community
                </p>
              </div>

              {/* Search in Knowledge Hub */}
              <div className="w-full lg:w-80 shrink-0">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300" />
                  <Input
                    placeholder="Search knowledge base..."
                    className="pl-9 h-11 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-emerald-200/60 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {/* Animated border gradient on focus */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 p-[1.5px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 pointer-events-none" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
                  {searchQuery && (
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200/60 hover:text-white transition-colors"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-6 sm:gap-10 py-4 overflow-x-auto">
            {stats ? (
              [
                { label: 'Total Agents', value: stats.knowledgeAgents, icon: Bot, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Frameworks', value: stats.frameworks, icon: Cpu, color: 'text-amber-600 dark:text-amber-400' },
                { label: 'Categories', value: stats.categories, icon: Layers, color: 'text-violet-600 dark:text-violet-400' },
                { label: 'Industries', value: stats.topIndustries?.length || 0, icon: Building2, color: 'text-rose-600 dark:text-rose-400' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 shrink-0"
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <div>
                    <div className="text-lg font-bold tracking-tight">
                      <AnimatedCounter target={stat.value} duration={1} />
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 shrink-0">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div>
                    <Skeleton className="h-5 w-10 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Framework Filter Tabs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {frameworkTabs.map((tab) => {
              const isActive = selectedFramework === tab.key
              return (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedFramework(tab.key)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0
                    ${isActive
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md ${tab.shadowColor} glow-emerald`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className={`
                    text-xs px-1.5 py-0.5 rounded-full font-semibold
                    ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                  `}>
                    {tab.count}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Trending Section */}
        {!debouncedQuery && selectedFramework === 'all' && (
          <section className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md shadow-orange-200 dark:shadow-orange-900/30">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Trending Agents</h2>
                  <p className="text-xs text-muted-foreground">Popular picks from the community</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="hidden sm:flex rounded-lg" onClick={() => handleNav('browse')}>
                View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </motion.div>

            {loadingTrending ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-2/3 mb-3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-14" />
                        <Skeleton className="h-5 w-18" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : trendingAgents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingAgents.map((agent, i) => (
                  <AgentCard key={agent.id} agent={agent} index={i} />
                ))}
              </div>
            ) : null}
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Grid */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  {selectedFramework === 'all' ? 'All Knowledge Agents' : frameworkConfig[selectedFramework]?.label + ' Agents'}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {loading ? 'Loading...' : `${total} agents found`}
                </p>
              </div>
            </div>

            {/* Agent Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-2/3 mb-3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-14" />
                        <Skeleton className="h-5 w-18" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No agents found</h3>
                <p className="text-muted-foreground mb-4">
                  {debouncedQuery
                    ? 'Try adjusting your search terms'
                    : 'Try selecting a different framework'}
                </p>
                {(debouncedQuery || selectedFramework !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedFramework('all')
                    }}
                  >
                    <X className="h-4 w-4 mr-1" /> Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {agents.map((agent, i) => (
                    <motion.div
                      key={agent.id}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <AgentCard agent={agent} index={i} />
                    </motion.div>
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="min-w-[200px] rounded-xl"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Load More Agents
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - Framework Distribution */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Framework Distribution Chart */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Framework Distribution</h3>
                      <p className="text-xs text-muted-foreground">Agents per framework</p>
                    </div>
                  </div>
                  {stats?.topFrameworks ? (
                    <FrameworkDistributionChart topFrameworks={stats.topFrameworks} />
                  ) : (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                          <div className="flex-1">
                            <Skeleton className="h-3 w-20 mb-1" />
                            <Skeleton className="h-2 w-full rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Industries */}
              {stats?.topIndustries && stats.topIndustries.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Top Industries</h3>
                        <p className="text-xs text-muted-foreground">By agent count</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stats.topIndustries.slice(0, 12).map((ind, i) => (
                        <motion.div
                          key={ind.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-xs"
                            onClick={() => {
                              const store = useAppStore.getState()
                              store.setSelectedIndustry(ind.name.toLowerCase())
                              store.setCurrentView('browse')
                              store.setSelectedAgentId(null)
                              window.scrollTo(0, 0)
                            }}
                          >
                            {ind.name}
                            <span className="ml-1 text-[10px] text-muted-foreground">({ind.count})</span>
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Links Card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Quick Links
                  </h3>
                  <div className="space-y-2">
                    <button
                      className="w-full text-left text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                      onClick={() => handleNav('browse')}
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Browse All Agents
                    </button>
                    <button
                      className="w-full text-left text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                      onClick={() => handleNav('wizard')}
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Create New Agent
                    </button>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-left text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Source Repository
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
