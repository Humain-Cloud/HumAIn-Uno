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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bot,
  Globe,
  Heart,
  Star,
  Eye,
  Clock,
  PlusCircle,
  Compass,
  Library,
  Cpu,
  Loader2,
  Trash2,
  ExternalLink,
  ArrowUpRight,
  LayoutDashboard,
  FolderOpen,
  Settings,
  RefreshCw,
  TrendingUp,
  Users,
  BookOpen,
  Sparkles,
  MoreVertical,
  Bookmark,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
  createdAt: string
  category?: { name: string }
  creator?: { name: string }
  _count?: { starredBy: number; comments: number }
}

interface ActivityItem {
  id: string
  type: 'created' | 'starred' | 'commented' | 'updated'
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
    outputPricePerMillion: number | null
  }
  note?: string
  createdAt: string
}

const frameworkBadge: Record<string, string> = {
  langgraph: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  crewai: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  autogen: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  agno: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  llamaindex: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
}

const difficultyBadge: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

export function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const { setShowAuthModal } = useAppStore()
  const isAuthenticated = !!user

  const [activeTab, setActiveTab] = useState('overview')
  const [myAgents, setMyAgents] = useState<AgentItem[]>([])
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [bookmarkedModels, setBookmarkedModels] = useState<BookmarkedModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'PUBLIC' | 'PRIVATE' | 'UNLISTED'>('all')
  const [profileRefreshing, setProfileRefreshing] = useState(false)

  // Derived user info
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const firstName = displayName.split(' ')[0]
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const initials = displayName.slice(0, 2).toUpperCase()

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true)
    }
  }, [authLoading, user, setShowAuthModal])

  // Load user agents
  useEffect(() => {
    if (!isAuthenticated || !user) return
    async function load() {
      setAgentsLoading(true)
      try {
        const data: any = await api.agents.list({ creatorId: user.id, pageSize: 50 })
        setMyAgents(data?.data || data || [])
      } catch (err) {
        console.error('Failed to load agents:', err)
      } finally {
        setAgentsLoading(false)
      }
    }
    load()
  }, [isAuthenticated, user])

  // Load bookmarked models
  useEffect(() => {
    if (!isAuthenticated || !user) return
    setModelsLoading(true)
    fetch(`/api/llm-models/bookmark?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setBookmarkedModels(data?.bookmarks || [])
      })
      .catch(console.error)
      .finally(() => setModelsLoading(false))
  }, [isAuthenticated, user])

  // Stats
  const totalStars = useMemo(() =>
    myAgents.reduce((sum, a) => sum + (a.stars || a._count?.starredBy || 0), 0),
    [myAgents]
  )

  // Generate activity from agents
  const recentActivity: ActivityItem[] = useMemo(() =>
    myAgents.slice(0, 5).map((agent, i) => ({
      id: `activity-${i}`,
      type: 'created' as const,
      message: `Created "${agent.name}"`,
      timestamp: agent.createdAt,
      agentName: agent.name,
      agentId: agent.id,
    })),
    [myAgents]
  )

  const filteredAgents = useMemo(() => {
    if (privacyFilter === 'all') return myAgents
    return myAgents.filter(a => a.privacy === privacyFilter)
  }, [myAgents, privacyFilter])

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return
    try {
      await api.agents.delete(id)
      setMyAgents(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error('Failed to delete agent:', err)
    }
  }

  const handleRefreshProfile = async () => {
    setProfileRefreshing(true)
    try {
      await refreshProfile()
    } finally {
      setProfileRefreshing(false)
    }
  }

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <LayoutDashboard className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Sign in to View Dashboard</h2>
          <p className="text-muted-foreground max-w-md">
            Your personalized dashboard shows your agents, bookmarks, and activity.
          </p>
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            onClick={() => setShowAuthModal(true)}
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 mb-6 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-white/30 shadow-lg">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
            <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> Welcome back!
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Hello, {firstName}!</h1>
            <p className="text-white/70 text-sm mt-1">
              {myAgents.length > 0
                ? `You have ${myAgents.length} agent${myAgents.length !== 1 ? 's' : ''} — keep building!`
                : 'Ready to create your first AI agent?'}
            </p>
          </div>
          <Button
            className="bg-white text-emerald-700 hover:bg-white/90 font-semibold shadow-lg hidden sm:flex rounded-xl"
            onClick={() => router.push('/create')}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Create Agent
          </Button>
        </div>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -right-4 -bottom-8 h-24 w-24 rounded-full bg-white/5 blur-xl" />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'My Agents', value: myAgents.length, icon: Bot, gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
          { label: 'Total Stars', value: totalStars, icon: Star, gradient: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
          { label: 'Public Agents', value: myAgents.filter(a => a.privacy === 'PUBLIC').length, icon: Globe, gradient: 'from-cyan-500 to-blue-600', iconBg: 'bg-cyan-100 dark:bg-cyan-900/30', iconColor: 'text-cyan-600' },
          { label: 'Bookmarked Models', value: bookmarkedModels.length, icon: Bookmark, gradient: 'from-rose-500 to-pink-600', iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="overflow-hidden rounded-xl">
              <div className={`h-1.5 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md rounded-xl"
            onClick={() => router.push('/create')}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Create New Agent
          </Button>
          <Button variant="outline" className="rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all" onClick={() => router.push('/knowledge-base')}>
            <Library className="h-4 w-4 mr-2" /> Browse Knowledge Base
          </Button>
          <Button variant="outline" className="rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all" onClick={() => router.push('/models')}>
            <Cpu className="h-4 w-4 mr-2" /> Explore LLM Models
          </Button>
          <Button variant="outline" className="rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all" onClick={() => router.push('/browse')}>
            <Compass className="h-4 w-4 mr-2" /> Browse Agents
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 dark:bg-gray-800 mb-6 w-full sm:w-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <LayoutDashboard className="h-4 w-4 mr-1.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="my-agents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Bot className="h-4 w-4 mr-1.5" /> My Agents
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Bookmark className="h-4 w-4 mr-1.5" /> Bookmarks
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                  <Card className="rounded-2xl">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground" /> Recent Activity
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={handleRefreshProfile} disabled={profileRefreshing}>
                          <RefreshCw className={`h-4 w-4 ${profileRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {recentActivity.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">No recent activity yet</p>
                          <Button
                            variant="link"
                            className="text-emerald-600"
                            onClick={() => router.push('/create')}
                          >
                            Create your first agent
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recentActivity.map((activity, i) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{activity.message}</p>
                                <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
                              </div>
                              {activity.agentId && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  onClick={() => router.push(`/agents/${activity.agentId}`)}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Bookmarked Models Sidebar */}
                <div>
                  <Card className="rounded-2xl">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Bookmark className="h-5 w-5 text-rose-500" /> Saved Models
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/models')}>
                          View All <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {modelsLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 rounded-lg" />
                          ))}
                        </div>
                      ) : bookmarkedModels.length === 0 ? (
                        <div className="text-center py-6">
                          <Cpu className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">No bookmarked models</p>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-emerald-600"
                            onClick={() => router.push('/models')}
                          >
                            Explore models
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {bookmarkedModels.slice(0, 5).map((bm, i) => (
                            <div
                              key={bm.id}
                              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                              onClick={() => router.push('/models')}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium truncate">{bm.model.name}</p>
                                <Badge variant="outline" className="text-[10px] px-1.5 shrink-0">
                                  #{bm.model.bestRank}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{bm.model.organization}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* My Agents Preview (recent 3) */}
              {myAgents.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Agents</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('my-agents')}>
                      View All <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myAgents.slice(0, 3).map((agent, i) => (
                      <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card
                          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 rounded-xl"
                          onClick={() => router.push(`/agents/${agent.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm line-clamp-1">{agent.name}</h4>
                              <Badge variant="outline" className="text-[10px] px-1.5 shrink-0 ml-2">
                                {agent.privacy}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {agent.framework && (
                                <Badge className={`text-[10px] px-2 py-0.5 ${frameworkBadge[agent.framework.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                                  {agent.framework}
                                </Badge>
                              )}
                              {agent.difficulty && (
                                <Badge className={`text-[10px] px-2 py-0.5 ${difficultyBadge[agent.difficulty] || ''}`}>
                                  {agent.difficulty}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" /> {agent.stars || agent._count?.starredBy || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {formatRelativeTime(agent.createdAt)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MY AGENTS TAB */}
        <AnimatePresence mode="wait">
          {activeTab === 'my-agents' && (
            <motion.div
              key="my-agents"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Privacy Filter */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {[
                  { key: 'all' as const, label: 'All', count: myAgents.length },
                  { key: 'PUBLIC' as const, label: 'Public', count: myAgents.filter(a => a.privacy === 'PUBLIC').length },
                  { key: 'PRIVATE' as const, label: 'Private', count: myAgents.filter(a => a.privacy === 'PRIVATE').length },
                  { key: 'UNLISTED' as const, label: 'Unlisted', count: myAgents.filter(a => a.privacy === 'UNLISTED').length },
                ].map(filter => (
                  <Button
                    key={filter.key}
                    variant={privacyFilter === filter.key ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-lg ${privacyFilter === filter.key ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                    onClick={() => setPrivacyFilter(filter.key)}
                  >
                    {filter.label}
                    <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{filter.count}</Badge>
                  </Button>
                ))}
              </div>

              {agentsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-44 rounded-xl" />
                  ))}
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center py-16">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">
                    {myAgents.length === 0 ? 'No agents yet' : 'No agents match this filter'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {myAgents.length === 0 ? 'Create your first AI agent to get started.' : 'Try a different filter.'}
                  </p>
                  {myAgents.length === 0 && (
                    <Button
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      onClick={() => router.push('/create')}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Create Agent
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAgents.map((agent, i) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative group"
                    >
                      <Card
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 rounded-xl h-full"
                        onClick={() => router.push(`/agents/${agent.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm line-clamp-1">{agent.name}</h4>
                            <Badge variant="outline" className="text-[10px] px-1.5 shrink-0 ml-2">
                              {agent.privacy}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            {agent.framework && (
                              <Badge className={`text-[10px] px-2 py-0.5 ${frameworkBadge[agent.framework.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                                {agent.framework}
                              </Badge>
                            )}
                            {agent.difficulty && (
                              <Badge className={`text-[10px] px-2 py-0.5 ${difficultyBadge[agent.difficulty] || ''}`}>
                                {agent.difficulty}
                              </Badge>
                            )}
                            {agent.llm && (
                              <Badge variant="outline" className="text-[10px] px-2 py-0.5">{agent.llm}</Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" /> {agent.stars || agent._count?.starredBy || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" /> {agent._count?.comments || 0}
                              </span>
                            </div>
                            <span>{formatRelativeTime(agent.createdAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                      {/* Delete button */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
                              onClick={e => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); router.push(`/agents/${agent.id}`) }}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => { e.stopPropagation(); handleDeleteAgent(agent.id) }}
                              className="text-red-600 dark:text-red-400 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOOKMARKS TAB */}
        <AnimatePresence mode="wait">
          {activeTab === 'bookmarks' && (
            <motion.div
              key="bookmarks"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {modelsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
              ) : bookmarkedModels.length === 0 ? (
                <div className="text-center py-16">
                  <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No bookmarked models</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Explore LLM models and bookmark your favorites.
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => router.push('/models')}
                  >
                    <Cpu className="h-4 w-4 mr-2" /> Explore LLM Models
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarkedModels.map((bm, i) => (
                    <motion.div
                      key={bm.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 rounded-xl"
                        onClick={() => router.push('/models')}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm line-clamp-1">{bm.model.name}</h4>
                            <Badge variant="outline" className="text-[10px] px-1.5 shrink-0 ml-2">
                              Rank #{bm.model.bestRank}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{bm.model.organization}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 text-amber-600">
                              <Star className="h-3 w-3" /> {bm.model.bestRating.toFixed(0)}
                            </span>
                            {bm.model.outputPricePerMillion != null && (
                              <span className="text-muted-foreground">
                                ${bm.model.outputPricePerMillion.toFixed(2)}/M tokens
                              </span>
                            )}
                          </div>
                          {bm.note && (
                            <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">
                              &quot;{bm.note}&quot;
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  )
}
