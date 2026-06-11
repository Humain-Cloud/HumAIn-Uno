'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore, type ViewType } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent, Category, Stats } from '@/lib/types'

// ─── Icons (inline SVGs to avoid importing all of lucide-react) ───

function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  )
}

const icons = {
  bot: "M12 8V4H8m0 0h8M8 4v4m8-4v4M4 14h2m12 0h2M9 13v2m6 0v-2M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z",
  search: "m21 21-4.34-4.34M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z",
  home: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  compass: "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265zM12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
  book: "m16 6 4 14M12 6v14M8 8v12M4 4v16",
  settings: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  plus: "M5 12h14M12 5v14",
  star: "m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z",
  sparkles: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
  arrowRight: "M5 12h14M12 5l7 7-7 7",
  moon: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z",
  sun: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41",
}

// ─── Navigation ───

const navItems: { key: ViewType; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: icons.home },
  { key: 'hub', label: 'Knowledge Hub', icon: icons.book },
  { key: 'browse', label: 'Browse', icon: icons.compass },
  { key: 'settings', label: 'Settings', icon: icons.settings },
]

// ─── Parse helper ───

function parseAgent(a: any): KnowledgeAgent {
  return {
    ...a,
    tools: typeof a.tools === 'string' ? JSON.parse(a.tools || '[]') : a.tools || [],
    models: typeof a.models === 'string' ? JSON.parse(a.models || '[]') : a.models || [],
    tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags || [],
  }
}

// ─── Home View ───

