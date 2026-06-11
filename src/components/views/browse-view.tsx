'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent, Category } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  AlignJustify,
  X,
  Filter,
  Clock,
  HelpCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'

// Split imports
import { type Industry, SORT_OPTIONS } from '@/components/browse/shared-data'
import { FilterSidebar } from '@/components/browse/filter-sidebar'
import { ActiveFiltersBar } from '@/components/browse/active-filters-bar'
import { QuickFilters } from '@/components/browse/quick-filters'
import { AgentGrid } from '@/components/browse/agent-grid'
import { KeyboardShortcutsModal } from '@/components/browse/keyboard-shortcuts-modal'

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
                <Clock className="h-3 w-3" /> {searchTiming}ms
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
              <FilterSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedFramework={selectedFramework}
                setSelectedFramework={setSelectedFramework}
                selectedIndustry={selectedIndustry}
                setSelectedIndustry={setSelectedIndustry}
                selectedDifficulty={selectedDifficulty}
                setSelectedDifficulty={setSelectedDifficulty}
                sortBy={sortBy}
                setSortBy={setSortBy}
                categories={categories}
                industries={industries}
                activeFilterCount={activeFilterCount}
                resetFilters={resetFilters}
              />
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

      {/* Quick Filters */}
      <QuickFilters />

      {/* Active Filters Bar */}
      <ActiveFiltersBar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedFramework={selectedFramework}
        setSelectedFramework={setSelectedFramework}
        selectedIndustry={selectedIndustry}
        setSelectedIndustry={setSelectedIndustry}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        categories={categories}
        resetFilters={resetFilters}
      />

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <Card className="shadow-md rounded-xl border-0 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" /> Filters
              </h3>
              <FilterSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedFramework={selectedFramework}
                setSelectedFramework={setSelectedFramework}
                selectedIndustry={selectedIndustry}
                setSelectedIndustry={setSelectedIndustry}
                selectedDifficulty={selectedDifficulty}
                setSelectedDifficulty={setSelectedDifficulty}
                sortBy={sortBy}
                setSortBy={setSortBy}
                categories={categories}
                industries={industries}
                activeFilterCount={activeFilterCount}
                resetFilters={resetFilters}
              />
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <AgentGrid
            agents={agents}
            loading={loading}
            loadingMore={loadingMore}
            error={error}
            viewMode={viewMode}
            sortBy={sortBy}
            total={total}
            searchTiming={searchTiming}
            hasMore={hasMore}
            loadMore={loadMore}
            onRetry={() => {
              setError(null)
              setRetryCount(0)
              fetchAgents(1)
            }}
            resetFilters={resetFilters}
            infiniteScrollRef={infiniteScrollRef}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />

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
