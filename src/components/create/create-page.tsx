'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Paintbrush,
  LayoutTemplate,
  BookOpen,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  Clock,
  Zap,
  GitFork,
  Search,
  Star,
  Headphones,
  Code2,
  BarChart3,
  PenTool,
  ChevronRight,
  ThumbsUp,
  Trophy,
  Shield,
  Eye,
} from 'lucide-react'
import { ScratchWizard } from '@/components/create/scratch-wizard'
import { TemplateGallery } from '@/components/create/template-gallery'
import { AIAssisted } from '@/components/create/ai-assisted'
import { useToast } from '@/hooks/use-toast'

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────
type CreationMode = 'choose' | 'scratch' | 'template' | 'knowledge' | 'ai'

interface RecentCreation {
  id: string
  name: string
  status: 'draft' | 'published' | 'deploying'
  framework: string | null
  updatedAt: string
}

interface KnowledgeAgent {
  id: string
  name: string
  category: string
  description: string
  tools: string[]
  models: string[]
  framework: string | null
  llm: string | null
  industry: string | null
  difficulty: string | null
  language: string | null
  tags: string[]
  isCurated: boolean
}

// ─────────────────────────────────────────────────
// Creation Mode Data (Enhanced)
// ─────────────────────────────────────────────────
const creationOptions = [
  {
    id: 'scratch' as const,
    title: 'From Scratch',
    description: 'Start with a blank canvas. Define your agent\'s name, description, framework, LLM model, and behavior from the ground up. Full control over every aspect of your agent.',
    icon: Paintbrush,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'Most Flexible',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    difficulty: 'Advanced' as const,
    estimatedTime: '10-15 min',
    steps: [
      { label: 'Basic Info', icon: Paintbrush },
      { label: 'Framework', icon: Code2 },
      { label: 'Configuration', icon: Shield },
      { label: 'Review', icon: Eye },
    ],
    outputs: [
      'Custom agent name & description',
      'Your choice of framework & LLM',
      'Fully configurable system prompt',
      'Production-ready agent',
    ],
  },
  {
    id: 'template' as const,
    title: 'From Template',
    description: 'Choose from curated agent templates across popular frameworks. Customize and deploy in minutes. Each template includes pre-configured tools, prompts, and workflows.',
    icon: LayoutTemplate,
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badge: 'Fastest',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    difficulty: 'Easy' as const,
    estimatedTime: '2-5 min',
    steps: [
      { label: 'Browse', icon: Search },
      { label: 'Select', icon: Star },
      { label: 'Customize', icon: Paintbrush },
      { label: 'Deploy', icon: Zap },
    ],
    outputs: [
      'Pre-built agent from template',
      'Curated tools & prompts',
      'Customizable name & settings',
      'Quick deployment',
    ],
  },
  {
    id: 'knowledge' as const,
    title: 'From Knowledge Base',
    description: 'Explore our curated knowledge base of 800+ agents. Fork any agent, customize it to your needs, and make it your own. Learn from the best implementations.',
    icon: BookOpen,
    gradient: 'from-teal-500 to-emerald-600',
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
    badge: '800+ Agents',
    badgeClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    difficulty: 'Easy' as const,
    estimatedTime: '3-7 min',
    steps: [
      { label: 'Search', icon: Search },
      { label: 'Explore', icon: Eye },
      { label: 'Fork', icon: GitFork },
      { label: 'Customize', icon: Paintbrush },
    ],
    outputs: [
      'Forked agent from knowledge base',
      'Proven architecture & design',
      'Community-tested prompts',
      'Fully customizable fork',
    ],
  },
  {
    id: 'ai' as const,
    title: 'AI-Assisted',
    description: 'Describe what you want in plain English. Our AI will generate a complete agent specification, recommend the best framework and model, and help you refine it step by step.',
    icon: Sparkles,
    gradient: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    badge: 'Recommended',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    recommended: true,
    difficulty: 'Medium' as const,
    estimatedTime: '5-10 min',
    steps: [
      { label: 'Describe', icon: Sparkles },
      { label: 'Generate', icon: Zap },
      { label: 'Review', icon: Eye },
      { label: 'Refine', icon: Paintbrush },
    ],
    outputs: [
      'AI-generated agent spec',
      'Smart framework & model pick',
      'Complete system prompt',
      'One-click creation',
    ],
  },
]

