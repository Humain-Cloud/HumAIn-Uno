'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Filter,
  Star,
  TrendingUp,
  DollarSign,
  Zap,
  Eye,
  Code,
  FileText,
  Image as ImageIcon,
  Video,
  Globe,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Cpu,
  ArrowUpDown,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Info,
  LayoutGrid,
  List,
  BarChart3,
  Target,
  RefreshCw,
} from 'lucide-react'
import { useDebounce } from '@/lib/hooks/use-debounce'

// ─── Types ──────────────────────────────────────────────────────────

interface LLMModel {
  id: string
  arenaKey: string
  name: string
  organization: string
  provider: string | null
  license: string
  modelUrl: string | null
  bestRank: number
  bestRating: number
  totalVotes: number
  inputPricePerMillion: number | null
  outputPricePerMillion: number | null
  contextLength: number | null
  pricePerImage: number | null
  pricePerSecond: number | null
  inputCapabilities: Record<string, boolean>
  outputCapabilities: Record<string, boolean>
  arenaCategories: string[]
  categoryRankings: Record<string, { rank: number; rating: number; votes: number }>
  useCaseTags: string[]
  userSelectable: boolean
  releaseType: string | null
  lastSyncedAt: string
  isBookmarked?: boolean
}

interface ModelStats {
  totalModels: number
  totalOrganizations: number
  topRated: LLMModel[]
  newestModels: LLMModel[]
  organizations: { name: string; modelCount: number; avgRating: number }[]
  licenses: { name: string; count: number }[]
  arenas: { name: string; count: number }[]
  pricing: {
    input: { min: number | null; max: number | null; avg: number }
    output: { min: number | null; max: number | null; avg: number }
  }
}

interface UseCase {
  id: string
  label: string
  description: string
  icon: string
}

interface Recommendation {
  id: string
  name: string
  organization: string
  arenaKey: string
  license: string
  bestRating: number
  bestRank: number
  totalVotes: number
  inputPricePerMillion: number | null
  outputPricePerMillion: number | null
  contextLength: number | null
  inputCapabilities: string[]
  outputCapabilities: string[]
  arenaCategories: string[]
  useCaseTags: string[]
  specificRank: number | null
  specificRating: number | null
  score: number
  withinBudget: boolean
}

// ─── Arena category metadata ────────────────────────────────────────

const ARENA_META: Record<string, { label: string; icon: any; color: string }> = {
  text: { label: 'Text / Chat', icon: Brain, color: 'text-blue-500' },
  code: { label: 'Code', icon: Code, color: 'text-emerald-500' },
  vision: { label: 'Vision', icon: Eye, color: 'text-purple-500' },
  document: { label: 'Document', icon: FileText, color: 'text-orange-500' },
  'text-to-image': { label: 'Image Gen', icon: ImageIcon, color: 'text-pink-500' },
  'image-edit': { label: 'Image Edit', icon: ImageIcon, color: 'text-rose-500' },
  'image-to-code': { label: 'Image to Code', icon: Code, color: 'text-cyan-500' },
  search: { label: 'Search', icon: Search, color: 'text-yellow-500' },
  'text-to-video': { label: 'Video Gen', icon: Video, color: 'text-red-500' },
  'image-to-video': { label: 'Img → Video', icon: Video, color: 'text-amber-500' },
  'video-to-video': { label: 'Video Edit', icon: Video, color: 'text-indigo-500' },
}

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'rank', label: 'Best Rank' },
  { value: 'votes', label: 'Most Votes' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'newest', label: 'Newest First' },
]

// ─── Main Component ─────────────────────────────────────────────────

