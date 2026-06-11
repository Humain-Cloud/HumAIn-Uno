'use client'

import { Bot, Clock, Trash2, Compass } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { EmptyRecentlyViewedState } from './empty-states'

// Recently Viewed Section (used in both auth and non-auth views)
interface RecentlyViewedSectionProps {
  recentlyViewedAgentIds: string[]
  recentlyViewedAgents: any[]
  recentlyViewedLoading: boolean
  onClearHistory: () => void
  onSelectAgent: (id: string) => void
  onNavigate: (view: string) => void
  showEmpty?: boolean
}

export function RecentlyViewedSection({
  recentlyViewedAgentIds,
  recentlyViewedAgents,
  recentlyViewedLoading,
  onClearHistory,
  onSelectAgent,
  onNavigate,
  showEmpty = true,
}: RecentlyViewedSectionProps) {
  if (recentlyViewedAgentIds.length === 0 && !showEmpty) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-600 dark:text-teal-400" /> Recently Viewed
        </h2>
        {recentlyViewedAgentIds.length > 0 && (
          <Button variant="ghost" size="sm" className="text-rose-600 dark:text-rose-400" onClick={onClearHistory}>
            <Trash2 className="h-4 w-4 mr-1" /> Clear History
          </Button>
        )}
      </div>
      {recentlyViewedAgentIds.length === 0 ? (
        showEmpty ? <EmptyRecentlyViewedState onBrowse={() => onNavigate('browse')} /> : null
      ) : recentlyViewedLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: Math.min(6, recentlyViewedAgentIds.length) }).map((_, i) => (
            <Card key={i} className="rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <div className="flex gap-1.5">
                      <Skeleton className="h-4 w-14" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentlyViewedAgents.map((agent: any, i: number) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="cursor-pointer"
              onClick={() => onSelectAgent(agent.id)}
            >
              <Card className="hover:shadow-md transition-all duration-300 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 flex items-center justify-center shrink-0">
                      <Bot className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{agent.description}</p>
                      <div className="flex gap-1.5 mt-2">
                        {agent.framework && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{agent.framework}</Badge>
                        )}
                        {agent.category && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{agent.category}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// Recent Activity Feed (used in authenticated overview tab)
import { Activity } from 'lucide-react'
import { Card as ActivityCard, CardContent as ActivityCardContent, CardHeader as ActivityCardHeader, CardTitle as ActivityCardTitle } from '@/components/ui/card'
import { recentActivity } from './shared-data'

export function ActivityFeed() {
  return (
    <ActivityCard className="rounded-xl mb-6">
      <ActivityCardHeader className="pb-3">
        <ActivityCardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-600" /> Recent Activity
        </ActivityCardTitle>
      </ActivityCardHeader>
      <ActivityCardContent>
        <div className="space-y-3">
          {recentActivity.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 py-2"
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${event.color}`}>
                <event.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{event.text}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {event.time}
              </span>
            </motion.div>
          ))}
        </div>
      </ActivityCardContent>
    </ActivityCard>
  )
}
