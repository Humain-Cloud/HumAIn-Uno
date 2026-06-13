'use client'

import type { KnowledgeAgent } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { AgentCard } from '@/components/agents/agent-card'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Loader2,
  ChevronDown,
  Eye,
  Wrench,
  X,
  Tag,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { frameworkConfig, difficultyConfig } from './shared-data'

interface AgentGridSectionProps {
  agents: KnowledgeAgent[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  total: number
  selectedFramework: string
  debouncedQuery: string
  selectedTag: string | null
  hasMore: boolean
  loadMore: () => void
  onRetry: () => void
  onClearFilters: () => void
  previewAgent: KnowledgeAgent | null
  setPreviewAgent: (agent: KnowledgeAgent | null) => void
}

export function AgentGridSection({
  agents,
  loading,
  loadingMore,
  error,
  total,
  selectedFramework,
  debouncedQuery,
  selectedTag,
  hasMore,
  loadMore,
  onRetry,
  onClearFilters,
  previewAgent,
  setPreviewAgent,
}: AgentGridSectionProps) {
  const router = useRouter()
  const { setSelectedAgentId, setCurrentView } = useAppStore()

  return (
    <>
      {/* Active tag filter indicator */}
      {selectedTag && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2"
        >
          <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm text-muted-foreground">Filtered by tag:</span>
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 gap-1">
            {selectedTag}
            <button
              onClick={() => setSelectedTag(null)}
              className="ml-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              aria-label="Remove tag filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Grid */}
        <div className="flex-1 min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                {selectedFramework === 'all' ? 'All Knowledge Agents' : frameworkConfig[selectedFramework]?.label + ' Agents'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {loading ? 'Loading...' : error ? 'Error loading agents' : `${total} agents found`}
              </p>
            </div>
          </div>

          {/* Agent Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3 mb-3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-14" />
                      <Skeleton className="h-5 w-18" />
                    </div>
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
                onClick={onRetry}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </motion.div>
          ) : agents.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No agents found</h3>
              <p className="text-muted-foreground mb-4">
                {debouncedQuery
                  ? 'Try adjusting your search terms'
                  : 'Try selecting a different framework'}
              </p>
              {(debouncedQuery || selectedFramework !== 'all' || selectedTag) && (
                <Button
                  variant="outline"
                  onClick={onClearFilters}
                >
                  <X className="h-4 w-4 mr-1" /> Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {agents.map((agent, i) => {
                  const diffConfig = agent.difficulty ? difficultyConfig[agent.difficulty.toLowerCase()] : null
                  return (
                    <motion.div
                      key={agent.id}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="relative group"
                    >
                      <AgentCard agent={agent} index={i} />
                      {/* Quick View overlay button */}
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewAgent(agent)
                        }}
                        aria-label={`Quick preview ${agent.name}`}
                      >
                        <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </motion.button>
                      {/* Difficulty progress bar */}
                      {diffConfig && (
                        <div className="absolute bottom-14 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          <div className="flex items-center gap-2">
                            <Progress value={diffConfig.value} className={`h-1.5 ${diffConfig.progressColor}`} />
                            <span className={`text-[10px] font-medium capitalize ${diffConfig.color}`}>{agent.difficulty}</span>
                          </div>
                        </div>
                      )}
                      {/* Tool count badge */}
                      {agent.tools && agent.tools.length > 0 && (
                        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          <Badge variant="secondary" className="text-[10px] h-5 gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm">
                            <Wrench className="h-3 w-3" /> {agent.tools.length} tools
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="min-w-[200px] rounded-xl"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Load More Agents
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quick Preview Modal */}
      <Dialog open={!!previewAgent} onOpenChange={(open) => !open && setPreviewAgent(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewAgent?.name}
              {previewAgent?.framework && (
                <Badge variant="secondary" className="text-[10px]">
                  {previewAgent.framework}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewAgent && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {previewAgent.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {previewAgent.category && (
                  <Badge variant="outline" className="text-xs">{previewAgent.category}</Badge>
                )}
                {previewAgent.difficulty && (
                  <Badge variant="secondary" className="text-xs capitalize">{previewAgent.difficulty}</Badge>
                )}
                {previewAgent.language && (
                  <Badge variant="secondary" className="text-xs">{previewAgent.language}</Badge>
                )}
              </div>
              {previewAgent.difficulty && difficultyConfig[previewAgent.difficulty.toLowerCase()] && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Difficulty</span>
                  <Progress
                    value={difficultyConfig[previewAgent.difficulty.toLowerCase()].value}
                    className={`h-2 ${difficultyConfig[previewAgent.difficulty.toLowerCase()].progressColor}`}
                  />
                </div>
              )}
              {previewAgent.tools && previewAgent.tools.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground font-medium mb-1.5 block">Tools</span>
                  <div className="flex flex-wrap gap-1.5">
                    {previewAgent.tools.map((tool) => (
                      <Badge key={tool} variant="secondary" className="text-[10px] gap-1">
                        <Wrench className="h-2.5 w-2.5" /> {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {previewAgent.models && previewAgent.models.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground font-medium mb-1.5 block">Models</span>
                  <div className="flex flex-wrap gap-1.5">
                    {previewAgent.models.map((model) => (
                      <Badge key={model} variant="outline" className="text-[10px]">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg"
                  onClick={() => {
                    router.push(`/agents/${previewAgent.id}`)
                    setPreviewAgent(null)
                  }}
                  aria-label={`View full details for ${previewAgent.name}`}
                >
                  View Full Details
                </Button>
                <Button
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setPreviewAgent(null)}
                  aria-label="Close preview"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}


