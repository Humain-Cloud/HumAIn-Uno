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
import {
  LayoutDashboard,
  Bot,
  Star,
  Settings,
  PlusCircle,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Link2,
  Loader2,
  LogIn,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function DashboardView() {
  const { session, status, isAuthenticated } = useRequireAuth()
  const { setCurrentView, setSelectedAgentId, setShowAuthModal } = useAppStore()
  const [activeTab, setActiveTab] = useState('my-agents')
  const [myAgents, setMyAgents] = useState<any[]>([])
  const [starredAgents, setStarredAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  // Show auth prompt if not logged in
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Sign in to access your Dashboard</h2>
          <p className="text-muted-foreground mb-6">
            View your agents, starred items, and account settings
          </p>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setShowAuthModal(true)}
          >
            <LogIn className="h-4 w-4 mr-2" /> Sign In
          </Button>
        </div>
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {session?.user?.name || session?.user?.email}
          </p>
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
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
        <Card>
          <CardContent className="p-4 text-center">
            <Bot className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
            <div className="text-2xl font-bold">{myAgents.length}</div>
            <div className="text-xs text-muted-foreground">My Agents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
            <div className="text-2xl font-bold">{myAgents.filter(a => a.privacy === 'PUBLIC').length}</div>
            <div className="text-xs text-muted-foreground">Public</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold">
              {myAgents.reduce((sum, a) => sum + (a.stars || 0), 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Stars</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Lock className="h-5 w-5 mx-auto mb-1 text-gray-500" />
            <div className="text-2xl font-bold">{myAgents.filter(a => a.privacy === 'PRIVATE').length}</div>
            <div className="text-xs text-muted-foreground">Private</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-agents">
            <Bot className="h-4 w-4 mr-1" /> My Agents
          </TabsTrigger>
          <TabsTrigger value="starred">
            <Star className="h-4 w-4 mr-1" /> Starred
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-1" /> Settings
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
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first AI agent to get started
              </p>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
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
                      className="h-7 w-7"
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
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No starred agents</h3>
            <p className="text-muted-foreground mb-4">
              Star agents you like to find them easily later
            </p>
            <Button variant="outline" onClick={() => {
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={session?.user?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input defaultValue={session?.user?.name || ''} />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea placeholder="Tell us about yourself..." />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Default View Mode</p>
                    <p className="text-xs text-muted-foreground">Choose how agents are displayed</p>
                  </div>
                  <Badge variant="outline">Grid</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-xs text-muted-foreground">Your account role</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    {(session as any)?.role || 'user'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
