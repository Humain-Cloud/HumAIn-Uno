'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { useRequireAuth } from '@/components/auth/auth-modal'
import { UserAgentCard } from '@/components/agents/agent-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  LayoutDashboard,
  Bot,
  Star,
  Settings,
  PlusCircle,
  Trash2,
  Eye,
  Lock,
  Globe,
  Link2,
  Loader2,
  LogIn,
  TrendingUp,
  Zap,
  Cpu,
  Database,
  Sparkles,
  ArrowRight,
  Activity,
  Compass,
  Library,
  FolderOpen,
  Pencil,
  Check,
  X,
  Clock,
  Crown,
  Rocket,
  Heart,
  FolderPlus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Download,
  UserX,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'

// Animated counter component
function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) return
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return <>{target === 0 ? 0 : count}</>
}

export function DashboardView() {
  const { session, status, isAuthenticated } = useRequireAuth()
  const {
    setCurrentView,
    setSelectedAgentId,
    setShowAuthModal,
    collections,
    createCollection,
    deleteCollection,
    renameCollection,
    addToCollection,
    removeFromCollection,
  } = useAppStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [myAgents, setMyAgents] = useState<any[]>([])
  const [recentKB, setRecentKB] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private' | 'unlisted'>('all')
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [newCollectionName, setNewCollectionName] = useState('')
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false)
  const [collectionAgents, setCollectionAgents] = useState<Record<string, any[]>>({})

  useEffect(() => {
    async function loadPublicData() {
      try {
        const [statsData, kbData]: any[] = await Promise.all([
          api.stats.get(),
          api.knowledge.list({ page: 1, pageSize: 6 }),
        ])
        setStats(statsData)
        setRecentKB(kbData?.data || kbData || [])
      } catch (err) {
        console.error('Failed to load public data:', err)
      }
    }
    loadPublicData()
  }, [])

  useEffect(() => {
    if (status !== 'authenticated' || !session) return

    async function load() {
      setLoading(true)
      try {
        const userId = (session as any)?.id
        if (userId) {
          const data: any = await api.agents.list({ creatorId: userId, pageSize: 50 })
          setMyAgents(data?.data || data || [])
        }
      } catch (err) {
        console.error('Failed to load agents:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [status, session])

  // Load collection agents when a collection is expanded
  useEffect(() => {
    async function loadCollectionAgents() {
      if (!expandedCollection) return
      const col = collections.find((c) => c.id === expandedCollection)
      if (!col || col.agentIds.length === 0) return

      // Load agent details for the collection
      const agentsMap: Record<string, any> = {}
      try {
        // Try knowledge agents first
        for (const id of col.agentIds.slice(0, 10)) {
          try {
            const agent = await api.knowledge.get(id)
            agentsMap[id] = agent
          } catch {
            // Not a knowledge agent, try user agents
            try {
              const agent = await api.agents.get(id)
              agentsMap[id] = agent
            } catch { /* ignore */ }
          }
        }
      } catch { /* ignore */ }
      setCollectionAgents((prev) => ({ ...prev, [expandedCollection]: Object.values(agentsMap) }))
    }
    loadCollectionAgents()
  }, [expandedCollection, collections])

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return
    try {
      await api.agents.delete(id)
      setMyAgents(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error('Failed to delete agent:', err)
    }
  }

  const handleRenameCollection = (id: string) => {
    if (renameValue.trim()) {
      renameCollection(id, renameValue.trim())
    }
    setRenamingId(null)
    setRenameValue('')
  }

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      createCollection(newCollectionName.trim())
      setNewCollectionName('')
      setShowNewCollectionInput(false)
    }
  }

  const filteredAgents = useMemo(() => {
    if (privacyFilter === 'all') return myAgents
    return myAgents.filter(a => a.privacy?.toLowerCase() === privacyFilter)
  }, [myAgents, privacyFilter])

  const privacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'PUBLIC': return <Globe className="h-3 w-3" />
      case 'UNLISTED': return <Link2 className="h-3 w-3" />
      default: return <Lock className="h-3 w-3" />
    }
  }

  // Mock recent activity
  const recentActivity = [
    { id: '1', icon: Rocket, text: 'Created "Customer Support Bot"', time: '2 hours ago', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { id: '2', icon: Star, text: 'Starred "LangGraph Research Agent"', time: '5 hours ago', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
    { id: '3', icon: Heart, text: 'Bookmarked "CrewAI Code Reviewer"', time: '1 day ago', color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400' },
    { id: '4', icon: Crown, text: 'Made "Data Pipeline Agent" public', time: '2 days ago', color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400' },
    { id: '5', icon: FolderPlus, text: 'Added 3 agents to "My Favorites"', time: '3 days ago', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400' },
  ]

  // ===========================
  // LOADING STATE
  // ===========================
  if (status === 'loading') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  // ===========================
  // NON-AUTHENTICATED VIEW
  // ===========================
  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 sm:p-10 mb-8 text-white"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 mb-3">
              <Sparkles className="h-3 w-3 mr-1" /> Welcome to Humain-Uno
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Discover & Build AI Agents
            </h1>
            <p className="text-white/80 text-lg mb-6 max-w-xl">
              Browse 500+ curated agent projects, create your own, and organize them into collections.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-white text-emerald-700 hover:bg-white/90 font-semibold shadow-lg"
                onClick={() => setShowAuthModal(true)}
              >
                <LogIn className="h-4 w-4 mr-2" /> Sign In to Get Started
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => { setCurrentView('browse'); setSelectedAgentId(null) }}
              >
                Browse Agents
              </Button>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -right-4 -bottom-12 h-32 w-32 rounded-full bg-white/5 blur-xl" />
        </motion.div>

        {/* Quick Start Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Quick Start</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: 'Browse Agents',
                desc: 'Explore 500+ curated AI agents from top frameworks',
                icon: Compass,
                color: 'from-emerald-500 to-teal-600',
                iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
                iconColor: 'text-emerald-600 dark:text-emerald-400',
                action: () => { setCurrentView('browse'); setSelectedAgentId(null) },
              },
              {
                title: 'Create Your First Agent',
                desc: 'Use our wizard to build a custom AI agent in minutes',
                icon: PlusCircle,
                color: 'from-amber-500 to-orange-600',
                iconBg: 'bg-amber-100 dark:bg-amber-900/30',
                iconColor: 'text-amber-600 dark:text-amber-400',
                action: () => { setCurrentView('wizard'); setSelectedAgentId(null) },
              },
              {
                title: 'Explore Knowledge Hub',
                desc: 'Dive into the curated collection of agent projects',
                icon: Library,
                color: 'from-violet-500 to-purple-600',
                iconBg: 'bg-violet-100 dark:bg-violet-900/30',
                iconColor: 'text-violet-600 dark:text-violet-400',
                action: () => { setCurrentView('hub'); setSelectedAgentId(null) },
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="cursor-pointer"
                onClick={item.action}
              >
                <Card className="h-full rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`h-1 bg-gradient-to-r ${item.color}`} />
                  <CardContent className="p-6">
                    <div className={`h-12 w-12 rounded-xl ${item.iconBg} flex items-center justify-center mb-4`}>
                      <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Platform Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" /> Platform Stats
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Agents', value: stats.totalAgents || 0, icon: Bot, color: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
                { label: 'Frameworks', value: stats.frameworks || 0, icon: Cpu, color: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
                { label: 'Categories', value: stats.categories || 0, icon: Database, color: 'from-violet-500 to-purple-600', iconBg: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600' },
                { label: 'Industries', value: stats.topIndustries?.length || 0, icon: TrendingUp, color: 'from-rose-500 to-pink-600', iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-600' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                >
                  <Card className="overflow-hidden rounded-xl">
                    <div className={`h-1.5 bg-gradient-to-r ${stat.color}`} />
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                          <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                        </div>
                        <div>
                          <div className="text-2xl font-bold tracking-tight">
                            <AnimatedCounter target={stat.value} />
                          </div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recently Added */}
        {recentKB.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" /> Recently Added
              </h2>
              <Button variant="ghost" size="sm" className="text-emerald-600" onClick={() => { setCurrentView('browse'); setSelectedAgentId(null) }}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentKB.map((agent: any, i: number) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.05 }}
                  className="cursor-pointer"
                  onClick={() => { setSelectedAgentId(agent.id); setCurrentView('detail') }}
                >
                  <Card className="hover:shadow-md transition-shadow rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center shrink-0">
                          <Bot className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{agent.description}</p>
                          <div className="flex gap-1.5 mt-2">
                            {agent.framework && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{agent.framework}</Badge>
                            )}
                            {agent.category && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{agent.category}</Badge>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="shrink-0 h-7 text-xs text-emerald-600" onClick={(e) => { e.stopPropagation(); setSelectedAgentId(agent.id); setCurrentView('detail') }}>
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl bg-gradient-to-r from-gray-50 to-emerald-50/50 dark:from-gray-900 dark:to-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30 p-8 text-center"
        >
          <h2 className="text-xl font-bold mb-2">Sign in to create your own agents and build collections</h2>
          <p className="text-muted-foreground mb-4">Join thousands of developers building and sharing AI agents</p>
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
            onClick={() => setShowAuthModal(true)}
          >
            <LogIn className="h-4 w-4 mr-2" /> Sign In Now
          </Button>
        </motion.div>
      </div>
    )
  }

  // ===========================
  // AUTHENTICATED VIEW
  // ===========================
  const publicCount = myAgents.filter(a => a.privacy === 'PUBLIC').length
  const totalStars = myAgents.reduce((sum, a) => sum + (a.stars || 0), 0)
  const privateCount = myAgents.filter(a => a.privacy === 'PRIVATE').length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 mb-6 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-white/30 shadow-lg">
            <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
              {(session?.user?.name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'Developer'}!
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {myAgents.length > 0
                ? `You have ${myAgents.length} agent${myAgents.length !== 1 ? 's' : ''} — keep building!`
                : 'Ready to create your first AI agent?'}
            </p>
          </div>
          <Button
            className="bg-white text-emerald-700 hover:bg-white/90 font-semibold shadow-lg hidden sm:flex"
            onClick={() => { setCurrentView('wizard'); setSelectedAgentId(null) }}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Create Agent
          </Button>
        </div>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
      </motion.div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 dark:bg-gray-800 mb-6 w-full sm:w-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <LayoutDashboard className="h-4 w-4 mr-1.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="my-agents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Bot className="h-4 w-4 mr-1.5" /> My Agents
          </TabsTrigger>
          <TabsTrigger value="collections" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <FolderOpen className="h-4 w-4 mr-1.5" /> Collections
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Settings className="h-4 w-4 mr-1.5" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* =====================
            OVERVIEW TAB
        ===================== */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Agents', value: myAgents.length, icon: Bot, gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
                  { label: 'Public Agents', value: publicCount, icon: Globe, gradient: 'from-cyan-500 to-blue-600', iconBg: 'bg-cyan-100 dark:bg-cyan-900/30', iconColor: 'text-cyan-600' },
                  { label: 'Private Agents', value: privateCount, icon: Lock, gradient: 'from-gray-500 to-gray-600', iconBg: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-600 dark:text-gray-400' },
                  { label: 'Total Stars', value: totalStars, icon: Star, gradient: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
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
                    onClick={() => { setCurrentView('wizard'); setSelectedAgentId(null) }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Create Agent
                  </Button>
                  <Button variant="outline" className="rounded-xl" onClick={() => { setCurrentView('browse'); setSelectedAgentId(null) }}>
                    <Compass className="h-4 w-4 mr-2" /> Browse Templates
                  </Button>
                  <Button variant="outline" className="rounded-xl" onClick={() => { setCurrentView('hub'); setSelectedAgentId(null) }}>
                    <Library className="h-4 w-4 mr-2" /> Knowledge Hub
                  </Button>
                </div>
              </div>

              {/* Recent Activity */}
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-600" /> Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((event, i) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-3 py-2"
                      >
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${event.color}`}>
                          <event.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{event.text}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {event.time}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =====================
            MY AGENTS TAB
        ===================== */}
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
                  { key: 'all', label: 'All', count: myAgents.length },
                  { key: 'public', label: 'Public', count: publicCount },
                  { key: 'private', label: 'Private', count: privateCount },
                  { key: 'unlisted', label: 'Unlisted', count: myAgents.filter(a => a.privacy === 'UNLISTED').length },
                ].map((filter) => (
                  <Button
                    key={filter.key}
                    variant={privacyFilter === filter.key ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-lg ${privacyFilter === filter.key ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                    onClick={() => setPrivacyFilter(filter.key as typeof privacyFilter)}
                  >
                    {filter.label}
                    <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                      {filter.count}
                    </Badge>
                  </Button>
                ))}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-xl" />
                  ))}
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center py-16">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <div className="h-20 w-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                      <Bot className="h-10 w-10 text-emerald-600" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">Create Your First Agent</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Use our wizard to build a custom AI agent from scratch or from a template
                  </p>
                  <Button
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md rounded-xl"
                    onClick={() => { setCurrentView('wizard'); setSelectedAgentId(null) }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Create Agent
                  </Button>
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
                      <UserAgentCard agent={agent} index={i} />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAgent(agent.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* =====================
            COLLECTIONS TAB
        ===================== */}
        <AnimatePresence mode="wait">
          {activeTab === 'collections' && (
            <motion.div
              key="collections"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Create Collection */}
              <div className="mb-6">
                {showNewCollectionInput ? (
                  <div className="flex gap-2 max-w-md">
                    <Input
                      placeholder="Collection name..."
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateCollection()
                        if (e.key === 'Escape') { setShowNewCollectionInput(false); setNewCollectionName('') }
                      }}
                      className="rounded-xl"
                      autoFocus
                    />
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" onClick={handleCreateCollection}>
                      <Check className="h-4 w-4 mr-1" /> Create
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={() => { setShowNewCollectionInput(false); setNewCollectionName('') }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setShowNewCollectionInput(true)}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" /> Create New Collection
                  </Button>
                )}
              </div>

              {/* Collections Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((col, i) => {
                  const isExpanded = expandedCollection === col.id
                  const isRenaming = renamingId === col.id
                  const colAgents = collectionAgents[col.id] || []

                  return (
                    <motion.div
                      key={col.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      layout
                    >
                      <Card className={`rounded-xl overflow-hidden transition-all ${isExpanded ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
                        <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                        <CardContent className={`p-4 ${isExpanded ? 'p-6' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              {isRenaming ? (
                                <div className="flex gap-2 mb-2">
                                  <Input
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleRenameCollection(col.id)
                                      if (e.key === 'Escape') { setRenamingId(null); setRenameValue('') }
                                    }}
                                    className="h-7 text-sm"
                                    autoFocus
                                  />
                                  <Button size="sm" className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleRenameCollection(col.id)}>
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => { setRenamingId(null); setRenameValue('') }}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <h3 className="font-semibold text-base truncate">{col.name}</h3>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[10px]">
                                  {col.agentIds.length} agent{col.agentIds.length !== 1 ? 's' : ''}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Created {new Date(col.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {col.agentIds.length > 0 && !isExpanded && (
                                <div className="mt-2 text-xs text-muted-foreground line-clamp-1">
                                  {col.agentIds.slice(0, 3).map((id) => {
                                    const agent = colAgents.find((a: any) => a.id === id)
                                    return agent ? agent.name : id.slice(0, 8)
                                  }).join(', ')}
                                  {col.agentIds.length > 3 && ` +${col.agentIds.length - 3} more`}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => setRenamingId(col.id)}
                                      className="h-8 w-8 min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">Rename</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {col.id !== 'default' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button
                                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete &quot;{col.name}&quot;? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-rose-600 hover:bg-rose-700 text-white"
                                        onClick={() => deleteCollection(col.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              <button
                                onClick={() => setExpandedCollection(isExpanded ? null : col.id)}
                                className="h-8 w-8 min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Collection - Show Agents */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <Separator className="my-4" />
                                {col.agentIds.length === 0 ? (
                                  <div className="text-center py-6">
                                    <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No agents in this collection yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">Bookmark agents to add them to this collection</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {col.agentIds.map((agentId) => {
                                      const agent = colAgents.find((a: any) => a.id === agentId)
                                      return (
                                        <div
                                          key={agentId}
                                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                          onClick={() => {
                                            setSelectedAgentId(agentId)
                                            setCurrentView('detail')
                                          }}
                                        >
                                          <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                            <Bot className="h-4 w-4 text-emerald-600" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                              {agent ? agent.name : agentId.slice(0, 12) + '...'}
                                            </p>
                                            {agent && (
                                              <p className="text-xs text-muted-foreground line-clamp-1">
                                                {agent.description || agent.framework || 'AI Agent'}
                                              </p>
                                            )}
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              removeFromCollection(col.id, agentId)
                                            }}
                                            className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shrink-0"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {collections.length === 0 && (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-1">No Collections</h3>
                  <p className="text-muted-foreground mb-4">Create your first collection to organize your agents</p>
                  <Button
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                    onClick={() => setShowNewCollectionInput(true)}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" /> Create Collection
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* =====================
            SETTINGS TAB
        ===================== */}
        <AnimatePresence mode="wait">
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="max-w-lg">
                {/* Profile Card */}
                <Card className="rounded-xl mb-6">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="h-4 w-4" /> Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 mb-2">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xl font-bold">
                          {(session?.user?.name || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{session?.user?.name || 'User'}</p>
                        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input value={session?.user?.name || ''} disabled className="bg-gray-50 dark:bg-gray-800 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={session?.user?.email || ''} disabled className="bg-gray-50 dark:bg-gray-800 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea placeholder="Tell us about yourself..." className="rounded-xl" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Member Since</Label>
                      <Input value="Today" disabled className="bg-gray-50 dark:bg-gray-800 rounded-xl" />
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="rounded-xl border-rose-200 dark:border-rose-800/30">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-rose-600">
                      <AlertTriangle className="h-4 w-4" /> Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Delete Account</p>
                        <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800/30 dark:hover:bg-rose-900/20" disabled>
                        <UserX className="h-4 w-4 mr-2" /> Coming Soon
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Export Data</p>
                        <p className="text-xs text-muted-foreground">Download all your agents and collections</p>
                      </div>
                      <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800/30 dark:hover:bg-amber-900/20" disabled>
                        <Download className="h-4 w-4 mr-2" /> Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  )
}
