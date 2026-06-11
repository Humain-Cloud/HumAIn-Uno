'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Star, Code2, Eye, BookOpen, GitCompareArrows, Check, Bookmark, BookmarkCheck, MoreVertical, Plus, FolderPlus } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { KnowledgeAgent } from '@/lib/types'

interface AgentCardProps {
  agent: KnowledgeAgent
  index?: number
  viewMode?: 'grid' | 'list'
}

const frameworkColors: Record<string, string> = {
  langgraph: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  crewai: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  autogen: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  agno: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  llamaindex: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
}

const frameworkGlow: Record<string, string> = {
  langgraph: 'shadow-emerald-200/50 dark:shadow-emerald-900/30',
  crewai: 'shadow-amber-200/50 dark:shadow-amber-900/30',
  autogen: 'shadow-rose-200/50 dark:shadow-rose-900/30',
  agno: 'shadow-violet-200/50 dark:shadow-violet-900/30',
  llamaindex: 'shadow-teal-200/50 dark:shadow-teal-900/30',
}

const difficultyColors: Record<string, string> = {
  beginner: 'text-green-600 dark:text-green-400',
  intermediate: 'text-amber-600 dark:text-amber-400',
  advanced: 'text-red-600 dark:text-red-400',
}

export function AgentCard({ agent, index = 0, viewMode = 'grid' }: AgentCardProps) {
  const {
    navigateToAgent,
    compareAgentIds,
    addCompareAgent,
    removeCompareAgent,
    bookmarkedAgentIds,
    toggleBookmark,
    collections,
    addToCollection,
    removeFromCollection,
    createCollection,
  } = useAppStore()

  const isInCompare = compareAgentIds.includes(agent.id)
  const isCompareFull = compareAgentIds.length >= 4
  const canCompare = isInCompare || !isCompareFull
  const isBookmarked = bookmarkedAgentIds.includes(agent.id)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false)

  const toggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isInCompare) {
      removeCompareAgent(agent.id)
    } else if (canCompare) {
      addCompareAgent(agent.id)
    }
  }

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleBookmark(agent.id)
  }

  const handleAddToCollection = (collectionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const collection = collections.find((c) => c.id === collectionId)
    if (collection) {
      if (collection.agentIds.includes(agent.id)) {
        removeFromCollection(collectionId, agent.id)
      } else {
        addToCollection(collectionId, agent.id)
      }
    }
  }

  const handleCreateAndAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (newCollectionName.trim()) {
      createCollection(newCollectionName.trim())
      setNewCollectionName('')
      setShowNewCollectionInput(false)
    }
  }

  const fwColor = frameworkColors[(agent.framework || '').toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  const fwGlow = frameworkGlow[(agent.framework || '').toLowerCase()] || ''
  const diffColor = difficultyColors[(agent.difficulty || '').toLowerCase()] || 'text-gray-500'

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
        whileHover={{ scale: 1.005 }}
      >
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-emerald-500"
          onClick={() => navigateToAgent(agent.id)}
        >
          <CardContent className="p-4 flex items-center gap-4">
            {/* Compare checkbox */}
            {canCompare && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleCompare}
                      className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isInCompare
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400'
                      }`}
                    >
                      {isInCompare ? <Check className="h-3.5 w-3.5" /> : <GitCompareArrows className="h-3.5 w-3.5" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {isInCompare ? 'Remove from comparison' : 'Add to comparison'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
                {agent.isCurated && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <BookOpen className="h-3 w-3 mr-0.5" />KB
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{agent.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {agent.framework && (
                <Badge variant="secondary" className={`text-[10px] ${fwColor}`}>
                  {agent.framework}
                </Badge>
              )}
              {agent.difficulty && (
                <span className={`text-xs font-medium capitalize ${diffColor}`}>
                  {agent.difficulty}
                </span>
              )}
              <Badge variant="outline" className="text-[10px]">
                {agent.category}
              </Badge>
            </div>
            {/* Bookmark + Collection dropdown */}
            <div className="flex items-center gap-1 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={handleBookmarkToggle}
                      whileTap={{ scale: 0.8 }}
                      className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        isBookmarked
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 dark:hover:text-amber-400'
                      }`}
                    >
                      {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {isBookmarked ? 'Remove bookmark' : 'Bookmark agent'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 w-7 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={(e) => handleAddToCollection('default', e as unknown as React.MouseEvent)} className="cursor-pointer">
                    <span className="mr-2">★</span>
                    Add to Favorites
                    {collections.find((c) => c.id === 'default')?.agentIds.includes(agent.id) && (
                      <Check className="h-3 w-3 ml-auto text-emerald-600" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {collections.filter((c) => c.id !== 'default').map((col) => (
                    <DropdownMenuItem key={col.id} onClick={(e) => handleAddToCollection(col.id, e as unknown as React.MouseEvent)} className="cursor-pointer">
                      <FolderPlus className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      {col.name}
                      {col.agentIds.includes(agent.id) && (
                        <Check className="h-3 w-3 ml-auto text-emerald-600" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  {showNewCollectionInput ? (
                    <div className="p-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        placeholder="Collection name..."
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                          if (e.key === 'Enter' && newCollectionName.trim()) {
                            createCollection(newCollectionName.trim())
                            setNewCollectionName('')
                            setShowNewCollectionInput(false)
                          }
                          if (e.key === 'Escape') {
                            setShowNewCollectionInput(false)
                            setNewCollectionName('')
                          }
                        }}
                        className="h-7 text-xs"
                        autoFocus
                      />
                      <Button size="sm" className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateAndAdd}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowNewCollectionInput(true) }} className="cursor-pointer">
                      <Plus className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                      <span className="text-emerald-600">New Collection</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-300 h-full flex flex-col hover:-translate-y-0.5 will-change-transform"
        onClick={() => navigateToAgent(agent.id)}
      >
        <CardContent className="p-4 flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm line-clamp-1 flex-1 mr-2">{agent.name}</h3>
            <div className="flex items-center gap-1 shrink-0">
              {/* Bookmark button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={handleBookmarkToggle}
                      whileTap={{ scale: 0.8 }}
                      className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        isBookmarked
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 dark:hover:text-amber-400'
                      }`}
                    >
                      {isBookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {isBookmarked ? 'Remove bookmark' : 'Bookmark agent'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {/* Compare button */}
              {canCompare && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={toggleCompare}
                        className={`h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 will-change-transform ${
                          isInCompare
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400'
                        }`}
                      >
                        {isInCompare ? <Check className="h-3 w-3" /> : <GitCompareArrows className="h-3 w-3" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {isInCompare ? 'Remove from comparison' : 'Add to comparison'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {/* Collection dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 w-6 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={(e) => handleAddToCollection('default', e as unknown as React.MouseEvent)} className="cursor-pointer">
                    <span className="mr-2">★</span>
                    Add to Favorites
                    {collections.find((c) => c.id === 'default')?.agentIds.includes(agent.id) && (
                      <Check className="h-3 w-3 ml-auto text-emerald-600" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {collections.filter((c) => c.id !== 'default').map((col) => (
                    <DropdownMenuItem key={col.id} onClick={(e) => handleAddToCollection(col.id, e as unknown as React.MouseEvent)} className="cursor-pointer">
                      <FolderPlus className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      {col.name}
                      {col.agentIds.includes(agent.id) && (
                        <Check className="h-3 w-3 ml-auto text-emerald-600" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  {showNewCollectionInput ? (
                    <div className="p-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        placeholder="Collection name..."
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                          if (e.key === 'Enter' && newCollectionName.trim()) {
                            createCollection(newCollectionName.trim())
                            setNewCollectionName('')
                            setShowNewCollectionInput(false)
                          }
                          if (e.key === 'Escape') {
                            setShowNewCollectionInput(false)
                            setNewCollectionName('')
                          }
                        }}
                        className="h-7 text-xs"
                        autoFocus
                      />
                      <Button size="sm" className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateAndAdd}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowNewCollectionInput(true) }} className="cursor-pointer">
                      <Plus className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                      <span className="text-emerald-600">New Collection</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {agent.isCurated && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-300">
                  <BookOpen className="h-3 w-3 mr-0.5" />KB
                </Badge>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {agent.framework && (
              <Badge variant="secondary" className={`text-[10px] ${fwColor} shadow-sm ${fwGlow}`}>
                {agent.framework}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              {agent.category}
            </Badge>
            {agent.difficulty && (
              <span className={`text-[10px] font-medium capitalize ${diffColor}`}>
                {agent.difficulty}
              </span>
            )}
          </div>
          {agent.tools && agent.tools.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {agent.tools.slice(0, 3).map((tool) => (
                <span key={tool} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {tool}
                </span>
              ))}
              {agent.tools.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{agent.tools.length - 3}</span>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-3 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {agent.codeSnippet && (
              <span className="flex items-center gap-0.5">
                <Code2 className="h-3 w-3" /> Code
              </span>
            )}
          </div>
          <Button size="sm" variant="ghost" className="h-7 text-xs hover:scale-105 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-all duration-200" onClick={(e) => { e.stopPropagation(); navigateToAgent(agent.id) }}>
            <Eye className="h-3 w-3 mr-1" /> View
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

interface UserAgentCardProps {
  agent: any
  index?: number
  viewMode?: 'grid' | 'list'
}

export function UserAgentCard({ agent, index = 0, viewMode = 'grid' }: UserAgentCardProps) {
  const { navigateToAgent } = useAppStore()

  const fwColor = frameworkColors[(agent.framework || '').toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  const diffColor = difficultyColors[(agent.difficulty || '').toLowerCase()] || 'text-gray-500'

  const privacyBadge = agent.privacy === 'PUBLIC'
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    : agent.privacy === 'UNLISTED'
    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
      >
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigateToAgent(agent.id)}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
                <Badge variant="secondary" className={`text-[10px] ${privacyBadge}`}>
                  {agent.privacy}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{agent.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {agent.framework && (
                <Badge variant="secondary" className={`text-[10px] ${fwColor}`}>
                  {agent.framework}
                </Badge>
              )}
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Star className="h-3 w-3" /> {agent.stars || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-200 h-full flex flex-col"
        onClick={() => navigateToAgent(agent.id)}
      >
        <CardContent className="p-4 flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm line-clamp-1 flex-1 mr-2">{agent.name}</h3>
            <Badge variant="secondary" className={`text-[10px] shrink-0 ${privacyBadge}`}>
              {agent.privacy}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {agent.framework && (
              <Badge variant="secondary" className={`text-[10px] ${fwColor}`}>
                {agent.framework}
              </Badge>
            )}
            {agent.difficulty && (
              <span className={`text-[10px] font-medium capitalize ${diffColor}`}>
                {agent.difficulty}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-3 pt-0 flex items-center justify-between">
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Star className="h-3 w-3" /> {agent.stars || 0}
          </span>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); navigateToAgent(agent.id) }}>
            <Eye className="h-3 w-3 mr-1" /> View
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
