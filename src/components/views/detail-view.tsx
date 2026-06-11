'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AgentCard } from '@/components/agents/agent-card'
import { useRequireAuth } from '@/components/auth/auth-modal'
import { toast } from '@/hooks/use-toast'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Heart,
  MessageCircle,
  ThumbsUp,
  Home,
  LayoutGrid,
  ChevronDown,
  Package,
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

// Mock comments for demonstration
interface MockComment {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: string
  likes: number
  liked: boolean
  replies: MockComment[]
}

const MOCK_COMMENTS: MockComment[] = [
  {
    id: '1',
    author: 'Alex Chen',
    avatar: 'AC',
    content: 'This agent is incredibly well-structured! The state management pattern is exactly what I needed for my project. Thanks for sharing!',
    timestamp: '2025-01-15T10:30:00Z',
    likes: 12,
    liked: false,
    replies: [
      {
        id: '1r',
        author: 'Sarah Kim',
        avatar: 'SK',
        content: 'Agreed! I adapted this pattern for my own agent and it works great.',
        timestamp: '2025-01-15T11:45:00Z',
        likes: 3,
        liked: false,
        replies: [],
      },
    ],
  },
  {
    id: '2',
    author: 'Morgan Liu',
    avatar: 'ML',
    content: 'How does this handle edge cases with very long inputs? I noticed some truncation in my testing.',
    timestamp: '2025-01-14T08:15:00Z',
    likes: 5,
    liked: false,
    replies: [],
  },
  {
    id: '3',
    author: 'Jordan Park',
    avatar: 'JP',
    content: 'Great work! Would love to see a version with streaming output support added.',
    timestamp: '2025-01-13T16:20:00Z',
    likes: 8,
    liked: false,
    replies: [],
  },
]

