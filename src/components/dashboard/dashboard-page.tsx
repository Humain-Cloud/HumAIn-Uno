'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import {
  LayoutDashboard, PlusCircle, Loader2, Trash2, ArrowUpRight, TrendingUp,
  Sparkles, MoreVertical, Bookmark, Rocket, Eye, Pencil, Bot, Clock,
  Cpu, ChevronRight, Circle, CircleCheck, Lightbulb, Wrench, Gauge,
  Beaker, Package, Play,
} from 'lucide-react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const LazyRecharts = dynamic(() => import('@/components/dashboard/analytics-charts'), {
  ssr: false,
  loading: () => <div className="h-48 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>
})

// ─── Types ────────────────────────────────────────────────────────────

interface AgentItem {
  id: string
  name: string
  description: string
  privacy: string
  framework: string | null
  llm: string | null
  industry: string | null
  difficulty: string | null
  tags: string[]
  stars: number
  status: string
  healthScore: number
  totalRequests: number
  avgLatencyMs: number
  errorRate: number
  createdAt: string
  updatedAt: string
  category?: { name: string }
  _count?: { starredBy: number; comments: number }
}

interface ActivityItem {
  id: string
  type: 'created' | 'updated' | 'deployed' | 'tested' | 'deleted' | 'starred' | 'archived'
  message: string
  timestamp: string
  agentName?: string
  agentId?: string
}

interface BookmarkedModel {
  id: string
  model: {
    id: string
    name: string
    organization: string
    bestRating: number
    bestRank: number
    inputPricePerMillion: number | null
    outputPricePerMillion: number | null
    contextLength: number | null
    license: string
  }
  note?: string
  createdAt: string
}

// ─── Constants ────────────────────────────────────────────────────────

const frameworkBadge: Record<string, string> = {
  langgraph: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  crewai: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  autogen: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  agno: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  llamaindex: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
}

const statusBadge: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  testing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  deployed: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  archived: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

const statusLabel: Record<string, string> = { draft: 'Draft', active: 'Active', testing: 'Testing', deployed: 'Deployed', archived: 'Archived' }

const frameworkColors: Record<string, string> = { langgraph: '#10b981', crewai: '#f59e0b', autogen: '#f43f5e', agno: '#8b5cf6', llamaindex: '#14b8a6' }

const PIPELINE_STAGES = [
  { key: 'ideate', label: 'Ideate', icon: Lightbulb, statuses: ['draft'] },
  { key: 'initiate', label: 'Initiate', icon: Rocket, statuses: ['active'] },
  { key: 'configure', label: 'Configure', icon: Wrench, statuses: [] },
  { key: 'test', label: 'Test', icon: Beaker, statuses: ['testing'] },
  { key: 'deploy', label: 'Deploy', icon: Package, statuses: ['deployed'] },
  { key: 'monitor', label: 'Monitor', icon: Play, statuses: [] },
  { key: 'optimize', label: 'Optimize', icon: Gauge, statuses: [] },
] as const

const STATUS_COLORS: Record<string, string> = { draft: '#6b7280', active: '#10b981', testing: '#f59e0b', deployed: '#14b8a6', archived: '#f43f5e' }

// Shared class strings
const cardCls = 'border-0 shadow-md bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow'
const badgeCls = 'text-[10px] h-5'

// ─── Helpers ──────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(diff / 3600000)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(diff / 86400000)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch { return dateStr }
}

function MiniSparkline({ data, color = '#10b981', w = 60, h = 24 }: { data: number[]; color?: string; w?: number; h?: number }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ')
  return <svg width={w} height={h} className="inline-block ml-1"><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function HealthScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : score >= 40 ? 'bg-orange-500' : 'bg-rose-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.max(score, 0)}%` }} />
      </div>
      <span className="text-xs font-medium text-muted-foreground w-8 text-right">{score}%</span>
    </div>
  )
}