// ─────────────────────────────────────────────────
// Quick Start Presets
// ─────────────────────────────────────────────────
const quickStartPresets = [
  {
    id: 'customer-support',
    name: 'Customer Support Bot',
    description: 'Handle FAQs, complaints, and ticket routing',
    icon: Headphones,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    config: {
      framework: 'langgraph',
      llm: 'gpt-4o',
      category: 'Support',
      industry: 'Customer Service',
      difficulty: 'beginner',
      systemPrompt: 'You are a helpful customer support agent. Answer questions politely, handle complaints with empathy, and escalate issues you cannot resolve to a human agent. Always ask for clarification if the user\'s request is ambiguous.',
      tools: ['web_search', 'knowledge_base', 'ticket_system'],
    },
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'Generate, review, and debug code',
    icon: Code2,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    config: {
      framework: 'langgraph',
      llm: 'gpt-4o',
      category: 'Development',
      industry: 'Technology',
      difficulty: 'intermediate',
      systemPrompt: 'You are an expert code assistant. Help users write, review, and debug code across multiple languages. Follow best practices, write clean and well-documented code, and explain your reasoning clearly.',
      tools: ['code_executor', 'file_system', 'web_search'],
    },
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyze data and generate insights',
    icon: BarChart3,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-200 dark:border-teal-800',
    config: {
      framework: 'crewai',
      llm: 'gpt-4o',
      category: 'Analytics',
      industry: 'Data Science',
      difficulty: 'intermediate',
      systemPrompt: 'You are a data analyst agent. Analyze datasets, generate visualizations, identify trends and patterns, and provide actionable insights. Always explain your methodology and present findings clearly.',
      tools: ['python_executor', 'database', 'visualization'],
    },
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    description: 'Create blog posts, marketing copy, and more',
    icon: PenTool,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-800',
    config: {
      framework: 'agno',
      llm: 'gpt-4o',
      category: 'Creative',
      industry: 'Marketing',
      difficulty: 'beginner',
      systemPrompt: 'You are a creative content writer. Generate engaging blog posts, marketing copy, social media content, and more. Adapt your tone and style to match the target audience. Always proofread for clarity and impact.',
      tools: ['web_search', 'grammar_check', 'seo_analyzer'],
    },
  },
]

// ─────────────────────────────────────────────────
// Knowledge Base Categories
// ─────────────────────────────────────────────────
const KB_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'Automation', label: 'Automation' },
  { id: 'Support', label: 'Support' },
  { id: 'Development', label: 'Development' },
  { id: 'Analytics', label: 'Analytics' },
  { id: 'Creative', label: 'Creative' },
  { id: 'Research', label: 'Research' },
]

const frameworkBadge: Record<string, string> = {
  langgraph: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  crewai: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  autogen: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  agno: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  llamaindex: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
}

const difficultyStyles: Record<string, { label: string; color: string; icon: typeof Trophy }> = {
  Easy: { label: 'Easy', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: ThumbsUp },
  Medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: Trophy },
  Advanced: { label: 'Advanced', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', icon: Shield },
}

