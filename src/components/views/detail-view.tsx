'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useRequireAuth } from '@/components/auth/auth-modal'
import { toast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  FileText,
  Code2,
  Package,
  MessageCircle,
  Eye,
  BookmarkCheck,
  Bookmark,
  Share2,
  BookOpen,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFrameworkGradient } from '@/components/detail/shared-data'
import type { MockComment } from '@/components/detail/shared-data'
import { MOCK_COMMENTS } from '@/components/detail/shared-data'

// Split components
import { FrameworkColorStrip } from '@/components/detail/framework-color-strip'
import { BreadcrumbNav } from '@/components/detail/breadcrumb-nav'
import { AgentHeader } from '@/components/detail/agent-header'
import { OverviewTab } from '@/components/detail/overview-tab'
import { CodeTab } from '@/components/detail/code-tab'
import { ReadmeTab } from '@/components/detail/readme-tab'
import { DependenciesTab } from '@/components/detail/dependencies-tab'
import { CommentsTab } from '@/components/detail/comments-tab'
import { RelatedAgentsSection } from '@/components/detail/related-agents-section'
import { FloatingActionBar } from '@/components/detail/floating-action-bar'
import { QuickActions } from '@/components/detail/quick-actions'

export function DetailView() {
  const { selectedAgentId, setCurrentView, setSelectedAgentId, bookmarkedAgentIds, toggleBookmark, collections, addToCollection, removeFromCollection, createCollection, ratings, setRating, addNotification } = useAppStore()
  const { requireAuth, isAuthenticated } = useRequireAuth()
  const [agent, setAgent] = useState<KnowledgeAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [starred, setStarred] = useState(false)
  const [comments, setComments] = useState<MockComment[]>(MOCK_COMMENTS)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentSort, setCommentSort] = useState<'newest' | 'oldest' | 'most-liked'>('newest')
  const [similarAgents, setSimilarAgents] = useState<KnowledgeAgent[]>([])
  const [sameFrameworkAgents, setSameFrameworkAgents] = useState<KnowledgeAgent[]>([])
  const [sameCategoryAgents, setSameCategoryAgents] = useState<KnowledgeAgent[]>([])
  const [codeLanguage, setCodeLanguage] = useState('python')
  const [downloading, setDownloading] = useState(false)
  const [showFloatingBar, setShowFloatingBar] = useState(false)
  const [bookmarkAnim, setBookmarkAnim] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedAgentId) return

    async function loadAgent() {
      setLoading(true)
      try {
        const data: any = await api.knowledge.get(selectedAgentId!)
        const parsed = {
          ...data,
          tools: typeof data.tools === 'string' ? JSON.parse(data.tools || '[]') : data.tools || [],
          models: typeof data.models === 'string' ? JSON.parse(data.models || '[]') : data.models || [],
          tags: typeof data.tags === 'string' ? JSON.parse(data.tags || '[]') : data.tags || [],
        }
        setAgent(parsed)

        // Set initial code language based on agent language
        if (parsed.language?.toLowerCase() === 'typescript') {
          setCodeLanguage('typescript')
        } else if (parsed.language?.toLowerCase() === 'javascript') {
          setCodeLanguage('javascript')
        } else {
          setCodeLanguage('python')
        }

        // Load similar agents from same category
        if (parsed.category) {
          try {
            const catData: any = await api.knowledge.search({
              category: parsed.category,
              pageSize: 8,
            })
            const catList = (catData?.data || catData || [])
              .filter((a: any) => a.id !== selectedAgentId)
              .slice(0, 6)
            setSameCategoryAgents(catList)
            setSimilarAgents(catList)
          } catch {}
        }

        // Load agents from same framework
        if (parsed.framework) {
          try {
            const fwData: any = await api.knowledge.search({
              framework: parsed.framework,
              pageSize: 8,
            })
            const fwList = (fwData?.data || fwData || [])
              .filter((a: any) => a.id !== selectedAgentId)
              .slice(0, 6)
            setSameFrameworkAgents(fwList)
          } catch {}
        }
      } catch (err) {
        console.error('Failed to load agent:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAgent()
  }, [selectedAgentId])

  // Floating action bar - show when scrolled past hero
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom
        setShowFloatingBar(heroBottom < 0)
        setShowStickyBar(heroBottom < -100)
      }
      // Reading progress
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        setReadingProgress(Math.min(100, (window.scrollY / scrollHeight) * 100))
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading])

  // IntersectionObserver for TOC active section tracking
  useEffect(() => {
    const sections = ['section-overview', 'section-code', 'section-dependencies', 'section-comments']
    const observers: IntersectionObserver[] = []

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id.replace('section-', ''))
            }
          })
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [loading, activeTab, agent])

  const handleCopy = async () => {
    if (!agent?.codeSnippet) return
    await navigator.clipboard.writeText(agent.codeSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareLink = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      toast({
        title: 'Link copied!',
        description: 'Agent URL has been copied to your clipboard.',
      })
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy the link. Please copy the URL manually.',
        variant: 'destructive',
      })
    }
  }

  const handleStar = () => {
    if (!requireAuth()) return
    setStarred(!starred)
  }

  const handleBookmarkToggle = () => {
    if (!selectedAgentId) return
    const wasBookmarked = bookmarkedAgentIds.includes(selectedAgentId)
    toggleBookmark(selectedAgentId)
    setBookmarkAnim(true)
    setTimeout(() => setBookmarkAnim(false), 400)
    if (!wasBookmarked) {
      addNotification({
        type: 'bookmark_reminder',
        title: 'Agent bookmarked',
        message: `"${agent?.name}" has been added to your bookmarks.`,
      })
    }
  }

  const handleAddToCollection = (collectionId: string) => {
    if (!selectedAgentId) return
    const collection = collections.find((c) => c.id === collectionId)
    if (collection) {
      if (collection.agentIds.includes(selectedAgentId)) {
        removeFromCollection(collectionId, selectedAgentId)
      } else {
        addToCollection(collectionId, selectedAgentId)
      }
    }
  }

  const handleCreateAndAdd = () => {
    if (newCollectionName.trim()) {
      createCollection(newCollectionName.trim())
      addNotification({
        type: 'system',
        title: 'Collection created',
        message: `New collection "${newCollectionName.trim()}" has been created.`,
      })
      setNewCollectionName('')
      setShowNewCollectionInput(false)
    }
  }

  const handleFork = () => {
    if (!requireAuth(() => {
      const store = useAppStore.getState()
      store.setWizardData({
        name: `${agent?.name} (Remix)`,
        description: agent?.description,
        code: agent?.codeSnippet || '',
        readme: agent?.readme || '',
        framework: agent?.framework,
        category: agent?.category,
        source: 'fork',
        parentId: agent?.id,
      })
      store.setWizardStep(2)
      store.setCurrentView('wizard')
    })) return

    const store = useAppStore.getState()
    store.setWizardData({
      name: `${agent?.name} (Remix)`,
      description: agent?.description,
      code: agent?.codeSnippet || '',
      readme: agent?.readme || '',
      framework: agent?.framework,
      category: agent?.category,
      source: 'fork',
      parentId: agent?.id,
    })
    store.setWizardStep(2)
    store.setCurrentView('wizard')
  }

  const handleUseAsTemplate = () => {
    if (!requireAuth(() => {
      const store = useAppStore.getState()
      store.setWizardData({
        name: '',
        description: agent?.description || '',
        code: agent?.codeSnippet || '',
        readme: agent?.readme || '',
        framework: agent?.framework,
        category: agent?.category,
        source: 'knowledge_base',
        parentId: agent?.id,
      })
      store.setWizardStep(1)
      store.setCurrentView('wizard')
    })) return

    const store = useAppStore.getState()
    store.setWizardData({
      name: '',
      description: agent?.description || '',
      code: agent?.codeSnippet || '',
      readme: agent?.readme || '',
      framework: agent?.framework,
      category: agent?.category,
      source: 'knowledge_base',
      parentId: agent?.id,
    })
    store.setWizardStep(1)
    store.setCurrentView('wizard')
  }

  const handleDownload = async (format: string = 'code') => {
    if (!selectedAgentId) return
    setDownloading(true)
    try {
      const url = `/api/knowledge/${selectedAgentId}/export?format=${format}`
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Download failed')
      }
      const blob = await res.blob()
      const contentDisposition = res.headers.get('Content-Disposition')
      let filename = `${agent?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'agent'}`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match) filename = match[1]
      }
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
      toast({
        title: 'Download started!',
        description: `${agent?.name} has been downloaded.`,
      })
    } catch (err) {
      console.error('Download error:', err)
      toast({
        title: 'Download failed',
        description: 'Could not download the agent. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDownloading(false)
    }
  }

  const handleComment = async () => {
    if (!commentText.trim() || !selectedAgentId) return
    if (!requireAuth()) return
    setSubmittingComment(true)
    try {
      const result = await api.agents.comment(selectedAgentId, commentText)
      const newComment: MockComment = {
        id: result?.id || Date.now().toString(),
        author: 'You',
        avatar: 'YO',
        content: commentText,
        timestamp: new Date().toISOString(),
        likes: 0,
        liked: false,
        replies: [],
      }
      setComments(prev => [newComment, ...prev])
      setCommentText('')
    } catch (err) {
      console.error('Failed to post comment:', err)
      // Still add the comment locally for UI demo
      const newComment: MockComment = {
        id: Date.now().toString(),
        author: 'You',
        avatar: 'YO',
        content: commentText,
        timestamp: new Date().toISOString(),
        likes: 0,
        liked: false,
        replies: [],
      }
      setComments(prev => [newComment, ...prev])
      setCommentText('')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
      }
      // Check replies
      return {
        ...c,
        replies: c.replies.map(r => {
          if (r.id === commentId) {
            return { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
          }
          return r
        }),
      }
    }))
  }

  const handleReplyToComment = (commentId: string, replyText: string) => {
    if (!replyText.trim()) return
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const newReply: MockComment = {
          id: Date.now().toString(),
          author: 'You',
          avatar: 'YO',
          content: replyText,
          timestamp: new Date().toISOString(),
          likes: 0,
          liked: false,
          replies: [],
        }
        return { ...c, replies: [...c.replies, newReply] }
      }
      return c
    }))
  }

  // Sort comments
  const sortedComments = useMemo(() => {
    const sorted = [...comments]
    switch (commentSort) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      case 'most-liked':
        return sorted.sort((a, b) => b.likes - a.likes)
      default:
        return sorted
    }
  }, [comments, commentSort])

  const goBack = () => {
    setCurrentView('browse')
    setSelectedAgentId(null)
  }

  const goHome = () => {
    setCurrentView('home')
    setSelectedAgentId(null)
  }

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // TOC items for the detail view sidebar
  const tocItems = useMemo(() => {
    const items = [
      { id: 'section-overview', label: 'Overview', icon: Eye },
    ]
    if (agent?.codeSnippet) {
      items.push({ id: 'section-code', label: 'Code', icon: Code2 })
    }
    items.push({ id: 'section-dependencies', label: 'Dependencies', icon: Package })
    items.push({ id: 'section-comments', label: 'Comments', icon: MessageCircle })
    return items
  }, [agent?.codeSnippet])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Skeleton className="h-2 w-full mb-6 rounded-full" />
        <Skeleton className="h-6 w-20 mb-6" />
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Agent not found</h2>
        <p className="text-muted-foreground mb-4">The agent you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Browse
        </Button>
      </div>
    )
  }

  const fwGradient = getFrameworkGradient(agent.framework)

  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* TOC Sidebar - hidden on mobile, visible on xl */}
      <aside className="hidden xl:block w-48 shrink-0">
        <nav className="toc-sidebar sticky top-24">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-3">On this page</h4>
          {tocItems.map((item) => {
            const Icon = item.icon
            const sectionKey = item.id.replace('section-', '')
            const isActive = activeSection === sectionKey
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(item.id)
                }}
                className={`flex items-center gap-2 ${isActive ? 'active' : ''}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 max-w-5xl">
      {/* Reading Progress Bar */}
      <div className="reading-progress" style={{ width: `${readingProgress}%` }} />

      {/* Sticky Agent Name Bar */}
      <AnimatePresence>
        {showStickyBar && agent && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="sticky-name-bar bg-white/80 dark:bg-gray-900/80 py-2.5 px-4 -mx-4 sm:-mx-6 -mt-6 sm:-mt-8 mb-6"
          >
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-sm truncate">{agent.name}</span>
                {agent.framework && (
                  <Badge className={`text-[10px] shrink-0 ${fwGradient.badge}`}>{agent.framework}</Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleBookmarkToggle}>
                  {bookmarkedAgentIds.includes(agent.id) ? <BookmarkCheck className="h-3.5 w-3.5 mr-1" /> : <Bookmark className="h-3.5 w-3.5 mr-1" />}
                  Save
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleShareLink}>
                  <Share2 className="h-3.5 w-3.5 mr-1" /> Share
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Framework Color Strip */}
      <FrameworkColorStrip framework={agent.framework} />

      {/* Breadcrumb Navigation */}
      <BreadcrumbNav agentName={agent.name} onGoHome={goHome} onGoBack={goBack} />

      {/* Hero Section - tracked for floating bar */}
      <div ref={heroRef}>
        {/* Agent Header */}
        <AgentHeader
          agent={agent}
          starred={starred}
          copied={copied}
          linkCopied={linkCopied}
          bookmarked={selectedAgentId ? bookmarkedAgentIds.includes(selectedAgentId) : false}
          bookmarkAnim={bookmarkAnim}
          collections={collections}
          newCollectionName={newCollectionName}
          showNewCollectionInput={showNewCollectionInput}
          selectedAgentId={selectedAgentId}
          onStar={handleStar}
          onCopy={handleCopy}
          onShareLink={handleShareLink}
          onBookmarkToggle={handleBookmarkToggle}
          onFork={handleFork}
          onAddToCollection={handleAddToCollection}
          onCreateAndAdd={handleCreateAndAdd}
          setNewCollectionName={setNewCollectionName}
          setShowNewCollectionInput={setShowNewCollectionInput}
        />

        {/* Quick Action Buttons */}
        <QuickActions
          hasCodeSnippet={!!agent.codeSnippet}
          hasSourceUrl={!!agent.sourceUrl}
          sourceUrl={agent.sourceUrl}
          downloading={downloading}
          onUseAsTemplate={handleUseAsTemplate}
          onDownload={handleDownload}
        />
      </div>

      <Separator className="mb-6" />

      {/* Tabs - Enhanced with Dependencies tab */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <FileText className="h-4 w-4 mr-1" /> Overview
          </TabsTrigger>
          {agent.codeSnippet && (
            <TabsTrigger value="code">
              <Code2 className="h-4 w-4 mr-1" /> Code
            </TabsTrigger>
          )}
          {agent.readme && (
            <TabsTrigger value="readme">
              <BookOpen className="h-4 w-4 mr-1" /> README
            </TabsTrigger>
          )}
          <TabsTrigger value="dependencies">
            <Package className="h-4 w-4 mr-1" /> Dependencies
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageCircle className="h-4 w-4 mr-1" /> Comments
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" id="section-overview">
          <OverviewTab
            agent={agent}
            ratings={ratings}
            onSetRating={setRating}
          />
        </TabsContent>

        {/* Code Tab */}
        {agent.codeSnippet && (
          <TabsContent value="code" id="section-code">
            <CodeTab
              code={agent.codeSnippet}
              language={codeLanguage}
              agentName={agent.name}
            />
          </TabsContent>
        )}

        {/* README Tab */}
        {agent.readme && (
          <TabsContent value="readme">
            <ReadmeTab readme={agent.readme} />
          </TabsContent>
        )}

        {/* Dependencies Tab */}
        <TabsContent value="dependencies" id="section-dependencies">
          <DependenciesTab agent={agent} />
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" id="section-comments">
          <CommentsTab
            comments={comments}
            commentText={commentText}
            submittingComment={submittingComment}
            isAuthenticated={isAuthenticated}
            commentSort={commentSort}
            onCommentTextChange={setCommentText}
            onComment={handleComment}
            onLikeComment={handleLikeComment}
            onReplyToComment={handleReplyToComment}
            onCommentSortChange={setCommentSort}
            sortedComments={sortedComments}
          />
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />

      {/* Related Agents */}
      <RelatedAgentsSection
        agent={agent}
        sameFrameworkAgents={sameFrameworkAgents}
        sameCategoryAgents={sameCategoryAgents}
        similarAgents={similarAgents}
        onSetCurrentView={setCurrentView}
        onSetSelectedAgentId={setSelectedAgentId}
      />

      {/* Floating Action Bar */}
      <FloatingActionBar
        visible={showFloatingBar}
        starred={starred}
        bookmarked={selectedAgentId ? bookmarkedAgentIds.includes(selectedAgentId) : false}
        bookmarkAnim={bookmarkAnim}
        downloading={downloading}
        onStar={handleStar}
        onFork={handleFork}
        onShareLink={handleShareLink}
        onBookmarkToggle={handleBookmarkToggle}
        onDownload={() => handleDownload('code')}
      />
      </div>{/* end main content */}
    </div>
  )
}
