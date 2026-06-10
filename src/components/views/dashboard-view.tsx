'use client'

import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { motion } from 'framer-motion'

export function DashboardView() {
  const { session, status, isAuthenticated } = useRequireAuth()
  const { setCurrentView, setSelectedAgentId, setShowAuthModal } = useAppStore()
  const [activeTab, setActiveTab] = useState('my-agents')
  const [myAgents, setMyAgents] = useState<any[]>([])
  const [recentKB, setRecentKB] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load stats and recent KB agents regardless of auth status
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

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return
    try {
      await api.agents.delete(id)
      setMyAgents(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error('Failed to delete agent:', err)
    }
  }

  // Show auth prompt if not logged in - but with more content
  if (status === 'loading') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Sign in prompt */}
        <div className="text-center py-12 mb-8">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
            >
              <LayoutDashboard className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Your Agent Dashboard</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to manage your agents, view starred items, and track your activity
            </p>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
              onClick={() => setShowAuthModal(true)}
            >
              <LogIn className="h-4 w-4 mr-2" /> Sign In to Dashboard
            </Button>
          </div>
        </div>

        {/* Platform Stats - visible to everyone */}
        {stats && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" /> Platform Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Agents', value: stats.totalAgents || 0, icon: Bot, color: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
                { label: 'Frameworks', value: stats.frameworks || 0, icon: Cpu, color: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
                { label: 'Categories', value: stats.categories || 0, icon: Database, color: 'from-violet-500 to-purple-600', iconBg: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600' },
                { label: 'Industries', value: stats.topIndustries?.length || 0, icon: TrendingUp, color: 'from-rose-500 to-pink-600', iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-600' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                          <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                        </div>
                        <div>
                          <div className="text-xl font-bold tracking-tight">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recent KB agents */}
        {recentKB.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" /> Recently Added
              </h3>
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
                  transition={{ delay: i * 0.05 }}
                  className="cursor-pointer"
                  onClick={() => { setSelectedAgentId(agent.id); setCurrentView('detail') }}
                >
                  <Card className="hover:shadow-md transition-shadow rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center shrink-0">
                          <Bot className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{agent.description}</p>
                          <div className="flex gap-1.5 mt-2">
                            {agent.framework && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{agent.framework}</Badge>
                            )}
                            {agent.difficulty && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{agent.difficulty}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const privacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'PUBLIC': return <Globe className="h-3 w-3" />
      case 'UNLISTED': return <Link2 className="h-3 w-3" />
      default: return <Lock className="h-3 w-3" />
    }
  }

  // Calculate dashboard metrics
  const publicCount = myAgents.filter(a => a.privacy === 'PUBLIC').length
  const totalStars = myAgents.reduce((sum, a) => sum + (a.stars || 0), 0)
  const privateCount = myAgents.filter(a => a.privacy === 'PRIVATE').length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold relative">
            Dashboard
            <span className="absolute -bottom-1 left-0 h-1 w-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Welcome back, {session?.user?.name || session?.user?.email}
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
          onClick={() => {
            setCurrentView('wizard')
            setSelectedAgentId(null)
          }}
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Create Agent
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'My Agents', value: myAgents.length, icon: Bot, gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
          { label: 'Public', value: publicCount, icon: Globe, gradient: 'from-cyan-500 to-blue-600', iconBg: 'bg-cyan-100 dark:bg-cyan-900/30', iconColor: 'text-cyan-600' },
          { label: 'Total Stars', value: totalStars, icon: Star, gradient: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
          { label: 'Private', value: privateCount, icon: Lock, gradient: 'from-gray-500 to-gray-600', iconBg: 'bg-gray-100 dark:bg-gray-900/30', iconColor: 'text-gray-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden rounded-xl">
              <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-xl font-bold tracking-tight">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Activity Progress */}
      {myAgents.length > 0 && (
        <Card className="mb-8 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Agent Activity
              </h3>
              <span className="text-xs text-muted-foreground">
                {publicCount} of {myAgents.length} agents are public
              </span>
            </div>
            <Progress value={myAgents.length > 0 ? (publicCount / myAgents.length) * 100 : 0} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Private: {privateCount}</span>
              <span>Public: {publicCount}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="my-agents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Bot className="h-4 w-4 mr-1.5" /> My Agents
          </TabsTrigger>
          <TabsTrigger value="starred" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Star className="h-4 w-4 mr-1.5" /> Starred
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Settings className="h-4 w-4 mr-1.5" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* My Agents Tab */}
        <TabsContent value="my-agents">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : myAgents.length === 0 ? (
            <div className="text-center py-12 mt-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-emerald-600" />
                </div>
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first AI agent to get started
              </p>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                onClick={() => {
                  setCurrentView('wizard')
                  setSelectedAgentId(null)
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Create Agent
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {myAgents.map((agent, i) => (
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
        </TabsContent>

        {/* Starred Tab */}
        <TabsContent value="starred">
          <div className="text-center py-12 mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-amber-500" />
              </div>
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">No starred agents</h3>
            <p className="text-muted-foreground mb-4">
              Star agents you like to find them easily later
            </p>
            <Button variant="outline" className="rounded-xl" onClick={() => {
              setCurrentView('browse')
              setSelectedAgentId(null)
            }}>
              Browse Agents
            </Button>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="max-w-lg mt-4">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={session?.user?.email || ''} disabled className="bg-gray-50 dark:bg-gray-800" />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input defaultValue={session?.user?.name || ''} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea placeholder="Tell us about yourself..." className="rounded-xl" />
                </div>
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6 rounded-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Default View Mode</p>
                    <p className="text-xs text-muted-foreground">Choose how agents are displayed</p>
                  </div>
                  <Badge variant="outline" className="rounded-lg">Grid</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-xs text-muted-foreground">Your account role</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg">
                    {(session as any)?.role || 'user'}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-xs text-muted-foreground">When you joined</p>
                  </div>
                  <Badge variant="outline" className="rounded-lg">Today</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