const activityIconMap: Record<string, { icon: typeof PlusCircle; cls: string }> = {
  created: { icon: PlusCircle, cls: 'text-emerald-500' },
  updated: { icon: Pencil, cls: 'text-amber-500' },
  deployed: { icon: Rocket, cls: 'text-teal-500' },
  tested: { icon: Beaker, cls: 'text-violet-500' },
  deleted: { icon: Trash2, cls: 'text-rose-500' },
  starred: { icon: Sparkles, cls: 'text-amber-500' },
  archived: { icon: Package, cls: 'text-gray-500' },
}

// ─── Main Component ───────────────────────────────────────────────────

export function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { setShowAuthModal } = useAppStore()
  const isAuthenticated = !!user

  const [activeTab, setActiveTab] = useState('agents')
  const [myAgents, setMyAgents] = useState<AgentItem[]>([])
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [bookmarkedModels, setBookmarkedModels] = useState<BookmarkedModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteTarget, setDeleteTarget] = useState<AgentItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([])

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const firstName = displayName.split(' ')[0]
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const initials = displayName.slice(0, 2).toUpperCase()

  const greetings = useMemo(() => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  }, [])

  // Auth guard
  useEffect(() => { if (!authLoading && !user) setShowAuthModal(true) }, [authLoading, user, setShowAuthModal])

  // Load agents
  const loadAgents = useCallback(async () => {
    if (!isAuthenticated || !user) return
    setAgentsLoading(true)
    try {
      const data: any = await api.agents.list({ creatorId: user.id, pageSize: 50 })
      setMyAgents(data?.data || data || [])
    } catch (err) { console.error('Failed to load agents:', err) }
    finally { setAgentsLoading(false) }
  }, [isAuthenticated, user])

  useEffect(() => { loadAgents() }, [loadAgents])

  // Load bookmarked models
  useEffect(() => {
    if (!isAuthenticated || !user) return
    setModelsLoading(true)
    fetch(`/api/llm-models/bookmark?userId=${user.id}`)
      .then(r => r.json()).then(d => setBookmarkedModels(d?.bookmarks || []))
      .catch(console.error).finally(() => setModelsLoading(false))
  }, [isAuthenticated, user])

  // Activity log
  useEffect(() => {
    try {
      const stored = localStorage.getItem('humain-activity-log')
      if (stored) { setActivityLog(JSON.parse(stored)); return }
    } catch { /* ignore */ }
    const types: ActivityItem['type'][] = ['created', 'updated', 'deployed', 'tested', 'starred']
    const generated: ActivityItem[] = myAgents.map((agent, i) => {
      const type = agent.status === 'deployed' ? 'deployed' : agent.status === 'testing' ? 'tested' : agent.status === 'active' ? 'updated' : types[i % types.length]
      const msgMap: Record<string, string> = { created: `Created "${agent.name}"`, deployed: `Deployed "${agent.name}"`, tested: `Started testing "${agent.name}"`, starred: `Starred "${agent.name}"`, updated: `Updated "${agent.name}"` }
      return { id: `activity-${agent.id}-${i}`, type, message: msgMap[type] || `Updated "${agent.name}"`, timestamp: agent.updatedAt || agent.createdAt, agentName: agent.name, agentId: agent.id }
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setActivityLog(generated)
  }, [myAgents])

  // ─── Computed ──────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalAgents = myAgents.length
    const deployedAgents = myAgents.filter(a => a.status === 'deployed').length
    const totalApiCalls = myAgents.reduce((s, a) => s + (a.totalRequests || 0), 0)
    const healthScores = myAgents.filter(a => (a.healthScore || 0) > 0)
    const avgHealth = healthScores.length > 0 ? Math.round(healthScores.reduce((s, a) => s + a.healthScore, 0) / healthScores.length) : 0
    return { totalAgents, deployedAgents, totalApiCalls, avgHealth }
  }, [myAgents])

  const pipelineCounts = useMemo(() => {
    const c: Record<string, number> = {}
    PIPELINE_STAGES.forEach(s => { c[s.key] = myAgents.filter(a => s.statuses.includes(a.status)).length })
    c.configure = myAgents.filter(a => a.framework && a.status !== 'draft').length
    c.monitor = myAgents.filter(a => a.status === 'deployed' && (a.totalRequests || 0) > 0).length
    c.optimize = myAgents.filter(a => a.healthScore >= 80).length
    return c
  }, [myAgents])

  const activePipelineStage = useMemo(() => {
    if (myAgents.some(a => a.status === 'deployed')) return 'deploy'
    if (myAgents.some(a => a.status === 'testing')) return 'test'
    if (myAgents.some(a => a.status === 'active')) return 'initiate'
    return 'ideate'
  }, [myAgents])

  const filteredAgents = useMemo(() => statusFilter === 'all' ? myAgents : myAgents.filter(a => a.status === statusFilter), [myAgents, statusFilter])

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: myAgents.length }
    myAgents.forEach(a => { c[a.status] = (c[a.status] || 0) + 1 })
    return c
  }, [myAgents])

  // Chart data
  const usageChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const base = stats.totalApiCalls || 50
    return days.map(day => ({ day, requests: Math.round(base * (0.5 + Math.random() * 0.8) / 7), errors: Math.round(base * 0.05 * Math.random() / 7) }))
  }, [stats.totalApiCalls])

  const statusChartData = useMemo(() =>
    Object.entries(statusCounts).filter(([k]) => k !== 'all').map(([status, count]) => ({ name: statusLabel[status] || status, count, color: STATUS_COLORS[status] || '#94a3b8' })),
  [statusCounts])

  const frameworkChartData = useMemo(() => {
    const c: Record<string, number> = {}
    myAgents.forEach(a => { const fw = a.framework || 'other'; c[fw] = (c[fw] || 0) + 1 })
    return Object.entries(c).map(([fw, count]) => ({ name: fw.charAt(0).toUpperCase() + fw.slice(1), count, color: frameworkColors[fw] || '#94a3b8' }))
  }, [myAgents])

  const sparkData = useMemo(() => ({
    agents: [3, 5, 4, 7, 6, 8, stats.totalAgents],
    deployments: [0, 1, 1, 2, 2, 3, stats.deployedAgents],
    apiCalls: [20, 45, 30, 55, 42, 68, Math.min(stats.totalApiCalls, 100)],
    health: [65, 72, 68, 78, 74, 82, stats.avgHealth],
  }), [stats])

  // ─── Handlers ──────────────────────────────────────────────────────

  const handleDeleteAgent = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.agents.delete(deleteTarget.id)
      setMyAgents(prev => prev.filter(a => a.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) { console.error('Failed to delete agent:', err) }
    finally { setDeleting(false) }
  }

  // ─── Loading State ─────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your command center...</p>
        </div>
      </div>
    )
  }

  // ─── Unauthenticated ───────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-500 flex items-center justify-center">
            <LayoutDashboard className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Command Center</h2>
          <p className="text-muted-foreground mb-6">Sign in to access your dashboard, manage agents, and track your progress.</p>
          <Button onClick={() => setShowAuthModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Sign In to Continue
          </Button>
        </motion.div>
      </div>
    )
  }

  // ─── Stats Cards Config ────────────────────────────────────────────

  const statCards = [
    { label: 'Total Agents', value: stats.totalAgents, spark: sparkData.agents, sparkColor: '#10b981', icon: Bot, iconCls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', badge: stats.totalAgents > 0 ? 'Active' : null, badgeCls: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Deployments', value: stats.deployedAgents, spark: sparkData.deployments, sparkColor: '#14b8a6', icon: Rocket, iconCls: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400', badge: stats.deployedAgents > 0 ? 'Live' : null, badgeCls: 'text-teal-600 dark:text-teal-400' },
    { label: 'API Calls', value: stats.totalApiCalls >= 1000 ? `${(stats.totalApiCalls / 1000).toFixed(1)}k` : stats.totalApiCalls, spark: sparkData.apiCalls, sparkColor: '#f59e0b', icon: Cpu, iconCls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', badge: stats.totalApiCalls > 0 ? 'Total' : null, badgeCls: 'text-amber-600 dark:text-amber-400' },
    { label: 'Health Score', value: `${stats.avgHealth}%`, spark: sparkData.health, sparkColor: '#f43f5e', icon: Sparkles, iconCls: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400', badge: stats.avgHealth >= 80 ? 'Good' : stats.avgHealth > 0 && stats.avgHealth < 60 ? 'Needs attention' : null, badgeCls: stats.avgHealth >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400' },
  ]

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ─── Welcome Banner ────────────────────────────────────────── */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-white/30">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-white/20 text-white text-lg font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{greetings}, {firstName}!</h1>
              <p className="text-emerald-100 text-sm sm:text-base">
                {myAgents.length === 0 ? 'Ready to build your first AI agent? Let\'s get started.' : `You have ${myAgents.length} agent${myAgents.length !== 1 ? 's' : ''} in your workspace. Keep building!`}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => router.push('/create')} variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <PlusCircle className="h-4 w-4 mr-2" /> New Agent
              </Button>
              <Button onClick={() => router.push('/browse')} variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <ArrowUpRight className="h-4 w-4 mr-2" /> Browse
              </Button>
            </div>
          </div>
        </div>

        {/* ─── Workflow Pipeline ──────────────────────────────────────── */}
        <Card className={cardCls}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Workflow Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-2">
              {PIPELINE_STAGES.map((stage, idx) => {
                const Icon = stage.icon
                const isActive = stage.key === activePipelineStage
                const count = pipelineCounts[stage.key] || 0
                return (
                  <div key={stage.key} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                      <div className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-colors ${
                        isActive ? 'bg-emerald-500 border-emerald-400 text-white shadow-md' :
                        count > 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300' :
                        'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500'
                      }`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        {count > 0 && <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold ring-2 ring-white dark:ring-gray-900">{count}</span>}
                      </div>
                      <span className={`text-[10px] sm:text-xs font-medium text-center truncate w-full ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>{stage.label}</span>
                    </div>
                    {idx < PIPELINE_STAGES.length - 1 && (
                      <ChevronRight className={`flex-shrink-0 h-3 w-3 sm:h-4 sm:w-4 mt-[-18px] ${isActive ? 'text-emerald-400' : 'text-gray-300 dark:text-gray-600'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* ─── Stats Row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(s => (
            <Card key={s.label} className={cardCls}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${s.iconCls}`}><s.icon className="h-4 w-4" /></div>
                    <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                  </div>
                  <MiniSparkline data={s.spark} color={s.sparkColor} />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl sm:text-3xl font-bold">{s.value}</span>
                  {s.badge && <span className={`text-xs font-medium flex items-center mb-1 ${s.badgeCls}`}><TrendingUp className="h-3 w-3 mr-0.5" />{s.badge}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ─── Main Tabbed Content ───────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-1 h-auto flex-wrap">
            <TabsTrigger value="agents" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><Bot className="h-3.5 w-3.5" /> My Agents</TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><Clock className="h-3.5 w-3.5" /> Activity</TabsTrigger>
            <TabsTrigger value="bookmarks" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><Bookmark className="h-3.5 w-3.5" /> Models</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><TrendingUp className="h-3.5 w-3.5" /> Analytics</TabsTrigger>
          </TabsList>

          {/* ─── My Agents Tab ──────────────────────────────────────── */}
          <TabsContent value="agents" className="space-y-4">
            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {[{ key: 'all', label: 'All' }, { key: 'draft', label: 'Draft' }, { key: 'active', label: 'Active' }, { key: 'testing', label: 'Testing' }, { key: 'deployed', label: 'Deployed' }, { key: 'archived', label: 'Archived' }].map(f => (
                <Button key={f.key} variant={statusFilter === f.key ? 'default' : 'outline'} size="sm"
                  onClick={() => setStatusFilter(f.key)}
                  className={`h-8 text-xs gap-1.5 ${statusFilter === f.key ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'hover:border-emerald-300 dark:hover:border-emerald-700'}`}>
                  {f.label}
                  <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">{statusCounts[f.key] || 0}</Badge>
                </Button>
              ))}
            </div>

            {/* Agents Grid */}
            {agentsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow-md"><CardContent className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-2 w-full" />
                  </CardContent></Card>
                ))}
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Bot className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{statusFilter !== 'all' ? `No ${statusLabel[statusFilter] || statusFilter} agents` : 'No agents yet'}</h3>
                <p className="text-muted-foreground text-sm mb-4">{statusFilter !== 'all' ? 'Try a different filter or create a new agent.' : 'Create your first AI agent and start building.'}</p>
                <Button onClick={() => router.push('/create')} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <PlusCircle className="h-4 w-4 mr-2" /> Create Agent
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredAgents.map(agent => (
                  <Card key={agent.id} className={`${cardCls} group h-full flex flex-col`}>
                    <CardContent className="p-5 flex flex-col flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{agent.name}</h3>
                          {agent.category?.name && <p className="text-xs text-muted-foreground">{agent.category.name}</p>}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => router.push(`/agents/${agent.id}`)}><Eye className="h-3.5 w-3.5 mr-2" /> View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/agents/${agent.id}`)}><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                            {agent.status !== 'deployed' && <DropdownMenuItem onClick={() => router.push(`/agents/${agent.id}`)}><Rocket className="h-3.5 w-3.5 mr-2" /> Deploy</DropdownMenuItem>}
                            {agent.status === 'draft' && <DropdownMenuItem onClick={() => router.push(`/agents/${agent.id}`)}><Beaker className="h-3.5 w-3.5 mr-2" /> Test</DropdownMenuItem>}
                            <DropdownMenuItem className="text-rose-600 dark:text-rose-400 focus:text-rose-600" onClick={() => setDeleteTarget(agent)}>
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Description + Health */}
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{agent.description || 'No description provided'}</p>
                      <div className="mb-3"><HealthScoreBar score={agent.healthScore || 0} /></div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge variant="secondary" className={`${badgeCls} ${statusBadge[agent.status] || statusBadge.draft}`}>{statusLabel[agent.status] || agent.status}</Badge>
                        {agent.framework && <Badge variant="secondary" className={`${badgeCls} ${frameworkBadge[agent.framework] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>{agent.framework}</Badge>}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          {agent.totalRequests > 0 && <span className="flex items-center gap-0.5"><Cpu className="h-3 w-3" /> {agent.totalRequests}</span>}
                          {(agent._count?.starredBy ?? 0) > 0 && <span className="flex items-center gap-0.5"><Sparkles className="h-3 w-3" /> {agent._count!.starredBy}</span>}
                        </div>
                        <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {formatRelativeTime(agent.updatedAt || agent.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── Activity Feed Tab ──────────────────────────────────── */}
          <TabsContent value="activity">
            <Card className={cardCls}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-500" /> Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {activityLog.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Clock className="h-7 w-7 text-gray-400" /></div>
                    <h3 className="font-semibold mb-1">No activity yet</h3>
                    <p className="text-sm text-muted-foreground">Your actions will appear here as you create and manage agents.</p>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto space-y-1">
                    {activityLog.map((item, idx) => {
                      const { icon: AIcon, cls: aCls } = activityIconMap[item.type] || activityIconMap.updated
                      return (
                        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                          <div className="flex flex-col items-center pt-0.5">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                              <AIcon className={`h-4 w-4 ${aCls}`} />
                            </div>
                            {idx < activityLog.length - 1 && <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mt-1" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{item.message}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{formatRelativeTime(item.timestamp)}</span>
                              {item.agentId && <Button variant="link" size="sm" className="h-auto p-0 text-xs text-emerald-600 dark:text-emerald-400" onClick={() => router.push(`/agents/${item.agentId}`)}>View agent <ArrowUpRight className="h-3 w-3 ml-0.5" /></Button>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Bookmarked Models Tab ──────────────────────────────── */}
          <TabsContent value="bookmarks">
            <Card className={cardCls}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2"><Bookmark className="h-4 w-4 text-emerald-500" /> Bookmarked Models</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => router.push('/llm-finder')} className="text-xs gap-1.5 hover:border-emerald-300"><PlusCircle className="h-3.5 w-3.5" /> Find Models</Button>
                </div>
              </CardHeader>
              <CardContent>
                {modelsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="p-4 rounded-lg border space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>)}
                  </div>
                ) : bookmarkedModels.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><Bookmark className="h-7 w-7 text-emerald-500" /></div>
                    <h3 className="font-semibold mb-1">No bookmarked models</h3>
                    <p className="text-sm text-muted-foreground mb-4">Explore LLM models and bookmark your favorites.</p>
                    <Button onClick={() => router.push('/llm-finder')} className="bg-emerald-500 hover:bg-emerald-600 text-white"><PlusCircle className="h-4 w-4 mr-2" /> Explore Models</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bookmarkedModels.map(bm => (
                      <div key={bm.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{bm.model.name}</h4>
                            <p className="text-xs text-muted-foreground">{bm.model.organization}</p>
                          </div>
                          {bm.model.bestRank <= 100 && <Badge className={`${badgeCls} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 shrink-0`}>#{bm.model.bestRank}</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {bm.model.bestRating > 0 && <span className="flex items-center gap-0.5"><Sparkles className="h-3 w-3 text-amber-500" /> {bm.model.bestRating.toFixed(0)}</span>}
                          {bm.model.outputPricePerMillion != null && <span>${bm.model.outputPricePerMillion.toFixed(2)}/M</span>}
                          {bm.model.contextLength != null && <span>{(bm.model.contextLength / 1000).toFixed(0)}k ctx</span>}
                        </div>
                        {bm.note && <p className="text-xs text-muted-foreground mt-2 italic line-clamp-1">&ldquo;{bm.note}&rdquo;</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Analytics Tab ──────────────────────────────────────── */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Avg Latency', value: myAgents.length > 0 ? `${Math.round(myAgents.reduce((s, a) => s + (a.avgLatencyMs || 0), 0) / myAgents.length)}ms` : '0ms', icon: Clock },
                { label: 'Error Rate', value: myAgents.length > 0 ? `${(myAgents.reduce((s, a) => s + (a.errorRate || 0), 0) / myAgents.length * 100).toFixed(1)}%` : '0%', icon: CircleCheck },
                { label: 'Frameworks', value: `${new Set(myAgents.map(a => a.framework).filter(Boolean)).size}`, icon: Cpu },
                { label: 'Public Agents', value: `${myAgents.filter(a => a.privacy === 'PUBLIC').length}`, icon: Circle },
              ].map(m => (
                <Card key={m.label} className="border-0 shadow-sm bg-white dark:bg-gray-900">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1"><m.icon className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[10px] sm:text-xs text-muted-foreground">{m.label}</span></div>
                    <span className="text-lg sm:text-xl font-bold">{m.value}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
            <LazyRecharts
              usageData={usageChartData.map(d => ({ date: d.day, requests: d.requests }))}
              statusData={statusChartData.map(d => ({ status: d.name, count: d.count }))}
              frameworkData={frameworkChartData.map(d => ({ name: d.name, value: d.count, color: d.color }))}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Delete Confirmation ────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>&ldquo;{deleteTarget?.name}&rdquo;</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAgent} disabled={deleting} className="bg-rose-600 hover:bg-rose-700 text-white">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
