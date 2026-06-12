'use client'

import { Bot, Heart, ArrowRight, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface BookmarksSectionProps {
  bookmarkedAgents: any[]
  totalBookmarkedCount: number
  onSelectAgent: (id: string) => void
  onToggleBookmark: (id: string) => void
  onViewCollections: () => void
}

export function BookmarksSection({ bookmarkedAgents, totalBookmarkedCount, onSelectAgent, onToggleBookmark, onViewCollections }: BookmarksSectionProps) {
  if (totalBookmarkedCount === 0) return null

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-600" /> Bookmarked Agents
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-600"
            onClick={onViewCollections}
          >
            View Collections <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {bookmarkedAgents.map((agent: any, i: number) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
              onClick={() => onSelectAgent(agent.id)}
            >
              <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{agent.name}</p>
                <div className="flex items-center gap-1.5">
                  {agent.framework && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{agent.framework}</Badge>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleBookmark(agent.id)
                }}
                className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
          {totalBookmarkedCount > bookmarkedAgents.length && (
            <p className="text-xs text-muted-foreground text-center py-2">
              +{totalBookmarkedCount - bookmarkedAgents.length} more bookmarked
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
