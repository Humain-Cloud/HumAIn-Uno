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

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
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
            onClick={() => setShowAuthModal(true)}
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
      {/* Banner skeleton */}
      <Skeleton className="h-36 rounded-2xl mb-6" />
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      {/* Tabs skeleton */}
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
// Overview Tab
// ─────────────────────────────────────────────────

function OverviewTab({
  bookmarkedAgents,
  bookmarkedCount,
  onSelectAgent,
  onToggleBookmark,
  onViewCollections,
  onNavigate,
  stats,
  recentlyViewedAgentIds,
  recentlyViewedAgents,
  recentlyViewedLoading,
  profile,
}: {
  bookmarkedAgents: any[]
  bookmarkedCount: number
  onSelectAgent: (id: string) => void
  onToggleBookmark: (id: string) => void
  onViewCollections: () => void
  onNavigate: (path: string) => void
  stats: any
  recentlyViewedAgentIds: string[]
  recentlyViewedAgents: any[]
  recentlyViewedLoading: boolean
  profile: UserProfile | null
}) {
  const router = useRouter()

  return (
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
              action: () => onNavigate('wizard'),
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

      {/* Recommended Agents based on preferences */}
      {profile?.preferred_framework && (
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> Recommended for You
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-emerald-600" onClick={() => router.push('/browse')}>
                View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
            <CardDescription className="text-xs">
              Based on your preference for {profile.preferred_framework}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Bot className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Browse agents to get personalized recommendations
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 rounded-xl"
                onClick={() => router.push('/browse')}
              >
                <Compass className="h-3.5 w-3.5 mr-1.5" /> Browse Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookmarked Agents */}
      {bookmarkedCount > 0 && (
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" /> Bookmarked Agents
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-emerald-600" onClick={onViewCollections}>
                View Collections <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bookmarkedAgents.map((agent: any, i: number) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                  onClick={() => onSelectAgent(agent.id)}
                >
                  <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.name}</p>
                    <div className="flex items-center gap-1.5">
                      {agent.framework && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {agent.framework}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleBookmark(agent.id)
                    }}
                    className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
              {bookmarkedCount > bookmarkedAgents.length && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{bookmarkedCount - bookmarkedAgents.length} more bookmarked
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
  )
}

// ─────────────────────────────────────────────────
// My Agents Tab
// ─────────────────────────────────────────────────

function MyAgentsTab({
  myAgents,
  loading,
  privacyFilter,
  setPrivacyFilter,
  onDeleteAgent,
  onSelectAgent,
}: {
  myAgents: any[]
  loading: boolean
  privacyFilter: 'all' | 'public' | 'private' | 'unlisted'
  setPrivacyFilter: (f: 'all' | 'public' | 'private' | 'unlisted') => void
  onDeleteAgent: (id: string) => void
  onSelectAgent: (id: string) => void
}) {
  const router = useRouter()

  const filteredAgents = useMemo(() => {
    if (privacyFilter === 'all') return myAgents
    return myAgents.filter((a) => a.privacy?.toLowerCase() === privacyFilter)
  }, [myAgents, privacyFilter])

  const publicCount = myAgents.filter((a) => a.privacy === 'PUBLIC').length
  const privateCount = myAgents.filter((a) => a.privacy === 'PRIVATE').length
  const unlistedCount = myAgents.filter((a) => a.privacy === 'UNLISTED').length

  const frameworkColors: Record<string, string> = {
    langgraph: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    crewai: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    autogen: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    agno: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    llamaindex: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  }

  const privacyBadge: Record<string, string> = {
    PUBLIC: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    UNLISTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    PRIVATE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  }

  return (
    <motion.div {...fadeInUp}>
      {/* Privacy Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {[
          { key: 'all' as const, label: 'All', count: myAgents.length },
          { key: 'public' as const, label: 'Public', count: publicCount },
          { key: 'private' as const, label: 'Private', count: privateCount },
          { key: 'unlisted' as const, label: 'Unlisted', count: unlistedCount },
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
          <h3 className="text-xl font-semibold mb-2">
            {myAgents.length === 0 ? 'Create Your First Agent' : 'No agents match this filter'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {myAgents.length === 0
              ? 'Use our wizard to build a custom AI agent from scratch or from a template'
              : 'Try changing the filter or create a new agent'}
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
          {filteredAgents.map((agent, i) => {
            const fwColor =
              frameworkColors[(agent.framework || '').toLowerCase()] ||
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            const pBadge =
              privacyBadge[agent.privacy] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'

            return (
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
                  onClick={() => onSelectAgent(agent.id)}
                >
                  <CardContent className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm line-clamp-1 flex-1 mr-2">{agent.name}</h4>
                      <Badge variant="secondary" className={`text-[10px] shrink-0 ${pBadge}`}>
                        {agent.privacy === 'PUBLIC' ? (
                          <Globe className="h-3 w-3 mr-0.5" />
                        ) : agent.privacy === 'UNLISTED' ? (
                          <Link2 className="h-3 w-3 mr-0.5" />
                        ) : (
                          <Lock className="h-3 w-3 mr-0.5" />
                        )}
                        {agent.privacy}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {agent.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.framework && (
                        <Badge variant="secondary" className={`text-[10px] ${fwColor}`}>
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
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectAgent(agent.id)
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
                {/* Delete button on hover */}
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
                          onClick={() => onDeleteAgent(agent.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────
// Collections Tab
// ─────────────────────────────────────────────────

function CollectionsTab({
  collections,
  onCreateCollection,
  onDeleteCollection,
  onRenameCollection,
  onRemoveFromCollection,
  onSelectAgent,
}: {
  collections: any[]
  onCreateCollection: (name: string) => void
  onDeleteCollection: (id: string) => void
  onRenameCollection: (id: string, name: string) => void
  onRemoveFromCollection: (collectionId: string, agentId: string) => void
  onSelectAgent: (id: string) => void
}) {
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [newCollectionName, setNewCollectionName] = useState('')
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false)
  const [localCollectionAgents, setLocalCollectionAgents] = useState<Record<string, any[]>>({})

  useEffect(() => {
    async function loadCollectionAgents() {
      if (!expandedCollection) return
      const col = collections.find((c: any) => c.id === expandedCollection)
      if (!col || col.agentIds.length === 0) return

      const agentsMap: Record<string, any> = {}
      for (const id of col.agentIds.slice(0, 10)) {
        try {
          const agent = await api.knowledge.get(id)
          agentsMap[id] = agent
        } catch {
          try {
            const agent = await api.agents.get(id)
            agentsMap[id] = agent
          } catch {
            /* ignore */
          }
        }
      }
      setLocalCollectionAgents((prev) => ({ ...prev, [expandedCollection]: Object.values(agentsMap) }))
    }
    loadCollectionAgents()
  }, [expandedCollection, collections])

  const handleRenameCollection = (id: string) => {
    if (renameValue.trim()) {
      onRenameCollection(id, renameValue.trim())
    }
    setRenamingId(null)
    setRenameValue('')
  }

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName.trim())
      setNewCollectionName('')
      setShowNewCollectionInput(false)
    }
  }

  return (
    <motion.div {...fadeInUp}>
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
                if (e.key === 'Escape') {
                  setShowNewCollectionInput(false)
                  setNewCollectionName('')
                }
              }}
              className="rounded-xl"
              autoFocus
            />
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              onClick={handleCreateCollection}
            >
              <Check className="h-4 w-4 mr-1" /> Create
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setShowNewCollectionInput(false)
                setNewCollectionName('')
              }}
            >
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
      {collections.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-1">No Collections</h3>
          <p className="text-muted-foreground mb-4">
            Create your first collection to organize your agents
          </p>
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl"
            onClick={() => setShowNewCollectionInput(true)}
          >
            Create Collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col: any, i: number) => {
            const isExpanded = expandedCollection === col.id
            const isRenaming = renamingId === col.id
            const colAgents = localCollectionAgents[col.id] || []

            return (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                layout
                className={isExpanded ? 'sm:col-span-2 lg:col-span-3' : ''}
              >
                <Card className="rounded-xl overflow-hidden transition-all">
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
                                if (e.key === 'Escape') {
                                  setRenamingId(null)
                                  setRenameValue('')
                                }
                              }}
                              className="h-7 text-sm"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleRenameCollection(col.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2"
                              onClick={() => {
                                setRenamingId(null)
                                setRenameValue('')
                              }}
                            >
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
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setRenamingId(col.id)
                            setRenameValue(col.name)
                          }}
                          className="h-8 w-8 min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        {col.id !== 'default' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{col.name}&quot;? This action cannot
                                  be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-rose-600 hover:bg-rose-700 text-white"
                                  onClick={() => onDeleteCollection(col.id)}
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
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded agents */}
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
                              <p className="text-sm text-muted-foreground">
                                No agents in this collection yet
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Bookmark agents to add them to this collection
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {col.agentIds.map((agentId: string) => {
                                const agent = colAgents.find((a: any) => a.id === agentId)
                                return (
                                  <div
                                    key={agentId}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                    onClick={() => onSelectAgent(agentId)}
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
                                        onRemoveFromCollection(col.id, agentId)
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
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────
// Profile Tab
// ─────────────────────────────────────────────────

function ProfileTab({
  profile,
  user,
  refreshProfile,
  signOut,
}: {
  profile: UserProfile | null
  user: any
  refreshProfile: () => Promise<UserProfile | null>
  signOut: () => Promise<void>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    job_title: '',
    bio: '',
    location: '',
    website: '',
  })

  // Initialize form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        company: profile.company || '',
        job_title: profile.job_title || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
      })
    }
  }, [profile])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      // Attempt to update profile via Supabase
      const supabaseModule = await import('@/lib/supabase/client')
      const supabase = supabaseModule.createSupabaseBrowserClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          company: formData.company || null,
          job_title: formData.job_title || null,
          bio: formData.bio || null,
          location: formData.location || null,
          website: formData.website || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile?.id)

      if (error) throw error

      await refreshProfile()
      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        company: profile.company || '',
        job_title: profile.job_title || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
      })
    }
    setIsEditing(false)
  }

  return (
    <motion.div {...fadeInUp} className="space-y-6 max-w-2xl">
      {/* Avatar & Identity Card */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload Area */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-emerald-200 dark:border-emerald-800">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xl font-bold">
                  {getInitials(profile?.full_name, profile?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {profile?.full_name || 'Unnamed User'}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> {profile?.email || user?.email}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <CalendarDays className="h-3 w-3" /> Member since {formatDate(profile?.created_at)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Editable Form */}
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="rounded-xl"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="rounded-xl"
                    placeholder="Your company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="rounded-xl"
                    placeholder="Your job title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="rounded-xl"
                    placeholder="City, Country"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="rounded-xl"
                  placeholder="https://your-website.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="rounded-xl min-h-[80px]"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Read-only profile display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <p className="text-sm font-medium mt-0.5">
                    {profile?.full_name || (
                      <span className="text-muted-foreground italic">Not set</span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <p className="text-sm font-medium mt-0.5 flex items-center gap-1">
                    {profile?.company ? (
                      <>
                        <Building2 className="h-3 w-3" /> {profile.company}
                      </>
                    ) : (
                      <span className="text-muted-foreground italic">Not set</span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Job Title</Label>
                  <p className="text-sm font-medium mt-0.5 flex items-center gap-1">
                    {profile?.job_title ? (
                      <>
                        <Briefcase className="h-3 w-3" /> {profile.job_title}
                      </>
                    ) : (
                      <span className="text-muted-foreground italic">Not set</span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <p className="text-sm font-medium mt-0.5 flex items-center gap-1">
                    {profile?.location ? (
                      <>
                        <MapPin className="h-3 w-3" /> {profile.location}
                      </>
                    ) : (
                      <span className="text-muted-foreground italic">Not set</span>
                    )}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Website</Label>
                <p className="text-sm font-medium mt-0.5">
                  {profile?.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" /> {profile.website}
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">Not set</span>
                  )}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bio</Label>
                <p className="text-sm mt-0.5">
                  {profile?.bio || <span className="text-muted-foreground italic">Not set</span>}
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
            </div>
          )}

          {/* Success toast */}
          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Profile updated successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" /> Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive email updates about your agents</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Public Profile</p>
              <p className="text-xs text-muted-foreground">Make your profile visible to other users</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Preferred Framework</p>
              <p className="text-xs text-muted-foreground">
                {profile?.preferred_framework || 'Not set'}
              </p>
            </div>
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 dark:border-emerald-800">
              {profile?.preferred_framework || 'None'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Connected Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Email / Password</p>
                <p className="text-xs text-muted-foreground">{profile?.email || user?.email}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400">
              Connected
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">GitHub</p>
                <p className="text-xs text-muted-foreground">Connect your GitHub account</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl text-xs">
              Connect
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Google</p>
                <p className="text-xs text-muted-foreground">Connect your Google account</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl text-xs">
              Connect
            </Button>
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
              <p className="text-sm font-medium">Export Data</p>
              <p className="text-xs text-muted-foreground">Download all your agents and collections</p>
            </div>
            <Button
              variant="outline"
              className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800/30 dark:hover:bg-amber-900/20 rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sign Out</p>
              <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={signOut}
            >
              <LogIn className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800/30 dark:hover:bg-rose-900/20 rounded-xl"
                >
                  <UserX className="h-4 w-4 mr-2" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all
                    of your data from our servers, including your agents, collections, and profile
                    information.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-rose-600 hover:bg-rose-700 text-white">
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────
// Activity Tab
// ─────────────────────────────────────────────────

function ActivityTab() {
  return (
    <motion.div {...fadeInUp} className="space-y-6">
      {/* Timeline */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" /> Activity Timeline
          </CardTitle>
          <CardDescription>Your recent actions and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />

            <div className="space-y-6">
              {recentActivity.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative flex items-start gap-4 pl-2"
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 ${event.color}`}>
                    <event.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-medium">{event.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {event.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <Rocket className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-muted-foreground">Agents Created</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Stars Given</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-rose-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">Bookmarks Made</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth()
  const router = useRouter()

  const {
    bookmarkedAgentIds,
    toggleBookmark,
    collections,
    createCollection,
    deleteCollection,
    renameCollection,
    removeFromCollection,
    recentlyViewedAgentIds,
    setShowAuthModal,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState('overview')
  const [myAgents, setMyAgents] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private' | 'unlisted'>('all')
  const [bookmarkedAgents, setBookmarkedAgents] = useState<any[]>([])
  const [recentlyViewedAgents, setRecentlyViewedAgents] = useState<any[]>([])

  // Load public data (stats)
  useEffect(() => {
    async function loadPublicData() {
      try {
        const statsData = await api.stats.get()
        setStats(statsData)
      } catch (err) {
        console.error('Failed to load stats:', err)
      }
    }
    loadPublicData()
  }, [])

  // Load user agents when authenticated
  useEffect(() => {
    if (!user) return

    async function loadAgents() {
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
    loadAgents()
  }, [user])

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
          } catch {
            /* ignore */
          }
        }
      }
      setBookmarkedAgents(agents)
    }
    loadBookmarkedAgents()
  }, [bookmarkedAgentIds])

  // Load recently viewed agents
  useEffect(() => {
    async function loadRecentlyViewed() {
      if (recentlyViewedAgentIds.length === 0) {
        setRecentlyViewedAgents([])
        return
      }
      const agents: any[] = []
      for (const id of recentlyViewedAgentIds.slice(0, 6)) {
        try {
          const agent = await api.knowledge.get(id)
          agents.push(agent)
        } catch {
          try {
            const agent = await api.agents.get(id)
            agents.push(agent)
          } catch {
            /* ignore */
          }
        }
      }
      setRecentlyViewedAgents(agents)
    }
    loadRecentlyViewed()
  }, [recentlyViewedAgentIds])

  const handleDeleteAgent = async (id: string) => {
    try {
      await api.agents.delete(id)
      setMyAgents((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      console.error('Failed to delete agent:', err)
    }
  }

  const handleSelectAgent = useCallback(
    (id: string) => {
      router.push(`/agents/${id}`)
    },
    [router]
  )

  const handleNavigate = useCallback(
    (path: string) => {
      if (path === 'wizard') {
        router.push('/browse?create=true')
      } else {
        router.push(`/${path}`)
      }
    },
    [router]
  )

  // Computed values
  const memberLevel = getMemberLevel(
    myAgents.length,
    bookmarkedAgentIds.length,
    collections.length
  )

  const displayName = profile?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Developer'
  const firstName = displayName.split(' ')[0]

  // ──── LOADING ────
  if (authLoading) {
    return <DashboardLoading />
  }

  // ──── NOT AUTHENTICATED ────
  if (!user) {
    return <UnauthenticatedView />
  }

  // ──── AUTHENTICATED DASHBOARD ────
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ═══ Welcome Banner ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 mb-6 text-white"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-white/30 shadow-lg shrink-0">
              <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                {getInitials(profile?.full_name, profile?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" /> {getTimeGreeting()}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                Welcome back, {firstName}!
              </h1>
              <p className="text-white/70 text-sm mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Member since {formatDate(profile?.created_at)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {profile && !profile.onboarding_completed && (
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 rounded-xl"
                  onClick={() => router.push('/onboarding')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Complete Profile
                </Button>
              )}
              <Button
                className="bg-white text-emerald-700 hover:bg-white/90 font-semibold shadow-lg hidden sm:flex rounded-xl"
                onClick={() => handleNavigate('wizard')}
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Create Agent
              </Button>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -right-4 -bottom-8 h-24 w-24 rounded-full bg-white/5 blur-xl" />
        </motion.div>

        {/* ═══ Onboarding Banner ═══ */}
        {profile && !profile.onboarding_completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 p-4 flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Complete your profile setup</p>
              <p className="text-xs text-muted-foreground">
                Finish onboarding to get personalized recommendations and unlock all features.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shrink-0"
              onClick={() => router.push('/onboarding')}
            >
              Continue <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* ═══ Quick Stats ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Agents Created"
            value={myAgents.length}
            icon={Bot}
            gradient="from-emerald-500 to-teal-600"
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            iconColor="text-emerald-600"
            index={0}
          />
          <StatCard
            label="Agents Bookmarked"
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
            label="Member Level"
            value={memberLevel.level}
            icon={memberLevel.icon}
            gradient="from-violet-500 to-purple-600"
            iconBg="bg-violet-100 dark:bg-violet-900/30"
            iconColor="text-violet-600"
            index={3}
          />
        </div>

        {/* ═══ Tab Navigation ═══ */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100 dark:bg-gray-800 mb-6 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
            >
              <Activity className="h-4 w-4 mr-1.5" /> Overview
            </TabsTrigger>
            <TabsTrigger
              value="my-agents"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
            >
              <Bot className="h-4 w-4 mr-1.5" /> My Agents
            </TabsTrigger>
            <TabsTrigger
              value="collections"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
            >
              <FolderOpen className="h-4 w-4 mr-1.5" /> Collections
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
            >
              <User className="h-4 w-4 mr-1.5" /> Profile
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
            >
              <Clock className="h-4 w-4 mr-1.5" /> Activity
            </TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ── */}
          <TabsContent value="overview">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <OverviewTab
                  bookmarkedAgents={bookmarkedAgents}
                  bookmarkedCount={bookmarkedAgentIds.length}
                  onSelectAgent={handleSelectAgent}
                  onToggleBookmark={toggleBookmark}
                  onViewCollections={() => setActiveTab('collections')}
                  onNavigate={handleNavigate}
                  stats={stats}
                  recentlyViewedAgentIds={recentlyViewedAgentIds}
                  recentlyViewedAgents={recentlyViewedAgents}
                  recentlyViewedLoading={false}
                  profile={profile}
                />
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ── My Agents Tab ── */}
          <TabsContent value="my-agents">
            <AnimatePresence mode="wait">
              {activeTab === 'my-agents' && (
                <MyAgentsTab
                  myAgents={myAgents}
                  loading={agentsLoading}
                  privacyFilter={privacyFilter}
                  setPrivacyFilter={setPrivacyFilter}
                  onDeleteAgent={handleDeleteAgent}
                  onSelectAgent={handleSelectAgent}
                />
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ── Collections Tab ── */}
          <TabsContent value="collections">
            <AnimatePresence mode="wait">
              {activeTab === 'collections' && (
                <CollectionsTab
                  collections={collections}
                  onCreateCollection={createCollection}
                  onDeleteCollection={deleteCollection}
                  onRenameCollection={renameCollection}
                  onRemoveFromCollection={removeFromCollection}
                  onSelectAgent={handleSelectAgent}
                />
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ── Profile Tab ── */}
          <TabsContent value="profile">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <ProfileTab
                  profile={profile}
                  user={user}
                  refreshProfile={refreshProfile}
                  signOut={signOut}
                />
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ── Activity Tab ── */}
          <TabsContent value="activity">
            <AnimatePresence mode="wait">
              {activeTab === 'activity' && <ActivityTab />}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
