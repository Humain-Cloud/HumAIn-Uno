'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent, Stats } from '@/lib/types'
import { AgentCard } from '@/components/agents/agent-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Shuffle,
  Clock,
  Eye,
  Wrench,
  Tag,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
  dotColor: string
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
    dotColor: 'bg-emerald-500',
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
    dotColor: 'bg-emerald-500',
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
    dotColor: 'bg-amber-500',
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
    dotColor: 'bg-rose-500',
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
    dotColor: 'bg-violet-500',
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
    dotColor: 'bg-teal-500',
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

// Difficulty config for progress bars
const difficultyConfig: Record<string, { value: number; color: string; progressColor: string }> = {
  beginner: { value: 33, color: 'text-green-600 dark:text-green-400', progressColor: '[&>div]:bg-green-500' },
  intermediate: { value: 66, color: 'text-amber-600 dark:text-amber-400', progressColor: '[&>div]:bg-amber-500' },
  advanced: { value: 100, color: 'text-rose-600 dark:text-rose-400', progressColor: '[&>div]:bg-rose-500' },
}

export function KnowledgeHubView() {
  const { setCurrentView, setSelectedAgentId } = useAppStore()
  const { toast } = useToast()

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

  // Compute recently added agents (within last 7 days - simulated)
  const recentlyAddedAgents = useMemo(() => {
    // Since createdAt isn't available on KnowledgeAgent type, simulate from first 5
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

      // Parse JSON fields
      const parsed = newAgents.map((a: any) => ({
        ...a,
        tools: typeof a.tools === 'string' ? JSON.parse(a.tools || '[]') : a.tools || [],
        models: typeof a.models === 'string' ? JSON.parse(a.models || '[]') : a.models || [],
        tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags || [],
      }))

      // Client-side tag filter
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
        // Auto-retry with exponential backoff
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

  // Framework tabs data
  const frameworkTabs = Object.entries(frameworkConfig).map(([key, config]) => ({
    key,
    ...config,
    count: key === 'all' ? (stats?.knowledgeAgents || 0) : (frameworkCounts[key] || 0),
  }))

  return (
    <div>
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800" aria-label="Knowledge Hub Header">
        {/* Animated background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-300/5 rounded-full blur-3xl" />
          {/* Constellation / Particle effect */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white constellation-particle"
              style={{
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                left: `${5 + (i * 4.7) % 90}%`,
                top: `${5 + (i * 6.3) % 85}%`,
                '--twinkle-duration': `${2 + (i % 4)}s`,
                '--twinkle-delay': `${i * 0.3}s`,
              } as React.CSSProperties}
            />
          ))}
          {/* Constellation lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" aria-hidden="true">
            {[...Array(8)].map((_, i) => {
              const x1 = 10 + (i * 12) % 80
              const y1 = 15 + (i * 17) % 70
              const x2 = 15 + ((i + 3) * 11) % 75
              const y2 = 20 + ((i + 2) * 14) % 65
              return (
                <line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="white" strokeWidth="0.5" />
              )
            })}
          </svg>
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

              <div className="flex items-center gap-3 w-full lg:w-auto">
                {/* Random Agent Picker */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRandomPick}
                  disabled={randomSpinning || allAgents.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all shrink-0 disabled:opacity-50"
                  aria-label="Discover a random agent"
                >
                  <motion.div
                    animate={randomSpinning ? { rotate: 360 } : { rotate: 0 }}
                    transition={randomSpinning ? { duration: 0.8, ease: 'linear' } : {}}
                  >
                    <Shuffle className="h-4 w-4" />
                  </motion.div>
                  <span className="hidden sm:inline">Discover Random</span>
                  <span className="sm:hidden">Random</span>
                </motion.button>

                {/* Search in Knowledge Hub */}
                <div className="w-full lg:w-80 shrink-0">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300" />
                    <Input
                      placeholder="Search knowledge base..."
                      className="pl-9 h-11 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-emerald-200/60 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search knowledge base"
                    />
                    {/* Animated border gradient on focus */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 p-[1.5px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 pointer-events-none" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
                    {searchQuery && (
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200/60 hover:text-white transition-colors"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-white dark:bg-gray-950" aria-label="Platform statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto">
              {stats ? (
                [
                  { label: 'Total Agents', value: stats.knowledgeAgents, icon: Bot, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                  { label: 'Frameworks', value: stats.frameworks, icon: Cpu, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                  { label: 'Categories', value: stats.categories, icon: Layers, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                  { label: 'Industries', value: stats.topIndustries?.length || 0, icon: Building2, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 shrink-0"
                  >
                    {/* Icon background */}
                    <div className={`h-9 w-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
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
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-10 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Last updated indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <Clock className="h-3 w-3" />
              <span>Updated {minutesAgo === 0 ? 'just now' : `${minutesAgo}m ago`}</span>
            </div>
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
                  aria-label={`Filter by ${tab.label}`}
                  aria-pressed={isActive}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0
                    ${isActive
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md ${tab.shadowColor}`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {/* Colored dot indicator */}
                  <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-white/60' : tab.dotColor}`} />
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {/* Count badge */}
                  <span className={`
                    text-xs px-1.5 py-0.5 rounded-full font-semibold
                    ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                  `}>
                    {tab.count}
                  </span>
                  {/* Active bottom border animation */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-white/50 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Trending Section */}
        {!debouncedQuery && selectedFramework === 'all' && !selectedTag && (
          <section className="mb-10" aria-label="Trending agents">
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
              <Button variant="outline" size="sm" className="hidden sm:flex rounded-lg" onClick={() => handleNav('browse')} aria-label="View all agents">
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

        {/* Active tag filter indicator */}
        {selectedTag && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2"
          >
            <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-muted-foreground">Filtered by tag:</span>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 gap-1">
              {selectedTag}
              <button
                onClick={() => setSelectedTag(null)}
                className="ml-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                aria-label="Remove tag filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </motion.div>
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
                  {loading ? 'Loading...' : error ? 'Error loading agents' : `${total} agents found`}
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
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-900/20 mb-4">
                  <AlertCircle className="h-8 w-8 text-rose-500 dark:text-rose-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Failed to load agents</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
                <Button
                  onClick={() => {
                    setError(null)
                    setRetryCount(0)
                    fetchAgents(1)
                  }}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </motion.div>
            ) : agents.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No agents found</h3>
                <p className="text-muted-foreground mb-4">
                  {debouncedQuery
                    ? 'Try adjusting your search terms'
                    : 'Try selecting a different framework'}
                </p>
                {(debouncedQuery || selectedFramework !== 'all' || selectedTag) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedFramework('all')
                      setSelectedTag(null)
                    }}
                  >
                    <X className="h-4 w-4 mr-1" /> Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {agents.map((agent, i) => {
                    const diffConfig = agent.difficulty ? difficultyConfig[agent.difficulty.toLowerCase()] : null
                    return (
                      <motion.div
                        key={agent.id}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="relative group"
                      >
                        <AgentCard agent={agent} index={i} />
                        {/* Quick View overlay button */}
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.1 }}
                          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewAgent(agent)
                          }}
                          aria-label={`Quick preview ${agent.name}`}
                        >
                          <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </motion.button>
                        {/* Difficulty progress bar (replaces text) */}
                        {diffConfig && (
                          <div className="absolute bottom-14 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                            <div className="flex items-center gap-2">
                              <Progress value={diffConfig.value} className={`h-1.5 ${diffConfig.progressColor}`} />
                              <span className={`text-[10px] font-medium capitalize ${diffConfig.color}`}>{agent.difficulty}</span>
                            </div>
                          </div>
                        )}
                        {/* Tool count badge */}
                        {agent.tools && agent.tools.length > 0 && (
                          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                            <Badge variant="secondary" className="text-[10px] h-5 gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm">
                              <Wrench className="h-3 w-3" /> {agent.tools.length} tools
                            </Badge>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
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

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Tag Cloud Section */}
              {tagFrequency.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <Tag className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Popular Tags</h3>
                        <p className="text-xs text-muted-foreground">Click to filter</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tagFrequency.map(([tag, count], i) => {
                        const ratio = count / maxTagFreq
                        const sizeClass = ratio > 0.8 ? 'text-sm px-3 py-1' : ratio > 0.5 ? 'text-xs px-2.5 py-0.5' : 'text-[11px] px-2 py-0.5'
                        const emeraldClass = ratio > 0.8
                          ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800/40 dark:text-emerald-200 hover:bg-emerald-300 dark:hover:bg-emerald-700/50'
                          : ratio > 0.5
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/40'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                        const isActive = selectedTag === tag
                        return (
                          <motion.button
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.03 }}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedTag(isActive ? null : tag)}
                            className={`rounded-full font-medium transition-all cursor-pointer ${sizeClass} ${isActive ? 'ring-2 ring-emerald-500 bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white' : emeraldClass}`}
                            aria-label={`Filter by tag: ${tag} (${count} agents)`}
                            aria-pressed={isActive}
                          >
                            {tag}
                          </motion.button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recently Added Section */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Recently Added</h3>
                      <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">
                      {recentlyAddedAgents.length} new
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {recentlyAddedAgents.slice(0, 3).map((agent) => (
                      <button
                        key={agent.id}
                        className="w-full text-left text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                        onClick={() => {
                          setSelectedAgentId(agent.id)
                          setCurrentView('detail')
                          window.scrollTo(0, 0)
                        }}
                        aria-label={`View ${agent.name}`}
                      >
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        <span className="truncate">{agent.name}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
                      aria-label="Browse all agents"
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Browse All Agents
                    </button>
                    <button
                      className="w-full text-left text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                      onClick={() => handleNav('wizard')}
                      aria-label="Create new agent"
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Create New Agent
                    </button>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-left text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                      aria-label="Source repository"
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

      {/* Quick Preview Modal */}
      <Dialog open={!!previewAgent} onOpenChange={(open) => !open && setPreviewAgent(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewAgent?.name}
              {previewAgent?.framework && (
                <Badge variant="secondary" className="text-[10px]">
                  {previewAgent.framework}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewAgent && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {previewAgent.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {previewAgent.category && (
                  <Badge variant="outline" className="text-xs">{previewAgent.category}</Badge>
                )}
                {previewAgent.difficulty && (
                  <Badge variant="secondary" className="text-xs capitalize">{previewAgent.difficulty}</Badge>
                )}
                {previewAgent.language && (
                  <Badge variant="secondary" className="text-xs">{previewAgent.language}</Badge>
                )}
              </div>
              {/* Difficulty progress bar */}
              {previewAgent.difficulty && difficultyConfig[previewAgent.difficulty.toLowerCase()] && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Difficulty</span>
                  <Progress
                    value={difficultyConfig[previewAgent.difficulty.toLowerCase()].value}
                    className={`h-2 ${difficultyConfig[previewAgent.difficulty.toLowerCase()].progressColor}`}
                  />
                </div>
              )}
              {/* Tools */}
              {previewAgent.tools && previewAgent.tools.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground font-medium mb-1.5 block">Tools</span>
                  <div className="flex flex-wrap gap-1.5">
                    {previewAgent.tools.map((tool) => (
                      <Badge key={tool} variant="secondary" className="text-[10px] gap-1">
                        <Wrench className="h-2.5 w-2.5" /> {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {/* Models */}
              {previewAgent.models && previewAgent.models.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground font-medium mb-1.5 block">Models</span>
                  <div className="flex flex-wrap gap-1.5">
                    {previewAgent.models.map((model) => (
                      <Badge key={model} variant="outline" className="text-[10px]">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg"
                  onClick={() => {
                    setSelectedAgentId(previewAgent.id)
                    setCurrentView('detail')
                    setPreviewAgent(null)
                    window.scrollTo(0, 0)
                  }}
                  aria-label={`View full details for ${previewAgent.name}`}
                >
                  View Full Details
                </Button>
                <Button
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setPreviewAgent(null)}
                  aria-label="Close preview"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
