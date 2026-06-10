'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent, Category } from '@/lib/types'
import { AgentCard } from '@/components/agents/agent-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  Loader2,
  ChevronDown,
  Filter,
  ArrowUpDown,
  Sparkles,
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
    // If it's already a name (not a cuid), return as-is
    if (!catValue.startsWith('cl')) return catValue
    // Look up the category name from the categories list
    const cat = categories.find(c => c.id === catValue)
    return cat?.name || catValue
  }, [categories])

  // Fetch agents
  const fetchAgents = useCallback(async (pageNum: number, append = false) => {
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

      const data: any = await api.knowledge.search(params)
      const newAgents = data?.data || data || []

      if (append) {
        setAgents(prev => [...prev, ...newAgents])
      } else {
        setAgents(newAgents)
      }
      setTotal(data?.total || newAgents.length)
      setHasMore(data?.hasMore !== undefined ? data.hasMore : newAgents.length >= 24)
    } catch (err) {
      console.error('Failed to fetch agents:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [debouncedQuery, selectedFramework, selectedIndustry, selectedCategory, resolveCategoryName])

  // Reset page and fetch when filters change
  useEffect(() => {
    setPage(1)
    fetchAgents(1)
  }, [fetchAgents])

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
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="most-starred">Most Starred</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full rounded-xl border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" onClick={resetFilters}>
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
    return value
  }

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
            {loading ? 'Loading...' : `${total} agents found`}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
              className={`rounded-none h-8 px-3 ${viewMode === 'grid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className={`rounded-none h-8 px-3 ${viewMode === 'list' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 mb-4"
          >
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
                {selectedDifficulty}
                <button onClick={() => setSelectedDifficulty(null)} className="hover:bg-rose-200 dark:hover:bg-rose-800 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground" onClick={resetFilters}>
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <Card className="shadow-md rounded-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
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
          {loading ? (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
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
          ) : agents.length === 0 ? (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Search className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" style={{ animation: 'float 3s ease-in-out infinite' }} />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">No agents found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" className="rounded-xl" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
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
                    <AgentCard agent={agent} index={i} viewMode={viewMode} />
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="min-w-[200px] rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 dark:hover:from-emerald-900/20 dark:hover:to-cyan-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Load More
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
