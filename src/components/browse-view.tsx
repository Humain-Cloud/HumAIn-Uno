'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent, Category } from '@/lib/types'
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
  X,
} from 'lucide-react'
import {
  AgentPagination,
  AgentCard,
  getCategoryStyle,
  parseAgent,
  FRAMEWORKS,
  DIFFICULTIES,
  SORT_OPTIONS,
} from '@/components/shared/agent-ui'

export default function BrowseView() {
  const { searchQuery, setSearchQuery, selectedCategory, setCurrentView, setSelectedAgentId, settings } = useAppStore()
  const [agents, setAgents] = useState<KnowledgeAgent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(settings.itemsPerPage || 24)
  const [total, setTotal] = useState(0)
  const [localCategory, setLocalCategory] = useState<string | null>(null)
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('az')
  const [showFilters, setShowFilters] = useState(false)

  // Effective category = local override or store value
  const activeCategory = localCategory !== null ? localCategory : selectedCategory

  // Debounced search
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => { setDebouncedSearch(localSearch); setPage(1) }, 300)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [localSearch])

  // Load categories
  useEffect(() => {
    api.categories.list().then((data: any) => {
      setCategories(Array.isArray(data) ? data : [])
    }).catch(console.error)
  }, [])

  // Load agents with pagination
  const fetchRef = useRef(0)
  useEffect(() => {
    const fetchId = ++fetchRef.current
    const params: any = { page, pageSize: itemsPerPage }
    if (debouncedSearch) params.q = debouncedSearch
    if (activeCategory) params.category = activeCategory
    if (selectedFramework) params.framework = selectedFramework

    api.knowledge.search(params)
      .then((data: any) => {
        if (fetchId !== fetchRef.current) return
        let results = (data?.data || data || []) as KnowledgeAgent[]
        // Client-side difficulty filter (not supported by API)
        if (selectedDifficulty) {
          results = results.filter((a: KnowledgeAgent) => a.difficulty === selectedDifficulty)
        }
        // Client-side sort
        if (sortBy === 'az') results.sort((a: KnowledgeAgent, b: KnowledgeAgent) => a.name.localeCompare(b.name))
        else if (sortBy === 'za') results.sort((a: KnowledgeAgent, b: KnowledgeAgent) => b.name.localeCompare(a.name))
        setAgents(results)
        setTotal(data?.total || results.length)
        setLoading(false)
      })
      .catch((err) => {
        if (fetchId !== fetchRef.current) return
        console.error(err)
        setLoading(false)
      })
  }, [debouncedSearch, activeCategory, selectedFramework, selectedDifficulty, sortBy, page, itemsPerPage])

  const totalPages = Math.ceil(total / itemsPerPage)
  const hasActiveFilters = activeCategory || selectedFramework || selectedDifficulty || debouncedSearch

  const handleClearFilters = () => {
    setLocalSearch('')
    setSearchQuery('')
    setLocalCategory(null)
    setSelectedFramework(null)
    setSelectedDifficulty(null)
    setSortBy('az')
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Browse Agents</h1>
          <p className="text-muted-foreground text-sm">
            {loading ? 'Loading...' : `${total} agent${total !== 1 ? 's' : ''} found`}
            {hasActiveFilters && ' with current filters'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9 px-3 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors border ${showFilters ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-muted-foreground hover:text-foreground'}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search agents by name, description, or tags..."
          value={localSearch}
          onChange={(e) => {
            setLocalSearch(e.target.value)
            setSearchQuery(e.target.value)
          }}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-sm"
        />
        {localSearch && (
          <button
            onClick={() => { setLocalSearch(''); setSearchQuery('') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Bar (expandable) */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Framework filter */}
            <Select value={selectedFramework || '_all'} onValueChange={(v) => { setSelectedFramework(v === '_all' ? null : v); setPage(1) }}>
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Frameworks</SelectItem>
                {FRAMEWORKS.map(fw => (
                  <SelectItem key={fw} value={fw}>{fw}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Difficulty filter */}
            <Select value={selectedDifficulty || '_all'} onValueChange={(v) => { setSelectedDifficulty(v === '_all' ? null : v); setPage(1) }}>
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Levels</SelectItem>
                {DIFFICULTIES.map(d => (
                  <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setLocalCategory(null); setPage(1) }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${!activeCategory ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground hover:text-foreground'}`}
        >
          All
        </button>
        {categories.map((cat, i) => {
          const style = getCategoryStyle(cat.name, i)
          const CatIcon = style.icon
          const isActive = activeCategory === cat.slug
          return (
            <button
              key={cat.id}
              onClick={() => { setLocalCategory(isActive ? null : cat.slug); setPage(1) }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${isActive ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground hover:text-foreground'}`}
            >
              <CatIcon className="h-3 w-3" />
              {cat.name}
              {cat.agentCount !== undefined && (
                <span className={`text-[10px] ${isActive ? 'text-emerald-100' : 'text-muted-foreground/60'}`}>
                  {cat.agentCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-muted-foreground">
          <span>Active:</span>
          {debouncedSearch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
              &ldquo;{debouncedSearch}&rdquo;
              <button onClick={() => { setLocalSearch(''); setSearchQuery('') }}><X className="h-3 w-3" /></button>
            </span>
          )}
          {activeCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full">
              {categories.find(c => c.slug === activeCategory)?.name || activeCategory}
              <button onClick={() => { setLocalCategory(null); setPage(1) }}><X className="h-3 w-3" /></button>
            </span>
          )}
          {selectedFramework && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-full">
              {selectedFramework}
              <button onClick={() => { setSelectedFramework(null); setPage(1) }}><X className="h-3 w-3" /></button>
            </span>
          )}
          {selectedDifficulty && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full capitalize rounded-full">
              {selectedDifficulty}
              <button onClick={() => { setSelectedDifficulty(null); setPage(1) }}><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Agent Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">No agents found</p>
          <p className="text-muted-foreground text-sm mb-4">Try adjusting your search or filters</p>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((rawAgent) => {
              const agent = parseAgent(rawAgent)
              return (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onClick={() => {
                    setSelectedAgentId(agent.id)
                    setCurrentView('detail')
                    window.scrollTo(0, 0)
                  }}
                />
              )
            })}
          </div>
          <AgentPagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            pageSize={itemsPerPage}
            onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            onPageSizeChange={(s) => { setItemsPerPage(s); setPage(1) }}
          />
        </>
      )}
    </div>
  )
}
