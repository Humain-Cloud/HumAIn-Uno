'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'

// shadcn/ui
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'

// Lucide Icons
import {
  Bot,
  Heart,
  FolderOpen,
  Globe,
  Link2,
  Lock,
  Star,
  Clock,
  Activity,
  Settings,
  User,
  MapPin,
  Briefcase,
  Building2,
  ExternalLink,
  PlusCircle,
  Compass,
  Library,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Crown,
  Rocket,
  FolderPlus,
  AlertTriangle,
  UserX,
  Download,
  LogIn,
  ArrowRight,
  Eye,
  TrendingUp,
  Cpu,
  Database,
  Shield,
  Loader2,
  Camera,
  CheckCircle2,
  Mail,
  CalendarDays,
  Zap,
} from 'lucide-react'

// Framer Motion
import { motion, AnimatePresence } from 'framer-motion'

// Types
import type { UserProfile } from '@/lib/supabase/types'

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getMemberLevel(
  agentsCount: number,
  bookmarksCount: number,
  collectionsCount: number
): { level: string; color: string; icon: typeof Crown } {
  const score = agentsCount * 3 + bookmarksCount + collectionsCount * 2
  if (score >= 20) return { level: 'Advanced', color: 'text-emerald-600 dark:text-emerald-400', icon: Crown }
  if (score >= 8) return { level: 'Intermediate', color: 'text-amber-600 dark:text-amber-400', icon: Zap }
  return { level: 'Beginner', color: 'text-sky-600 dark:text-sky-400', icon: Star }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'N/A'
  }
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0][0].toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return 'U'
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.3 },
}

// ─────────────────────────────────────────────────
// Activity data (shared)
// ─────────────────────────────────────────────────

