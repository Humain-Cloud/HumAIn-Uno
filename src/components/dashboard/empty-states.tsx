'use client'

import { Bot, FolderOpen, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export function EmptyAgentsState({ onCreateAgent }: { onCreateAgent: () => void }) {
  return (
    <div className="text-center py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <div className="h-20 w-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
          <Bot className="h-10 w-10 text-emerald-600" />
        </div>
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">Create Your First Agent</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Use our wizard to build a custom AI agent from scratch or from a template
      </p>
      <Button
        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md rounded-xl"
        onClick={onCreateAgent}
      >
        Create Agent
      </Button>
    </div>
  )
}

export function EmptyCollectionsState({ onCreateCollection }: { onCreateCollection: () => void }) {
  return (
    <div className="text-center py-12">
      <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
      <h3 className="text-lg font-semibold mb-1">No Collections</h3>
      <p className="text-muted-foreground mb-4">Create your first collection to organize your agents</p>
      <Button
        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
        onClick={onCreateCollection}
      >
        Create Collection
      </Button>
    </div>
  )
}

export function EmptyRecentlyViewedState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-6 text-center">
        <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Start browsing agents to see your history here</p>
        <Button variant="outline" size="sm" className="mt-3 rounded-xl" onClick={onBrowse}>
          Browse Agents
        </Button>
      </CardContent>
    </Card>
  )
}

export function EmptyCollectionAgentsState() {
  return (
    <div className="text-center py-6">
      <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">No agents in this collection yet</p>
      <p className="text-xs text-muted-foreground mt-1">Bookmark agents to add them to this collection</p>
    </div>
  )
}
