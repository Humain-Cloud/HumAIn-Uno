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
  X,
  BookOpen,
} from 'lucide-react'
import {
  AgentPagination,
  AgentCard,
  parseAgent,
  FRAMEWORKS,
} from '@/components/shared/agent-ui'

export default function KnowledgeHubView() {
  const { setCurrentView, setSelectedAgentId, settings } = useAppStore()
  const [agents, setAgents] = useState<KnowledgeAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(settings.itemsPerPage || 24)
  const [total, setTotal] = useState(0)
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQueryLocal] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  // Debounce search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(1) }, 300)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [searchQuery])

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
    if (selectedFramework) params.framework = selectedFramework
    if (selectedCategory) params.category = selectedCategory

    api.knowledge.list(params)
      .then((data: any) => {
        if (fetchId !== fetchRef.current) return
        setAgents((data?.data || data || []).map(parseAgent))
        setTotal(data?.total || 0)
        setLoading(false)
      })
      .catch((err) => {
        if (fetchId !== fetchRef.current) return
        console.error(err)
        setLoading(false)
      })
  }, [debouncedSearch, selectedFramework, selectedCategory, page, itemsPerPage])

  const totalPages = Math.ceil(total / itemsPerPage)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Knowledge Hub</h1>
          <p className="text-muted-foreground text-sm">
            {loading ? 'Loading...' : `${total} curated AI agent projects`}
            {(selectedFramework || selectedCategory || debouncedSearch) && ' matching filters'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedFramework || '_all'} onValueChange={(v) => { setSelectedFramework(v === '_all' ? null : v); setPage(1) }}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue placeholder="Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Frameworks</SelectItem>
              {FRAMEWORKS.map(fw => (
                <SelectItem key={fw} value={fw}>{fw}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory || '_all'} onValueChange={(v) => { setSelectedCategory(v === '_all' ? null : v); setPage(1) }}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search the knowledge base..."
          value={searchQuery}
          onChange={(e) => { setSearchQueryLocal(e.target.value); setPage(1) }}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-sm"
        />
        {searchQuery && (
          <button onClick={() => { setSearchQueryLocal(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Active filters */}
      {(selectedFramework || selectedCategory) && (
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-muted-foreground">
          <span>Filtering by:</span>
          {selectedFramework && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-full">
              {selectedFramework}
              <button onClick={() => { setSelectedFramework(null); setPage(1) }}><X className="h-3 w-3" /></button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full">
              {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
              <button onClick={() => { setSelectedCategory(null); setPage(1) }}><X className="h-3 w-3" /></button>
            </span>
          )}
          <button
            onClick={() => { setSelectedFramework(null); setSelectedCategory(null); setSearchQueryLocal(''); setPage(1) }}
            className="text-emerald-600 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Framework quick filters as badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setSelectedFramework(null); setPage(1) }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!selectedFramework ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'}`}
        >
          All Frameworks
        </button>
        {FRAMEWORKS.map(fw => (
          <button
            key={fw}
            onClick={() => { setSelectedFramework(selectedFramework === fw ? null : fw); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedFramework === fw ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'}`}
          >
            {fw}
          </button>
        ))}
      </div>

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
            <BookOpen className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">No agents found</p>
          <p className="text-muted-foreground text-sm mb-4">Try adjusting your search or filters</p>
          <button
            onClick={() => { setSelectedFramework(null); setSelectedCategory(null); setSearchQueryLocal(''); setPage(1) }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={() => {
                  setSelectedAgentId(agent.id)
                  setCurrentView('detail')
                  window.scrollTo(0, 0)
                }}
              />
            ))}
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
