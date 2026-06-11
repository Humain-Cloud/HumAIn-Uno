'use client'

import { useState, useEffect } from 'react'
import { useAppStore, type ViewType } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent, Category } from '@/lib/types'
import { getAgentDetailData, type AgentDetailData } from '@/lib/agent-detail-data'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Copy,
  Share2,
  CheckCircle2,
  ExternalLink,
  Clock,
  Tag,
  User,
  FileCode,
  BookOpen,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Brain,
  Zap,
  Shield,
  Wrench,
  GraduationCap,
  Building2,
  Layers,
  Star,
  Code2,
  MessageSquare,
  GitBranch,
  Bot,
  Settings,
  AlertTriangle,
  Lightbulb,
  Terminal,
  Database,
  Sparkles,
  FileText,
  HelpCircle,
  Target,
  ToggleLeft,
  BarChart3,
  Workflow,
  Heart,
  Globe,
  Palette,
  Search,
  Mail,
  ShoppingBag,
  Sprout,
  Briefcase,
  Plane,
  Music,
  Gamepad2,
  Scale,
  Cpu,
  Newspaper,
  Users,
  ChefHat,
  Bolt,
  Truck,
  Building,
  HardHat,
  Trophy,
  Leaf,
  ShieldCheck,
  Ship,
  Activity,
  Dumbbell,
  Calculator,
  FileCheck,
  Recycle,
  Award,
  Route,
  Package,
  Fuel,
} from 'lucide-react'

// ─── Framework Color Config ───

const frameworkColors: Record<string, { bg: string; text: string; badge: string; badgeText: string; border: string; hero: string; dot: string }> = {
  'LangGraph': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-900/40', badgeText: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/40', hero: 'from-emerald-600 to-teal-600', dot: 'bg-emerald-500' },
  'CrewAI': { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-900/40', badgeText: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/40', hero: 'from-amber-500 to-orange-500', dot: 'bg-amber-500' },
  'AutoGen': { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-100 dark:bg-rose-900/40', badgeText: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/40', hero: 'from-rose-500 to-pink-500', dot: 'bg-rose-500' },
  'Agno': { bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-300', badge: 'bg-violet-100 dark:bg-violet-900/40', badgeText: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800/40', hero: 'from-violet-500 to-purple-500', dot: 'bg-violet-500' },
  'LlamaIndex': { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-300', badge: 'bg-teal-100 dark:bg-teal-900/40', badgeText: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800/40', hero: 'from-teal-500 to-cyan-500', dot: 'bg-teal-500' },
}
const defaultFrameworkColor = frameworkColors['LangGraph']!

function getFrameworkColor(framework: string | null) {
  if (!framework) return defaultFrameworkColor
  return frameworkColors[framework] || defaultFrameworkColor
}

function parseAgent(a: any): KnowledgeAgent {
  return {
    ...a,
    tools: typeof a.tools === 'string' ? JSON.parse(a.tools || '[]') : a.tools || [],
    models: typeof a.models === 'string' ? JSON.parse(a.models || '[]') : a.models || [],
    tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags || [],
  }
}

type DetailTab = 'overview' | 'capabilities' | 'prompts' | 'architecture' | 'setup' | 'config' | 'faq' | 'related'

// ─── Icon mapping for capabilities ───
function getCapIcon(iconName: string) {
  const map: Record<string, React.ComponentType<{ className?: string }>> = {
    BookOpen, Brain, BarChart3, GitBranch, Zap, FileCode, Workflow, MessageSquare, Heart, Globe, User, Palette, Layers, Shield, Search, Database, Code2, CheckCircle2, Mail, ShoppingBag, Sprout, GraduationCap, Briefcase, Plane, Music, Gamepad2, Scale, Cpu, Wrench, Newspaper, Users, ChefHat, Bolt, Truck, Building, Clock, FileText, Target, HardHat, Trophy, Leaf, ShieldCheck, Ship, Activity, Dumbbell, Calculator, FileCheck, Recycle, Award, Route, Package, Fuel,
  }
  return map[iconName] || Brain
}