const recentActivity = [
  { id: '1', icon: Rocket, text: 'Created "Customer Support Bot"', time: '2 hours ago', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { id: '2', icon: Star, text: 'Starred "LangGraph Research Agent"', time: '5 hours ago', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
  { id: '3', icon: Heart, text: 'Bookmarked "CrewAI Code Reviewer"', time: '1 day ago', color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400' },
  { id: '4', icon: Crown, text: 'Made "Data Pipeline Agent" public', time: '2 days ago', color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400' },
  { id: '5', icon: FolderPlus, text: 'Added 3 agents to "My Favorites"', time: '3 days ago', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { id: '6', icon: Globe, text: 'Published "Market Analysis Bot"', time: '4 days ago', color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400' },
]

// ─────────────────────────────────────────────────
// Unauthenticated CTA
// ─────────────────────────────────────────────────

function UnauthenticatedView() {
  const { setShowAuthModal } = useAppStore()
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-6">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40">
            <Shield className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
        <p className="text-muted-foreground mb-6">
          Access your personal dashboard to manage agents, collections, and profile settings.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md rounded-xl h-11"
            onClick={() => router.push('/auth/signin')}
          >
            <LogIn className="h-4 w-4 mr-2" /> Sign In to Continue
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => router.push('/browse')}
          >
            <Compass className="h-4 w-4 mr-2" /> Browse Agents Instead
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────

function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Skeleton className="h-36 rounded-2xl mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 rounded-lg mb-6 w-full max-w-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  iconBg,
  iconColor,
  index = 0,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  gradient: string
  iconBg: string
  iconColor: string
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className="overflow-hidden rounded-xl hover:shadow-md transition-shadow">
        <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold tracking-tight">{value}</div>
              <div className="text-xs text-muted-foreground truncate">{label}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const {
    collections,
    createCollection,
    deleteCollection,
    renameCollection,
    removeFromCollection,
    bookmarkedAgentIds,
    toggleBookmark,
    recentlyViewedAgentIds,
    clearRecentlyViewed,
    setCurrentView,
    setSelectedAgentId,
    setShowAuthModal,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState('overview')
  const [myAgents, setMyAgents] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private' | 'unlisted'>('all')
  const [bookmarkedAgents, setBookmarkedAgents] = useState<any[]>([])
  const [recentlyViewedAgents, setRecentlyViewedAgents] = useState<any[]>([])
  const [recentlyViewedLoading, setRecentlyViewedLoading] = useState(false)

  // Derived state
  const isAuthenticated = !!user
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const displayEmail = user?.email ?? ''
  const initials = getInitials(displayName, displayEmail)
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null

  // Navigation helper
  const handleNavigate = (view: string) => {
    setCurrentView(view as any)
    setSelectedAgentId(null)
  }

  const handleSelectAgent = (id: string) => {
    setSelectedAgentId(id)
    setCurrentView('detail')
  }

  // Load public data (stats)
  useEffect(() => {
    async function loadPublicData() {
      try {
        const statsData: any = await api.stats.get()
        setStats(statsData)
      } catch (err) {
        console.error('Failed to load public data:', err)
      }
    }
    loadPublicData()
  }, [])

  // Load user agents when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return

    async function load() {
      setDataLoading(true)
      try {
        const data: any = await api.agents.list({ creatorId: user.id, pageSize: 50 })
        setMyAgents(data?.data || data || [])
      } catch (err) {
        console.error('Failed to load agents:', err)
      } finally {
        setDataLoading(false)
      }
    }
    load()
  }, [isAuthenticated, user])

  // Load bookmarked agents
  useEffect(() => {
    async function loadBookmarkedAgents() {
      if (bookmarkedAgentIds.length === 0) {
        setBookmarkedAgents([])
        return
      }
      const agents: any[] = []
      for (const id of bookmarkedAgentIds.slice(0, 10)) {
        try {
          const agent = await api.knowledge.get(id)
          agents.push(agent)
        } catch {
          try {
            const agent = await api.agents.get(id)
            agents.push(agent)
          } catch { /* ignore */ }
        }
      }
      setBookmarkedAgents(agents)
    }
    loadBookmarkedAgents()
  }, [bookmarkedAgentIds])

  // Load recently viewed agents
  useEffect(() => {
    async function loadRecentlyViewedAgents() {
      if (recentlyViewedAgentIds.length === 0) {
        setRecentlyViewedAgents([])
        return
      }
      setRecentlyViewedLoading(true)
      const agents: any[] = []
      for (const id of recentlyViewedAgentIds.slice(0, 6)) {
        try {
          const agent = await api.knowledge.get(id)
          agents.push(agent)
        } catch {
          try {
            const agent = await api.agents.get(id)
            agents.push(agent)
          } catch { /* ignore */ }
        }
      }
      setRecentlyViewedAgents(agents)
      setRecentlyViewedLoading(false)
    }
    loadRecentlyViewedAgents()
  }, [recentlyViewedAgentIds])

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return
    try {
      await api.agents.delete(id)
      setMyAgents(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error('Failed to delete agent:', err)
    }
  }

  const filteredAgents = useMemo(() => {
    if (privacyFilter === 'all') return myAgents
    return myAgents.filter(a => a.privacy?.toLowerCase() === privacyFilter)
  }, [myAgents, privacyFilter])

  const publicCount = myAgents.filter(a => a.privacy === 'PUBLIC').length
  const privateCount = myAgents.filter(a => a.privacy === 'PRIVATE').length

  const memberLevel = getMemberLevel(myAgents.length, bookmarkedAgentIds.length, collections.length)

  // ─── LOADING STATE
  if (authLoading) {
    return <DashboardLoading />
  }

  // ─── NON-AUTHENTICATED VIEW
  if (!isAuthenticated) {
    return <UnauthenticatedView />
  }

  // ─── AUTHENTICATED VIEW
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="overflow-hidden rounded-2xl border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-emerald-500/20">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName || 'User'} />}
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {getTimeGreeting()}, {displayName || 'User'}!
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className={`${memberLevel.color} bg-opacity-10`}>
                    <memberLevel.icon className="h-3 w-3 mr-1" />
                    {memberLevel.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {displayEmail}
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md"
                  onClick={() => router.push('/onboarding')}
                >
                  <Sparkles className="h-4 w-4 mr-2" /> Setup Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="My Agents"
          value={myAgents.length}
          icon={Bot}
          gradient="from-emerald-500 to-teal-600"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600"
          index={0}
        />
        <StatCard
          label="Bookmarks"
          value={bookmarkedAgentIds.length}
          icon={Heart}
          gradient="from-rose-500 to-pink-600"
          iconBg="bg-rose-100 dark:bg-rose-900/30"
          iconColor="text-rose-600"
          index={1}
        />
        <StatCard
          label="Collections"
          value={collections.length}
          icon={FolderOpen}
          gradient="from-amber-500 to-orange-600"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600"
          index={2}
        />
        <StatCard
          label="Public Agents"
          value={publicCount}
          icon={Globe}
          gradient="from-violet-500 to-purple-600"
          iconBg="bg-violet-100 dark:bg-violet-900/30"
          iconColor="text-violet-600"
          index={3}
        />
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 dark:bg-gray-800 mb-6 w-full sm:w-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Activity className="h-4 w-4 mr-1.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="my-agents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Bot className="h-4 w-4 mr-1.5" /> My Agents
          </TabsTrigger>
          <TabsTrigger value="collections" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <FolderOpen className="h-4 w-4 mr-1.5" /> Collections
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <User className="h-4 w-4 mr-1.5" /> Profile
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview">
          <motion.div {...fadeInUp} className="space-y-6">
            {/* Activity Feed */}
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

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Browse Agents',
                    desc: 'Explore 800+ curated AI agents',
                    icon: Compass,
                    color: 'from-emerald-500 to-teal-600',
                    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
                    iconColor: 'text-emerald-600 dark:text-emerald-400',
                    action: () => router.push('/browse'),
                  },
                  {
                    title: 'Create Agent',
                    desc: 'Build a custom AI agent in minutes',
                    icon: PlusCircle,
                    color: 'from-amber-500 to-orange-600',
                    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
                    iconColor: 'text-amber-600 dark:text-amber-400',
                    action: () => handleNavigate('wizard'),
                  },
                  {
                    title: 'Knowledge Hub',
                    desc: 'Dive into curated agent projects',
                    icon: Library,
                    color: 'from-violet-500 to-purple-600',
                    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
                    iconColor: 'text-violet-600 dark:text-violet-400',
                    action: () => router.push('/knowledge-base'),
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="cursor-pointer"
                    onClick={item.action}
                  >
                    <Card className="h-full rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      <div className={`h-1 bg-gradient-to-r ${item.color}`} />
                      <CardContent className="p-5">
                        <div className={`h-10 w-10 rounded-xl ${item.iconBg} flex items-center justify-center mb-3`}>
                          <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Platform Stats */}
            {stats && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" /> Platform Stats
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Agents', value: stats.totalAgents || 0, icon: Bot, gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
                    { label: 'Frameworks', value: stats.frameworks || 0, icon: Cpu, gradient: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
                    { label: 'Categories', value: stats.categories || 0, icon: Database, gradient: 'from-violet-500 to-purple-600', iconBg: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600' },
                    { label: 'Industries', value: stats.topIndustries?.length || 0, icon: Globe, gradient: 'from-rose-500 to-pink-600', iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-600' },
                  ].map((stat, i) => (
                    <StatCard key={stat.label} {...stat} index={i} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* MY AGENTS TAB */}
        <TabsContent value="my-agents">
          <motion.div {...fadeInUp}>
            {/* Privacy Filter */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {[
                { key: 'all' as const, label: 'All', count: myAgents.length },
                { key: 'public' as const, label: 'Public', count: publicCount },
                { key: 'private' as const, label: 'Private', count: privateCount },
                { key: 'unlisted' as const, label: 'Unlisted', count: myAgents.filter(a => a.privacy === 'UNLISTED').length },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={privacyFilter === filter.key ? 'default' : 'outline'}
                  size="sm"
                  className={`rounded-lg ${
                    privacyFilter === filter.key
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : ''
                  }`}
                  onClick={() => setPrivacyFilter(filter.key)}
                >
                  {filter.label}
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {dataLoading ? (
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
                  onClick={() => router.push('/browse')}
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
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="relative group"
                  >
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 h-full flex flex-col rounded-xl"
                      onClick={() => handleSelectAgent(agent.id)}
                    >
                      <CardContent className="p-4 flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm line-clamp-1 flex-1 mr-2">{agent.name}</h4>
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {agent.privacy}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {agent.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {agent.framework && (
                            <Badge variant="secondary" className="text-[10px]">
                              {agent.framework}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px]">
                            {agent.category || 'General'}
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 pt-0 flex items-center justify-between">
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Star className="h-3 w-3" /> {agent.stars || 0}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectAgent(agent.id)
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" /> View
                        </Button>
                      </CardFooter>
                    </Card>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3 w-3 text-rose-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{agent.name}&quot;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-rose-600 hover:bg-rose-700 text-white"
                              onClick={() => handleDeleteAgent(agent.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* COLLECTIONS TAB */}
        <TabsContent value="collections">
          <motion.div {...fadeInUp} className="space-y-4">
            {collections.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-1">No Collections</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first collection to organize your agents
                </p>
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl"
                  onClick={() => createCollection('My First Collection')}
                >
                  <FolderPlus className="h-4 w-4 mr-2" /> Create Collection
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((col: any, i: number) => (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="rounded-xl overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">{col.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px]">
                                {col.agentIds.length} agent{col.agentIds.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                          {col.id !== 'default' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                              onClick={() => deleteCollection(col.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <motion.div {...fadeInUp} className="space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" /> Profile Information
                </CardTitle>
                <CardDescription>Your personal information and account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-20 w-20 ring-2 ring-emerald-500/20">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName || 'User'} />}
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{displayName || 'User'}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {displayEmail}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className={`${memberLevel.color}`}>
                        <memberLevel.icon className="h-3 w-3 mr-1" />
                        {memberLevel.level}
                      </Badge>
                      {profile?.created_at && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> Joined {formatDate(profile.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile?.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  {profile?.job_title && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.job_title}</span>
                    </div>
                  )}
                  {profile?.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile?.preferred_framework && (
                    <div className="flex items-center gap-2 text-sm">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.preferred_framework}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => router.push('/onboarding')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" /> Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    onClick={() => signOut()}
                  >
                    <LogIn className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
