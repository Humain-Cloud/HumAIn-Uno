'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { Stats, Category } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Shield,
  Database,
  RefreshCw,
  BarChart3,
  Bot,
  Layers,
  Cpu,
  Building2,
  Users,
  Loader2,
  Check,
  AlertTriangle,
  TrendingUp,
  Activity,
  Star,
  X,
  Search,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Rocket,
  UserPlus,
  HardDrive,
  ChevronUp,
  ChevronDown,
  Zap,
  Eye,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

// ─── Icon Map ──────────────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  Bot,
  Users,
  Star,
  Database,
  Rocket,
  UserPlus,
  HardDrive,
  Activity,
}

// ─── Framework Colors ──────────────────────────────────────────────
const frameworkColors: Record<string, { bar: string; text: string; badge: string; bg: string }> = {
  LangGraph: { bar: 'from-emerald-400 to-emerald-600', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', bg: 'bg-emerald-500' },
  CrewAI: { bar: 'from-amber-400 to-amber-600', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', bg: 'bg-amber-500' },
  AutoGen: { bar: 'from-rose-400 to-rose-600', text: 'text-rose-600', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', bg: 'bg-rose-500' },
  Agno: { bar: 'from-violet-400 to-violet-600', text: 'text-violet-600', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', bg: 'bg-violet-500' },
  LlamaIndex: { bar: 'from-teal-400 to-teal-600', text: 'text-teal-600', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', bg: 'bg-teal-500' },
}

const defaultFrameworkColor = { bar: 'from-gray-400 to-gray-600', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', bg: 'bg-gray-500' }

// ─── Relative Time ─────────────────────────────────────────────────
function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

// ─── Animated Counter ──────────────────────────────────────────────
function AnimatedCounter({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (value - start) * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, duration])

  return <span>{display.toLocaleString()}</span>
}

// ─── Activity ──────────────────────────────────────────────────────
interface ActivityItem {
  id: string
  type: string
  description: string
  timestamp: string
  icon: string
}

// ─── Featured Agent ────────────────────────────────────────────────
interface FeaturedAgent {
  id: string
  name: string
  framework: string | null
  category: string
  description: string
  featured: boolean
}

// ─── Search Agent (for dialog) ─────────────────────────────────────
interface SearchAgent {
  id: string
  name: string
  framework: string | null
  category: string
  description: string
  featured: boolean
}

export function AdminView() {
  const sessionData = useSession()
  const { toast } = useToast()
  const [stats, setStats] = useState<Stats | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [reindexing, setReindexing] = useState(false)
  const [reindexResult, setReindexResult] = useState<{ processed: number; new: number; updated: number } | null>(null)
  const [lastIndexed, setLastIndexed] = useState<string | null>(null)
  const [featuredAgents, setFeaturedAgents] = useState<FeaturedAgent[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [showAddFeaturedDialog, setShowAddFeaturedDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchAgent[]>([])
  const [searching, setSearching] = useState(false)
  const [sortColumn, setSortColumn] = useState<'category' | 'agents' | 'framework'>('agents')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const isAdmin = sessionData.data?.user && (sessionData.data.user as any).role === 'admin'

  useEffect(() => {
    loadData()
    // Set last indexed from the most recent knowledge agent
    loadLastIndexed()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [statsData, catsData]: any[] = await Promise.all([
        api.stats.get(),
        api.categories.list(),
      ])
      setStats(statsData)
      setCategories(Array.isArray(catsData) ? catsData : [])
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadFeatured() {
    try {
      const data: any = await api.admin.getFeatured()
      setFeaturedAgents(data.agents || [])
    } catch (err) {
      console.error('Failed to load featured agents:', err)
    }
  }

  async function loadActivities() {
    try {
      const data: any = await api.admin.getActivity()
      setActivities(data.activities || [])
    } catch (err) {
      console.error('Failed to load activities:', err)
    }
  }

  async function loadLastIndexed() {
    try {
      const res = await fetch('/api/knowledge?pageSize=1&sort=newest')
      if (res.ok) {
        const data = await res.json()
        if (data.data && data.data.length > 0) {
          setLastIndexed(data.data[0].createdAt)
        }
      }
    } catch {
      // Ignore
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadFeatured()
      loadActivities()
    }
  }, [isAdmin])

  const handleReindex = async () => {
    setReindexing(true)
    setReindexResult(null)
    try {
      const result: any = await api.admin.reindex()
      setReindexResult({
        processed: result.agentsProcessed,
        new: result.newAgents,
        updated: result.updatedAgents,
      })
      setLastIndexed(new Date().toISOString())
      await loadData()
      await loadActivities()
      toast({
        title: 'Re-index Complete',
        description: `Processed ${result.agentsProcessed} agents (${result.newAgents} new, ${result.updatedAgents} updated)`,
      })
    } catch (err) {
      toast({
        title: 'Re-index Failed',
        description: 'An error occurred during re-indexing.',
        variant: 'destructive',
      })
    } finally {
      setReindexing(false)
    }
  }

  const handleToggleFeatured = async (agentId: string, featured: boolean) => {
    try {
      await api.admin.toggleFeatured(agentId, featured)
      await loadFeatured()
      toast({
        title: featured ? 'Agent Featured' : 'Agent Unfeatured',
        description: featured ? 'Agent is now featured on the homepage.' : 'Agent removed from featured list.',
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to toggle featured status.',
        variant: 'destructive',
      })
    }
  }

  const handleSearchAgents = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const data: any = await api.knowledge.search({ q: query, pageSize: 10 })
      setSearchResults(data.data || [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  const handleSort = (column: 'category' | 'agents' | 'framework') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  // ─── Sort categories ────────────────────────────────────────
  const sortedCategories = [...categories].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1
    if (sortColumn === 'category') return dir * a.name.localeCompare(b.name)
    if (sortColumn === 'agents') return dir * ((a.agentCount || 0) - (b.agentCount || 0))
    return 0
  })

  // ─── Loading State ──────────────────────────────────────────
  if (sessionData.status === 'loading') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  // ─── Access Denied ──────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground mb-4">
            Sign in with an admin account to access this panel.
          </p>
          <p className="text-xs text-muted-foreground">
            Use <strong>admin@humain-uno.dev</strong> for admin access
          </p>
        </div>
      </div>
    )
  }

  // ─── Stats Card Config ─────────────────────────────────────
  const statCards = stats ? [
    { label: 'Total Agents', value: stats.totalAgents, icon: Bot, gradient: 'from-emerald-500 to-emerald-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Knowledge Base', value: stats.knowledgeAgents, icon: Database, gradient: 'from-amber-500 to-amber-600', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400' },
    { label: 'User Created', value: stats.userAgents || 0, icon: Users, gradient: 'from-violet-500 to-violet-600', iconBg: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600 dark:text-violet-400' },
    { label: 'Categories', value: stats.categories, icon: Layers, gradient: 'from-rose-500 to-rose-600', iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-600 dark:text-rose-400' },
    { label: 'Frameworks', value: stats.frameworks, icon: Cpu, gradient: 'from-cyan-500 to-cyan-600', iconBg: 'bg-cyan-100 dark:bg-cyan-900/30', iconColor: 'text-cyan-600 dark:text-cyan-400' },
    { label: 'Industries', value: (stats as any).industries || 0, icon: Building2, gradient: 'from-orange-500 to-orange-600', iconBg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400' },
  ] : []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* ─── Header ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 sm:p-8 mb-8 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8" />
              Admin Panel
            </h1>
            <p className="text-emerald-100 mt-1">Manage your Humain-Uno platform</p>
          </div>
          <div className="flex items-center gap-3">
            {lastIndexed && (
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 gap-1.5">
                <Clock className="h-3 w-3" />
                Last indexed: {formatRelativeTime(lastIndexed)}
              </Badge>
            )}
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 gap-1.5">
              <Shield className="h-3 w-3" />
              Admin
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
                <CardContent className="p-4 pt-5">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xl font-bold tracking-tight">
                        <AnimatedCounter value={stat.value} />
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column (2 cols) ──────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ─── Real Re-Index Card ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-md overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-amber-600" />
                  Knowledge Base Re-Index
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {stats?.knowledgeAgents ?? '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">KB Agents</div>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {lastIndexed ? formatRelativeTime(lastIndexed) : 'Never'}
                      </div>
                      <div className="text-xs text-muted-foreground">Last Indexed</div>
                    </div>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md"
                    onClick={handleReindex}
                    disabled={reindexing}
                  >
                    {reindexing ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Re-indexing...</>
                    ) : (
                      <><RefreshCw className="h-4 w-4 mr-2" /> Re-index Now</>
                    )}
                  </Button>
                </div>

                {/* Re-index Result */}
                <AnimatePresence>
                  {reindexResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <Check className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium text-emerald-700 dark:text-emerald-300">Re-index Complete</div>
                          <div className="text-emerald-600 dark:text-emerald-400 mt-1 space-x-4">
                            <span>{reindexResult.processed} processed</span>
                            <span className="text-emerald-800 dark:text-emerald-200 font-medium">+{reindexResult.new} new</span>
                            <span>{reindexResult.updated} updated</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Featured Agents Management ──────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-md overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-400 via-violet-500 to-purple-500" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4 text-violet-600" />
                    Featured Agents
                    <Badge variant="secondary" className="ml-1 text-[10px]">
                      {featuredAgents.length}/6
                    </Badge>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddFeaturedDialog(true)}
                    disabled={featuredAgents.length >= 6}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Add Featured
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {featuredAgents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No featured agents yet</p>
                    <p className="text-xs mt-1">Click &quot;Add Featured&quot; to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {featuredAgents.map((agent, i) => {
                      const fwColor = frameworkColors[agent.framework || ''] || defaultFrameworkColor
                      return (
                        <motion.div
                          key={agent.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="relative group p-3 rounded-lg border bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                        >
                          <button
                            onClick={() => handleToggleFeatured(agent.id, false)}
                            className="absolute top-2 right-2 h-5 w-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/30"
                          >
                            <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          </button>
                          <div className="flex items-start gap-2">
                            <div className={`h-8 w-8 rounded-md ${fwColor.bg} flex items-center justify-center flex-shrink-0`}>
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">{agent.name}</div>
                              {agent.framework && (
                                <Badge className={`text-[10px] mt-1 ${fwColor.badge}`}>
                                  {agent.framework}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            <span className="text-[10px] text-muted-foreground">Featured</span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Framework Distribution Chart ────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-md overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-600" />
                  Framework Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : stats?.topFrameworks ? (
                  <div className="space-y-3">
                    {stats.topFrameworks.slice(0, 6).map((fw, i) => {
                      const maxCount = stats.topFrameworks[0]?.count || 1
                      const percentage = Math.round((fw.count / maxCount) * 100)
                      const fwColor = frameworkColors[fw.name] || defaultFrameworkColor
                      return (
                        <div key={fw.name} className="flex items-center gap-3">
                          <span className={`text-sm font-medium w-24 truncate ${fwColor.text}`}>
                            {fw.name}
                          </span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-7 relative overflow-hidden">
                            <motion.div
                              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${fwColor.bar} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: i * 0.1, duration: 0.6 }}
                            />
                            <span className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
                              <span className="text-white drop-shadow-sm">{fw.count} agents</span>
                              <span className="text-muted-foreground text-[10px]">{percentage}%</span>
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Top Categories Table ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-md overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-rose-600" />
                  Top Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('category')}
                          >
                            <div className="flex items-center gap-1">
                              Category
                              {sortColumn === 'category' && (
                                sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer hover:bg-muted/50 text-right"
                            onClick={() => handleSort('agents')}
                          >
                            <div className="flex items-center gap-1 justify-end">
                              Agents
                              {sortColumn === 'agents' && (
                                sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead>Top Framework</TableHead>
                          <TableHead className="text-center">Trend</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedCategories.slice(0, 10).map((cat, i) => {
                          // Determine a "top framework" for this category from the framework distribution
                          const topFw = stats?.topFrameworks?.[0]?.name || '—'
                          const fwColor = frameworkColors[topFw] || defaultFrameworkColor
                          // Simulated trend
                          const trend = i % 3 === 0 ? 'up' : i % 3 === 1 ? 'neutral' : 'down'
                          return (
                            <TableRow key={cat.id}>
                              <TableCell className="font-medium">{cat.name}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant="secondary" className="font-mono">
                                  {cat.agentCount || 0}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] ${fwColor.badge}`}>
                                  {topFw}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {trend === 'up' && <ArrowUp className="h-4 w-4 text-emerald-500 mx-auto" />}
                                {trend === 'down' && <ArrowDown className="h-4 w-4 text-red-500 mx-auto" />}
                                {trend === 'neutral' && <Minus className="h-4 w-4 text-gray-400 mx-auto" />}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Category Management Grid ────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  All Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium truncate block">{cat.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {cat.agentCount || 0} agents
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] ml-2 flex-shrink-0">
                          {cat.slug}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Top Industries ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-600" />
                  Top Industries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : stats?.topIndustries ? (
                  <div className="flex flex-wrap gap-3">
                    {stats.topIndustries.map((ind, i) => (
                      <motion.div
                        key={ind.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-2 p-2.5 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Building2 className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{ind.name}</span>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {ind.count}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Right Column (1 col) ──────────────────────────── */}
        <div className="space-y-6">
          {/* ─── Activity Log ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-md overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[420px]">
                  <div className="px-6 pb-4 space-y-0">
                    {activities.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <Activity className="h-6 w-6 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No recent activity</p>
                      </div>
                    ) : (
                      activities.map((activity, i) => {
                        const IconComp = iconMap[activity.icon] || Activity
                        const typeColorMap: Record<string, string> = {
                          agent_created: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
                          agent_featured: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
                          knowledge_indexed: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30',
                          user_signed_up: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30',
                          system: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
                        }
                        const colorClass = typeColorMap[activity.type] || typeColorMap.system

                        return (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-3 py-3 border-b last:border-0"
                          >
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                              <IconComp className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm leading-snug">{activity.description}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {formatRelativeTime(activity.timestamp)}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Quick Actions ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleReindex}
                  disabled={reindexing}
                >
                  <RefreshCw className={`h-4 w-4 ${reindexing ? 'animate-spin' : ''}`} />
                  {reindexing ? 'Re-indexing...' : 'Re-index Knowledge Base'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setShowAddFeaturedDialog(true)}
                  disabled={featuredAgents.length >= 6}
                >
                  <Star className="h-4 w-4" />
                  Manage Featured Agents
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={async () => {
                    await loadActivities()
                    toast({ title: 'Activity log refreshed' })
                  }}
                >
                  <Activity className="h-4 w-4" />
                  Refresh Activity Log
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={async () => {
                    await loadData()
                    toast({ title: 'Stats refreshed' })
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Refresh Stats
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ─── Add Featured Agent Dialog ───────────────────────── */}
      <Dialog open={showAddFeaturedDialog} onOpenChange={setShowAddFeaturedDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Add Featured Agent
            </DialogTitle>
            <DialogDescription>
              Search and select an agent to feature on the homepage. Maximum 6 featured agents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents by name..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => handleSearchAgents(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[300px]">
              {searching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery.length < 2 ? (
                    <p className="text-sm">Type at least 2 characters to search</p>
                  ) : (
                    <p className="text-sm">No agents found</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((agent) => {
                    const isAlreadyFeatured = featuredAgents.some(f => f.id === agent.id)
                    const fwColor = frameworkColors[agent.framework || ''] || defaultFrameworkColor
                    return (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`h-8 w-8 rounded-md ${fwColor.bg} flex items-center justify-center flex-shrink-0`}>
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{agent.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {agent.framework && (
                                <Badge className={`text-[10px] ${fwColor.badge}`}>
                                  {agent.framework}
                                </Badge>
                              )}
                              <span className="text-[10px] text-muted-foreground truncate">{agent.category}</span>
                            </div>
                          </div>
                        </div>
                        {isAlreadyFeatured ? (
                          <Badge variant="secondary" className="text-[10px] flex-shrink-0 ml-2">
                            Featured
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-shrink-0 ml-2"
                            onClick={async () => {
                              await handleToggleFeatured(agent.id, true)
                              setSearchQuery('')
                              setSearchResults([])
                              setShowAddFeaturedDialog(false)
                            }}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Feature
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
