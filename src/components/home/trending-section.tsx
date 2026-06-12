'use client'

import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Flame, ChevronLeft, ChevronRight, TrendingUp, Eye, AlertCircle, RefreshCw, Clock } from 'lucide-react'
import type { KnowledgeAgent } from '@/lib/types'

interface TrendingSectionProps {
  trendingAgents: KnowledgeAgent[]
  loading: boolean
  error?: string
  trendingIndex: number
  onRetry: () => void
  onViewAgent: (agent: KnowledgeAgent) => void
  // Recently viewed props
  recentlyViewedAgentIds: string[]
  recentlyViewedAgents: any[]
  recentlyViewedLoading: boolean
}

export function TrendingSection({
  trendingAgents,
  loading,
  error,
  trendingIndex,
  onRetry,
  onViewAgent,
  recentlyViewedAgentIds,
  recentlyViewedAgents,
  recentlyViewedLoading,
}: TrendingSectionProps) {
  const trendingScrollRef = useRef<HTMLDivElement>(null)

  const scrollTrending = useCallback((direction: 'left' | 'right') => {
    const el = trendingScrollRef.current
    if (!el) return
    const amount = 320
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }, [])

  return (
    <>
      {/* Trending Agents Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-orange-50 to-amber-50/50 dark:from-gray-950 dark:to-gray-900" role="region" aria-label="Trending agents">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md shadow-orange-200 dark:shadow-orange-900/30" aria-hidden="true">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Trending Now</h2>
                <p className="text-sm text-muted-foreground">Hot agents gaining momentum</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => scrollTrending('left')} aria-label="Scroll trending agents left">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => scrollTrending('right')} aria-label="Scroll trending agents right">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
          
          {loading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="min-w-[280px] max-w-[280px] border-0 shadow-sm shrink-0">
                  <CardContent className="p-5">
                    <Skeleton className="h-4 w-3/4 mb-3" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3 mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-900/20 mb-3">
                <AlertCircle className="h-6 w-6 text-rose-500 dark:text-rose-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">{error}</p>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={onRetry}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div
                ref={trendingScrollRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
                style={{ scrollbarWidth: 'thin' }}
              >
                {trendingAgents.map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="min-w-[280px] max-w-[280px] snap-start shrink-0"
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden relative glow-amber shimmer rounded-xl">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" aria-hidden="true" />
                      <CardContent className="p-5 pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-sm line-clamp-1 flex-1 mr-2">{agent.name}</h3>
                          <Badge className="text-[10px] px-1.5 py-0 h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shrink-0">
                            <TrendingUp className="h-3 w-3 mr-0.5" aria-hidden="true" /> Hot
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {agent.framework && (
                            <Badge variant="secondary" className="text-[10px]">
                              {agent.framework}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px]">
                            {agent.category}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full text-xs h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          onClick={() => onViewAgent(agent)}
                          aria-label={`View agent: ${agent.name}`}
                        >
                          <Eye className="h-3 w-3 mr-1" aria-hidden="true" /> View Agent
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              {/* Fade edges */}
              <div className="absolute top-0 left-0 bottom-4 w-8 bg-gradient-to-r from-orange-50 dark:from-gray-950 to-transparent pointer-events-none z-10" aria-hidden="true" />
              <div className="absolute top-0 right-0 bottom-4 w-8 bg-gradient-to-l from-amber-50/50 dark:from-gray-900 to-transparent pointer-events-none z-10" aria-hidden="true" />
            </div>
          )}
          
          {/* Auto-cycle indicator */}
          {!loading && trendingAgents.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 mt-4" role="tablist" aria-label="Trending agents indicator">
              {trendingAgents.slice(0, 6).map((_, i) => (
                <div
                  key={i}
                  role="tab"
                  aria-selected={i === trendingIndex % 6}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === trendingIndex % 6 ? 'w-6 bg-gradient-to-r from-orange-500 to-red-500' : 'w-1.5 bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed / Pick Up Where You Left Off */}
      {recentlyViewedAgentIds.length > 0 && (
        <section className="py-10 sm:py-14 bg-white dark:bg-gray-950" role="region" aria-label="Recently viewed agents">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-200 dark:shadow-teal-900/30" aria-hidden="true">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">Pick Up Where You Left Off</h2>
                  <p className="text-sm text-muted-foreground">Your recently viewed agents</p>
                </div>
              </div>
            </motion.div>

            {recentlyViewedLoading ? (
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="min-w-[220px] max-w-[220px] border-0 shadow-sm shrink-0">
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-1/2 mb-3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-14" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
                style={{ scrollbarWidth: 'thin' }}
              >
                {recentlyViewedAgents.map((agent: any, i: number) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="min-w-[220px] max-w-[220px] snap-start shrink-0"
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden relative rounded-xl">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500" aria-hidden="true" />
                      <CardContent className="p-4 pt-5">
                        <h3 className="font-semibold text-sm line-clamp-1 mb-1">{agent.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {agent.framework && (
                            <Badge variant="secondary" className="text-[10px]">
                              {agent.framework}
                            </Badge>
                          )}
                          {agent.category && (
                            <Badge variant="outline" className="text-[10px]">
                              {agent.category}
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full text-xs h-8 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                          onClick={() => onViewAgent(agent)}
                          aria-label={`View agent: ${agent.name}`}
                        >
                          <Eye className="h-3 w-3 mr-1" aria-hidden="true" /> View
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}