// ─────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────
export function CreatePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { setShowAuthModal } = useAppStore()
  const { toast } = useToast()
  const [mode, setMode] = useState<CreationMode>('choose')

  // Recent creations
  const [recentCreations, setRecentCreations] = useState<RecentCreation[]>([])
  const [recentLoading, setRecentLoading] = useState(false)

  // Knowledge base inline browser
  const [kbAgents, setKbAgents] = useState<KnowledgeAgent[]>([])
  const [kbLoading, setKbLoading] = useState(false)
  const [kbSearch, setKbSearch] = useState('')
  const [kbCategory, setKbCategory] = useState('all')
  const [kbPage, setKbPage] = useState(1)

  // Fork dialog
  const [forkAgent, setForkAgent] = useState<KnowledgeAgent | null>(null)
  const [forkDialogOpen, setForkDialogOpen] = useState(false)
  const [forkName, setForkName] = useState('')
  const [forkDescription, setForkDescription] = useState('')
  const [forkPrivacy, setForkPrivacy] = useState('PUBLIC')
  const [forking, setForking] = useState(false)

  // Quick start
  const [quickStarting, setQuickStarting] = useState(false)

  // Categories for API
  const [categories, setCategories] = useState<any[]>([])

  // Load recent creations
  const loadRecentCreations = useCallback(async () => {
    if (!user) return
    setRecentLoading(true)
    try {
      const data: any = await api.agents.list({ pageSize: 3, sort: 'newest' })
      const agents = data?.data || data?.agents || []
      setRecentCreations(
        (Array.isArray(agents) ? agents : []).slice(0, 3).map((a: any) => ({
          id: a.id,
          name: a.name,
          status: a.status || 'published',
          framework: a.framework,
          updatedAt: a.updatedAt || a.created_at || new Date().toISOString(),
        }))
      )
    } catch {
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('humain-recent-creations')
        if (saved) setRecentCreations(JSON.parse(saved).slice(0, 3))
      } catch { /* ignore */ }
    } finally {
      setRecentLoading(false)
    }
  }, [user])

  // Load categories
  useEffect(() => {
    api.categories.list().then((data: any) => {
      setCategories(Array.isArray(data) ? data : [])
    }).catch(console.error)
  }, [])

  // Load knowledge base agents
  const loadKbAgents = useCallback(async () => {
    setKbLoading(true)
    try {
      const data: any = await api.knowledge.list({
        page: kbPage,
        pageSize: 12,
        category: kbCategory !== 'all' ? kbCategory : undefined,
      })
      const agents = data?.data || data || []
      if (kbSearch.trim()) {
        const searchResult: any = await api.knowledge.search({
          q: kbSearch,
          category: kbCategory !== 'all' ? kbCategory : undefined,
          page: kbPage,
          pageSize: 12,
        })
        setKbAgents(searchResult?.data || searchResult?.agents || [])
      } else {
        setKbAgents(Array.isArray(agents) ? agents : [])
      }
    } catch {
      setKbAgents([])
    } finally {
      setKbLoading(false)
    }
  }, [kbSearch, kbCategory, kbPage])

  useEffect(() => {
    if (user) loadRecentCreations()
  }, [user, loadRecentCreations])

  useEffect(() => {
    if (mode === 'knowledge') loadKbAgents()
  }, [mode, loadKbAgents])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true)
    }
  }, [authLoading, user, setShowAuthModal])

  // Quick start handler
  const handleQuickStart = async (preset: typeof quickStartPresets[number]) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setQuickStarting(true)
    try {
      const cat = categories.find(c =>
        c.name.toLowerCase() === preset.config.category.toLowerCase()
      )
      await api.agents.create({
        name: preset.name,
        description: preset.description,
        categoryId: cat?.id || categories[0]?.id,
        privacy: 'PUBLIC',
        source: 'quick-start',
        readme: `# ${preset.name}\n\n${preset.description}\n\n## Configuration\n\n- **Framework**: ${preset.config.framework}\n- **LLM**: ${preset.config.llm}\n- **Difficulty**: ${preset.config.difficulty}\n- **Industry**: ${preset.config.industry}\n\n## System Prompt\n\n${preset.config.systemPrompt}\n`,
        code: preset.config.framework,
        tags: [preset.config.category.toLowerCase(), preset.config.industry.toLowerCase(), 'quick-start'],
        framework: preset.config.framework,
        llm: preset.config.llm,
        industry: preset.config.industry,
        difficulty: preset.config.difficulty,
        language: 'python',
      })
      toast({ title: 'Agent created!', description: `${preset.name} has been created successfully.` })
      // Save to recent
      try {
        const saved = localStorage.getItem('humain-recent-creations')
        const existing = saved ? JSON.parse(saved) : []
        const newEntry = {
          id: `qs-${Date.now()}`,
          name: preset.name,
          status: 'published',
          framework: preset.config.framework,
          updatedAt: new Date().toISOString(),
        }
        localStorage.setItem('humain-recent-creations', JSON.stringify([newEntry, ...existing].slice(0, 10)))
      } catch { /* ignore */ }
      router.push('/dashboard')
    } catch (err: any) {
      toast({ title: 'Creation failed', description: err.message || 'Please try again', variant: 'destructive' })
    } finally {
      setQuickStarting(false)
    }
  }

  // Fork handler
  const handleFork = async () => {
    if (!forkAgent) return
    setForking(true)
    try {
      const cat = categories.find(c =>
        c.name.toLowerCase() === forkAgent.category?.toLowerCase()
      )
      await api.agents.create({
        name: forkName || forkAgent.name,
        description: forkDescription || forkAgent.description,
        categoryId: cat?.id || categories[0]?.id,
        privacy: forkPrivacy,
        source: 'knowledge-base',
        readme: `# ${forkName || forkAgent.name}\n\n${forkDescription || forkAgent.description}\n\n## Forked From\n\n- **Original**: ${forkAgent.name}\n- **Framework**: ${forkAgent.framework || 'N/A'}\n- **Category**: ${forkAgent.category}\n- **Tools**: ${forkAgent.tools?.join(', ') || 'None'}\n`,
        code: forkAgent.framework || null,
        tags: forkAgent.tags || [],
        framework: forkAgent.framework,
        llm: forkAgent.llm,
        industry: forkAgent.industry,
        difficulty: forkAgent.difficulty,
        language: forkAgent.language || 'python',
      })
      toast({ title: 'Agent forked!', description: `${forkName || forkAgent.name} has been created from the knowledge base.` })
      setForkDialogOpen(false)
      router.push('/dashboard')
    } catch (err: any) {
      toast({ title: 'Fork failed', description: err.message || 'Please try again', variant: 'destructive' })
    } finally {
      setForking(false)
    }
  }

  const openForkDialog = (agent: KnowledgeAgent) => {
    setForkAgent(agent)
    setForkName(`${agent.name} (Fork)`)
    setForkDescription(agent.description)
    setForkPrivacy('PUBLIC')
    setForkDialogOpen(true)
  }

  // Filtered KB agents
  const filteredKbAgents = kbAgents.filter(a => {
    if (kbCategory !== 'all' && a.category?.toLowerCase() !== kbCategory.toLowerCase()) return false
    if (kbSearch.trim()) {
      const q = kbSearch.toLowerCase()
      return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    }
    return true
  })

  // ─────────────────────────────────────────────────
  // Loading state
  // ─────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Paintbrush className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Sign in to Create Agents</h2>
          <p className="text-muted-foreground max-w-md">
            You need to be signed in to create AI agents. Sign in or create an account to get started.
          </p>
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            onClick={() => setShowAuthModal(true)}
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════ */}
        {/* Choose Creation Mode                        */}
        {/* ═══════════════════════════════════════════ */}
        {mode === 'choose' && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* ── Hero Header ── */}
            <div className="relative mb-8 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 opacity-90" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
              <div className="relative px-6 py-8 sm:px-8 sm:py-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
                      4 Creation Modes Available
                    </Badge>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                    Create an Agent
                  </h1>
                  <p className="text-emerald-100 text-base sm:text-lg max-w-2xl">
                    Choose how you&apos;d like to build your AI agent. Each path leads to a production-ready agent tailored to your needs.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* ── Quick Start Presets ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-lg font-bold">Quick Start</h2>
                </div>
                <span className="text-xs text-muted-foreground">Pre-configured agents — just click to create</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickStartPresets.map((preset, i) => (
                  <motion.div
                    key={preset.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                  >
                    <Card
                      className={`cursor-pointer overflow-hidden rounded-xl border ${preset.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 h-full`}
                      onClick={() => handleQuickStart(preset)}
                    >
                      <CardContent className="p-4">
                        <div className={`h-10 w-10 rounded-lg ${preset.bg} flex items-center justify-center mb-3`}>
                          <preset.icon className={`h-5 w-5 ${preset.color}`} />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{preset.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{preset.description}</p>
                        {quickStarting ? (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" /> Creating...
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <Zap className="h-3 w-3" /> One-click create
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── Creation Mode Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {creationOptions.map((option, i) => {
                const diff = difficultyStyles[option.difficulty]
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                  >
                    <Card
                      className="group cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/20 hover:-translate-y-1.5 h-full relative"
                      onClick={() => setMode(option.id)}
                    >
                      {/* Recommended badge */}
                      {option.recommended && (
                        <div className="absolute top-3 right-3 z-10">
                          <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 text-[10px] px-2.5 py-0.5 shadow-md">
                            <Sparkles className="h-3 w-3 mr-1" /> Recommended
                          </Badge>
                        </div>
                      )}

                      {/* Top gradient bar */}
                      <div className={`h-2 bg-gradient-to-r ${option.gradient}`} />

                      <CardContent className="p-5">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className={`h-12 w-12 rounded-xl ${option.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                            <option.icon className={`h-6 w-6 ${option.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold">{option.title}</h3>
                              <Badge className={`text-[10px] px-2 py-0.5 ${option.badgeClass}`}>
                                {option.badge}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {option.description}
                            </p>
                          </div>
                        </div>

                        {/* Step-by-step workflow indicator */}
                        <div className="mb-4">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Workflow</p>
                          <div className="flex items-center gap-1">
                            {option.steps.map((step, si) => (
                              <div key={si} className="flex items-center gap-1 flex-1">
                                <div className="flex flex-col items-center flex-1">
                                  <motion.div
                                    className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                                      si === 0
                                        ? `border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20`
                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                    } group-hover:border-emerald-400`}
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    <step.icon className={`h-3.5 w-3.5 ${si === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                                  </motion.div>
                                  <span className="text-[9px] text-muted-foreground mt-0.5 text-center leading-tight">{step.label}</span>
                                </div>
                                {si < option.steps.length - 1 && (
                                  <div className="h-0.5 flex-1 bg-gray-200 dark:bg-gray-700 -mt-3 rounded-full group-hover:bg-emerald-300 dark:group-hover:bg-emerald-700 transition-colors duration-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* What you'll get */}
                        <div className="mb-4">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">What you&apos;ll get</p>
                          <div className="space-y-1">
                            {option.outputs.map((output, oi) => (
                              <div key={oi} className="flex items-center gap-1.5">
                                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="text-xs text-muted-foreground">{output}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer: Difficulty + Time */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-[10px] px-2 py-0.5 ${diff.color}`}>
                              <diff.icon className="h-3 w-3 mr-1" />
                              {diff.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{option.estimatedTime}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* ── Recent Creations ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mt-10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-lg font-bold">Recent Creations</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => router.push('/dashboard')}
                >
                  View all <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>

              {recentLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[0, 1, 2].map(i => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : recentCreations.length === 0 ? (
                <Card className="rounded-xl border-dashed">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">No agents created yet. Choose a creation mode above to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recentCreations.map((creation, i) => (
                    <motion.div
                      key={creation.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.05 }}
                    >
                      <Card className="rounded-xl hover:shadow-md transition-all duration-200 group">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{creation.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              {creation.framework && (
                                <Badge className={`text-[9px] px-1.5 py-0 ${frameworkBadge[creation.framework.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                                  {creation.framework}
                                </Badge>
                              )}
                              <Badge
                                className={`text-[9px] px-1.5 py-0 ${
                                  creation.status === 'published'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                    : creation.status === 'draft'
                                    ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                }`}
                              >
                                {creation.status}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => router.push('/dashboard')}
                          >
                            {creation.status === 'draft' ? 'Continue' : 'View'}
                            <ChevronRight className="h-3 w-3 ml-0.5" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ── Bottom hint ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-muted-foreground">
                All agents are saved to your dashboard and can be edited anytime after creation.
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* From Scratch Wizard                         */}
        {/* ═══════════════════════════════════════════ */}
        {mode === 'scratch' && (
          <motion.div
            key="scratch"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={() => setMode('choose')} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to options
              </Button>
            </div>
            <ScratchWizard onCreated={() => router.push('/dashboard')} />
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* From Template Gallery                       */}
        {/* ═══════════════════════════════════════════ */}
        {mode === 'template' && (
          <motion.div
            key="template"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={() => setMode('choose')} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to options
              </Button>
            </div>
            <TemplateGallery onCreated={() => router.push('/dashboard')} />
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* Knowledge Base Inline Browser               */}
        {/* ═══════════════════════════════════════════ */}
        {mode === 'knowledge' && (
          <motion.div
            key="knowledge"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={() => setMode('choose')} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to options
              </Button>
            </div>

            {/* KB Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-teal-600" />
                From Knowledge Base
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Explore 800+ curated agents. Fork any agent and customize it to your needs.
              </p>
            </div>

            {/* KB Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search knowledge base..."
                  value={kbSearch}
                  onChange={e => { setKbSearch(e.target.value); setKbPage(1) }}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {KB_CATEGORIES.map(cat => (
                  <Button
                    key={cat.id}
                    variant={kbCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    className={`whitespace-nowrap ${kbCategory === cat.id ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
                    onClick={() => { setKbCategory(cat.id); setKbPage(1) }}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* KB Agent Grid */}
            {kbLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : filteredKbAgents.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No agents found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or category filter
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredKbAgents.map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 h-full rounded-xl group"
                      onClick={() => openForkDialog(agent)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {agent.name}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            {agent.isCurated && (
                              <Badge className="text-[9px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                <Star className="h-2.5 w-2.5 mr-0.5" /> Curated
                              </Badge>
                            )}
                            <Badge className="text-[9px] px-1.5 py-0 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                              <GitFork className="h-2.5 w-2.5 mr-0.5" /> Fork
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {agent.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {agent.framework && (
                            <Badge className={`text-[10px] px-2 py-0.5 ${frameworkBadge[agent.framework.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                              {agent.framework}
                            </Badge>
                          )}
                          {agent.category && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                              {agent.category}
                            </Badge>
                          )}
                          {agent.difficulty && (
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 capitalize">
                              {agent.difficulty}
                            </Badge>
                          )}
                        </div>
                        {agent.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {agent.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
                            ))}
                            {agent.tags.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">+{agent.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* KB Load More */}
            {filteredKbAgents.length > 0 && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => { setKbPage(p => p + 1); loadKbAgents() }}
                  disabled={kbLoading}
                >
                  {kbLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Load More Agents
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* AI-Assisted Creation                        */}
        {/* ═══════════════════════════════════════════ */}
        {mode === 'ai' && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={() => setMode('choose')} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to options
              </Button>
            </div>
            <AIAssisted onCreated={() => router.push('/dashboard')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════ */}
      {/* Fork & Customize Dialog                     */}
      {/* ═══════════════════════════════════════════ */}
      <Dialog open={forkDialogOpen} onOpenChange={setForkDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitFork className="h-5 w-5 text-teal-600" />
              Fork &amp; Customize
            </DialogTitle>
            <DialogDescription>
              Fork &quot;{forkAgent?.name}&quot; from the knowledge base and customize it to your needs.
            </DialogDescription>
          </DialogHeader>

          {forkAgent && (
            <div className="space-y-4">
              {/* Agent Info */}
              <div className="flex gap-2 flex-wrap">
                {forkAgent.framework && (
                  <Badge className={`text-xs ${frameworkBadge[forkAgent.framework.toLowerCase()] || ''}`}>
                    {forkAgent.framework}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">{forkAgent.category}</Badge>
                {forkAgent.difficulty && (
                  <Badge variant="secondary" className="text-xs capitalize">{forkAgent.difficulty}</Badge>
                )}
                {forkAgent.isCurated && (
                  <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    <Star className="h-3 w-3 mr-1" /> Curated
                  </Badge>
                )}
              </div>

              {/* Original Description */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-sm text-muted-foreground">
                {forkAgent.description}
              </div>

              {forkAgent.tools?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Included Tools:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {forkAgent.tools.map(tool => (
                      <Badge key={tool} variant="secondary" className="text-xs">{tool}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Customize Form */}
              <div className="space-y-2">
                <Label htmlFor="fork-name">Agent Name</Label>
                <Input
                  id="fork-name"
                  value={forkName}
                  onChange={e => setForkName(e.target.value)}
                  placeholder="Enter agent name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fork-desc">Description</Label>
                <Textarea
                  id="fork-desc"
                  value={forkDescription}
                  onChange={e => setForkDescription(e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Describe your agent..."
                />
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select value={forkPrivacy} onValueChange={setForkPrivacy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public — Everyone can discover</SelectItem>
                    <SelectItem value="PRIVATE">Private — Only you can see</SelectItem>
                    <SelectItem value="UNLISTED">Unlisted — Link only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setForkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                  onClick={handleFork}
                  disabled={forking || !forkName.trim()}
                >
                  {forking ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Forking...</>
                  ) : (
                    <><GitFork className="h-4 w-4 mr-2" /> Fork &amp; Create</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
