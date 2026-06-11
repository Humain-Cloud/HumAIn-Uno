'use client'

import { Bot, Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface RecentAgentsSectionProps {
  agents: any[]
  onNavigate: (view: string) => void
  onSelectAgent: (id: string) => void
}

export function RecentAgentsSection({ agents, onNavigate, onSelectAgent }: RecentAgentsSectionProps) {
  if (agents.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" /> Recently Added
        </h2>
        <Button variant="ghost" size="sm" className="text-emerald-600" onClick={() => onNavigate('browse')}>
          View All <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent: any, i: number) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 + i * 0.05 }}
            className="cursor-pointer"
            onClick={() => onSelectAgent(agent.id)}
          >
            <Card className="hover:shadow-md transition-all duration-300 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{agent.description}</p>
                    <div className="flex gap-1.5 mt-2">
                      {agent.framework && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{agent.framework}</Badge>
                      )}
                      {agent.category && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{agent.category}</Badge>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="shrink-0 h-7 text-xs text-emerald-600" onClick={(e) => { e.stopPropagation(); onSelectAgent(agent.id) }}>
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
