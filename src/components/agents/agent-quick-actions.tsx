'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import type { KnowledgeAgent } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Eye,
  Bookmark,
  BookmarkCheck,
  FolderPlus,
  GitCompareArrows,
  Check,
  Link2,
  Share2,
  Download,
  ExternalLink,
  MoreHorizontal,
  Plus,
  Code2,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface AgentQuickActionsProps {
  agent: KnowledgeAgent
  trigger?: React.ReactNode
}

export function AgentQuickActions({ agent, trigger }: AgentQuickActionsProps) {
  const {
    navigateToAgent,
    bookmarkedAgentIds,
    toggleBookmark,
    collections,
    addToCollection,
    removeFromCollection,
    createCollection,
    compareAgentIds,
    addCompareAgent,
    removeCompareAgent,
    addNotification,
  } = useAppStore()

  const [newCollectionName, setNewCollectionName] = useState('')
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false)
  const [copied, setCopied] = useState(false)

  const isBookmarked = bookmarkedAgentIds.includes(agent.id)
  const isInCompare = compareAgentIds.includes(agent.id)
  const isCompareFull = compareAgentIds.length >= 4
  const canCompare = isInCompare || !isCompareFull
  const hasCode = !!agent.codeSnippet

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleBookmark(agent.id)
    if (!isBookmarked) {
      addNotification({
        type: 'bookmark_reminder',
        title: 'Agent bookmarked',
        message: `"${agent.name}" has been added to your bookmarks.`,
      })
      toast({
        title: 'Bookmarked!',
        description: `${agent.name} added to your bookmarks.`,
      })
    } else {
      toast({
        title: 'Removed bookmark',
        description: `${agent.name} removed from your bookmarks.`,
      })
    }
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isInCompare) {
      removeCompareAgent(agent.id)
      toast({
        title: 'Removed from comparison',
        description: `${agent.name} removed from the compare bar.`,
      })
    } else if (canCompare) {
      addCompareAgent(agent.id)
      addNotification({
        type: 'agent_update',
        title: 'Agent added to comparison',
        message: `"${agent.name}" added to the compare bar. ${compareAgentIds.length + 1}/4 agents selected.`,
      })
      toast({
        title: 'Added to comparison',
        description: `${agent.name} added to compare bar. ${compareAgentIds.length + 1}/4 selected.`,
      })
    }
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast({
        title: 'Link copied!',
        description: 'Agent link has been copied to your clipboard.',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        title: 'Failed to copy link',
        description: 'Please copy the URL manually.',
        variant: 'destructive',
      })
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareData = {
      title: agent.name,
      text: `Check out ${agent.name} - ${agent.description}`,
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled or share failed - fallback to copy link
        await handleCopyLink(e)
      }
    } else {
      await handleCopyLink(e)
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!hasCode) return
    const ext = (agent.language || 'python').toLowerCase() === 'typescript' ? 'ts' : (agent.language || 'python').toLowerCase() === 'javascript' ? 'js' : 'py'
    const blob = new Blob([agent.codeSnippet!], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${agent.name.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
    toast({
      title: 'Downloaded!',
      description: `Code saved as ${agent.name.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`,
    })
  }

  const handleViewInHub = (e: React.MouseEvent) => {
    e.stopPropagation()
    const store = useAppStore.getState()
    store.setCurrentView('hub')
    store.setSelectedAgentId(null)
    window.scrollTo(0, 0)
  }

  const handleAddToCollection = (collectionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const collection = collections.find((c) => c.id === collectionId)
    if (collection) {
      if (collection.agentIds.includes(agent.id)) {
        removeFromCollection(collectionId, agent.id)
        toast({
          title: 'Removed from collection',
          description: `${agent.name} removed from "${collection.name}".`,
        })
      } else {
        addToCollection(collectionId, agent.id)
        addNotification({
          type: 'bookmark_reminder',
          title: 'Added to collection',
          message: `"${agent.name}" added to "${collection.name}".`,
        })
        toast({
          title: 'Added to collection!',
          description: `${agent.name} added to "${collection.name}".`,
        })
      }
    }
  }

  const handleCreateAndAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (newCollectionName.trim()) {
      createCollection(newCollectionName.trim())
      setNewCollectionName('')
      setShowNewCollectionInput(false)
      addNotification({
        type: 'system',
        title: 'Collection created',
        message: `New collection "${newCollectionName.trim()}" has been created.`,
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>

        {/* View Details */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => { e.stopPropagation(); navigateToAgent(agent.id) }}
        >
          <Eye className="h-3.5 w-3.5 mr-2" />
          View Details
          <kbd className="ml-auto text-[9px] bg-muted px-1 rounded">Enter</kbd>
        </DropdownMenuItem>

        {/* Bookmark */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleBookmark}
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-3.5 w-3.5 mr-2 text-amber-500" />
          ) : (
            <Bookmark className="h-3.5 w-3.5 mr-2" />
          )}
          {isBookmarked ? 'Unbookmark' : 'Bookmark'}
          <kbd className="ml-auto text-[9px] bg-muted px-1 rounded">B</kbd>
        </DropdownMenuItem>

        {/* Add to Collection */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => handleAddToCollection('default', e as unknown as React.MouseEvent)}
        >
          <span className="mr-2 text-xs">★</span>
          Add to Favorites
          {collections.find((c) => c.id === 'default')?.agentIds.includes(agent.id) && (
            <Check className="h-3 w-3 ml-auto text-emerald-600" />
          )}
        </DropdownMenuItem>

        {collections.filter((c) => c.id !== 'default').slice(0, 3).map((col) => (
          <DropdownMenuItem
            key={col.id}
            className="cursor-pointer"
            onClick={(e) => handleAddToCollection(col.id, e as unknown as React.MouseEvent)}
          >
            <FolderPlus className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            {col.name}
            {col.agentIds.includes(agent.id) && (
              <Check className="h-3 w-3 ml-auto text-emerald-600" />
            )}
          </DropdownMenuItem>
        ))}

        {showNewCollectionInput ? (
          <div className="p-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Input
              placeholder="Collection name..."
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === 'Enter' && newCollectionName.trim()) handleCreateAndAdd(e as unknown as React.MouseEvent)
                if (e.key === 'Escape') { setShowNewCollectionInput(false); setNewCollectionName('') }
              }}
              className="h-7 text-xs"
              autoFocus
            />
            <Button size="sm" className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateAndAdd}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setShowNewCollectionInput(true) }}
          >
            <Plus className="h-3.5 w-3.5 mr-2 text-emerald-600" />
            <span className="text-emerald-600">New Collection</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Compare */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCompare}
          disabled={!canCompare && !isInCompare}
        >
          <GitCompareArrows className="h-3.5 w-3.5 mr-2" />
          {isInCompare ? 'Remove from Compare' : 'Add to Compare'}
          {!isInCompare && !isCompareFull && (
            <kbd className="ml-auto text-[9px] bg-muted px-1 rounded">C</kbd>
          )}
          {isCompareFull && !isInCompare && (
            <span className="ml-auto text-[10px] text-muted-foreground">Full (4/4)</span>
          )}
        </DropdownMenuItem>

        {/* Copy Link */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyLink}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 mr-2 text-emerald-600" />
          ) : (
            <Link2 className="h-3.5 w-3.5 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy Link'}
          <kbd className="ml-auto text-[9px] bg-muted px-1 rounded">⌘C</kbd>
        </DropdownMenuItem>

        {/* Share */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleShare}
        >
          <Share2 className="h-3.5 w-3.5 mr-2" />
          Share
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Download Code */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleDownload}
          disabled={!hasCode}
        >
          <Code2 className="h-3.5 w-3.5 mr-2" />
          Download Code
          {!hasCode && <span className="ml-auto text-[10px] text-muted-foreground">No code</span>}
        </DropdownMenuItem>

        {/* View in Hub */}
        {agent.isCurated && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleViewInHub}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-2" />
            View in Hub
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
