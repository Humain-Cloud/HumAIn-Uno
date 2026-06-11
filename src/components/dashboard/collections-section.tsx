'use client'

import { useState, useEffect } from 'react'
import { Bot, FolderOpen, FolderPlus, Pencil, Check, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api-client'
import { EmptyCollectionsState, EmptyCollectionAgentsState } from './empty-states'

interface Collection {
  id: string
  name: string
  agentIds: string[]
  createdAt: string
}

interface CollectionsSectionProps {
  collections: Collection[]
  collectionAgents: Record<string, any[]>
  onCreateCollection: (name: string) => void
  onDeleteCollection: (id: string) => void
  onRenameCollection: (id: string, newName: string) => void
  onRemoveFromCollection: (collectionId: string, agentId: string) => void
  onSelectAgent: (id: string) => void
}

export function CollectionsSection({
  collections,
  collectionAgents,
  onCreateCollection,
  onDeleteCollection,
  onRenameCollection,
  onRemoveFromCollection,
  onSelectAgent,
}: CollectionsSectionProps) {
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [newCollectionName, setNewCollectionName] = useState('')
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false)
  const [localCollectionAgents, setLocalCollectionAgents] = useState<Record<string, any[]>>(collectionAgents)

  // Load agent details when a collection is expanded
  useEffect(() => {
    async function loadCollectionAgents() {
      if (!expandedCollection) return
      const col = collections.find((c) => c.id === expandedCollection)
      if (!col || col.agentIds.length === 0) return

      const agentsMap: Record<string, any> = {}
      try {
        for (const id of col.agentIds.slice(0, 10)) {
          try {
            const agent = await api.knowledge.get(id)
            agentsMap[id] = agent
          } catch {
            try {
              const agent = await api.agents.get(id)
              agentsMap[id] = agent
            } catch { /* ignore */ }
          }
        }
      } catch { /* ignore */ }
      setLocalCollectionAgents((prev) => ({ ...prev, [expandedCollection]: Object.values(agentsMap) }))
    }
    loadCollectionAgents()
  }, [expandedCollection, collections])

  // Merge parent-provided agents with locally loaded agents
  const allCollectionAgents = { ...collectionAgents, ...localCollectionAgents }

  const handleRenameCollection = (id: string) => {
    if (renameValue.trim()) {
      onRenameCollection(id, renameValue.trim())
    }
    setRenamingId(null)
    setRenameValue('')
  }

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName.trim())
      setNewCollectionName('')
      setShowNewCollectionInput(false)
    }
  }

  return (
    <>
      {/* Create Collection */}
      <div className="mb-6">
        {showNewCollectionInput ? (
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="Collection name..."
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCollection()
                if (e.key === 'Escape') { setShowNewCollectionInput(false); setNewCollectionName('') }
              }}
              className="rounded-xl"
              autoFocus
            />
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" onClick={handleCreateCollection}>
              <Check className="h-4 w-4 mr-1" /> Create
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => { setShowNewCollectionInput(false); setNewCollectionName('') }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setShowNewCollectionInput(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" /> Create New Collection
          </Button>
        )}
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col, i) => {
          const isExpanded = expandedCollection === col.id
          const isRenaming = renamingId === col.id
          const colAgents = allCollectionAgents[col.id] || []

          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              layout
            >
              <Card className={`rounded-xl overflow-hidden transition-all ${isExpanded ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardContent className={`p-4 ${isExpanded ? 'p-6' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {isRenaming ? (
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameCollection(col.id)
                              if (e.key === 'Escape') { setRenamingId(null); setRenameValue('') }
                            }}
                            className="h-7 text-sm"
                            autoFocus
                          />
                          <Button size="sm" className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleRenameCollection(col.id)}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => { setRenamingId(null); setRenameValue('') }}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <h3 className="font-semibold text-base truncate">{col.name}</h3>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {col.agentIds.length} agent{col.agentIds.length !== 1 ? 's' : ''}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Created {new Date(col.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {col.agentIds.length > 0 && !isExpanded && (
                        <div className="mt-2 text-xs text-muted-foreground line-clamp-1">
                          {col.agentIds.slice(0, 3).map((id) => {
                            const agent = colAgents.find((a: any) => a.id === id)
                            return agent ? agent.name : id.slice(0, 8)
                          }).join(', ')}
                          {col.agentIds.length > 3 && ` +${col.agentIds.length - 3} more`}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setRenamingId(col.id)}
                              className="h-8 w-8 min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Rename</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {col.id !== 'default' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{col.name}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-rose-600 hover:bg-rose-700 text-white"
                                onClick={() => onDeleteCollection(col.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <button
                        onClick={() => setExpandedCollection(isExpanded ? null : col.id)}
                        className="h-8 w-8 min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Collection - Show Agents */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <Separator className="my-4" />
                        {col.agentIds.length === 0 ? (
                          <EmptyCollectionAgentsState />
                        ) : (
                          <div className="space-y-2">
                            {col.agentIds.map((agentId) => {
                              const agent = colAgents.find((a: any) => a.id === agentId)
                              return (
                                <div
                                  key={agentId}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                  onClick={() => onSelectAgent(agentId)}
                                >
                                  <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4 text-emerald-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {agent ? agent.name : agentId.slice(0, 12) + '...'}
                                    </p>
                                    {agent && (
                                      <p className="text-xs text-muted-foreground line-clamp-1">
                                        {agent.description || agent.framework || 'AI Agent'}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onRemoveFromCollection(col.id, agentId)
                                    }}
                                    className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shrink-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {collections.length === 0 && (
        <EmptyCollectionsState onCreateCollection={() => setShowNewCollectionInput(true)} />
      )}
    </>
  )
}