// Dependency graph node colors
const nodeColors: Record<string, string> = {
  agent: '#10b981', // emerald
  tool: '#f59e0b', // amber
  model: '#8b5cf6', // violet
  framework: '#06b6d4', // cyan
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
  const [comments, setComments] = useState<MockComment[]>(MOCK_COMMENTS)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentSort, setCommentSort] = useState<'newest' | 'oldest' | 'most-liked'>('newest')
  const [similarAgents, setSimilarAgents] = useState<KnowledgeAgent[]>([])
  const [sameFrameworkAgents, setSameFrameworkAgents] = useState<KnowledgeAgent[]>([])
  const [sameCategoryAgents, setSameCategoryAgents] = useState<KnowledgeAgent[]>([])
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [codeLanguage, setCodeLanguage] = useState('python')
  const [downloading, setDownloading] = useState(false)
  const [showFloatingBar, setShowFloatingBar] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
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
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading])

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

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  // Render dependency graph SVG
  const renderDependencyGraph = () => {
    if (!agent) return null

    const tools = agent.tools || []
    const models = agent.models || []
    const hasFramework = !!agent.framework

    // Calculate positions
    const allDeps = [
      ...tools.map((t: string) => ({ name: t, type: 'tool' })),
      ...models.map((m: string) => ({ name: m, type: 'model' })),
      ...(hasFramework ? [{ name: agent.framework!, type: 'framework' }] : []),
    ]

    if (allDeps.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No dependency information available for this agent.</p>
        </div>
      )
    }

    // Layout: center node, then orbit around it
    const centerX = 300
    const centerY = 200
    const radius = Math.min(150, 50 + allDeps.length * 20)

    const depPositions = allDeps.map((dep, i) => {
      const angle = (2 * Math.PI * i) / allDeps.length - Math.PI / 2
      return {
        ...dep,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      }
    })

    const nodeRadius = 30
    const centerNodeRadius = 40

    return (
      <svg viewBox="0 0 600 400" className="w-full h-auto" style={{ minHeight: '300px' }}>
        {/* Background grid pattern */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
          </pattern>
        </defs>
        <rect width="600" height="400" fill="url(#grid)" />

        {/* Connection lines */}
        {depPositions.map((dep, i) => (
          <g key={`line-${i}`}>
            <line
              x1={centerX}
              y1={centerY}
              x2={dep.x}
              y2={dep.y}
              stroke={nodeColors[dep.type]}
              strokeWidth="2"
              strokeDasharray="6,3"
              opacity="0.4"
            />
            {/* Arrow at end */}
            <circle
              cx={dep.x - (dep.x - centerX) * (nodeRadius / Math.sqrt((dep.x - centerX) ** 2 + (dep.y - centerY) ** 2))}
              cy={dep.y - (dep.y - centerY) * (nodeRadius / Math.sqrt((dep.x - centerX) ** 2 + (dep.y - centerY) ** 2))}
              r="3"
              fill={nodeColors[dep.type]}
              opacity="0.6"
            />
          </g>
        ))}

        {/* Dependency nodes */}
        {depPositions.map((dep, i) => (
          <g key={`dep-${i}`} className="cursor-pointer">
            <circle
              cx={dep.x}
              cy={dep.y}
              r={nodeRadius}
              fill={nodeColors[dep.type]}
              opacity="0.15"
              stroke={nodeColors[dep.type]}
              strokeWidth="2"
            />
            <circle
              cx={dep.x}
              cy={dep.y}
              r={nodeRadius - 4}
              fill="var(--card, white)"
              opacity="0.95"
            />
            {/* Icon */}
            {dep.type === 'tool' && (
              <g transform={`translate(${dep.x - 8}, ${dep.y - 14})`}>
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" fill="none" stroke={nodeColors[dep.type]} strokeWidth="1.5" />
              </g>
            )}
            {dep.type === 'model' && (
              <g transform={`translate(${dep.x - 8}, ${dep.y - 14})`}>
                <rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke={nodeColors[dep.type]} strokeWidth="1.5" />
                <path d="M8 6v4M6 8h4" stroke={nodeColors[dep.type]} strokeWidth="1.5" />
              </g>
            )}
            {dep.type === 'framework' && (
              <g transform={`translate(${dep.x - 8}, ${dep.y - 14})`}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke={nodeColors[dep.type]} strokeWidth="1.5" />
              </g>
            )}
            {/* Name */}
            <text
              x={dep.x}
              y={dep.y + nodeRadius + 14}
              textAnchor="middle"
              fontSize="9"
              fontWeight="500"
              fill="currentColor"
              className="text-foreground"
            >
              {dep.name.length > 14 ? dep.name.slice(0, 12) + '…' : dep.name}
            </text>
            <text
              x={dep.x}
              y={dep.y + nodeRadius + 24}
              textAnchor="middle"
              fontSize="7"
              fill="currentColor"
              className="text-muted-foreground"
            >
              {dep.type}
            </text>
          </g>
        ))}

        {/* Center node - the agent */}
        <g>
          <circle
            cx={centerX}
            cy={centerY}
            r={centerNodeRadius + 6}
            fill={nodeColors.agent}
            opacity="0.1"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={centerNodeRadius}
            fill={nodeColors.agent}
            opacity="0.2"
            stroke={nodeColors.agent}
            strokeWidth="3"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={centerNodeRadius - 4}
            fill="var(--card, white)"
            opacity="0.95"
          />
          {/* Agent icon */}
          <g transform={`translate(${centerX - 10}, ${centerY - 18})`}>
            <path d="M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5z" fill="none" stroke={nodeColors.agent} strokeWidth="1.5" />
            <path d="M2 21v-1a7 7 0 0114 0v1" fill="none" stroke={nodeColors.agent} strokeWidth="1.5" />
          </g>
          <text
            x={centerX}
            y={centerY + centerNodeRadius + 16}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="currentColor"
            className="text-foreground"
          >
            {agent.name.length > 18 ? agent.name.slice(0, 16) + '…' : agent.name}
          </text>
          <text
            x={centerX}
            y={centerY + centerNodeRadius + 28}
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
            className="text-muted-foreground"
          >
            agent
          </text>
        </g>

        {/* Legend */}
        <g transform="translate(10, 370)">
          <circle cx="10" cy="0" r="5" fill={nodeColors.agent} opacity="0.5" />
          <text x="20" y="4" fontSize="9" fill="currentColor" className="text-muted-foreground">Agent</text>
          <circle cx="70" cy="0" r="5" fill={nodeColors.tool} opacity="0.5" />
          <text x="80" y="4" fontSize="9" fill="currentColor" className="text-muted-foreground">Tool</text>
          <circle cx="120" cy="0" r="5" fill={nodeColors.model} opacity="0.5" />
          <text x="130" y="4" fontSize="9" fill="currentColor" className="text-muted-foreground">Model</text>
          <circle cx="180" cy="0" r="5" fill={nodeColors.framework} opacity="0.5" />
          <text x="190" y="4" fontSize="9" fill="currentColor" className="text-muted-foreground">Framework</text>
        </g>
      </svg>
    )
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
        className={`h-2 rounded-full bg-gradient-to-r ${fwGradient.from} ${fwGradient.to} mb-6 origin-left shimmer will-change-transform`}
      />

      {/* Breadcrumb Navigation */}
      <nav className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="cursor-pointer"
              >
                <span onClick={goHome} className="flex items-center gap-1">
                  <Home className="h-3 w-3" /> Home
                </span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="cursor-pointer"
              >
                <span onClick={goBack}>Browse</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate">{agent.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      {/* Hero Section - tracked for floating bar */}
      <div ref={heroRef}>
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
                className={`transition-all duration-200 hover:scale-105 ${starred ? 'bg-amber-50 border-amber-300 text-amber-700' : 'hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-300 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20'}`}
              >
                <Star className={`h-4 w-4 mr-1 ${starred ? 'fill-amber-500 text-amber-500' : ''}`} />
                {starred ? 'Starred' : 'Star'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleFork} className="hover:scale-105 transition-transform duration-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:from-violet-900/20 dark:hover:to-purple-900/20 hover:border-violet-300 dark:hover:border-violet-700">
                <GitFork className="h-4 w-4 mr-1" /> Remix
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareLink}
                className={`transition-all duration-200 hover:scale-105 ${linkCopied ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 hover:border-emerald-300 dark:hover:border-emerald-700'}`}
              >
                {linkCopied ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}><Check className="h-4 w-4 mr-1" /> Copied!</motion.span>
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
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 hover:scale-[1.02] transition-transform duration-200"
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
          <TabsTrigger value="dependencies">
            <Package className="h-4 w-4 mr-1" /> Dependencies
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageCircle className="h-4 w-4 mr-1" /> Comments
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
              <Card className="border-l-2 border-l-emerald-500 dark:border-l-emerald-400">
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

                <div className="relative">
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
                    lineNumberStyle={{
                      minWidth: '3em',
                      paddingRight: '1em',
                      color: '#4b5563',
                      background: '#1e1e2e',
                      borderRight: '1px solid #374151',
                    }}
                  >
                  {agent.codeSnippet}
                </SyntaxHighlighter>
                  {/* Gradient overlay at bottom for "scroll for more" hint */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#282c34] to-transparent pointer-events-none rounded-b-lg" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Dependencies Tab */}
        <TabsContent value="dependencies">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" /> Dependency Graph
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Visual representation of this agent&apos;s dependencies, tools, and models.
                </p>
                <div className="rounded-lg border bg-white dark:bg-gray-950 overflow-hidden">
                  {renderDependencyGraph()}
                </div>
              </CardContent>
            </Card>

            {/* Dependency Lists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tools */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-amber-500" /> Tools
                    <Badge variant="secondary" className="text-[10px] ml-auto">{(agent.tools || []).length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(agent.tools || []).length > 0 ? (
                    <div className="space-y-2">
                      {agent.tools.map((tool) => (
                        <div key={tool} className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                          <span>{tool}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No tools required</p>
                  )}
                </CardContent>
              </Card>

              {/* Models */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-violet-500" /> Models
                    <Badge variant="secondary" className="text-[10px] ml-auto">{(agent.models || []).length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(agent.models || []).length > 0 ? (
                    <div className="space-y-2">
                      {agent.models.map((model) => (
                        <div key={model} className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-violet-500" />
                          <span>{model}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No models specified</p>
                  )}
                </CardContent>
              </Card>

              {/* Framework */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-cyan-500" /> Framework
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {agent.framework ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-cyan-500" />
                      <Badge className={fwGradient.badge}>{agent.framework}</Badge>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No framework specified</p>
                  )}
                  {agent.llm && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">LLM Provider</p>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>{agent.llm}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Enhanced Comments Tab */}
        <TabsContent value="comments">
          <div className="space-y-4">
            {/* Comment Input */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                      {isAuthenticated ? 'YO' : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder={isAuthenticated ? "Write a comment..." : "Sign in to comment"}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={!isAuthenticated}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {commentText.length > 0 ? `${commentText.length} characters` : ''}
                      </p>
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comment Sort */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </p>
              <Select value={commentSort} onValueChange={(v: any) => setCommentSort(v)}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="most-liked">Most Liked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Comments List */}
            <AnimatePresence mode="popLayout">
              {sortedComments.length > 0 ? (
                <div className="space-y-3">
                  {sortedComments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      onLike={handleLikeComment}
                      onReply={handleReplyToComment}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />

      {/* Related Agents - Enhanced */}
      <div className="space-y-8">
        {/* Agents using same framework */}
        {sameFrameworkAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Agents using {agent.framework || 'same framework'}
                <Badge variant="secondary" className="text-[10px]">{sameFrameworkAgents.length}</Badge>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700"
                onClick={() => {
                  useAppStore.getState().setSelectedFramework(agent.framework?.toLowerCase() || null)
                  setCurrentView('browse')
                  setSelectedAgentId(null)
                }}
              >
                View all <ChevronRight className="h-4 w-4 ml-0.5" />
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
              {sameFrameworkAgents.map((a, i) => (
                <div key={a.id} className="min-w-[280px] max-w-[280px] flex-shrink-0">
                  <AgentCard agent={a} index={i} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Agents in same category */}
        {sameCategoryAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Agents in {agent.category || 'same category'}
                <Badge variant="secondary" className="text-[10px]">{sameCategoryAgents.length}</Badge>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700"
                onClick={() => {
                  useAppStore.getState().setSelectedCategory(agent.category || null)
                  setCurrentView('browse')
                  setSelectedAgentId(null)
                }}
              >
                View all <ChevronRight className="h-4 w-4 ml-0.5" />
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
              {sameCategoryAgents.map((a, i) => (
                <div key={a.id} className="min-w-[280px] max-w-[280px] flex-shrink-0">
                  <AgentCard agent={a} index={i} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Legacy: Similar Agents Carousel (if no framework/category specific) */}
        {similarAgents.length > 0 && sameFrameworkAgents.length === 0 && sameCategoryAgents.length === 0 && (
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
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
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

      {/* Floating Action Bar */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border shadow-lg"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStar}
              className={`h-8 ${starred ? 'text-amber-500' : ''}`}
            >
              <Star className={`h-4 w-4 mr-1 ${starred ? 'fill-amber-500' : ''}`} />
              {starred ? 'Starred' : 'Star'}
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFork}
              className="h-8"
            >
              <GitFork className="h-4 w-4 mr-1" /> Fork
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareLink}
              className="h-8"
            >
              <Share2 className="h-4 w-4 mr-1" /> Share
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload('code')}
              disabled={downloading}
              className="h-8"
            >
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Comment Card Component
function CommentCard({
  comment,
  onLike,
  onReply,
  depth = 0,
}: {
  comment: MockComment
  onLike: (id: string) => void
  onReply: (commentId: string, replyText: string) => void
  depth?: number
}) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')

  const avatarColors = [
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
    'bg-teal-100 text-teal-700',
  ]

  const colorIndex = comment.author.charCodeAt(0) % avatarColors.length

  const handleSubmitReply = () => {
    if (!replyText.trim()) return
    onReply(comment.id, replyText)
    setReplyText('')
    setReplyOpen(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${depth > 0 ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}
    >
      <Card className={depth > 0 ? 'shadow-none' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className={`text-xs ${avatarColors[colorIndex]}`}>
                {comment.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{comment.author}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => onLike(comment.id)}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    comment.liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${comment.liked ? 'fill-rose-500' : ''}`} />
                  {comment.likes > 0 && <span>{comment.likes}</span>}
                </button>
                {depth === 0 && (
                  <button
                    onClick={() => setReplyOpen(!replyOpen)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-500 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Reply
                  </button>
                )}
              </div>

              {/* Reply input */}
              {replyOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 flex items-start gap-2"
                >
                  <Input
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmitReply()
                      }
                    }}
                    className="text-xs h-8"
                  />
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 shrink-0"
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim()}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </motion.div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-3 space-y-2">
                  {comment.replies.map((reply) => (
                    <CommentCard
                      key={reply.id}
                      comment={reply}
                      onLike={onLike}
                      onReply={onReply}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
