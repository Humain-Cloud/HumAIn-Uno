'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { AgentCard } from '@/components/agents/agent-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react'
import type { KnowledgeAgent } from '@/lib/types'

interface FeaturedAgentsSectionProps {
  featuredAgents: KnowledgeAgent[]
  loading: boolean
  error?: string
  onRetry: () => void
  onNavigate: (view: any) => void
}

export function FeaturedAgentsSection({ featuredAgents, loading, error, onRetry, onNavigate }: FeaturedAgentsSectionProps) {
  return (
    <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900" role="region" aria-label="Featured agents" id="main-content">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center" aria-hidden="true">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold relative text-gray-900 dark:text-gray-100">
                Featured Agents
                <span className="absolute -bottom-1 left-0 h-1 w-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
              </h2>
            </div>
            <p className="text-muted-foreground mt-2 ml-[52px]">Hand-picked from our knowledge base</p>
          </div>
          <Button variant="outline" className="hidden sm:flex rounded-lg" onClick={() => onNavigate('browse')} aria-label="View all agents">
            View All <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
          </Button>
        </motion.div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredAgents.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} index={i} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" className="rounded-lg" onClick={() => onNavigate('browse')} aria-label="View all agents">
            View All Agents <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  )
}