// ─── Collapsible Section Component ───
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false, badge }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; defaultOpen?: boolean; badge?: string }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-sm">{title}</span>
          {badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800">{children}</div>}
    </div>
  )
}

// ─── Prompt Card Component ───
function PromptCard({ prompt, index }: { prompt: { title: string; category: string; prompt: string; tips: string[] }; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const previewLength = 300
  const isLong = prompt.prompt.length > previewLength

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm truncate">{prompt.title}</h4>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{prompt.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy Prompt'}
          </button>
        </div>
      </div>

      {/* Prompt Content */}
      <div className="px-5 py-4">
        <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {isLong && !expanded ? (
            <>
              {prompt.prompt.slice(0, previewLength)}...
            </>
          ) : (
            prompt.prompt
          )}
        </div>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            {expanded ? 'Show Less' : 'Read Full Prompt'}
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Tips */}
      {prompt.tips.length > 0 && (
        <div className="px-5 py-4 bg-amber-50/50 dark:bg-amber-900/10 border-t border-gray-200 dark:border-gray-700">
          <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" /> Pro Tips
          </h5>
          <ul className="space-y-1.5">
            {prompt.tips.map((tip, i) => (
              <li key={i} className="text-xs text-amber-900/80 dark:text-amber-200/70 leading-relaxed flex gap-2">
                <span className="text-amber-500 dark:text-amber-400 shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Main Detail View ───

export default function DetailView() {
  const { selectedAgentId, setCurrentView, setSelectedAgentId } = useAppStore()
  const [agent, setAgent] = useState<KnowledgeAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [relatedAgents, setRelatedAgents] = useState<KnowledgeAgent[]>([])
  const [copied, setCopied] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [detailData, setDetailData] = useState<AgentDetailData | null>(null)

  useEffect(() => {
    if (!selectedAgentId) return
    setLoading(true)
    api.knowledge.get(selectedAgentId)
      .then((data: any) => {
        const parsed = parseAgent(data)
        setAgent(parsed)
        setDetailData(getAgentDetailData(parsed))
        // Load related agents
        if (parsed.framework || parsed.category) {
          api.knowledge.search({
            framework: parsed.framework || undefined,
            category: parsed.category || undefined,
            page: 1,
            pageSize: 6,
          }).then((relData: any) => {
            const relAgents = (relData?.data || relData || []).map(parseAgent).filter((a: KnowledgeAgent) => a.id !== parsed.id)
            setRelatedAgents(relAgents.slice(0, 4))
          }).catch(() => {})
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedAgentId])

  const handleCopyId = () => {
    if (!agent) return
    navigator.clipboard.writeText(agent.id).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleBookmark = () => {
    if (!agent) return
    const store = useAppStore.getState()
    store.toggleBookmark(agent.id)
    setBookmarked(!bookmarked)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading agent details…</p>
        </div>
      </div>
    )
  }

  if (!agent || !detailData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Bot className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Agent Not Found</h2>
          <p className="text-muted-foreground mb-4">The agent you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button onClick={() => { setCurrentView('browse'); setSelectedAgentId(null) }} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </button>
        </div>
      </div>
    )
  }

  const fw = getFrameworkColor(agent.framework)

  const tabs: { id: DetailTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'capabilities', label: 'Capabilities', icon: Zap },
    { id: 'prompts', label: 'Master Prompts', icon: Sparkles },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'setup', label: 'Getting Started', icon: Terminal },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'related', label: 'Related', icon: Layers },
  ]

  return (
    <div className="min-h-screen">
      {/* Framework-colored hero strip */}
      <div className={`bg-gradient-to-r ${fw.hero} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-white/70 text-sm mb-6" aria-label="Breadcrumb">
            <button onClick={() => { setCurrentView('home'); setSelectedAgentId(null) }} className="hover:text-white transition-colors">Home</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <button onClick={() => { setCurrentView('browse'); setSelectedAgentId(null) }} className="hover:text-white transition-colors">Browse</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-medium truncate max-w-[200px]">{agent.name}</span>
          </nav>

          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {agent.framework && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${fw.badge} ${fw.badgeText} backdrop-blur-sm`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${fw.dot}`} />
                    {agent.framework}
                  </span>
                )}
                {agent.isCurated && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                    <CheckCircle2 className="h-3 w-3" /> Curated
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/15 text-white/90 backdrop-blur-sm">
                  <Target className="h-3 w-3" /> {agent.category}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">{agent.name}</h1>
              <p className="text-white/80 text-base sm:text-lg max-w-2xl">{agent.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleBookmark} className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${bookmarked ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'}`} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this agent'}>
                <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
              <button onClick={handleCopyId} className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'}`} aria-label="Copy agent ID">
                {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
              <button className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all" aria-label="Share agent">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Tabbed Content */}
          <div className="lg:col-span-3">
            {/* Tab Bar */}
            <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto pb-px -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? `border-emerald-500 ${fw.text}`
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === 'prompts' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold">
                      {detailData.masterPrompts.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ─── Tab: Overview ─── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: FolderOpen, label: 'Category', value: agent.category || '—' },
                    { icon: Building2, label: 'Industry', value: agent.industry || '—' },
                    { icon: GraduationCap, label: 'Difficulty', value: agent.difficulty ? agent.difficulty.charAt(0).toUpperCase() + agent.difficulty.slice(1) : '—' },
                    { icon: Brain, label: 'LLM', value: agent.llm || '—' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                      </div>
                      <p className="font-semibold text-sm truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                {agent.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" /> Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {agent.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools */}
                {agent.tools.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Wrench className="h-4 w-4 text-muted-foreground" /> Tools & Integrations</h3>
                    <div className="flex flex-wrap gap-2">
                      {agent.tools.map((tool) => (
                        <span key={tool} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30">{tool}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Models */}
                {agent.models.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Brain className="h-4 w-4 text-muted-foreground" /> Supported Models</h3>
                    <div className="flex flex-wrap gap-2">
                      {agent.models.map((model) => (
                        <span key={model} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-800/30">{model}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source & Author Info */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Star className="h-4 w-4 text-muted-foreground" /> Agent Details</h3>
                  <div className="space-y-3">
                    {agent.author && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2"><User className="h-3.5 w-3.5" /> Author</span>
                        <span className="text-sm font-medium">{agent.author}</span>
                      </div>
                    )}
                    {agent.sourceUrl && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2"><ExternalLink className="h-3.5 w-3.5" /> Source</span>
                        <a href={agent.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                          View Source <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Last Updated</span>
                      <span className="text-sm font-medium">{(agent as any).updatedAt ? new Date((agent as any).updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2"><Copy className="h-3.5 w-3.5" /> Agent ID</span>
                      <button onClick={handleCopyId} className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                        {agent.id.slice(0, 24)}…
                        {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* README */}
                {agent.readme && (
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">README.md</span>
                    </div>
                    <div className="p-5 sm:p-6 text-sm leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                      {agent.readme}
                    </div>
                  </div>
                )}

                {/* Code Snippet */}
                {agent.codeSnippet && (
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{agent.repoPath || 'main.py'}</span>
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(agent.codeSnippet || '') }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </button>
                    </div>
                    <pre className="p-5 sm:p-6 text-sm leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto bg-gray-950 text-gray-100 font-mono">
                      <code>{agent.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Best Practices & Limitations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-5">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                      <Lightbulb className="h-4 w-4" /> Best Practices
                    </h3>
                    <ul className="space-y-2">
                      {detailData.bestPractices.slice(0, 4).map((bp, i) => (
                        <li key={i}>
                          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">{bp.title}</p>
                          <p className="text-xs text-emerald-700/70 dark:text-emerald-300/60 line-clamp-2">{bp.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-5">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="h-4 w-4" /> Known Limitations
                    </h3>
                    <ul className="space-y-2">
                      {detailData.limitations.slice(0, 4).map((lim, i) => (
                        <li key={i}>
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">{lim.title}</p>
                          <p className="text-xs text-amber-700/70 dark:text-amber-300/60 line-clamp-2">{lim.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Tab: Capabilities ─── */}
            {activeTab === 'capabilities' && (
              <div className="space-y-6">
                {/* Capability Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailData.capabilities.map((cap, i) => {
                    const IconComp = getCapIcon(cap.icon)
                    return (
                      <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 hover:border-emerald-200 dark:hover:border-emerald-800/40 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                            <IconComp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{cap.title}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">{cap.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Use Cases */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-emerald-600" /> Use Cases</h3>
                  <div className="space-y-3">
                    {detailData.useCases.map((uc, i) => (
                      <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{uc.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                            uc.complexity === 'simple' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            uc.complexity === 'advanced' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}>{uc.complexity}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{uc.description}</p>
                        <span className="text-[10px] text-muted-foreground font-medium">{uc.industry}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Tab: Master Prompts ─── */}
            {activeTab === 'prompts' && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-rose-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Master Legendary Prompts</h3>
                      <p className="text-sm text-amber-800/70 dark:text-amber-200/60 leading-relaxed">
                        Industry-graded, fully in-depth curated prompt templates crafted for maximum performance with {agent.name}. Each prompt has been designed for production-grade deployment with comprehensive instructions, constraints, and quality criteria.
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">{detailData.masterPrompts.length} Master Prompts</span>
                        <span className="text-xs text-amber-600/50 dark:text-amber-400/40">•</span>
                        <span className="text-xs text-amber-700/70 dark:text-amber-300/50">Ready to deploy</span>
                        <span className="text-xs text-amber-600/50 dark:text-amber-400/40">•</span>
                        <span className="text-xs text-amber-700/70 dark:text-amber-300/50">Copy & customize</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prompt Cards */}
                <div className="space-y-4">
                  {detailData.masterPrompts.map((prompt, i) => (
                    <PromptCard key={i} prompt={prompt} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Tab: Architecture ─── */}
            {activeTab === 'architecture' && (
              <div className="space-y-6">
                {/* Pattern */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6">
                  <h3 className="font-bold text-base mb-2 flex items-center gap-2"><Layers className="h-5 w-5 text-emerald-600" /> Architecture Pattern</h3>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-3">{detailData.architecture.pattern}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{detailData.architecture.dataFlow}</p>
                </div>

                {/* Components */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6">
                  <h3 className="font-bold text-base mb-4 flex items-center gap-2"><Database className="h-5 w-5 text-emerald-600" /> Core Components</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {detailData.architecture.components.map((comp, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-sm font-medium">{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagram */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Architecture Diagram</span>
                  </div>
                  <pre className="p-6 text-xs leading-relaxed overflow-x-auto font-mono text-gray-700 dark:text-gray-300 bg-gray-950/5 dark:bg-gray-950/30">
                    {detailData.architecture.diagram}
                  </pre>
                </div>

                {/* Changelog */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6">
                  <h3 className="font-bold text-base mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-emerald-600" /> Changelog</h3>
                  <div className="space-y-4">
                    {detailData.changelog.map((entry, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-600'}`}>v{entry.version.charAt(0)}</div>
                          {i < detailData.changelog.length - 1 && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />}
                        </div>
                        <div className="pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold">v{entry.version}</span>
                            <span className="text-xs text-muted-foreground">{entry.date}</span>
                            {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold">Latest</span>}
                          </div>
                          <ul className="space-y-1">
                            {entry.changes.map((change, j) => (
                              <li key={j} className="text-xs text-muted-foreground flex gap-2">
                                <span className="text-emerald-500 shrink-0">+</span> {change}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Tab: Getting Started ─── */}
            {activeTab === 'setup' && (
              <div className="space-y-6">
                {detailData.gettingStarted.map((step, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                    <div className="flex items-start gap-4 p-5">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md">
                        {step.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{step.description}</p>
                        {step.code && (
                          <div className="relative rounded-lg overflow-hidden">
                            <div className="absolute top-2 right-2 z-10">
                              <button
                                onClick={() => navigator.clipboard.writeText(step.code || '')}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-gray-700/80 text-gray-200 hover:bg-gray-600 transition-colors backdrop-blur-sm"
                              >
                                <Copy className="h-3 w-3" /> Copy
                              </button>
                            </div>
                            <pre className="p-4 text-xs leading-relaxed overflow-x-auto bg-gray-950 text-gray-100 font-mono">
                              <code>{step.code}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── Tab: Configuration ─── */}
            {activeTab === 'config' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Configuration Options</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground">Key</th>
                          <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground">Type</th>
                          <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground">Default</th>
                          <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground">Required</th>
                          <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailData.configuration.map((config, i) => (
                          <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                            <td className="px-5 py-3 font-mono text-xs font-medium text-emerald-700 dark:text-emerald-300">{config.key}</td>
                            <td className="px-5 py-3 text-xs text-muted-foreground">{config.type}</td>
                            <td className="px-5 py-3 text-xs font-mono text-gray-600 dark:text-gray-400">{config.default}</td>
                            <td className="px-5 py-3">
                              {config.required ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold">Required</span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold">Optional</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-xs text-muted-foreground max-w-xs">{config.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Environment Variables Example */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">.env.example</span>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(detailData.configuration.filter(c => c.required).map(c => `${c.key}=${c.default}`).join('\n'))} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                  </div>
                  <pre className="p-5 text-xs leading-relaxed overflow-x-auto bg-gray-950 text-gray-100 font-mono">
                    <code>{detailData.configuration.filter(c => c.required).map(c => `${c.key}=${c.default}`).join('\n')}\n\n# Optional configuration\n{detailData.configuration.filter(c => !c.required).map(c => `# ${c.key}=${c.default}`).join('\n')}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* ─── Tab: FAQ ─── */}
            {activeTab === 'faq' && (
              <div className="space-y-3">
                {detailData.faq.map((faq, i) => (
                  <CollapsibleSection key={i} title={faq.question} icon={HelpCircle} defaultOpen={i === 0}>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-3">{faq.answer}</p>
                  </CollapsibleSection>
                ))}

                {/* Best Practices */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-emerald-600" /> Best Practices</h3>
                  <div className="space-y-3">
                    {detailData.bestPractices.map((bp, i) => (
                      <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
                        <h4 className="font-semibold text-sm mb-1">{bp.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{bp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limitations */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Known Limitations</h3>
                  <div className="space-y-3">
                    {detailData.limitations.map((lim, i) => (
                      <div key={i} className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-5">
                        <h4 className="font-semibold text-sm mb-1 text-amber-800 dark:text-amber-200">{lim.title}</h4>
                        <p className="text-xs text-amber-700/70 dark:text-amber-300/60 leading-relaxed">{lim.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Tab: Related ─── */}
            {activeTab === 'related' && (
              <div>
                {relatedAgents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedAgents.map((relAgent) => (
                      <button
                        key={relAgent.id}
                        onClick={() => {
                          setSelectedAgentId(relAgent.id)
                          setCurrentView('detail')
                          window.scrollTo(0, 0)
                        }}
                        className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 text-left hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{relAgent.name}</h4>
                          {relAgent.framework && (
                            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${fw.badge} ${fw.badgeText}`}>
                              {relAgent.framework}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{relAgent.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {relAgent.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
                    <Layers className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No related agents found.</p>
                    <button onClick={() => { setCurrentView('browse'); setSelectedAgentId(null) }} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1">
                      Browse all agents <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => { setCurrentView('browse'); setSelectedAgentId(null) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Browse
                </button>
                <button
                  onClick={handleBookmark}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${bookmarked ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'}`}
                >
                  <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} /> {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                {agent.sourceUrl && (
                  <a
                    href={agent.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" /> View Source
                  </a>
                )}
              </div>
            </div>

            {/* Framework Card */}
            {agent.framework && (
              <div className={`${fw.bg} border ${fw.border} rounded-xl p-5`}>
                <h3 className="text-sm font-semibold mb-3">Framework</h3>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${fw.badge} flex items-center justify-center`}>
                    <GitBranch className={`h-5 w-5 ${fw.text}`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${fw.text}`}>{agent.framework}</p>
                    <p className="text-xs text-muted-foreground">AI Agent Framework</p>
                  </div>
                </div>
              </div>
            )}

            {/* Master Prompts Quick Link */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-amber-800 dark:text-amber-200">Master Prompts</p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">{detailData.masterPrompts.length} Legendary Templates</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('prompts')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium transition-colors shadow-md"
              >
                <Sparkles className="h-4 w-4" /> View Master Prompts
              </button>
            </div>

            {/* Metadata Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Metadata</h3>
              <div className="space-y-3 text-sm">
                {agent.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{agent.category}</span>
                  </div>
                )}
                {agent.industry && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium">{agent.industry}</span>
                  </div>
                )}
                {agent.difficulty && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Difficulty</span>
                    <span className={`font-medium capitalize ${agent.difficulty === 'beginner' ? 'text-green-600 dark:text-green-400' : agent.difficulty === 'advanced' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>{agent.difficulty}</span>
                  </div>
                )}
                {agent.language && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-medium">{agent.language}</span>
                  </div>
                )}
                {agent.llm && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">LLM</span>
                    <span className="font-medium">{agent.llm}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Curated</span>
                  <span className="font-medium">{agent.isCurated ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3">Explore Sections</h3>
              <div className="space-y-1.5">
                {[
                  { id: 'capabilities' as DetailTab, label: 'Capabilities', icon: Zap, count: detailData.capabilities.length },
                  { id: 'prompts' as DetailTab, label: 'Master Prompts', icon: Sparkles, count: detailData.masterPrompts.length },
                  { id: 'architecture' as DetailTab, label: 'Architecture', icon: Layers },
                  { id: 'setup' as DetailTab, label: 'Getting Started', icon: Terminal, count: detailData.gettingStarted.length },
                  { id: 'config' as DetailTab, label: 'Configuration', icon: Settings, count: detailData.configuration.length },
                  { id: 'faq' as DetailTab, label: 'FAQ', icon: HelpCircle, count: detailData.faq.length },
                ].map((link) => (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeTab === link.id ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <link.icon className="h-4 w-4" />
                      <span className="font-medium">{link.label}</span>
                    </div>
                    {link.count && <span className="text-xs text-muted-foreground">{link.count}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Cloud Card */}
            {agent.tags.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {agent.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Agents Section (always visible below) */}
        {relatedAgents.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Related Agents</h2>
              <button onClick={() => { setCurrentView('browse'); setSelectedAgentId(null) }} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedAgents.map((relAgent) => (
                <button
                  key={relAgent.id}
                  onClick={() => {
                    setSelectedAgentId(relAgent.id)
                    setCurrentView('detail')
                    window.scrollTo(0, 0)
                  }}
                  className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 text-left hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">{relAgent.name}</h4>
                    {relAgent.framework && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${fw.badge} ${fw.badgeText}`}>
                        {relAgent.framework}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{relAgent.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {relAgent.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
