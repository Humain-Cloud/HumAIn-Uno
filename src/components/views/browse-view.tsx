'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent, Category } from '@/lib/types'
import { AgentCard } from '@/components/agents/agent-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  AlignJustify,
  X,
  Loader2,
  ChevronDown,
  Filter,
  ArrowUpDown,
  Sparkles,
  Clock,
  ArrowUpAZ,
  ArrowUpZA,
  CalendarPlus,
  Flame,
  Star,
  GraduationCap,
  Users,
  HelpCircle,
  Keyboard,
  Zap,
  Timer,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface Industry {
  name: string
  count: number
}

// Saved filter presets
const SAVED_FILTERS = [
  {
    id: 'popular',
    label: 'Popular',
    icon: Flame,
    color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    apply: { sortBy: 'popular' as const, category: null, framework: null, industry: null, difficulty: null },
  },
  {
    id: 'recently-added',
    label: 'Recently Added',
    icon: CalendarPlus,
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    apply: { sortBy: 'recently-added' as const, category: null, framework: null, industry: null, difficulty: null },
  },
  {
    id: 'beginner-friendly',
    label: 'Beginner Friendly',
    icon: GraduationCap,
    color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    apply: { sortBy: 'popular' as const, category: null, framework: null, industry: null, difficulty: 'beginner' },
  },
  {
    id: 'multi-agent',
    label: 'Multi-Agent',
    icon: Users,
    color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    apply: { sortBy: 'popular' as const, category: null, framework: null, industry: null, difficulty: null },
    // We'll handle multi-agent specially
  },
]

const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular', icon: Flame },
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'most-starred', label: 'Most Starred', icon: Star },
  { value: 'recently-added', label: 'Recently Added', icon: CalendarPlus },
  { value: 'az', label: 'A-Z', icon: ArrowUpAZ },
  { value: 'za', label: 'Z-A', icon: ArrowUpZA },
]

