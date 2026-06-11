'use client'

import type { KnowledgeAgent, Stats } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { frameworkConfig, FrameworkDistributionChart } from './shared-data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tag,
  Clock,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Building2,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface SidebarContentProps {
  tagFrequency: [string, number][]
  maxTagFreq: number
  selectedTag: string | null
  setSelectedTag: (v: string | null) => void
  recentlyAddedAgents: KnowledgeAgent[]
  stats: Stats | null
  onNavigate: (view: any) => void
}

export function SidebarContent({
  tagFrequency,
  maxTagFreq,
  selectedTag,
  setSelectedTag,
  recentlyAddedAgents,
  stats,
  onNavigate,
}: SidebarContentProps) {
  const { setSelectedAgentId, setCurrentView } = useAppStore()

  return (
    <div className="lg:sticky lg:top-24 space-y-6">
      {/* Tag Cloud Section */}
      {tagFrequency.length > 0 && (
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <Tag className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Popular Tags</h3>
                <p className="text-xs text-muted-foreground">Click to filter</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tagFrequency.map(([tag, count], i) => {
                const ratio = count / maxTagFreq
                const sizeClass = ratio > 0.8 ? 'text-sm px-3 py-1' : ratio > 0.5 ? 'text-xs px-2.5 py-0.5' : 'text-[11px] px-2 py-0.5'
                const emeraldClass = ratio > 0.8
                  ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800/40 dark:text-emerald-200 hover:bg-emerald-300 dark:hover:bg-emerald-700/50'
                  : ratio > 0.5
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/40'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                const isActive = selectedTag === tag
                return (
                  <motion.button
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTag(isActive ? null : tag)}
                    className={`rounded-full font-medium transition-all cursor-pointer ${sizeClass} ${isActive ? 'ring-2 ring-emerald-500 bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white' : emeraldClass}`}
                    aria-label={`Filter by tag: ${tag} (${count} agents)`}
                    aria-pressed={isActive}
                  >
                    {tag}
                  </motion.button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recently Added Section */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Recently Added</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">
              {recentlyAddedAgents.length} new
            </Badge>
          </div>
          <div className="space-y-2">
            {recentlyAddedAgents.slice(0, 3).map((agent) => (
              <button
                key={agent.id}
                className="w-full text-left text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                onClick={() => {
                  setSelectedAgentId(agent.id)
                  setCurrentView('detail')
                  window.scrollTo(0, 0)
                }}
                aria-label={`View ${agent.name}`}
              >
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                <span className="truncate">{agent.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Framework Distribution Chart */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Framework Distribution</h3>
              <p className="text-xs text-muted-foreground">Agents per framework</p>
            </div>
          </div>
          {stats?.topFrameworks ? (
            <FrameworkDistributionChart topFrameworks={stats.topFrameworks} />
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Industries */}
      {stats?.topIndustries && stats.topIndustries.length > 0 && (
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Top Industries</h3>
                <p className="text-xs text-muted-foreground">By agent count</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.topIndustries.slice(0, 12).map((ind, i) => (
                <motion.div
                  key={ind.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-xs"
                    onClick={() => {
                      const store = useAppStore.getState()
                      store.setSelectedIndustry(ind.name.toLowerCase())
                      store.setCurrentView('browse')
                      store.setSelectedAgentId(null)
                      window.scrollTo(0, 0)
                    }}
                  >
                    {ind.name}
                    <span className="ml-1 text-[10px] text-muted-foreground">({ind.count})</span>
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links Card */}
      <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <CardContent className="p-5">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Quick Links
          </h3>
          <div className="space-y-2">
            <button
              className="w-full text-left text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group"
              onClick={() => onNavigate('browse')}
              aria-label="Browse all agents"
            >
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              Browse All Agents
            </button>
            <button
              className="w-full text-left text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group"
              onClick={() => onNavigate('wizard')}
              aria-label="Create new agent"
            >
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              Create New Agent
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group"
              aria-label="Source repository"
            >
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              Source Repository
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