export default function ModelsExplorer() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'explore' | 'recommend' | 'bookmarks'>('explore')

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border/40 bg-gradient-to-r from-emerald-50/50 via-background to-teal-50/50 dark:from-emerald-950/20 dark:via-background dark:to-teal-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent dark:from-emerald-900/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Cpu className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">LLM Model Explorer</h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-1">
                  Find the perfect AI model for your use-case — powered by <a href="https://arena.ai/leaderboard/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Arena.ai</a> rankings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="explore" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Search className="h-4 w-4 mr-2" /> Explore Models
            </TabsTrigger>
            <TabsTrigger value="recommend" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Target className="h-4 w-4 mr-2" /> Find Your Model
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Bookmark className="h-4 w-4 mr-2" /> My Bookmarks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explore">
            <ExploreTab userId={user?.id} />
          </TabsContent>

          <TabsContent value="recommend">
            <RecommendTab userId={user?.id} />
          </TabsContent>

          <TabsContent value="bookmarks">
            <BookmarksTab userId={user?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// ─── Explore Tab ────────────────────────────────────────────────────

function ExploreTab({ userId }: { userId?: string }) {
  const [models, setModels] = useState<LLMModel[]>([])
  const [stats, setStats] = useState<ModelStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 24

  // Filters
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const [selectedArena, setSelectedArena] = useState<string>('')
  const [selectedLicense, setSelectedLicense] = useState<string>('')
  const [selectedSort, setSelectedSort] = useState('rating')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [syncing, setSyncing] = useState(false)

  const fetchModels = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sort: selectedSort,
      })
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (selectedOrg) params.set('organization', selectedOrg)
      if (selectedArena) params.set('arena', selectedArena)
      if (selectedLicense) params.set('license', selectedLicense)

      const res = await fetch(`/api/llm-models?${params}`)
      const data = await res.json()
      setModels(data.models || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
    } catch (error) {
      console.error('Failed to fetch models:', error)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, selectedOrg, selectedArena, selectedLicense, selectedSort])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/llm-models/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }, [])

  useEffect(() => { fetchModels() }, [fetchModels])
  useEffect(() => { fetchStats() }, [fetchStats])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/llm-models/sync', { method: 'POST' })
      const data = await res.json()
      if (data.status === 'success') {
        fetchModels()
        fetchStats()
      }
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  const activeFilterCount = [selectedOrg, selectedArena, selectedLicense, debouncedSearch].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Stats Banner */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard icon={Cpu} label="Total Models" value={stats.totalModels.toString()} />
          <StatsCard icon={Globe} label="Organizations" value={stats.totalOrganizations.toString()} />
          <StatsCard icon={BarChart3} label="Avg Output $/M" value={`$${stats.pricing.output.avg?.toFixed(2) || 'N/A'}`} />
          <StatsCard icon={TrendingUp} label="#1 Ranked" value={stats.topRated[0]?.name || 'N/A'} subtext={stats.topRated[0]?.organization} />
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search models, organizations..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-10 pr-4 h-10 rounded-xl border-border/60 bg-background"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full bg-emerald-500 text-white">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <Select value={selectedSort} onValueChange={(v) => { setSelectedSort(v); setPage(1) }}>
            <SelectTrigger className="w-[180px] h-10 rounded-xl">
              <ArrowUpDown className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="hidden sm:flex border rounded-xl overflow-hidden">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" className="rounded-none" onClick={() => setViewMode('grid')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" className="rounded-none" onClick={() => setViewMode('list')}>
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" className="rounded-xl" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Organization Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Organization</Label>
                <Select value={selectedOrg} onValueChange={(v) => { setSelectedOrg(v === '__all__' ? '' : v); setPage(1) }}>
                  <SelectTrigger className="h-9 rounded-lg text-sm">
                    <SelectValue placeholder="All organizations" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="__all__">All organizations</SelectItem>
                    {stats?.organizations.map(o => (
                      <SelectItem key={o.name} value={o.name}>
                        {o.name} ({o.modelCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Arena Category Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Arena Category</Label>
                <Select value={selectedArena} onValueChange={(v) => { setSelectedArena(v === '__all__' ? '' : v); setPage(1) }}>
                  <SelectTrigger className="h-9 rounded-lg text-sm">
                    <SelectValue placeholder="All arenas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All arenas</SelectItem>
                    {stats?.arenas.map(a => {
                      const meta = ARENA_META[a.name]
                      return (
                        <SelectItem key={a.name} value={a.name}>
                          {meta?.label || a.name} ({a.count})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* License Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">License</Label>
                <Select value={selectedLicense} onValueChange={(v) => { setSelectedLicense(v === '__all__' ? '' : v); setPage(1) }}>
                  <SelectTrigger className="h-9 rounded-lg text-sm">
                    <SelectValue placeholder="All licenses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All licenses</SelectItem>
                    {stats?.licenses.map(l => (
                      <SelectItem key={l.name} value={l.name}>
                        {l.name} ({l.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters as chips */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
                <span className="text-xs text-muted-foreground">Active:</span>
                {selectedOrg && <FilterChip label={selectedOrg} onRemove={() => setSelectedOrg('')} />}
                {selectedArena && <FilterChip label={ARENA_META[selectedArena]?.label || selectedArena} onRemove={() => setSelectedArena('')} />}
                {selectedLicense && <FilterChip label={selectedLicense} onRemove={() => setSelectedLicense('')} />}
                <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => { setSelectedOrg(''); setSelectedArena(''); setSelectedLicense(''); setSearch(''); }}>
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading...' : `${total} model${total !== 1 ? 's' : ''} found`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <span className="text-sm text-muted-foreground">{page}/{totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>

      {/* Models Grid/List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-16">
          <Cpu className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No models found</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map(m => <ModelCard key={m.id} model={m} userId={userId} onBookmarkChange={fetchModels} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {models.map(m => <ModelListItem key={m.id} model={m} userId={userId} onBookmarkChange={fetchModels} />)}
        </div>
      )}
    </div>
  )
}

// ─── Recommend Tab ──────────────────────────────────────────────────

function RecommendTab({ userId }: { userId?: string }) {
  const [useCases, setUseCases] = useState<UseCase[]>([])
  const [selectedUseCase, setSelectedUseCase] = useState<string>('')
  const [budget, setBudget] = useState<'any' | 'free' | 'low' | 'mid' | 'high'>('any')
  const [priorities, setPriorities] = useState<string[]>(['accuracy'])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    fetch('/api/llm-models/recommend')
      .then(r => r.json())
      .then(data => setUseCases(data.useCases || []))
      .catch(console.error)
  }, [])

  const handleRecommend = async () => {
    if (!selectedUseCase) return
    setLoading(true)
    setShowResults(true)
    try {
      const res = await fetch('/api/llm-models/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCase: selectedUseCase, budget, priorities }),
      })
      const data = await res.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Recommendation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePriority = (p: string) => {
    setPriorities(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  return (
    <div className="space-y-8">
      {/* Use Case Selection */}
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-50/30 to-teal-50/30 dark:from-emerald-950/10 dark:to-teal-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            What do you need the model for?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {useCases.map(uc => (
              <button
                key={uc.id}
                onClick={() => setSelectedUseCase(uc.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                  selectedUseCase === uc.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md'
                    : 'border-border/60 hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
              >
                <div className="text-2xl mb-1">{uc.icon}</div>
                <div className="text-sm font-medium">{uc.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{uc.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget & Priorities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {(['any', 'free', 'low', 'mid', 'high'] as const).map(b => (
                <Button
                  key={b}
                  variant={budget === b ? 'default' : 'outline'}
                  size="sm"
                  className={`rounded-lg text-xs ${budget === b ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                  onClick={() => setBudget(b)}
                >
                  {b === 'any' ? 'Any' : b === 'free' ? 'Free' : b === 'low' ? '<$5/M' : b === 'mid' ? '<$25/M' : '<$100/M'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Priorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'accuracy', label: '🎯 Accuracy', desc: 'Best quality results' },
                { id: 'speed', label: '⚡ Speed', desc: 'Fast inference' },
                { id: 'cost', label: '💰 Cost', desc: 'Best value' },
                { id: 'context', label: '📏 Long Context', desc: '128K+ tokens' },
              ].map(p => (
                <Button
                  key={p.id}
                  variant={priorities.includes(p.id) ? 'default' : 'outline'}
                  size="sm"
                  className={`rounded-lg ${priorities.includes(p.id) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                  onClick={() => togglePriority(p.id)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Find Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="rounded-xl px-8 bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={!selectedUseCase || loading}
          onClick={handleRecommend}
        >
          {loading ? (
            <><RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Finding models...</>
          ) : (
            <><Target className="h-5 w-5 mr-2" /> Find My Model</>
          )}
        </Button>
      </div>

      {/* Results */}
      {showResults && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Recommended Models
            {recommendations.length > 0 && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {recommendations.length} matches
              </Badge>
            )}
          </h3>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No matching models</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">Try a different use case or adjust your budget</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <RecommendationCard key={rec.id} recommendation={rec} rank={idx + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Bookmarks Tab ──────────────────────────────────────────────────

function BookmarksTab({ userId }: { userId?: string }) {
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBookmarks = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/llm-models/bookmark?userId=${userId}`)
      const data = await res.json()
      setBookmarks(data.bookmarks || [])
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchBookmarks() }, [fetchBookmarks])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16">
        <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No bookmarked models</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">Bookmark models from the Explore tab to save them here</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookmarks.map((b: any) => (
        <ModelCard key={b.id} model={b.model} userId={userId} onBookmarkChange={fetchBookmarks} />
      ))}
    </div>
  )
}

// ─── Sub-Components ─────────────────────────────────────────────────

function StatsCard({ icon: Icon, label, value, subtext }: { icon: any; label: string; value: string; subtext?: string }) {
  return (
    <Card className="border-border/40 bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold truncate" title={value}>{value}</p>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
      {label}
      <button onClick={onRemove} className="ml-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 p-0.5">
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}

function ModelCard({ model, userId, onBookmarkChange }: { model: LLMModel; userId?: string; onBookmarkChange: () => void }) {
  const [bookmarked, setBookmarked] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const toggleBookmark = async () => {
    if (!userId) return
    try {
      if (bookmarked) {
        await fetch(`/api/llm-models/bookmark?userId=${userId}&modelId=${model.id}`, { method: 'DELETE' })
        setBookmarked(false)
      } else {
        await fetch('/api/llm-models/bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, modelId: model.id }),
        })
        setBookmarked(true)
      }
      onBookmarkChange()
    } catch (error) {
      console.error('Bookmark error:', error)
    }
  }

  const inpCaps = Object.keys(model.inputCapabilities || {})
  const outCaps = Object.keys(model.outputCapabilities || {})
  const topRank = model.bestRank <= 10
  const isFree = model.outputPricePerMillion === null
  const isCheap = model.outputPricePerMillion !== null && model.outputPricePerMillion <= 2

  return (
    <Card className={`group border-border/60 hover:border-emerald-500/30 hover:shadow-lg transition-all duration-200 ${topRank ? 'ring-1 ring-emerald-500/20' : ''}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{model.name}</h3>
              {topRank && <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 shrink-0">Top #{model.bestRank}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{model.organization}</p>
          </div>
          <button onClick={toggleBookmark} className="shrink-0 p-1 rounded-lg hover:bg-muted">
            {bookmarked ? <BookmarkCheck className="h-4 w-4 text-emerald-600" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>

        {/* Rating & Rank */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium">{model.bestRating.toFixed(0)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="text-xs">Rank #{model.bestRank}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="text-xs">{(model.totalVotes / 1000).toFixed(1)}K votes</span>
          </div>
        </div>

        {/* Arena Categories */}
        <div className="flex flex-wrap gap-1 mb-3">
          {model.arenaCategories.slice(0, 4).map(cat => {
            const meta = ARENA_META[cat]
            return (
              <Badge key={cat} variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-0.5">
                {meta?.icon && <meta.icon className={`h-2.5 w-2.5 ${meta.color}`} />}
                {meta?.label || cat}
              </Badge>
            )
          })}
          {model.arenaCategories.length > 4 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">+{model.arenaCategories.length - 4}</Badge>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-3 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            {isFree ? (
              <span className="text-emerald-600 font-medium">Free / N/A</span>
            ) : (
              <span>
                <span className="text-muted-foreground">In:</span> ${model.inputPricePerMillion?.toFixed(2)}/M
                <span className="text-muted-foreground ml-1">Out:</span> ${model.outputPricePerMillion?.toFixed(2)}/M
              </span>
            )}
          </div>
          {model.contextLength && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Zap className="h-3 w-3" />
              {model.contextLength >= 1000000 ? `${(model.contextLength / 1000000).toFixed(0)}M` : `${(model.contextLength / 1000).toFixed(0)}K`} ctx
            </div>
          )}
        </div>

        {/* Capabilities */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Input: {inpCaps.join(', ') || 'N/A'}</span>
          <span>→</span>
          <span>Output: {outCaps.join(', ') || 'N/A'}</span>
        </div>

        {/* Use-case Tags */}
        {model.useCaseTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {model.useCaseTags.slice(0, 4).map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* License & Link */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${
            model.license === 'MIT' || model.license === 'Apache 2.0' ? 'border-emerald-500/30 text-emerald-600' : ''
          }`}>
            {model.license}
          </Badge>
          {model.modelUrl && (
            <a href={model.modelUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5">
              <ExternalLink className="h-3 w-3" /> Learn more
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ModelListItem({ model, userId, onBookmarkChange }: { model: LLMModel; userId?: string; onBookmarkChange: () => void }) {
  const [bookmarked, setBookmarked] = useState(false)
  const inpCaps = Object.keys(model.inputCapabilities || {})
  const outCaps = Object.keys(model.outputCapabilities || {})

  const toggleBookmark = async () => {
    if (!userId) return
    try {
      if (bookmarked) {
        await fetch(`/api/llm-models/bookmark?userId=${userId}&modelId=${model.id}`, { method: 'DELETE' })
        setBookmarked(false)
      } else {
        await fetch('/api/llm-models/bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, modelId: model.id }),
        })
        setBookmarked(true)
      }
      onBookmarkChange()
    } catch (error) {
      console.error('Bookmark error:', error)
    }
  }

  return (
    <Card className="border-border/40 hover:border-emerald-500/20 transition-colors">
      <CardContent className="p-3 flex items-center gap-4">
        <div className="flex-1 min-w-0 flex items-center gap-4">
          <div className="flex items-center gap-1.5 w-10 shrink-0">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-semibold">{model.bestRating.toFixed(0)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{model.name}</span>
              {model.bestRank <= 10 && <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 shrink-0">#{model.bestRank}</Badge>}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span>{model.organization}</span>
              <span>•</span>
              <span>{(model.totalVotes / 1000).toFixed(1)}K votes</span>
              <span>•</span>
              <span>{model.outputPricePerMillion ? `$${model.outputPricePerMillion.toFixed(2)}/M` : 'Free/N/A'}</span>
              {model.contextLength && <><span>•</span><span>{model.contextLength >= 1000000 ? `${(model.contextLength / 1000000).toFixed(0)}M` : `${(model.contextLength / 1000).toFixed(0)}K`} ctx</span></>}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            {model.arenaCategories.slice(0, 3).map(cat => {
              const meta = ARENA_META[cat]
              return meta ? <meta.icon key={cat} className={`h-4 w-4 ${meta.color}`} title={meta.label} /> : null
            })}
          </div>
        </div>
        <button onClick={toggleBookmark} className="shrink-0 p-1.5 rounded-lg hover:bg-muted">
          {bookmarked ? <BookmarkCheck className="h-4 w-4 text-emerald-600" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
        </button>
      </CardContent>
    </Card>
  )
}

function RecommendationCard({ recommendation: rec, rank }: { recommendation: Recommendation; rank: number }) {
  const scorePercent = Math.min(100, Math.round(rec.score))
  const topRank = rec.bestRank <= 10

  return (
    <Card className={`border-border/60 hover:border-emerald-500/30 hover:shadow-lg transition-all ${rank <= 3 ? 'ring-1 ring-emerald-500/20' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Rank Badge */}
          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
            rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
            rank === 2 ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
            rank === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
            'bg-muted text-muted-foreground'
          }`}>
            {rank}
          </div>

          {/* Model Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{rec.name}</h3>
              {topRank && <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0">Top #{rec.bestRank}</Badge>}
              {rec.specificRank && <Badge variant="outline" className="text-[10px]">Arena Rank #{rec.specificRank}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{rec.organization} • {rec.license}</p>

            {/* Score Bar */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${scorePercent}%` }} />
              </div>
              <span className="text-xs font-medium text-emerald-600">{scorePercent}% match</span>
            </div>

            {/* Details */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> {rec.bestRating.toFixed(0)}</span>
              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {rec.outputPricePerMillion ? `$${rec.outputPricePerMillion.toFixed(2)}/M` : 'N/A'}</span>
              {rec.contextLength && <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {rec.contextLength >= 1000000 ? `${(rec.contextLength/1000000).toFixed(0)}M` : `${(rec.contextLength/1000).toFixed(0)}K`} ctx</span>}
              <span>{(rec.totalVotes / 1000).toFixed(1)}K votes</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {rec.useCaseTags.slice(0, 5).map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