export function BrowseView() {
  const {
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    selectedFramework, setSelectedFramework,
    selectedIndustry, setSelectedIndustry,
    selectedDifficulty, setSelectedDifficulty,
    sortBy, setSortBy,
    viewMode, setViewMode,
    resetFilters,
    setCurrentView,
    searchHistory, addSearchHistory, clearSearchHistory,
  } = useAppStore()

  const [agents, setAgents] = useState<KnowledgeAgent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery)
  const [searchTiming, setSearchTiming] = useState(0)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)
  const infiniteScrollRef = useRef<HTMLDivElement>(null)
  const keySequenceRef = useRef('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load categories and industries
  useEffect(() => {
    api.categories.list().then((data: any) => {
      setCategories(Array.isArray(data) ? data : [])
    }).catch(console.error)

    api.industries.list().then((data: any) => {
      setIndustries(Array.isArray(data) ? data : [])
    }).catch(console.error)
  }, [])

  // Resolve category name from ID or name
  const resolveCategoryName = useCallback((catValue: string): string => {
    if (!catValue.startsWith('cl')) return catValue
    const cat = categories.find(c => c.id === catValue)
    return cat?.name || catValue
  }, [categories])

  // Fetch agents with auto-retry
  const fetchAgents = useCallback(async (pageNum: number, append = false, attempt = 0) => {
    const startTime = performance.now()
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const params: any = {
        page: pageNum,
        pageSize: 24,
      }
      if (debouncedQuery) params.q = debouncedQuery
      if (selectedFramework) params.framework = selectedFramework
      if (selectedIndustry) params.industry = selectedIndustry
      if (selectedCategory) params.category = resolveCategoryName(selectedCategory)
      if (selectedDifficulty) params.difficulty = selectedDifficulty

      const data: any = await api.knowledge.search(params)
      let newAgents = data?.data || data || []

      // Client-side sort for A-Z, Z-A, and recently-added
      if (sortBy === 'az') {
        newAgents = [...newAgents].sort((a: KnowledgeAgent, b: KnowledgeAgent) => a.name.localeCompare(b.name))
      } else if (sortBy === 'za') {
        newAgents = [...newAgents].sort((a: KnowledgeAgent, b: KnowledgeAgent) => b.name.localeCompare(a.name))
      }
      // 'recently-added' is handled by API's 'newest' sort - we map it below

      if (append) {
        setAgents(prev => [...prev, ...newAgents])
      } else {
        setAgents(newAgents)
      }
      setTotal(data?.total || newAgents.length)
      setHasMore(data?.hasMore !== undefined ? data.hasMore : newAgents.length >= 24)

      const elapsed = performance.now() - startTime
      setSearchTiming(Math.round(elapsed))
      setError(null)
      setRetryCount(0)
    } catch (err) {
      console.error('Failed to fetch agents:', err)
      if (attempt < 3) {
        // Auto-retry with exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        setRetryCount(attempt + 1)
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
        retryTimerRef.current = setTimeout(() => {
          fetchAgents(pageNum, append, attempt + 1)
        }, delay)
      } else {
        setError('Unable to load agents. The server may be temporarily unavailable.')
        setRetryCount(0)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [debouncedQuery, selectedFramework, selectedIndustry, selectedCategory, selectedDifficulty, sortBy, resolveCategoryName])

  // Cleanup retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
  }, [])

  // Reset page and fetch when filters change
  useEffect(() => {
    setPage(1)
    setError(null)
    fetchAgents(1)
  }, [fetchAgents])

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!infiniteScrollRef.current || !hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchAgents(nextPage, true)
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    observer.observe(infiniteScrollRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, page, fetchAgents])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger in input/textarea fields
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if (e.key === 'Escape') {
          setSearchQuery('')
          target.blur()
        }
        return
      }

      if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key === 'Escape') {
        setSearchQuery('')
        searchInputRef.current?.blur()
      } else if (e.key === '?') {
        setShowShortcuts(true)
      } else if (e.key === 'g') {
        keySequenceRef.current = 'g'
        setTimeout(() => { keySequenceRef.current = '' }, 1000)
      } else if (e.key === 'b' && keySequenceRef.current === 'g') {
        keySequenceRef.current = ''
        setCurrentView('browse')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setSearchQuery, setCurrentView])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchAgents(nextPage, true)
  }

  const activeFilterCount = [
    selectedCategory,
    selectedFramework,
    selectedIndustry,
    selectedDifficulty,
  ].filter(Boolean).length

  const frameworkOptions = [
    { value: 'langgraph', label: 'LangGraph', color: 'text-emerald-600' },
    { value: 'crewai', label: 'CrewAI', color: 'text-amber-600' },
    { value: 'autogen', label: 'AutoGen', color: 'text-rose-600' },
    { value: 'agno', label: 'Agno', color: 'text-violet-600' },
    { value: 'llamaindex', label: 'LlamaIndex', color: 'text-teal-600' },
  ]

  // Apply saved filter preset
  const applySavedFilter = (filterId: string) => {
    const preset = SAVED_FILTERS.find(f => f.id === filterId)
    if (!preset) return

    if (filterId === 'multi-agent') {
      // For multi-agent, we cycle through frameworks or just set framework
      setSelectedCategory(null)
      setSelectedIndustry(null)
      setSelectedDifficulty(null)
      setSortBy(preset.apply.sortBy)
      // Multi-agent means langgraph, crewai, or autogen - just pick the first one as filter
      setSelectedFramework('langgraph')
    } else if (filterId === 'beginner-friendly') {
      setSelectedCategory(null)
      setSelectedFramework(null)
      setSelectedIndustry(null)
      setSelectedDifficulty('beginner')
      setSortBy(preset.apply.sortBy)
    } else {
      setSelectedCategory(preset.apply.category)
      setSelectedFramework(preset.apply.framework)
      setSelectedIndustry(preset.apply.industry)
      setSelectedDifficulty(preset.apply.difficulty)
      setSortBy(preset.apply.sortBy)
    }
  }

  // Check if a saved filter is active
  const isActiveSavedFilter = (filterId: string): boolean => {
    if (filterId === 'popular') return sortBy === 'popular' && !selectedCategory && !selectedFramework && !selectedIndustry && !selectedDifficulty
    if (filterId === 'recently-added') return sortBy === 'recently-added' && !selectedCategory && !selectedFramework && !selectedIndustry && !selectedDifficulty
    if (filterId === 'beginner-friendly') return selectedDifficulty === 'beginner' && sortBy === 'popular'
    if (filterId === 'multi-agent') return (selectedFramework === 'langgraph' || selectedFramework === 'crewai' || selectedFramework === 'autogen') && !selectedCategory && !selectedIndustry && !selectedDifficulty
    return false
  }

  // Multi-agent frameworks for filter display
  const multiAgentFrameworks = ['langgraph', 'crewai', 'autogen']

  const FilterSidebar = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Category
        </h3>
        <Select value={selectedCategory || 'all'} onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name} ({cat.agentCount || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-amber-500" /> Framework
        </h3>
        <Select value={selectedFramework || 'all'} onValueChange={(v) => setSelectedFramework(v === 'all' ? null : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All frameworks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All frameworks</SelectItem>
            {frameworkOptions.map((fw) => (
              <SelectItem key={fw.value} value={fw.value}>
                <span className={fw.color}>{fw.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-violet-500" /> Industry
        </h3>
        <Select value={selectedIndustry || 'all'} onValueChange={(v) => setSelectedIndustry(v === 'all' ? null : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All industries</SelectItem>
            {industries.map((ind) => (
              <SelectItem key={ind.name} value={ind.name}>
                {ind.name} ({ind.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Difficulty</h3>
        <Select value={selectedDifficulty || 'all'} onValueChange={(v) => setSelectedDifficulty(v === 'all' ? null : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="beginner">🟢 Beginner</SelectItem>
            <SelectItem value="intermediate">🟡 Intermediate</SelectItem>
            <SelectItem value="advanced">🔴 Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Sort By</h3>
        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-1.5">
                  <opt.icon className="h-3.5 w-3.5" />
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full rounded-xl border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 min-h-[44px]" onClick={resetFilters}>
          <X className="h-4 w-4 mr-1" /> Clear Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  )

  // Get display name for a filter value
  const getFilterDisplayName = (type: string, value: string) => {
    if (type === 'framework') {
      return frameworkOptions.find(f => f.value === value)?.label || value
    }
    if (type === 'category') {
      const cat = categories.find(c => c.id === value || c.name === value)
      return cat?.name || value
    }
    if (type === 'difficulty') {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
    return value
  }

  // Compact view row component
  const CompactRow = ({ agent, index }: { agent: KnowledgeAgent; index: number }) => {
    const fwColor = agent.framework
      ? { langgraph: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', crewai: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', autogen: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', agno: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', llamaindex: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' }[agent.framework.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'

    const diffColor = agent.difficulty
      ? { beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' }[agent.difficulty.toLowerCase()] || ''
      : ''

    return (
      <motion.tr
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02, duration: 0.2 }}
        className="cursor-pointer hover:bg-muted/50 transition-colors border-b"
        onClick={() => useAppStore.getState().navigateToAgent(agent.id)}
      >
        <TableCell className="font-medium text-sm py-2.5">{agent.name}</TableCell>
        <TableCell className="py-2.5">
          {agent.framework ? (
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-5 ${fwColor}`}>
              {agent.framework}
            </Badge>
          ) : <span className="text-muted-foreground text-xs">—</span>}
        </TableCell>
        <TableCell className="py-2.5 text-xs text-muted-foreground">{agent.category}</TableCell>
        <TableCell className="py-2.5">
          {agent.difficulty ? (
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-5 ${diffColor}`}>
              {agent.difficulty}
            </Badge>
          ) : <span className="text-muted-foreground text-xs">—</span>}
        </TableCell>
      </motion.tr>
    )
  }

  // Agent preview tooltip
  const AgentPreviewTooltip = ({ agent, children }: { agent: KnowledgeAgent; children: React.ReactNode }) => (
    <HoverCard openDelay={500} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-72 p-3" side="top" align="center">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{agent.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-4">
            {agent.description?.slice(0, 200)}{agent.description && agent.description.length > 200 ? '...' : ''}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {agent.framework && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                {agent.framework}
              </Badge>
            )}
            {agent.difficulty && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 capitalize">
                {agent.difficulty}
              </Badge>
            )}
          </div>
          {agent.tools && agent.tools.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {agent.tools.slice(0, 3).map((tool) => (
                <span key={tool} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {tool}
                </span>
              ))}
              {agent.tools.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{agent.tools.length - 3}</span>
              )}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground italic">Click to view details</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )

  // Scroll to top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold relative">
            Browse Agents
            <span className="absolute -bottom-1 left-0 h-1 w-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {loading ? 'Loading...' : error ? 'Error loading agents' : `${total} agents found`}
            {!loading && searchTiming > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-muted-foreground/60">
                <Timer className="h-3 w-3" /> {searchTiming}ms
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search agents... (press /)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearchHistory(false)
              }}
              onFocus={() => {
                if (searchHistory.length > 0 && !searchQuery) {
                  setShowSearchHistory(true)
                }
              }}
              onBlur={() => {
                // Delay to allow click on history item
                setTimeout(() => setShowSearchHistory(false), 200)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  addSearchHistory(searchQuery.trim())
                  setShowSearchHistory(false)
                }
                if (e.key === 'Escape') {
                  setShowSearchHistory(false)
                }
              }}
              className="pl-9 pr-8 h-9 w-48 sm:w-64 rounded-xl input-focus"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {/* Search History Dropdown */}
            {showSearchHistory && searchHistory.length > 0 && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border rounded-xl shadow-lg z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground">Recent Searches</span>
                  <button
                    onClick={() => {
                      clearSearchHistory()
                      setShowSearchHistory(false)
                    }}
                    className="text-xs text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    Clear history
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchHistory.map((query, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
                      onClick={() => {
                        setSearchQuery(query)
                        addSearchHistory(query)
                        setShowSearchHistory(false)
                      }}
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{query}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden rounded-xl">
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center bg-emerald-600">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="mb-6">Filters</SheetTitle>
              <FilterSidebar />
            </SheetContent>
          </Sheet>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-xl overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className={`rounded-none h-8 px-3 min-w-[36px] ${viewMode === 'grid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className={`rounded-none h-8 px-3 min-w-[36px] ${viewMode === 'list' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
              size="sm"
              className={`rounded-none h-8 px-3 min-w-[36px] ${viewMode === 'compact' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}`}
              onClick={() => setViewMode('compact')}
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Saved Filters / Quick Filters */}
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Zap className="h-3 w-3" /> Quick Filters:
          </span>
          {SAVED_FILTERS.map((filter) => {
            const active = isActiveSavedFilter(filter.id)
            return (
              <motion.button
                key={filter.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => applySavedFilter(filter.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  active
                    ? 'ring-2 ring-emerald-400 ring-offset-1 ' + filter.color
                    : filter.color + ' hover:shadow-sm'
                }`}
              >
                <filter.icon className="h-3 w-3" />
                {filter.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Active Filters Bar */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Active:</span>
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg px-2.5 py-1">
                  {getFilterDisplayName('category', selectedCategory)}
                  <button onClick={() => setSelectedCategory(null)} className="hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedFramework && (
                <Badge variant="secondary" className="gap-1.5 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-lg px-2.5 py-1">
                  {getFilterDisplayName('framework', selectedFramework)}
                  <button onClick={() => setSelectedFramework(null)} className="hover:bg-amber-200 dark:hover:bg-amber-800 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedIndustry && (
                <Badge variant="secondary" className="gap-1.5 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 rounded-lg px-2.5 py-1">
                  {selectedIndustry}
                  <button onClick={() => setSelectedIndustry(null)} className="hover:bg-violet-200 dark:hover:bg-violet-800 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedDifficulty && (
                <Badge variant="secondary" className="gap-1.5 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 rounded-lg px-2.5 py-1">
                  {getFilterDisplayName('difficulty', selectedDifficulty)}
                  <button onClick={() => setSelectedDifficulty(null)} className="hover:bg-rose-200 dark:hover:bg-rose-800 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground" onClick={resetFilters}>
                Clear all
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <Card className="shadow-md rounded-xl border-0 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" /> Filters
              </h3>
              <FilterSidebar />
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Result Count & Timing */}
          {!loading && !error && agents.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{total}</span> agents found
                {searchTiming > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-full">
                    <Timer className="h-3 w-3" /> {searchTiming}ms
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Sorted by {SORT_OPTIONS.find(o => o.value === sortBy)?.label || sortBy}
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
              : viewMode === 'compact'
              ? 'space-y-0'
              : 'space-y-3'
            }>
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="rounded-xl">
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-900/20 mb-4">
                <AlertCircle className="h-8 w-8 text-rose-500 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Failed to load agents</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
              <Button
                onClick={() => {
                  setError(null)
                  setRetryCount(0)
                  fetchAgents(1)
                }}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </motion.div>
          ) : agents.length === 0 ? (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="mb-6"
              >
                {/* Animated empty state illustration */}
                <div className="relative inline-block">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mx-auto" style={{ animation: 'float 3s ease-in-out infinite' }}>
                    <Search className="h-10 w-10 text-emerald-400 dark:text-emerald-500" />
                  </div>
                  {/* Decorative dots around the circle */}
                  <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-emerald-300 dark:bg-emerald-700 opacity-60" style={{ animation: 'float 2.5s ease-in-out infinite', animationDelay: '0.3s' }} />
                  <div className="absolute -bottom-1 -left-3 h-3 w-3 rounded-full bg-teal-300 dark:bg-teal-700 opacity-50" style={{ animation: 'float 3.2s ease-in-out infinite', animationDelay: '0.8s' }} />
                  <div className="absolute top-1 -left-4 h-2 w-2 rounded-full bg-cyan-300 dark:bg-cyan-700 opacity-40" style={{ animation: 'float 2.8s ease-in-out infinite', animationDelay: '1.2s' }} />
                </div>
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">No agents found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" className="rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200" onClick={resetFilters}>
                <X className="h-4 w-4 mr-1.5" /> Clear Filters
              </Button>
            </div>
          ) : viewMode === 'compact' ? (
            <>
              <Card className="rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent, i) => (
                      <CompactRow key={agent.id} agent={agent} index={i} />
                    ))}
                  </TableBody>
                </Table>
              </Card>
              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div ref={infiniteScrollRef} className="flex justify-center py-4">
                  {loadingMore ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading more...
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      className="min-w-[200px] rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 dark:hover:from-emerald-900/20 dark:hover:to-cyan-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300"
                    >
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Load More
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'space-y-3'
              }>
                {agents.map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    <AgentPreviewTooltip agent={agent}>
                      <div>
                        <AgentCard agent={agent} index={i} viewMode={viewMode} />
                      </div>
                    </AgentPreviewTooltip>
                  </motion.div>
                ))}
              </div>

              {/* Infinite scroll sentinel + Load More fallback */}
              {hasMore && (
                <div ref={infiniteScrollRef} className="text-center mt-8">
                  {loadingMore ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading more agents...
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="min-w-[200px] rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 dark:hover:from-emerald-900/20 dark:hover:to-cyan-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300"
                    >
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Load More
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-emerald-600" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these shortcuts to navigate faster
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {[
              { keys: ['/', 'Search'], desc: 'Focus search input' },
              { keys: ['Esc'], desc: 'Clear search and blur input' },
              { keys: ['g', 'b'], desc: 'Go to Browse view' },
              { keys: ['?'], desc: 'Show this help dialog' },
            ].map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground">{shortcut.desc}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, ki) => (
                    <span key={ki}>
                      {ki > 0 && <span className="text-xs text-muted-foreground mx-0.5">then</span>}
                      <kbd className="inline-flex items-center justify-center h-6 px-2 text-xs font-mono bg-muted border rounded-md">
                        {key}
                      </kbd>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcut Hint (bottom-right) */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 15 }}
        onClick={() => setShowShortcuts(true)}
        className="fixed bottom-6 right-6 z-40 h-10 w-10 rounded-full bg-background border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-xl transition-all duration-200"
        title="Keyboard shortcuts (?)"
      >
        <HelpCircle className="h-5 w-5" />
      </motion.button>

      {/* Scroll to Top Button */}
      <button
        className={`scroll-to-top h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 flex items-center justify-center hover:shadow-xl hover:scale-110 transition-all duration-200 ${showScrollTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 9l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  )
}