function HomeView() {
  const { setCurrentView, setSelectedAgentId } = useAppStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [agents, setAgents] = useState<KnowledgeAgent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statsData, agentsData, catsData] = await Promise.all([
          api.stats.get(),
          api.knowledge.list({ page: 1, pageSize: 6 }),
          api.categories.list(),
        ])
        setStats(statsData as Stats)
        setAgents((agentsData as any)?.data || agentsData || [])
        setCategories(Array.isArray(catsData) ? catsData : [])
      } catch (err) {
        console.error('Failed to load home data:', err)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleNav = (view: ViewType) => {
    setCurrentView(view)
    setSelectedAgentId(null)
    window.scrollTo(0, 0)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/30">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-100 text-sm mb-8">
            ✨ Powered by 500+ curated AI agent projects
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Discover & Build<br />
            <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">AI Agents</span>
          </h1>
          <p className="text-lg sm:text-xl text-emerald-100/90 max-w-2xl mx-auto mb-10">
            Explore 500+ curated AI agents across 5 frameworks. Find the perfect starting point, remix with your own twist, or build from scratch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleNav('browse')}
              className="px-8 py-3.5 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold rounded-xl shadow-lg transition-colors w-full sm:w-auto"
            >
              🔍 Browse Agents
            </button>
            <button
              onClick={() => handleNav('hub')}
              className="px-8 py-3.5 border border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl backdrop-blur-sm transition-colors w-full sm:w-auto"
            >
              ✨ Knowledge Hub
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: 'Knowledge Agents', value: stats?.knowledgeAgents || '—' },
              { label: 'Categories', value: stats?.categories || '—' },
              { label: 'Frameworks', value: stats?.frameworks || '—' },
              { label: 'Industries', value: stats?.topIndustries?.length || '—' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="text-3xl font-bold text-emerald-600">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-14 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    useAppStore.getState().setSelectedCategory(cat.slug)
                    handleNav('browse')
                  }}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-left hover:border-emerald-500/50 hover:shadow-md transition-all"
                >
                  <span className="text-2xl">{cat.icon || '📁'}</span>
                  <div className="font-medium mt-2">{cat.name}</div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Agents */}
      <section className="py-14 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Featured Agents</h2>
            <button onClick={() => handleNav('browse')} className="text-emerald-600 hover:underline flex items-center gap-1 text-sm font-medium">
              View All →
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.slice(0, 6).map((rawAgent) => {
                const agent = parseAgent(rawAgent)
                return (
                  <div
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgentId(agent.id)
                      setCurrentView('detail')
                      window.scrollTo(0, 0)
                    }}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold">{agent.name}</h3>
                      {agent.framework && (
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                          {agent.framework}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Describe Your Problem', desc: 'Tell our AI assistant what challenge your agent should solve.' },
              { step: 2, title: 'Get AI Suggestions', desc: 'Receive framework recommendations and code scaffolding.' },
              { step:3, title: 'Customize & Build', desc: 'Modify the generated code to fit your specific needs.' },
              { step: 4, title: 'Deploy & Share', desc: 'Launch your agent and share it with the community.' },
            ].map((item) => (
              <div key={item.step} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-3 left-3 h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2 mt-6">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Build?</h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
            Start creating your AI agent today with our powerful tools and 500+ templates.
          </p>
          <button
            onClick={() => handleNav('hub')}
            className="px-8 py-3.5 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold rounded-xl shadow-lg transition-colors"
          >
            🚀 Get Started
          </button>
        </div>
      </section>
    </div>
  )
}

// ─── Browse View ───

function BrowseView() {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, setCurrentView, setSelectedAgentId } = useAppStore()
  const [agents, setAgents] = useState<KnowledgeAgent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [localSearch, setLocalSearch] = useState(searchQuery)

  useEffect(() => {
    api.categories.list().then((data: any) => {
      setCategories(Array.isArray(data) ? data : [])
    }).catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    const params: any = { page: 1, pageSize: 24 }
    if (localSearch) params.q = localSearch
    if (selectedCategory) params.category = selectedCategory

    api.knowledge.search(params)
      .then((data: any) => {
        setAgents(data?.data || data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [localSearch, selectedCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Browse Agents
        <span className="absolute -bottom-1 left-0 h-1 w-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
      </h1>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.34-4.34" /></svg>
          <input
            type="text"
            placeholder="Search agents..."
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value)
              setSearchQuery(e.target.value)
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground hover:text-foreground'}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.slug ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground hover:text-foreground'}`}
          >
            {cat.icon || '📁'} {cat.name}
          </button>
        ))}
      </div>

      {/* Agent Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No agents found.</p>
          <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((rawAgent) => {
            const agent = parseAgent(rawAgent)
            return (
              <div
                key={agent.id}
                onClick={() => {
                  setSelectedAgentId(agent.id)
                  setCurrentView('detail')
                  window.scrollTo(0, 0)
                }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  {agent.framework && (
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                      {agent.framework}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>
                <div className="flex flex-wrap gap-1">
                  {agent.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                  {agent.difficulty && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${agent.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : agent.difficulty === 'advanced' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                      {agent.difficulty}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Settings View ───

function SettingsView() {
  const { settings, updateSettings } = useAppStore()
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Appearance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value as any })}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Default View</p>
                <p className="text-sm text-muted-foreground">Choose what you see first</p>
              </div>
              <select
                value={settings.defaultView}
                onChange={(e) => updateSettings({ defaultView: e.target.value as any })}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                <option value="home">Home</option>
                <option value="browse">Browse</option>
                <option value="hub">Knowledge Hub</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Display</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Items Per Page</p>
                <p className="text-sm text-muted-foreground">Number of agents shown per page</p>
              </div>
              <select
                value={settings.itemsPerPage}
                onChange={(e) => updateSettings({ itemsPerPage: Number(e.target.value) as any })}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Detail View ───

function DetailView() {
  const { selectedAgentId, setCurrentView, setSelectedAgentId } = useAppStore()
  const [agent, setAgent] = useState<KnowledgeAgent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedAgentId) return
    setLoading(true)
    api.knowledge.get(selectedAgentId)
      .then((data: any) => setAgent(parseAgent(data)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedAgentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Agent not found.</p>
        <button onClick={() => { setCurrentView('browse'); setSelectedAgentId(null) }} className="text-emerald-600 hover:underline mt-2">
          ← Back to Browse
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => { setCurrentView('browse'); setSelectedAgentId(null) }} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
        ← Back to Browse
      </button>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">{agent.name}</h1>
          {agent.framework && (
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full">
              {agent.framework}
            </span>
          )}
        </div>
        <p className="text-muted-foreground mb-6">{agent.description}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {agent.difficulty && <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"><p className="text-xs text-muted-foreground">Difficulty</p><p className="font-medium capitalize">{agent.difficulty}</p></div>}
          {agent.industry && <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"><p className="text-xs text-muted-foreground">Industry</p><p className="font-medium">{agent.industry}</p></div>}
          {agent.category && <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"><p className="text-xs text-muted-foreground">Category</p><p className="font-medium">{agent.category}</p></div>}
          {agent.llm && <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"><p className="text-xs text-muted-foreground">LLM</p><p className="font-medium">{agent.llm}</p></div>}
        </div>
        {agent.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {agent.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        )}
        {agent.tools.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Tools</h3>
            <div className="flex flex-wrap gap-2">
              {agent.tools.map((tool) => (
                <span key={tool} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">{tool}</span>
              ))}
            </div>
          </div>
        )}
        {agent.readme && (
          <div>
            <h3 className="font-semibold mb-2">README</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">{agent.readme}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Knowledge Hub View ───

function KnowledgeHubView() {
  const { setCurrentView, setSelectedAgentId } = useAppStore()
  const [agents, setAgents] = useState<KnowledgeAgent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.knowledge.list({ page: 1, pageSize: 24 })
      .then((data: any) => setAgents((data?.data || data || []).map(parseAgent)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const frameworks = [...new Set(agents.map(a => a.framework).filter(Boolean))]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">Knowledge Hub</h1>
      <p className="text-muted-foreground mb-8">Browse 500+ curated AI agent projects from the open-source community</p>

      {frameworks.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {frameworks.map(fw => (
            <span key={fw} className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
              {fw}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => {
                setSelectedAgentId(agent.id)
                setCurrentView('detail')
                window.scrollTo(0, 0)
              }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2">{agent.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>
              <div className="flex flex-wrap gap-1">
                {agent.framework && <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">{agent.framework}</span>}
                {agent.difficulty && <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full capitalize">{agent.difficulty}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main App Shell ───

const viewMap: Record<string, React.ComponentType> = {
  home: HomeView,
  browse: BrowseView,
  detail: DetailView,
  hub: KnowledgeHubView,
  settings: SettingsView,
}

export default function HomePage() {
  const { currentView, setCurrentView, setSelectedAgentId } = useAppStore()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const handleNav = (view: ViewType) => {
    setCurrentView(view)
    setSelectedAgentId(null)
    window.scrollTo(0, 0)
  }

  const ViewComponent = viewMap[currentView] || HomeView

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Top gradient */}
      <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shrink-0" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8m0 0h8M8 4v4m8-4v4M4 14h2m12 0h2M9 13v2m6 0v-2M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
              </svg>
            </div>
            <span className="font-bold text-lg hidden sm:inline tracking-tight">
              Humain<span className="text-emerald-600 dark:text-emerald-400">-Uno</span>
            </span>
          </button>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => handleNav(key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentView === key
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Actions */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => handleNav('hub')}
            className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium text-sm shadow-md transition-all"
          >
            ✨ Knowledge Hub
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <ViewComponent />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 8V4H8m0 0h8M8 4v4m8-4v4M4 14h2m12 0h2M9 13v2m6 0v-2M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                </svg>
              </div>
              <span className="font-bold text-sm">Humain<span className="text-emerald-600">-Uno</span></span>
            </div>
            <p className="text-xs text-muted-foreground">© 2025 Humain-Uno. Powered by 500+ AI Agents Knowledge Base</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="hover:text-emerald-600 cursor-pointer">LangGraph</span>
              <span>·</span>
              <span className="hover:text-amber-600 cursor-pointer">CrewAI</span>
              <span>·</span>
              <span className="hover:text-rose-600 cursor-pointer">AutoGen</span>
              <span>·</span>
              <span className="hover:text-violet-600 cursor-pointer">Agno</span>
              <span>·</span>
              <span className="hover:text-teal-600 cursor-pointer">LlamaIndex</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
