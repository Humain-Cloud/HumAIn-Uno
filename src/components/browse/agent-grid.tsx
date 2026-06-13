'use client'

import type { KnowledgeAgent } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { AgentCard } from '@/components/agents/agent-card'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Loader2, ChevronDown, Search, AlertCircle, RefreshCw, Timer } from 'lucide-react'
import { motion } from 'framer-motion'
import { SORT_OPTIONS } from './shared-data'
import React from 'react'

// Compact view row component
function CompactRow({ agent, index }: { agent: KnowledgeAgent; index: number }) {
  const router = useRouter()
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
      onClick={() => router.push(`/agents/${agent.id}`)}
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
function AgentPreviewTooltip({ agent, children }: { agent: KnowledgeAgent; children: React.ReactNode }) {
  return (
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
}

interface AgentGridProps {
  agents: KnowledgeAgent[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  viewMode: 'grid' | 'list' | 'compact'
  sortBy: string
  total: number
  searchTiming: number
  hasMore: boolean
  loadMore: () => void
  onRetry: () => void
  resetFilters: () => void
  infiniteScrollRef: React.RefObject<HTMLDivElement | null>
}

export function AgentGrid({
  agents,
  loading,
  loadingMore,
  error,
  viewMode,
  sortBy,
  total,
  searchTiming,
  hasMore,
  loadMore,
  onRetry,
  resetFilters,
  infiniteScrollRef,
}: AgentGridProps) {
  // Result Count & Timing
  const resultHeader = !loading && !error && agents.length > 0 && (
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
  )

  if (loading) {
    return (
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
    )
  }

  if (error) {
    return (
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
          onClick={onRetry}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </motion.div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-6"
        >
          <div className="relative inline-block">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mx-auto" style={{ animation: 'float 3s ease-in-out infinite' }}>
              <Search className="h-10 w-10 text-emerald-400 dark:text-emerald-500" />
            </div>
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
          <Search className="h-4 w-4 mr-1.5" /> Clear Filters
        </Button>
      </div>
    )
  }

  if (viewMode === 'compact') {
    return (
      <>
        {resultHeader}
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
    )
  }

  return (
    <>
      {resultHeader}
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
  )
}
