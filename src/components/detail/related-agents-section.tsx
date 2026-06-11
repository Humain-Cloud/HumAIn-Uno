'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { AgentCard } from '@/components/agents/agent-card'
import type { KnowledgeAgent } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { useRef } from 'react'

interface RelatedAgentsSectionProps {
  agent: KnowledgeAgent
  sameFrameworkAgents: KnowledgeAgent[]
  sameCategoryAgents: KnowledgeAgent[]
  similarAgents: KnowledgeAgent[]
  onSetCurrentView: (view: string) => void
  onSetSelectedAgentId: (id: string | null) => void
}

export function RelatedAgentsSection({
  agent,
  sameFrameworkAgents,
  sameCategoryAgents,
  similarAgents,
  onSetCurrentView,
  onSetSelectedAgentId,
}: RelatedAgentsSectionProps) {
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Agents using same framework */}
      {sameFrameworkAgents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Agents using {agent.framework || 'same framework'}
              <Badge variant="secondary" className="text-[10px]">{sameFrameworkAgents.length}</Badge>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600 hover:text-emerald-700"
              onClick={() => {
                useAppStore.getState().setSelectedFramework(agent.framework?.toLowerCase() || null)
                onSetCurrentView('browse')
                onSetSelectedAgentId(null)
              }}
            >
              View all <ChevronRight className="h-4 w-4 ml-0.5" />
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
            {sameFrameworkAgents.map((a, i) => (
              <div key={a.id} className="min-w-[280px] max-w-[280px] flex-shrink-0">
                <AgentCard agent={a} index={i} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Agents in same category */}
      {sameCategoryAgents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Agents in {agent.category || 'same category'}
              <Badge variant="secondary" className="text-[10px]">{sameCategoryAgents.length}</Badge>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600 hover:text-emerald-700"
              onClick={() => {
                useAppStore.getState().setSelectedCategory(agent.category || null)
                onSetCurrentView('browse')
                onSetSelectedAgentId(null)
              }}
            >
              View all <ChevronRight className="h-4 w-4 ml-0.5" />
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
            {sameCategoryAgents.map((a, i) => (
              <div key={a.id} className="min-w-[280px] max-w-[280px] flex-shrink-0">
                <AgentCard agent={a} index={i} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Legacy: Similar Agents Carousel (if no framework/category specific) */}
      {similarAgents.length > 0 && sameFrameworkAgents.length === 0 && sameCategoryAgents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Related Agents</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scrollCarousel('left')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scrollCarousel('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700"
                onClick={() => {
                  onSetCurrentView('browse')
                  onSetSelectedAgentId(null)
                }}
              >
                See more <ChevronRight className="h-4 w-4 ml-0.5" />
              </Button>
            </div>
          </div>
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
          >
            {similarAgents.map((a, i) => (
              <div
                key={a.id}
                className="min-w-[280px] max-w-[280px] flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <AgentCard agent={a} index={i} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
