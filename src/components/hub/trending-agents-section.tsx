'use client'

import type { KnowledgeAgent } from '@/lib/types'
import { AgentCard } from '@/components/agents/agent-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Flame, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface TrendingAgentsSectionProps {
  trendingAgents: KnowledgeAgent[]
  loadingTrending: boolean
  onNavigate: (view: any) => void
}

export function TrendingAgentsSection({
  trendingAgents,
  loadingTrending,
  onNavigate,
}: TrendingAgentsSectionProps) {
  return (
    <section className="mb-10" aria-label="Trending agents">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md shadow-orange-200 dark:shadow-orange-900/30">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Trending Agents</h2>
            <p className="text-xs text-muted-foreground">Popular picks from the community</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex rounded-lg" onClick={() => onNavigate('browse')} aria-label="View all agents">
          View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </motion.div>

      {loadingTrending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
      ) : trendingAgents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingAgents.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
