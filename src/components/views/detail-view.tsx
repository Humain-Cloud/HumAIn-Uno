'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { AgentCard } from '@/components/agents/agent-card'
import { useRequireAuth } from '@/components/auth/auth-modal'
import { toast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Star,
  GitFork,
  Copy,
  BookOpen,
  Code2,
  FileText,
  ExternalLink,
  Send,
  Check,
  Loader2,
  Tag,
  Wrench,
  Cpu,
  Building2,
  BarChart3,
  Share2,
  Download,
  Globe,
  Languages,
  User,
  Calendar,
  Database,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Framework gradient configurations
const frameworkGradients: Record<string, { from: string; to: string; badge: string; text: string; bar: string }> = {
  langgraph: {
    from: 'from-emerald-500',
    to: 'to-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    text: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
  },
  crewai: {
    from: 'from-amber-500',
    to: 'to-amber-600',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-400',
    bar: 'bg-amber-500',
  },
  autogen: {
    from: 'from-rose-500',
    to: 'to-rose-600',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    text: 'text-rose-600 dark:text-rose-400',
    bar: 'bg-rose-500',
  },
  agno: {
    from: 'from-violet-500',
    to: 'to-violet-600',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    text: 'text-violet-600 dark:text-violet-400',
    bar: 'bg-violet-500',
  },
  llamaindex: {
    from: 'from-teal-500',
    to: 'to-teal-600',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    text: 'text-teal-600 dark:text-teal-400',
    bar: 'bg-teal-500',
  },
}

const defaultGradient = {
  from: 'from-gray-500',
  to: 'to-gray-600',
  badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  text: 'text-gray-600 dark:text-gray-400',
  bar: 'bg-gray-500',
}

const difficultyConfig: Record<string, { value: number; color: string; barClass: string }> = {
  beginner: { value: 33, color: 'text-green-600 dark:text-green-400', barClass: '[&>div]:bg-green-500' },
  intermediate: { value: 66, color: 'text-amber-600 dark:text-amber-400', barClass: '[&>div]:bg-amber-500' },
  advanced: { value: 100, color: 'text-rose-600 dark:text-rose-400', barClass: '[&>div]:bg-rose-500' },
}

export function DetailView() {
  const { selectedAgentId, setCurrentView, setSelectedAgentId } = useAppStore()
  const { session, status, requireAuth, isAuthenticated } = useRequireAuth()
  const [agent, setAgent] = useState<KnowledgeAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [starred, setStarred] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [similarAgents, setSimilarAgents] = useState<KnowledgeAgent[]>([])
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [codeLanguage, setCodeLanguage] = useState('python')
  const [downloading, setDownloading] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

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

        // Load similar agents from same category/framework
        if (parsed.category || parsed.framework) {
          try {
            const similar: any = await api.knowledge.search({
              category: parsed.category,
              pageSize: 8,
            })
            const similarList = (similar?.data || similar || [])
              .filter((a: any) => a.id !== selectedAgentId)
              .slice(0, 6)
            setSimilarAgents(similarList)
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
      setComments(prev => [...prev, result])
      setCommentText('')
    } catch (err) {
      console.error('Failed to post comment:', err)
    } finally {
      setSubmittingComment(false)
    }
  }

  const goBack = () => {
    setCurrentView('browse')
    setSelectedAgentId(null)
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

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

  const fwKey = (agent.framework || '').toLowerCase()
  const fwGradient = frameworkGradients[fwKey] || defaultGradient
  const diffKey = (agent.difficulty || '').toLowerCase()
  const diffConfig = difficultyConfig[diffKey]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Framework Color Strip */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`h-2 rounded-full bg-gradient-to-r ${fwGradient.from} ${fwGradient.to} mb-6 origin-left`}
      />

      {/* Back Button */}
      <Button variant="ghost" size="sm" className="mb-4" onClick={goBack}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      {/* Header */}
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleStar}
              className={starred ? 'bg-amber-50 border-amber-300 text-amber-700' : ''}
            >
              <Star className={`h-4 w-4 mr-1 ${starred ? 'fill-amber-500 text-amber-500' : ''}`} />
              {starred ? 'Starred' : 'Star'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleFork}>
              <GitFork className="h-4 w-4 mr-1" /> Remix
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareLink}
              className={linkCopied ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : ''}
            >
              {linkCopied ? (
                <><Check className="h-4 w-4 mr-1" /> Copied!</>
              ) : (
                <><Share2 className="h-4 w-4 mr-1" /> Share</>
              )}
            </Button>
            {agent.codeSnippet && (
              <Button variant="outline" size="sm" onClick={handleCopy}>
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

      {/* Quick Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 mb-6"
      >
        <Button
          onClick={handleUseAsTemplate}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
        >
          <GitFork className="h-4 w-4 mr-2" /> Use as Template
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDownload('code')}
          disabled={downloading || !agent.codeSnippet}
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download Code
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDownload('markdown')}
          disabled={downloading}
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Export README
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDownload('zip')}
          disabled={downloading}
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export Bundle
        </Button>
        {agent.sourceUrl && (
          <Button
            variant="outline"
            asChild
          >
            <a href={agent.sourceUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> View Source
            </a>
          </Button>
        )}
      </motion.div>

      <Separator className="mb-6" />

      {/* Tabs */}
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
          <TabsTrigger value="readme">
            <BookOpen className="h-4 w-4 mr-1" /> README
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">About this agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                  {agent.author && (
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      Created by <span className="font-medium">{agent.author}</span>
                    </p>
                  )}
                  {agent.sourceUrl && (
                    <a
                      href={agent.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-2"
                    >
                      <ExternalLink className="h-3 w-3" /> View Source Repository
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              {agent.tags && agent.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {agent.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Enhanced Metadata */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agent Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Framework */}
                  {agent.framework && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Cpu className={`h-4 w-4 ${fwGradient.text}`} />
                        <span className="text-muted-foreground">Framework</span>
                      </div>
                      <Badge className={fwGradient.badge}>{agent.framework}</Badge>
                    </div>
                  )}

                  {/* Industry */}
                  {agent.industry && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Industry</span>
                      </div>
                      <span className="text-sm font-medium capitalize">{agent.industry}</span>
                    </div>
                  )}

                  {/* Difficulty with Progress Bar */}
                  {agent.difficulty && diffConfig && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Difficulty</span>
                        <span className={`ml-auto text-xs font-medium capitalize ${diffConfig.color}`}>
                          {agent.difficulty}
                        </span>
                      </div>
                      <Progress
                        value={diffConfig.value}
                        className={`h-2 ${diffConfig.barClass}`}
                      />
                    </div>
                  )}

                  {/* Language */}
                  {agent.language && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Language</span>
                      </div>
                      <span className="text-sm font-medium">{agent.language}</span>
                    </div>
                  )}

                  {/* LLM Provider */}
                  {agent.llm && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">LLM Provider</span>
                      </div>
                      <span className="text-sm font-medium">{agent.llm}</span>
                    </div>
                  )}

                  {/* Source */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Source</span>
                    </div>
                    {agent.isCurated ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">
                        <BookOpen className="h-3 w-3 mr-1" /> Knowledge Base
                      </Badge>
                    ) : (
                      <span className="text-sm font-medium">Community</span>
                    )}
                  </div>

                  {/* Author */}
                  {agent.author && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Author</span>
                      </div>
                      <span className="text-sm font-medium">{agent.author}</span>
                    </div>
                  )}

                  {/* Created Date */}
                  {agent.createdAt && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Created</span>
                      </div>
                      <span className="text-sm font-medium">
                        {new Date(agent.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}

                  <Separator />

                  {/* Category */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Category</span>
                    </div>
                    <Badge variant="outline">{agent.category}</Badge>
                  </div>
                </CardContent>
              </Card>

              {agent.tools && agent.tools.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wrench className="h-4 w-4" /> Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.tools.map((tool) => (
                        <Badge key={tool} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {agent.models && agent.models.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Cpu className="h-4 w-4" /> Models
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.models.map((model) => (
                        <Badge key={model} variant="outline" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Code Tab - Enhanced */}
        {agent.codeSnippet && (
          <TabsContent value="code">
            <Card>
              <CardContent className="p-0 relative">
                {/* Code Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    {/* Language Selector */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <select
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer text-foreground"
                      >
                        <option value="python">Python</option>
                        <option value="typescript">TypeScript</option>
                        <option value="javascript">JavaScript</option>
                      </select>
                    </div>

                    <Separator orientation="vertical" className="h-4" />

                    {/* Line Numbers Toggle */}
                    <button
                      onClick={() => setShowLineNumbers(!showLineNumbers)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showLineNumbers ? (
                        <ToggleRight className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                      Lines
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload('code')}
                      disabled={downloading}
                      className="h-7 text-xs"
                    >
                      {downloading ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3 mr-1" />
                      )}
                      Download
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopy}
                      className="h-7 text-xs"
                    >
                      {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>

                <SyntaxHighlighter
                  language={codeLanguage}
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0 0 0.5rem 0.5rem',
                    fontSize: '0.8rem',
                    maxHeight: '600px',
                  }}
                  showLineNumbers={showLineNumbers}
                >
                  {agent.codeSnippet}
                </SyntaxHighlighter>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* README Tab */}
        <TabsContent value="readme">
          <Card>
            <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>
                {agent.readme || 'No README available for this agent.'}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />

      {/* Comments Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Comments</h2>
        <Card className="mb-4">
          <CardContent className="p-4">
            <Textarea
              placeholder={isAuthenticated ? "Write a comment..." : "Sign in to comment"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!isAuthenticated}
              className="mb-3 min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!commentText.trim() || !isAuthenticated || submittingComment}
                onClick={handleComment}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {submittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Post Comment
              </Button>
            </div>
          </CardContent>
        </Card>
        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700">
                      {(comment.user?.name || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{comment.user?.name || 'User'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>

      {/* Related Agents Carousel */}
      {similarAgents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Related Agents</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scrollCarousel('left')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scrollCarousel('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700"
                onClick={() => {
                  setCurrentView('browse')
                  setSelectedAgentId(null)
                }}
              >
                See more <ChevronRight className="h-4 w-4 ml-0.5" />
              </Button>
            </div>
          </div>
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {similarAgents.map((a, i) => (
              <div
                key={a.id}
                className="min-w-[280px] max-w-[280px] flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <AgentCard agent={a} index={i} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
