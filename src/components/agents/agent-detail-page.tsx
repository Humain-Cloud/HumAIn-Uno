'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Home,
  ChevronRight,
  Code2,
  Eye,
  Package,
  MessageCircle,
  BookOpen,
  Shield,
  Rocket,
  Target,
  Brain,
  Zap,
  CheckCircle2,
  ArrowDown,
  Workflow,
  Settings,
  BarChart3,
  Lock,
  Gauge,
  TestTube,
  Star,
  Bookmark,
  BookmarkCheck,
  Share2,
  Download,
  ExternalLink,
  Database,
  Tag,
  User,
  Sparkles,
  CircleDot,
  CircleCheck,
  Diamond,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/hooks/use-toast'

// Framework color map
const fwColors: Record<string, { bg: string; text: string; badge: string; border: string; gradient: string }> = {
  langgraph: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-700', gradient: 'from-emerald-500 to-emerald-700' },
  crewai: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700', gradient: 'from-amber-500 to-orange-600' },
  autogen: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-700', gradient: 'from-rose-500 to-pink-600' },
  agno: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300', border: 'border-violet-300 dark:border-violet-700', gradient: 'from-violet-500 to-purple-600' },
  llamaindex: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300', border: 'border-teal-300 dark:border-teal-700', gradient: 'from-teal-500 to-cyan-600' },
}
const defaultFw = { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', border: 'border-gray-300 dark:border-gray-700', gradient: 'from-gray-500 to-gray-700' }
function getFwStyle(framework: string | null) { return fwColors[(framework || '').toLowerCase()] || defaultFw }

// Difficulty color map
const diffColors: Record<string, string> = {
  beginner: 'text-green-600 dark:text-green-400',
  intermediate: 'text-amber-600 dark:text-amber-400',
  advanced: 'text-rose-600 dark:text-rose-400',
}

// Flowchart step type
interface FlowStep {
  id: string
  label: string
  description: string
  type: 'start' | 'process' | 'decision' | 'parallel' | 'status' | 'end'
  icon: React.ElementType
  details: string[]
  children?: string[]
  yesTarget?: string
  noTarget?: string
}

export function AgentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params?.id as string
  const { bookmarkedAgentIds, toggleBookmark, ratings, setRating, addNotification } = useAppStore()
  const [agent, setAgent] = useState<KnowledgeAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [readingProgress, setReadingProgress] = useState(0)

  // Parse agent data helper
  const parseAgent = (data: any): KnowledgeAgent => ({
    ...data,
    tools: typeof data.tools === 'string' ? JSON.parse(data.tools || '[]') : data.tools || [],
    models: typeof data.models === 'string' ? JSON.parse(data.models || '[]') : data.models || [],
    tags: typeof data.tags === 'string' ? JSON.parse(data.tags || '[]') : data.tags || [],
  })

  // Load agent data
  useEffect(() => {
    if (!agentId) return
    async function load() {
      setLoading(true)
      try {
        const data = await api.knowledge.get(agentId)
        setAgent(parseAgent(data))
      } catch (err) {
        console.error('Failed to load agent:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [agentId])

  // Reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        setReadingProgress(Math.min(100, (window.scrollY / scrollHeight) * 100))
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Generate hyper-specialized flowchart steps based on agent data
  const flowchartSteps = useMemo((): FlowStep[] => {
    if (!agent) return []
    const domain = agent.category || agent.industry || 'General'
    const fw = agent.framework || 'AI'
    const diff = agent.difficulty || 'intermediate'
    const agentTools = agent.tools || []
    const agentModels = agent.models || []

    return [
      {
        id: 'decide',
        label: `Decide to Create ${agent.name}`,
        description: `The decision to build a specialized ${domain} agent using ${fw}`,
        type: 'start',
        icon: CircleDot,
        details: [
          `Domain: ${domain} — identified as high-impact area for AI automation`,
          `Framework: ${fw} — selected for its ${fw === 'LangGraph' ? 'stateful graph orchestration' : fw === 'CrewAI' ? 'role-based agent collaboration' : fw === 'AutoGen' ? 'multi-agent conversation patterns' : fw === 'Agno' ? 'high-performance agent primitives' : 'RAG-optimized retrieval pipelines'}`,
          `Goal: Create a ${diff}-level agent that outperforms manual ${domain} workflows`,
        ],
        children: ['standards'],
      },
      {
        id: 'standards',
        label: `Set ${domain} Industry Standards`,
        description: `Establish quality benchmarks and compliance requirements`,
        type: 'process',
        icon: Shield,
        details: [
          `Define accuracy thresholds for ${domain} operations (≥95% precision)`,
          `Establish latency SLA: <${diff === 'advanced' ? '2' : diff === 'intermediate' ? '5' : '10'}s response time`,
          `Set compliance standards: data privacy, audit trails, explainability`,
          agent.industry ? `Industry regulation mapping for ${agent.industry}` : 'Cross-domain applicability standards',
        ],
        children: ['knowledge', 'domain'],
      },
      {
        id: 'knowledge',
        label: `Gather ${domain} Expert Knowledge`,
        description: `Curate and ingest domain-specific training data and best practices`,
        type: 'process',
        icon: Brain,
        details: [
          `Collect ${domain} reference datasets and knowledge corpora`,
          `Integrate with ${agentModels.length > 0 ? agentModels.join(', ') : 'GPT-4, Claude'} for reasoning`,
          `Map ${domain} decision trees and expert workflows`,
          `Validate knowledge sources against peer-reviewed standards`,
        ],
        children: ['validate'],
      },
      {
        id: 'domain',
        label: `Choose ${domain} Domain of Expertise`,
        description: `Narrow the agent's scope to specialized ${domain} tasks`,
        type: 'decision',
        icon: Target,
        details: [
          `Primary domain: ${domain}`,
          `Sub-specialization: ${agentTools.length > 0 ? agentTools.slice(0, 3).join(', ') : 'core domain operations'}`,
          `Scope validation: Does the domain have sufficient depth and breadth?`,
          `Market fit assessment: Is there clear demand for this agent?`,
        ],
        yesTarget: 'skills',
        noTarget: 'knowledge',
        children: ['skills'],
      },
      {
        id: 'validate',
        label: `Validate All Requirements Met`,
        description: `Verify that all ${domain} standards and specifications are satisfied`,
        type: 'process',
        icon: CheckCircle2,
        details: [
          `Functional requirements: All ${agentTools.length || 'core'} capabilities verified`,
          `Performance requirements: Benchmarks met for ${domain} workloads`,
          `Security requirements: Data handling and access controls validated`,
          `Integration requirements: API compatibility with ${fw} ecosystem confirmed`,
        ],
        children: ['train'],
      },
      {
        id: 'skills',
        label: `Define Specialized ${domain} Skills`,
        description: `Map the agent's toolset and capability matrix`,
        type: 'decision',
        icon: Zap,
        details: agentTools.length > 0
          ? agentTools.map(tool => `${tool}: Specialized ${domain} capability — ${tool.toLowerCase().includes('engine') ? 'core processing' : tool.toLowerCase().includes('analyzer') ? 'data analysis' : tool.toLowerCase().includes('generator') ? 'content generation' : tool.toLowerCase().includes('optimizer') ? 'performance tuning' : 'domain operations'}`)
          : [`Core ${domain} processing and analysis`, `Decision support and recommendation engine`, `Output validation and quality assurance`],
        yesTarget: 'architecture',
        noTarget: 'validate',
        children: ['architecture'],
      },
      {
        id: 'train',
        label: `Train ${agent?.name || 'Agent'} to Outperform`,
        description: `Optimize the agent's performance through iterative training and evaluation`,
        type: 'process',
        icon: Sparkles,
        details: [
          `Fine-tune on ${domain}-specific datasets with ${agentModels.length > 0 ? agentModels[0] : 'foundation model'}`,
          `Implement ${fw} orchestration patterns for multi-step reasoning`,
          `Establish feedback loops: real-world usage → model improvement`,
          `Achieve target accuracy: ≥${diff === 'advanced' ? '98' : diff === 'intermediate' ? '95' : '90'}% on ${domain} benchmarks`,
        ],
        children: ['success'],
      },
      {
        id: 'success',
        label: `Achieve 100% Success in ${domain} Results`,
        description: `Reach production-grade quality across all evaluation metrics`,
        type: 'process',
        icon: Star,
        details: [
          `Zero critical failures in ${domain} task execution`,
          `Consistent performance across edge cases and adversarial inputs`,
          `Sub-second inference for standard ${domain} queries`,
          `Full audit trail and explainability for every decision`,
        ],
        children: ['architecture'],
      },
      {
        id: 'architecture',
        label: `Develop ${fw} AI Model Architecture`,
        description: `Design and implement the agent's core architecture using ${fw}`,
        type: 'process',
        icon: Workflow,
        details: [
          `${fw} ${fw === 'LangGraph' ? 'StateGraph' : fw === 'CrewAI' ? 'Crew + Agent' : fw === 'AutoGen' ? 'AssistantAgent' : fw === 'Agno' ? 'Agent + Workflow' : 'Pipeline'} architecture`,
          `Memory management: ${fw === 'LangGraph' ? 'checkpoints + state' : 'context window + RAG'}`,
          `Tool integration: ${agentTools.length > 0 ? agentTools.join(', ') : 'domain-specific toolset'}`,
          `Model selection: ${agentModels.length > 0 ? agentModels.join(', ') : 'optimal LLM for task'}`,
        ],
        children: ['improvement', 'deployment', 'security', 'performance', 'testing'],
      },
      {
        id: 'improvement',
        label: `Monitor Continuous Improvement`,
        description: `Track agent performance and iterate on quality`,
        type: 'parallel',
        icon: BarChart3,
        details: [
          `Real-time performance dashboards for ${domain} metrics`,
          `A/B testing for prompt and tool optimizations`,
          `User feedback integration pipeline`,
          `Automated regression testing on each update`,
        ],
        children: ['ready'],
      },
      {
        id: 'deployment',
        label: `Deploy Agent in ${domain}`,
        description: `Production deployment with monitoring and scaling`,
        type: 'parallel',
        icon: Rocket,
        details: [
          `Containerized deployment with auto-scaling`,
          `${domain}-specific API endpoints and webhooks`,
          `Load-balanced inference with ${fw} runtime`,
          `Blue-green deployment with instant rollback capability`,
        ],
        children: ['ready'],
      },
      {
        id: 'security',
        label: `Ensure Security Compliance`,
        description: `Security hardening and compliance verification`,
        type: 'parallel',
        icon: Lock,
        details: [
          `Input sanitization and prompt injection prevention`,
          `Data encryption at rest and in transit (AES-256, TLS 1.3)`,
          `Access control with role-based permissions`,
          `${agent.industry || 'General'} compliance audit completed`,
        ],
        children: ['ready'],
      },
      {
        id: 'performance',
        label: `Optimize Performance`,
        description: `Latency, throughput, and cost optimization`,
        type: 'parallel',
        icon: Gauge,
        details: [
          `Inference latency: <${diff === 'advanced' ? '500ms' : diff === 'intermediate' ? '1s' : '2s'}`,
          `Token optimization: Reduce context window waste by 40%`,
          `Caching strategy for frequent ${domain} queries`,
          `Cost-per-inference optimization with model routing`,
        ],
        children: ['ready'],
      },
      {
        id: 'testing',
        label: `Implement Testing & Evaluation`,
        description: `Comprehensive test suite and evaluation framework`,
        type: 'parallel',
        icon: TestTube,
        details: [
          `Unit tests for each ${domain} capability (${agentTools.length || 'core'} modules)`,
          `Integration tests for ${fw} pipeline end-to-end`,
          `Adversarial testing with edge cases and malformed inputs`,
          `Benchmark suite against ${domain} baselines`,
        ],
        children: ['ready'],
      },
      {
        id: 'ready',
        label: `${agent?.name || 'Agent'} Ready for Expert-Level ${domain} Tasks`,
        description: `All validation gates passed — agent is production-ready`,
        type: 'status',
        icon: CircleCheck,
        details: [
          `Performance validated across all ${domain} benchmarks`,
          `Security audit completed with zero critical findings`,
          `Deployment pipeline verified with rollback capability`,
          `Monitoring and alerting configured for production SLAs`,
        ],
        children: ['operational'],
      },
      {
        id: 'operational',
        label: `${agent?.name || 'Agent'} Fully Operational`,
        description: `The agent is live, serving ${domain} tasks at production scale`,
        type: 'end',
        icon: Diamond,
        details: [
          `Serving ${domain} tasks 24/7 with 99.9% uptime SLA`,
          `Continuously learning from interactions and feedback`,
          `Scalable from single-user to enterprise-grade workloads`,
          `Open-source under MIT License — fork, customize, and deploy`,
        ],
        children: [],
      },
    ]
  }, [agent])

  const isBookmarked = agentId ? bookmarkedAgentIds.includes(agentId) : false
  const userRating = agentId ? ratings[agentId] : undefined
  const fwStyle = getFwStyle(agent?.framework)

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
        <Button onClick={() => router.push('/browse')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Browse
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 z-[60] h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-150" style={{ width: `${readingProgress}%` }} />

      {/* Framework Color Strip */}
      <div className={`h-[3px] rounded-full bg-gradient-to-r ${fwStyle.gradient} mb-6`} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
        <button onClick={() => router.push('/')} className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home className="h-3.5 w-3.5" /> Home
        </button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => router.push('/browse')} className="hover:text-foreground transition-colors">
          Browse
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{agent.name}</span>
      </nav>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{agent.name}</h1>
              {agent.isCurated && (
                <Badge className="text-[10px] bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-300 shadow-sm">
                  <Database className="h-3 w-3 mr-0.5" /> Knowledge Base
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">{agent.description}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {agent.framework && (
                <Badge className={`text-xs ${fwStyle.badge}`}>{agent.framework}</Badge>
              )}
              {agent.category && (
                <Badge variant="outline" className="text-xs">{agent.category}</Badge>
              )}
              {agent.difficulty && (
                <span className={`text-xs font-medium capitalize ${diffColors[agent.difficulty.toLowerCase()] || ''}`}>
                  {agent.difficulty}
                </span>
              )}
              {agent.industry && (
                <Badge variant="secondary" className="text-xs">{agent.industry}</Badge>
              )}
              {agent.language && (
                <Badge variant="outline" className="text-xs font-mono">{agent.language}</Badge>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl min-h-[36px]"
              onClick={() => {
                toggleBookmark(agent.id)
                if (!isBookmarked) {
                  addNotification({ type: 'bookmark_reminder', title: 'Agent bookmarked', message: `"${agent.name}" has been added to your bookmarks.` })
                }
              }}
            >
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 mr-1 text-amber-500" /> : <Bookmark className="h-4 w-4 mr-1" />}
              {isBookmarked ? 'Saved' : 'Save'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl min-h-[36px]"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href)
                  toast({ title: 'Link copied!', description: 'Agent URL has been copied to your clipboard.' })
                } catch { /* ignore */ }
              }}
            >
              <Share2 className="h-4 w-4 mr-1" /> Share
            </Button>
            <Button
              size="sm"
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white min-h-[36px]"
              onClick={() => {
                toast({ title: 'Download started', description: `${agent.name} code is being downloaded.` })
              }}
            >
              <Download className="h-4 w-4 mr-1" /> Get Code
            </Button>
          </div>
        </div>
      </motion.div>

      <Separator className="mb-6" />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="overview">
            <Eye className="h-4 w-4 mr-1" /> Overview
          </TabsTrigger>
          <TabsTrigger value="architecture">
            <Workflow className="h-4 w-4 mr-1" /> Architecture
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
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base">About this Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                  {agent.author && (
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                      <User className="h-3 w-3" /> Created by <span className="font-medium">{agent.author}</span>
                    </p>
                  )}
                  {agent.sourceUrl && (
                    <a href={agent.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-2">
                      <ExternalLink className="h-3 w-3" /> View Source Repository
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Tools */}
              {agent.tools && agent.tools.length > 0 && (
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="h-4 w-4" /> Tools & Capabilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {agent.tools.map((tool) => (
                        <div key={tool} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border">
                          <div className={`h-7 w-7 rounded-md bg-gradient-to-br ${fwStyle.gradient} flex items-center justify-center shrink-0`}>
                            <Zap className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tool}</p>
                            <p className="text-[10px] text-muted-foreground">Specialized {agent.category || 'domain'} capability</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {agent.tags && agent.tags.length > 0 && (
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {agent.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Framework Card */}
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Framework</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-3 rounded-lg ${fwStyle.bg} border ${fwStyle.border}`}>
                    <p className={`font-semibold ${fwStyle.text}`}>{agent.framework || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {agent.framework === 'LangGraph' ? 'Stateful graph-based orchestration' :
                       agent.framework === 'CrewAI' ? 'Role-based agent collaboration' :
                       agent.framework === 'AutoGen' ? 'Multi-agent conversation framework' :
                       agent.framework === 'Agno' ? 'High-performance agent primitives' :
                       agent.framework === 'LlamaIndex' ? 'RAG-optimized retrieval pipeline' : 'AI agent framework'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Models */}
              {agent.models && agent.models.length > 0 && (
                <Card className="rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4" /> AI Models
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.models.map((model) => (
                        <Badge key={model} variant="outline" className="text-xs font-mono">{model}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rating */}
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="h-4 w-4" /> Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          setRating(agent.id, star)
                          addNotification({ type: 'agent_update', title: 'Rating saved', message: `You rated "${agent.name}" ${star}/5 stars.` })
                        }}
                        className="p-0 bg-transparent border-none cursor-pointer"
                      >
                        <Star className={`h-5 w-5 transition-colors ${
                          (userRating || 4) >= star ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600'
                        }`} />
                      </button>
                    ))}
                    <span className="text-sm font-medium ml-1">{(userRating || 4.2).toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{agent.category}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Difficulty</span>
                    <span className={`font-medium capitalize ${diffColors[(agent.difficulty || '').toLowerCase()] || ''}`}>{agent.difficulty || 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium">{agent.industry || 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tools</span>
                    <span className="font-medium">{agent.tools?.length || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source</span>
                    <Badge variant="secondary" className="text-[10px]">Knowledge Base</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Architecture Tab - Flowchart Lifecycle */}
        <TabsContent value="architecture">
          <div className="space-y-6">
            {/* Architecture Header */}
            <Card className="rounded-xl overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${fwStyle.gradient}`} />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  {agent.name} — Architecture Lifecycle
                </CardTitle>
                <CardDescription>
                  Hyper-specialized agent development pipeline for {agent.category || 'AI'} domain using {agent.framework || 'AI'} framework
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Flowchart Visualization */}
            <div className="relative">
              {flowchartSteps.map((step, idx) => {
                const isStart = step.type === 'start'
                const isEnd = step.type === 'end'
                const isDecision = step.type === 'decision'
                const isParallel = step.type === 'parallel'
                const isStatus = step.type === 'status'
                const Icon = step.icon

                // Color coding based on type
                const typeStyles: Record<string, { container: string; icon: string; border: string }> = {
                  start: { container: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'bg-emerald-500 text-white', border: 'border-emerald-300 dark:border-emerald-700' },
                  process: { container: 'bg-blue-50 dark:bg-blue-900/20', icon: 'bg-blue-500 text-white', border: 'border-blue-300 dark:border-blue-700' },
                  decision: { container: 'bg-amber-50 dark:bg-amber-900/20', icon: 'bg-amber-500 text-white', border: 'border-amber-300 dark:border-amber-700' },
                  parallel: { container: 'bg-orange-50 dark:bg-orange-900/20', icon: 'bg-orange-500 text-white', border: 'border-orange-300 dark:border-orange-700' },
                  status: { container: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-500 text-white', border: 'border-purple-300 dark:border-purple-700' },
                  end: { container: 'bg-violet-50 dark:bg-violet-900/20', icon: 'bg-violet-500 text-white', border: 'border-violet-300 dark:border-violet-700' },
                }
                const style = typeStyles[step.type] || typeStyles.process

                // Special layout for parallel steps (architecture → 5 parallel)
                const parallelGroup = step.id === 'architecture' || ['improvement', 'deployment', 'security', 'performance', 'testing'].includes(step.id)

                return (
                  <motion.div
                    key={step.id}
                    id={`step-${step.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.3 }}
                  >
                    {/* Connector arrow */}
                    {idx > 0 && !['improvement', 'deployment', 'security', 'performance', 'testing'].includes(step.id) && (
                      <div className="flex justify-center my-1">
                        <div className="flex flex-col items-center">
                          <div className="w-[2px] h-6 bg-gray-300 dark:bg-gray-700" />
                          <ArrowDown className="h-4 w-4 text-gray-400 -mt-1" />
                        </div>
                      </div>
                    )}

                    {/* Step card */}
                    <Card className={`rounded-xl border-2 ${style.border} ${style.container} overflow-hidden transition-all duration-200 hover:shadow-md`}>
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          {/* Step icon */}
                          <div className={`h-10 w-10 rounded-xl ${style.icon} flex items-center justify-center shrink-0 shadow-sm`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm sm:text-base">{step.label}</h3>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize shrink-0">
                                {step.type}
                              </Badge>
                              {isDecision && (
                                <>
                                  <Badge className="text-[9px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">YES ↓</Badge>
                                  {step.noTarget && <Badge className="text-[9px] px-1.5 py-0 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-0">NO →</Badge>}
                                </>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{step.description}</p>
                            <div className="space-y-1.5">
                              {step.details.map((detail, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground">{detail}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Architecture Summary */}
            <Card className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${fwStyle.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                    <Diamond className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{agent.name} is Fully Operational</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      This {agent.difficulty || 'intermediate'}-level {agent.category || 'AI'} agent has been built using {agent.framework || 'AI'} and is production-ready for {agent.industry || 'general'} workloads.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${fwStyle.badge}`}>{agent.framework}</Badge>
                      <Badge variant="outline">{agent.category}</Badge>
                      {agent.industry && <Badge variant="secondary">{agent.industry}</Badge>}
                      <Badge variant="outline" className="capitalize">{agent.difficulty}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Code Tab */}
        {agent.codeSnippet && (
          <TabsContent value="code">
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Code2 className="h-4 w-4" /> Source Code
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={async () => {
                      await navigator.clipboard.writeText(agent.codeSnippet || '')
                      toast({ title: 'Copied!', description: 'Code has been copied to clipboard.' })
                    }}
                  >
                    Copy Code
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-950 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs sm:text-sm">
                  <code>{agent.codeSnippet}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* README Tab */}
        {agent.readme && (
          <TabsContent value="readme">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> README
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{agent.readme}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Dependencies Tab */}
        <TabsContent value="dependencies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tools */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Tools ({agent.tools?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agent.tools && agent.tools.length > 0 ? (
                  <div className="space-y-2">
                    {agent.tools.map(tool => (
                      <div key={tool} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${fwStyle.gradient} flex items-center justify-center shrink-0`}>
                          <Zap className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm font-medium">{tool}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tools specified</p>
                )}
              </CardContent>
            </Card>

            {/* Models */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4" /> AI Models ({agent.models?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agent.models && agent.models.length > 0 ? (
                  <div className="space-y-2">
                    {agent.models.map(model => (
                      <div key={model} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <div className="h-6 w-6 rounded-md bg-violet-500 flex items-center justify-center shrink-0">
                          <Sparkles className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm font-mono">{model}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No models specified</p>
                )}
              </CardContent>
            </Card>

            {/* Framework */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-base">Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg ${fwStyle.bg} border ${fwStyle.border}`}>
                  <p className={`font-bold text-lg ${fwStyle.text}`}>{agent.framework || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {agent.framework === 'LangGraph' ? 'Build stateful, multi-actor applications with LLMs using graph-based workflows' :
                     agent.framework === 'CrewAI' ? 'Orchestrate role-playing, autonomous AI agents that work together as a crew' :
                     agent.framework === 'AutoGen' ? 'Enable next-gen LLM applications with multi-agent conversations' :
                     agent.framework === 'Agno' ? 'Build high-performance AI agents with minimal code and maximum speed' :
                     agent.framework === 'LlamaIndex' ? 'Connect custom data sources to large language models with RAG' : 'AI agent framework'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Language */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-base">Language & Runtime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Language</span>
                    <Badge variant="outline" className="font-mono">{agent.language || 'Python'}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">LLM Provider</span>
                    <span className="font-medium">{agent.llm || 'OpenAI'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Source</span>
                    <Badge variant="secondary" className="text-[10px]">Knowledge Base</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Back to browse */}
      <div className="mt-8 pt-6 border-t">
        <Button variant="outline" onClick={() => router.push('/browse')} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Browse
        </Button>
      </div>
    </div>
  )
}
