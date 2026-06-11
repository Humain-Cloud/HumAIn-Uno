'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { useRequireAuth } from '@/components/auth/auth-modal'
import { UserAgentCard } from '@/components/agents/agent-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Bot, Trash2, LayoutDashboard, FolderOpen, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Split section components
import { PlatformStatsSection } from '@/components/dashboard/platform-stats-section'
import { RecentAgentsSection } from '@/components/dashboard/recent-agents-section'
import { UserStatsSection } from '@/components/dashboard/user-stats-section'
import { BookmarksSection } from '@/components/dashboard/bookmarks-section'
import { CollectionsSection } from '@/components/dashboard/collections-section'
import { RecentlyViewedSection, ActivityFeed } from '@/components/dashboard/activity-section'
import { SettingsSection } from '@/components/dashboard/settings-section'
import { EmptyAgentsState } from '@/components/dashboard/empty-states'

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
    removeFromCollection,
    bookmarkedAgentIds,
    toggleBookmark,
    recentlyViewedAgentIds,
    clearRecentlyViewed,
  } = useAppStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [myAgents, setMyAgents] = useState<any[]>([])
  const [recentKB, setRecentKB] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private' | 'unlisted'>('all')
  const [bookmarkedAgents, setBookmarkedAgents] = useState<any[]>([])
  const [recentlyViewedAgents, setRecentlyViewedAgents] = useState<any[]>([])
  const [recentlyViewedLoading, setRecentlyViewedLoading] = useState(false)

  // Navigation helper
  const handleNavigate = (view: string) => {
    setCurrentView(view as any)
    setSelectedAgentId(null)
  }

  const handleSelectAgent = (id: string) => {
    setSelectedAgentId(id)
    setCurrentView('detail')
  }

  // Load public data (stats + recent KB agents)
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

  // Load user agents when authenticated
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
        <RecentlyViewedSection
          recentlyViewedAgentIds={recentlyViewedAgentIds}
          recentlyViewedAgents={recentlyViewedAgents}
          recentlyViewedLoading={recentlyViewedLoading}
          onClearHistory={clearRecentlyViewed}
          onSelectAgent={handleSelectAgent}
          onNavigate={handleNavigate}
          showEmpty={false}
        />
        <PlatformStatsSection
          stats={stats}
          onSignIn={() => setShowAuthModal(true)}
          onNavigate={handleNavigate}
        />
        <RecentAgentsSection
          agents={recentKB}
          onNavigate={handleNavigate}
          onSelectAgent={handleSelectAgent}
        />
      </div>
    )
  }

  // ===========================
  // AUTHENTICATED VIEW
  // ===========================
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <RecentlyViewedSection
        recentlyViewedAgentIds={recentlyViewedAgentIds}
        recentlyViewedAgents={recentlyViewedAgents}
        recentlyViewedLoading={recentlyViewedLoading}
        onClearHistory={clearRecentlyViewed}
        onSelectAgent={handleSelectAgent}
        onNavigate={handleNavigate}
        showEmpty={true}
      />

      <UserStatsSection
        session={session}
        myAgentsCount={myAgents.length}
        publicCount={publicCount}
        bookmarkedCount={bookmarkedAgentIds.length}
        collectionsCount={collections.length}
        onNavigate={handleNavigate}
      />

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
              <ActivityFeed />
              <BookmarksSection
                bookmarkedAgents={bookmarkedAgents}
                totalBookmarkedCount={bookmarkedAgentIds.length}
                onSelectAgent={handleSelectAgent}
                onToggleBookmark={toggleBookmark}
                onViewCollections={() => setActiveTab('collections')}
              />
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
                <EmptyAgentsState onCreateAgent={() => handleNavigate('wizard')} />
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

        {/* COLLECTIONS TAB */}
        <AnimatePresence mode="wait">
          {activeTab === 'collections' && (
            <motion.div
              key="collections"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <CollectionsSection
                collections={collections}
                collectionAgents={{}}
                onCreateCollection={createCollection}
                onDeleteCollection={deleteCollection}
                onRenameCollection={renameCollection}
                onRemoveFromCollection={removeFromCollection}
                onSelectAgent={handleSelectAgent}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* SETTINGS TAB */}
        <AnimatePresence mode="wait">
          {activeTab === 'settings' && (
            <SettingsSection session={session} />
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  )
}
