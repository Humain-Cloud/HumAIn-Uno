'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Star,
  GitFork,
  Copy,
  BookOpen,
  Check,
  Share2,
  Bookmark,
  BookmarkCheck,
  FolderPlus,
  Plus,
  BarChart3,
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { KnowledgeAgent } from '@/lib/types'
import { getFrameworkGradient, getDifficultyConfig } from './shared-data'

interface AgentHeaderProps {
  agent: KnowledgeAgent
  starred: boolean
  copied: boolean
  linkCopied: boolean
  bookmarked: boolean
  bookmarkAnim: boolean
  collections: { id: string; name: string; agentIds: string[] }[]
  newCollectionName: string
  showNewCollectionInput: boolean
  selectedAgentId: string | null
  onStar: () => void
  onCopy: () => void
  onShareLink: () => void
  onBookmarkToggle: () => void
  onFork: () => void
  onAddToCollection: (collectionId: string) => void
  onCreateAndAdd: () => void
  setNewCollectionName: (name: string) => void
  setShowNewCollectionInput: (show: boolean) => void
}

export function AgentHeader({
  agent,
  starred,
  copied,
  linkCopied,
  bookmarked,
  bookmarkAnim,
  collections,
  newCollectionName,
  showNewCollectionInput,
  selectedAgentId,
  onStar,
  onCopy,
  onShareLink,
  onBookmarkToggle,
  onFork,
  onAddToCollection,
  onCreateAndAdd,
  setNewCollectionName,
  setShowNewCollectionInput,
}: AgentHeaderProps) {
  const fwGradient = getFrameworkGradient(agent.framework)
  const diffConfig = getDifficultyConfig(agent.difficulty)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{agent.name}</h1>
            {agent.isCurated && (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <BookOpen className="h-3 w-3 mr-1" /> Knowledge Base
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {agent.framework && (
              <Badge className={fwGradient.badge}>
                {agent.framework}
              </Badge>
            )}
            <Badge variant="outline">{agent.category}</Badge>
            {agent.difficulty && diffConfig && (
              <Badge variant="outline" className={`capitalize ${diffConfig.color}`}>
                <BarChart3 className="h-3 w-3 mr-1" /> {agent.difficulty}
              </Badge>
            )}
            {agent.language && (
              <Badge variant="outline">{agent.language}</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">{agent.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <motion.div
            animate={bookmarkAnim ? { scale: [1, 1.15, 0.95, 1.05, 1] } : { scale: 1 }}
            transition={bookmarkAnim ? { duration: 0.4, ease: 'easeInOut' } : { duration: 0.1 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onBookmarkToggle}
              className={`transition-all duration-200 hover:scale-105 ${
                selectedAgentId && bookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400'
                  : 'hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-300 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20'
              }`}
            >
              {selectedAgentId && bookmarked ? (
                <BookmarkCheck className="h-4 w-4 mr-1" />
              ) : (
                <Bookmark className="h-4 w-4 mr-1" />
              )}
              {selectedAgentId && bookmarked ? 'Saved' : 'Save'}
            </Button>
          </motion.div>
          {/* Collection Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700">
                <FolderPlus className="h-4 w-4 mr-1" /> Collect
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onAddToCollection('default')} className="cursor-pointer">
                <span className="mr-2">★</span>
                Add to Favorites
                {collections.find((c) => c.id === 'default')?.agentIds.includes(selectedAgentId || '') && (
                  <Check className="h-3 w-3 ml-auto text-emerald-600" />
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {collections.filter((c) => c.id !== 'default').map((col) => (
                <DropdownMenuItem key={col.id} onClick={() => onAddToCollection(col.id)} className="cursor-pointer">
                  <FolderPlus className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  {col.name}
                  {col.agentIds.includes(selectedAgentId || '') && (
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
                        onCreateAndAdd()
                      }
                      if (e.key === 'Escape') {
                        setShowNewCollectionInput(false)
                        setNewCollectionName('')
                      }
                    }}
                    className="h-7 text-xs"
                    autoFocus
                  />
                  <Button size="sm" className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onCreateAndAdd}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <DropdownMenuItem onClick={() => setShowNewCollectionInput(true)} className="cursor-pointer">
                  <Plus className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                  <span className="text-emerald-600">New Collection</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={onStar}
            className={`transition-all duration-200 hover:scale-105 ${starred ? 'bg-amber-50 border-amber-300 text-amber-700' : 'hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-300 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20'}`}
          >
            <Star className={`h-4 w-4 mr-1 ${starred ? 'fill-amber-500 text-amber-500' : ''}`} />
            {starred ? 'Starred' : 'Star'}
          </Button>
          <Button variant="outline" size="sm" onClick={onFork} className="hover:scale-105 transition-transform duration-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:from-violet-900/20 dark:hover:to-purple-900/20 hover:border-violet-300 dark:hover:border-violet-700">
            <GitFork className="h-4 w-4 mr-1" /> Remix
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onShareLink}
            className={`transition-all duration-200 hover:scale-105 ${linkCopied ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 hover:border-emerald-300 dark:hover:border-emerald-700'}`}
          >
            {linkCopied ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}><Check className="h-4 w-4 mr-1" /> Copied!</motion.span>
            ) : (
              <><Share2 className="h-4 w-4 mr-1" /> Share</>
            )}
          </Button>
          {agent.codeSnippet && (
            <Button variant="outline" size="sm" onClick={onCopy}>
              {copied ? (
                <><Check className="h-4 w-4 mr-1" /> Copied</>
              ) : (
                <><Copy className="h-4 w-4 mr-1" /> Copy</>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
