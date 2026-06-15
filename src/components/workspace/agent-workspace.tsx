'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  ArrowLeft,
  LayoutDashboard,
  Settings,
  FlaskConical,
  Terminal,
  Rocket,
  BarChart3,
  Activity,
  Heart,
  Gauge,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,

  Edit3,
  Share2,
  Play,
  Send,
  Plus,
  X,
  Copy,

  Key,
  Globe,
  Shield,
  Sparkles,
  Bot,
  User,
  Code2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Save,
  ChevronRight,
  Trash2,
  Eye,
  Server,
  GitBranch,
  FileCode,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/hooks/use-toast'
import dynamic from 'next/dynamic'
const LazyWorkspaceCharts = dynamic(() => import('@/components/workspace/workspace-charts'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
})

// ─── Types ──────────────────────────────────────────────────────

export interface AgentWorkspaceData {
  id: string
  name: string
  description: string
  categoryId: string
  category: { name: string }
  creatorId: string
  creator: { name: string | null; email: string; image: string | null }
  privacy: string
  source: string | null
  readme: string
  code: string | null
  stars: number
  tags: string[]
  framework: string | null
  llm: string | null
  industry: string | null
  difficulty: string | null
  language: string | null
  status: string
  healthScore: number
  systemPrompt: string | null
  tools: string[]
  configJson: Record<string, unknown>
  version: number
  thumbnailUrl: string | null
  deployUrl: string | null
  lastTestedAt: string | null
  lastDeployedAt: string | null
  totalRequests: number
  avgLatencyMs: number
  errorRate: number
  createdAt: string
  updatedAt: string
}

// ─── Constants ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', icon: Edit3 },
  active: { label: 'Active', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle2 },
  testing: { label: 'Testing', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: FlaskConical },
  deployed: { label: 'Deployed', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/30', icon: Rocket },
  archived: { label: 'Archived', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30', icon: ArchiveIcon },
}

function ArchiveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  )
}

const LIFECYCLE_STAGES = ['draft', 'active', 'testing', 'deployed', 'archived']

const FRAMEWORK_OPTIONS = [
  { value: 'langgraph', label: 'LangGraph' },
  { value: 'crewai', label: 'CrewAI' },
  { value: 'autogen', label: 'AutoGen' },
  { value: 'agno', label: 'Agno' },
  { value: 'llamaindex', label: 'LlamaIndex' },
]

const LLM_OPTIONS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
  { value: 'gemini-pro', label: 'Gemini Pro' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'llama-3.1-70b', label: 'Llama 3.1 70B' },
  { value: 'mistral-large', label: 'Mistral Large' },
]

const INDUSTRY_OPTIONS = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'technology', label: 'Technology' },
  { value: 'education', label: 'Education' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'legal', label: 'Legal' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'travel', label: 'Travel' },
  { value: 'entertainment', label: 'Entertainment' },
]

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const PRIVACY_OPTIONS = [
  { value: 'PRIVATE', label: 'Private' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'UNLISTED', label: 'Unlisted' },
]

const AVAILABLE_TOOLS = [
  'web_search', 'code_execution', 'file_read', 'file_write', 'database_query',
  'api_call', 'email_send', 'image_generation', 'pdf_parser', 'data_analysis',
  'calculator', 'calendar', 'weather', 'news', 'translation',
]

// ─── Mock Data Generators ───────────────────────────────────────

function generateAnalyticsData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const baseRequests = 120 + Math.floor(Math.random() * 80)
  return days.map((day, i) => ({
    day,
    requests: Math.floor(baseRequests + Math.random() * 60 - 20 + i * 10),
    latency: Math.floor(180 + Math.random() * 120 - 40),
    errors: Math.floor(Math.random() * 8),
    errorRate: +(Math.random() * 3 + 0.5).toFixed(1),
    cost: +(Math.random() * 0.5 + 0.1).toFixed(2),
  }))
}

function generateRecentActivity(): Array<{ id: string; action: string; timestamp: string; icon: React.ElementType; color: string }> {
  return [
    { id: '1', action: 'Agent configuration updated', timestamp: new Date(Date.now() - 120000).toISOString(), icon: Settings, color: 'text-amber-500' },
    { id: '2', action: 'Test suite passed (5/5)', timestamp: new Date(Date.now() - 3600000).toISOString(), icon: CheckCircle2, color: 'text-emerald-500' },
    { id: '3', action: 'Deployed to production', timestamp: new Date(Date.now() - 7200000).toISOString(), icon: Rocket, color: 'text-teal-500' },
    { id: '4', action: 'System prompt optimized', timestamp: new Date(Date.now() - 14400000).toISOString(), icon: Sparkles, color: 'text-purple-500' },
    { id: '5', action: 'Agent created', timestamp: new Date(Date.now() - 86400000).toISOString(), icon: Plus, color: 'text-emerald-500' },
  ]
}

function generateDeployHistory(): Array<{ id: string; env: string; status: string; version: number; timestamp: string; url: string | null }> {
  return [
    { id: 'd1', env: 'production', status: 'running', version: 3, timestamp: new Date(Date.now() - 7200000).toISOString(), url: 'https://agent-prod.example.com' },
    { id: 'd2', env: 'staging', status: 'stopped', version: 2, timestamp: new Date(Date.now() - 86400000).toISOString(), url: 'https://agent-staging.example.com' },
    { id: 'd3', env: 'development', status: 'failed', version: 1, timestamp: new Date(Date.now() - 172800000).toISOString(), url: null },
  ]
}

// ─── Utility Components ─────────────────────────────────────────

function HealthGauge({ score }: { score: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground">Health</span>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, trendLabel, color }: {
  title: string; value: string | number; icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'; trendLabel?: string; color: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${color.replace('text-', 'bg-')}`} />
      <CardContent className="p-4 pl-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trendLabel && (
              <div className="flex items-center gap-1 mt-1">
                {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3 text-rose-500" />}
                {trend === 'neutral' && <Minus className="h-3 w-3 text-muted-foreground" />}
                <span className={`text-xs ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : trend === 'down' ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>
                  {trendLabel}
                </span>
              </div>
            )}
          </div>
          <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')}/10`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LifecyclePipeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = LIFECYCLE_STAGES.indexOf(currentStatus)

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {LIFECYCLE_STAGES.map((stage, index) => {
        const config = STATUS_CONFIG[stage]
        const isCurrent = stage === currentStatus
        const isPast = index < currentIndex
        const IconComp = config.icon

        return (
          <div key={stage} className="flex items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                isCurrent
                  ? `${config.bg} ${config.color} border-current/20 shadow-sm`
                  : isPast
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'bg-muted/50 text-muted-foreground border-transparent'
              }`}
            >
              {isPast ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <IconComp className="h-4 w-4" />
              )}
              <span className="text-xs font-medium capitalize">{config.label}</span>
            </motion.div>
            {index < LIFECYCLE_STAGES.length - 1 && (
              <ChevronRight className={`h-4 w-4 mx-1 ${isPast ? 'text-emerald-500' : 'text-muted-foreground/40'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// ─── Overview Tab ───────────────────────────────────────────────

function OverviewTab({ agent, onTabChange }: { agent: AgentWorkspaceData; onTabChange: (tab: string) => void }) {
  const recentActivity = useMemo(() => generateRecentActivity(), [])
  const statusConfig = STATUS_CONFIG[agent.status] || STATUS_CONFIG.draft
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <HealthGauge score={agent.healthScore} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold truncate">{agent.name}</h1>
              <Badge className={`${statusConfig.bg} ${statusConfig.color} border-0`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                v{agent.version}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{agent.description}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {agent.framework && (
                <Badge variant="secondary" className="text-xs">{agent.framework}</Badge>
              )}
              {agent.llm && (
                <Badge variant="secondary" className="text-xs">{agent.llm}</Badge>
              )}
              {agent.category?.name && (
                <Badge variant="outline" className="text-xs">{agent.category.name}</Badge>
              )}
              {agent.privacy === 'PRIVATE' && (
                <Badge variant="outline" className="text-xs"><Shield className="h-3 w-3 mr-1" />Private</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={agent.totalRequests.toLocaleString()}
          icon={Activity}
          trend="up"
          trendLabel="+12% this week"
          color="text-emerald-600"
        />
        <StatCard
          title="Avg Latency"
          value={`${agent.avgLatencyMs}ms`}
          icon={Clock}
          trend={agent.avgLatencyMs < 300 ? 'up' : 'down'}
          trendLabel={agent.avgLatencyMs < 300 ? 'Good' : 'Slow'}
          color="text-amber-600"
        />
        <StatCard
          title="Error Rate"
          value={`${(agent.errorRate * 100).toFixed(1)}%`}
          icon={AlertTriangle}
          trend={agent.errorRate < 0.05 ? 'up' : 'down'}
          trendLabel={agent.errorRate < 0.05 ? 'Healthy' : 'Elevated'}
          color="text-rose-600"
        />
        <StatCard
          title="Health Score"
          value={agent.healthScore}
          icon={Heart}
          trend={agent.healthScore >= 80 ? 'up' : agent.healthScore >= 50 ? 'neutral' : 'down'}
          trendLabel={agent.healthScore >= 80 ? 'Excellent' : agent.healthScore >= 50 ? 'Fair' : 'Poor'}
          color="text-teal-600"
        />
      </div>

      {/* Lifecycle Pipeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-emerald-500" />
            Lifecycle Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LifecyclePipeline currentStatus={agent.status} />
        </CardContent>
      </Card>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="space-y-3">
                {recentActivity.map((item) => {
                  const ItemIcon = item.icon
                  return (
                    <div key={item.id} className="flex items-center gap-3 py-1.5">
                      <div className={`p-1.5 rounded-md bg-muted ${item.color}`}>
                        <ItemIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{item.action}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(item.timestamp)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => onTabChange('configuration')}
            >
              <Edit3 className="h-4 w-4" />
              Edit Configuration
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => onTabChange('testing')}
            >
              <FlaskConical className="h-4 w-4" />
              Test Agent
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => onTabChange('deployment')}
            >
              <Rocket className="h-4 w-4" />
              Deploy Agent
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => onTabChange('analytics')}
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
            <Separator className="my-2" />
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast({ title: 'Link copied to clipboard' })
              }}
            >
              <Share2 className="h-4 w-4" />
              Share Agent
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Agent Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creator</span>
              <span className="font-medium">{agent.creator?.name || agent.creator?.email || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Framework</span>
              <span className="font-medium capitalize">{agent.framework || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">LLM</span>
              <span className="font-medium">{agent.llm || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Industry</span>
              <span className="font-medium capitalize">{agent.industry || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difficulty</span>
              <span className="font-medium capitalize">{agent.difficulty || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Tested</span>
              <span className="font-medium">{formatRelativeTime(agent.lastTestedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Deployed</span>
              <span className="font-medium">{formatRelativeTime(agent.lastDeployedAt)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tools & Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Tools ({agent.tools.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {agent.tools.length > 0 ? agent.tools.map((tool) => (
                  <Badge key={tool} variant="secondary" className="text-xs">{tool}</Badge>
                )) : (
                  <span className="text-xs text-muted-foreground">No tools configured</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Tags ({agent.tags.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {agent.tags.length > 0 ? agent.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                )) : (
                  <span className="text-xs text-muted-foreground">No tags</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Configuration Tab ──────────────────────────────────────────

function ConfigurationTab({ agent, onUpdate }: { agent: AgentWorkspaceData; onUpdate: (data: Partial<AgentWorkspaceData>) => void }) {
  const [form, setForm] = useState({
    name: agent.name,
    description: agent.description,
    framework: agent.framework || '',
    llm: agent.llm || '',
    industry: agent.industry || '',
    difficulty: agent.difficulty || '',
    privacy: agent.privacy,
    tags: agent.tags,
    systemPrompt: agent.systemPrompt || '',
    tools: agent.tools,
  })
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)
  const [advancedJson, setAdvancedJson] = useState(
    JSON.stringify(agent.configJson || {}, null, 2)
  )
  const [jsonError, setJsonError] = useState<string | null>(null)

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      let parsedConfig = agent.configJson
      try {
        parsedConfig = JSON.parse(advancedJson)
        setJsonError(null)
      } catch {
        setJsonError('Invalid JSON in advanced settings')
        setSaving(false)
        return
      }

      const updateData: Record<string, unknown> = {
        name: form.name,
        description: form.description,
        framework: form.framework || null,
        llm: form.llm || null,
        industry: form.industry || null,
        difficulty: form.difficulty || null,
        privacy: form.privacy,
        tags: form.tags,
      }

      await api.agents.update(agent.id, updateData)
      onUpdate({
        ...updateData,
        systemPrompt: form.systemPrompt,
        tools: form.tools,
        configJson: parsedConfig,
      })
      toast({ title: 'Configuration saved', description: 'Agent settings have been updated.' })
    } catch {
      toast({ title: 'Save failed', description: 'Could not save configuration.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }, [agent.id, form, advancedJson, agent.configJson, onUpdate])

  const addTag = useCallback(() => {
    const trimmed = newTag.trim()
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, trimmed] }))
      setNewTag('')
    }
  }, [newTag, form.tags])

  const removeTag = useCallback((tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }, [])

  const addTool = useCallback((tool: string) => {
    if (!form.tools.includes(tool)) {
      setForm(prev => ({ ...prev, tools: [...prev.tools, tool] }))
    }
  }, [form.tools])

  const removeTool = useCallback((tool: string) => {
    setForm(prev => ({ ...prev, tools: prev.tools.filter(t => t !== tool) }))
  }, [])

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4 text-emerald-500" />
            Basic Settings
          </CardTitle>
          <CardDescription>Configure the core properties of your agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My AI Agent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="privacy">Privacy</Label>
              <Select value={form.privacy} onValueChange={(v) => setForm(prev => ({ ...prev, privacy: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIVACY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what your agent does..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Framework</Label>
              <Select value={form.framework} onValueChange={(v) => setForm(prev => ({ ...prev, framework: v }))}>
                <SelectTrigger><SelectValue placeholder="Select framework" /></SelectTrigger>
                <SelectContent>
                  {FRAMEWORK_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>LLM Model</Label>
              <Select value={form.llm} onValueChange={(v) => setForm(prev => ({ ...prev, llm: v }))}>
                <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                <SelectContent>
                  {LLM_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm(prev => ({ ...prev, difficulty: v }))}>
                <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={(v) => setForm(prev => ({ ...prev, industry: v }))}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-xs">#</Badge>
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-destructive ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              className="max-w-xs"
            />
            <Button variant="outline" size="sm" onClick={addTag} disabled={!newTag.trim()}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-teal-500" />
            System Prompt
          </CardTitle>
          <CardDescription>Define the behavior and instructions for your agent</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.systemPrompt}
            onChange={(e) => setForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
            placeholder="You are a helpful AI assistant that..."
            className="font-mono text-sm min-h-[200px]"
            rows={12}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Use {'{variable}'} syntax for dynamic prompt template variables.
          </p>
        </CardContent>
      </Card>

      {/* Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCode className="h-4 w-4 text-amber-500" />
            Tools
          </CardTitle>
          <CardDescription>Configure the tools your agent can use</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.tools.map((tool) => (
              <Badge key={tool} variant="secondary" className="gap-1 pr-1">
                {tool}
                <button onClick={() => removeTool(tool)} className="hover:text-destructive ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
            {AVAILABLE_TOOLS.filter(t => !form.tools.includes(t)).map((tool) => (
              <button
                key={tool}
                onClick={() => addTool(tool)}
                className="text-xs px-2 py-1.5 rounded-md border border-dashed border-muted-foreground/30 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-muted-foreground"
              >
                + {tool}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4 text-purple-500" />
            Advanced Settings
          </CardTitle>
          <CardDescription>Raw JSON configuration for agent-specific settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={advancedJson}
            onChange={(e) => {
              setAdvancedJson(e.target.value)
              try {
                JSON.parse(e.target.value)
                setJsonError(null)
              } catch {
                setJsonError('Invalid JSON')
              }
            }}
            className="font-mono text-sm min-h-[120px]"
            rows={8}
          />
          {jsonError && (
            <p className="text-xs text-destructive mt-2">{jsonError}</p>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => {
          setForm({
            name: agent.name,
            description: agent.description,
            framework: agent.framework || '',
            llm: agent.llm || '',
            industry: agent.industry || '',
            difficulty: agent.difficulty || '',
            privacy: agent.privacy,
            tags: agent.tags,
            systemPrompt: agent.systemPrompt || '',
            tools: agent.tools,
          })
          setAdvancedJson(JSON.stringify(agent.configJson || {}, null, 2))
        }}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}

// ─── Prompt Lab Tab ─────────────────────────────────────────────

function PromptLabTab({ agent, onUpdate }: { agent: AgentWorkspaceData; onUpdate: (data: Partial<AgentWorkspaceData>) => void }) {
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt || '')
  const [testMessage, setTestMessage] = useState('')
  const [testResponse, setTestResponse] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [promptHistory, setPromptHistory] = useState<Array<{ id: string; prompt: string; timestamp: string }>>([
    { id: '1', prompt: agent.systemPrompt || 'No system prompt set', timestamp: agent.updatedAt },
  ])
  const [showPreview, setShowPreview] = useState(true)

  const handleTestPrompt = useCallback(async () => {
    if (!testMessage.trim()) return
    setIsTesting(true)
    setTestResponse('')
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: testMessage },
      ]
      const result = await api.ai.chat(messages) as { message: string }
      setTestResponse(result.message || 'No response received.')
    } catch {
      setTestResponse('Error: Could not get a response. Please try again.')
    } finally {
      setIsTesting(false)
    }
  }, [systemPrompt, testMessage])

  const handleOptimize = useCallback(async () => {
    if (!systemPrompt.trim()) {
      toast({ title: 'No prompt to optimize', description: 'Enter a system prompt first.' })
      return
    }
    setIsOptimizing(true)
    try {
      const messages = [
        {
          role: 'user',
          content: `Please optimize the following AI agent system prompt for clarity, effectiveness, and completeness. Return ONLY the optimized prompt, nothing else:\n\n${systemPrompt}`,
        },
      ]
      const result = await api.ai.chat(messages) as { message: string }
      if (result.message) {
        // Save current to history
        setPromptHistory(prev => [
          { id: String(Date.now()), prompt: systemPrompt, timestamp: new Date().toISOString() },
          ...prev,
        ])
        setSystemPrompt(result.message)
        toast({ title: 'Prompt optimized', description: 'Your system prompt has been improved by AI.' })
      }
    } catch {
      toast({ title: 'Optimization failed', description: 'Could not optimize prompt.', variant: 'destructive' })
    } finally {
      setIsOptimizing(false)
    }
  }, [systemPrompt])

  const handleSavePrompt = useCallback(async () => {
    try {
      // Save current to history
      setPromptHistory(prev => [
        { id: String(Date.now()), prompt: systemPrompt, timestamp: new Date().toISOString() },
        ...prev,
      ])
      await api.agents.update(agent.id, { systemPrompt })
      onUpdate({ systemPrompt })
      toast({ title: 'Prompt saved', description: 'System prompt has been updated.' })
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' })
    }
  }, [agent.id, systemPrompt, onUpdate])

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{([^}]+)\}/g)
    return matches ? [...new Set(matches.map(m => m.slice(1, -1)))] : []
  }

  const variables = useMemo(() => extractVariables(systemPrompt), [systemPrompt])

  return (
    <div className="space-y-6">
      {/* Prompt Editor with Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-teal-500" />
                System Prompt Editor
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleOptimize} disabled={isOptimizing}>
                  {isOptimizing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                  Optimize
                </Button>
                <Button size="sm" onClick={handleSavePrompt} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful AI assistant that helps with..."
              className="font-mono text-sm min-h-[300px]"
              rows={16}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {systemPrompt.length} characters
              </p>
              <p className="text-xs text-muted-foreground">
                Use {'{variable}'} for template variables
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview & Variables */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-500" />
                  Live Preview
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                  {showPreview ? 'Hide' : 'Show'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showPreview && (
                <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {systemPrompt || <span className="text-muted-foreground italic">Start typing a system prompt...</span>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Variables */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="h-4 w-4 text-amber-500" />
                Template Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              {variables.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {variables.map((v) => (
                    <Badge key={v} variant="outline" className="font-mono text-xs">
                      {'{'}{v}{'}'}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No template variables found. Use {'{variable_name}'} syntax to add dynamic variables.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Test Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-amber-500" />
            Test Prompt
          </CardTitle>
          <CardDescription>Send a test message to see how your agent responds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTestPrompt()}
              placeholder="Type a test message..."
              className="flex-1"
            />
            <Button onClick={handleTestPrompt} disabled={isTesting || !testMessage.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              {isTesting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
              Send
            </Button>
          </div>
          {testResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap border"
            >
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-muted-foreground">Agent Response</span>
              </div>
              {testResponse}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Prompt History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Prompt History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-64">
            <div className="space-y-3">
              {promptHistory.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2 font-mono">{entry.prompt}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(entry.timestamp)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSystemPrompt(entry.prompt)}
                    className="flex-shrink-0"
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Testing Tab ────────────────────────────────────────────────

interface TestMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

function TestingTab({ agent }: { agent: AgentWorkspaceData }) {
  const [messages, setMessages] = useState<TestMessage[]>([
    {
      id: '1',
      role: 'system',
      content: `Testing session started for "${agent.name}". Send messages to test your agent's responses.`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [testResults, setTestResults] = useState({ passed: 3, failed: 1, total: 4 })
  const [testLogs, setTestLogs] = useState<Array<{ id: string; message: string; level: 'info' | 'success' | 'error'; timestamp: string }>>([
    { id: 'l1', message: 'Test suite initialized', level: 'info', timestamp: new Date(Date.now() - 60000).toISOString() },
    { id: 'l2', message: 'Basic response test: PASSED', level: 'success', timestamp: new Date(Date.now() - 50000).toISOString() },
    { id: 'l3', message: 'Context retention test: PASSED', level: 'success', timestamp: new Date(Date.now() - 40000).toISOString() },
    { id: 'l4', message: 'Tool usage test: PASSED', level: 'success', timestamp: new Date(Date.now() - 30000).toISOString() },
    { id: 'l5', message: 'Error handling test: FAILED', level: 'error', timestamp: new Date(Date.now() - 20000).toISOString() },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isRunningTests, setIsRunningTests] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending) return
    const userMsg: TestMessage = {
      id: String(Date.now()),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsSending(true)

    try {
      const chatMessages = [
        { role: 'system', content: agent.systemPrompt || 'You are a helpful AI assistant.' },
        ...messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: input },
      ]
      const result = await api.ai.chat(chatMessages) as { message: string }
      const assistantMsg: TestMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: result.message || 'No response received.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      const errorMsg: TestMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: 'Error: Could not get a response. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsSending(false)
    }
  }, [input, isSending, agent.systemPrompt, messages])

  const handleRunTests = useCallback(async () => {
    setIsRunningTests(true)
    const testCases = [
      { name: 'Basic response test', delay: 1500 },
      { name: 'Context retention test', delay: 2000 },
      { name: 'Tool invocation test', delay: 1800 },
      { name: 'Error handling test', delay: 1200 },
      { name: 'Prompt adherence test', delay: 1600 },
    ]

    let passed = 0
    let failed = 0

    for (const tc of testCases) {
      await new Promise(resolve => setTimeout(resolve, tc.delay))
      const success = Math.random() > 0.2
      if (success) {
        passed++
        setTestLogs(prev => [...prev, {
          id: String(Date.now()),
          message: `${tc.name}: PASSED`,
          level: 'success',
          timestamp: new Date().toISOString(),
        }])
      } else {
        failed++
        setTestLogs(prev => [...prev, {
          id: String(Date.now()),
          message: `${tc.name}: FAILED`,
          level: 'error',
          timestamp: new Date().toISOString(),
        }])
      }
      setTestResults({ passed, failed, total: passed + failed })
    }

    setIsRunningTests(false)
    toast({
      title: 'Test suite complete',
      description: `${passed} passed, ${failed} failed out of ${passed + failed} tests.`,
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Test Results Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{testResults.passed}</p>
              <p className="text-xs text-muted-foreground">Passed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
              <X className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-600">{testResults.failed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Gauge className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {testResults.total > 0 ? Math.round((testResults.passed / testResults.total) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Pass Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Run Tests Button */}
      <div className="flex gap-3">
        <Button onClick={handleRunTests} disabled={isRunningTests} className="bg-emerald-600 hover:bg-emerald-700">
          {isRunningTests ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
          {isRunningTests ? 'Running Tests...' : 'Run Tests'}
        </Button>
        <Button variant="outline" onClick={() => { setMessages([messages[0]]); setTestLogs([]); setTestResults({ passed: 0, failed: 0, total: 0 }) }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Console */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-500" />
              Test Console
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 min-h-[400px] max-h-[500px] border rounded-lg p-3">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                        <Bot className="h-4 w-4 text-emerald-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white'
                          : msg.role === 'system'
                            ? 'bg-muted/50 text-muted-foreground text-xs italic'
                            : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-emerald-200' : 'text-muted-foreground'}`}>
                        {formatRelativeTime(msg.timestamp)}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex-shrink-0 p-1.5 rounded-md bg-teal-100 dark:bg-teal-900/30">
                        <User className="h-4 w-4 text-teal-600" />
                      </div>
                    )}
                  </div>
                ))}
                {isSending && (
                  <div className="flex gap-2">
                    <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                      <Bot className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="flex gap-2 mt-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a test message..."
                disabled={isSending}
              />
              <Button onClick={handleSend} disabled={isSending || !input.trim()} size="icon" className="bg-emerald-600 hover:bg-emerald-700 flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Logs */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCode className="h-4 w-4 text-amber-500" />
              Test Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="min-h-[400px] max-h-[500px]">
              <div className="space-y-1.5 font-mono text-xs">
                {testLogs.map((log) => (
                  <div key={log.id} className={`flex items-start gap-2 py-1 px-2 rounded ${
                    log.level === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/10' :
                    log.level === 'error' ? 'bg-rose-50 dark:bg-rose-900/10' :
                    'bg-muted/30'
                  }`}>
                    <span className="text-muted-foreground flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className={
                      log.level === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                      log.level === 'error' ? 'text-rose-600 dark:text-rose-400' :
                      'text-muted-foreground'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Deployment Tab ─────────────────────────────────────────────

function DeploymentTab({ agent, onUpdate }: { agent: AgentWorkspaceData; onUpdate: (data: Partial<AgentWorkspaceData>) => void }) {
  const deployHistory = useMemo(() => generateDeployHistory(), [])
  const [selectedEnv, setSelectedEnv] = useState('production')
  const [isDeploying, setIsDeploying] = useState(false)
  const [apiKeys] = useState<Array<{ id: string; name: string; key: string; created: string }>>([
    { id: '1', name: 'Production Key', key: 'huno_pk_a1b2c3d4e5f6g7h8i9j0', created: new Date(Date.now() - 86400000).toISOString() },
    { id: '2', name: 'Development Key', key: 'huno_dk_z9y8x7w6v5u4t3s2r1q0', created: new Date(Date.now() - 172800000).toISOString() },
  ])
  const [deployLogs] = useState<Array<{ id: string; message: string; level: 'info' | 'success' | 'warn' | 'error'; timestamp: string }>>([
    { id: 'dl1', message: 'Building agent container...', level: 'info', timestamp: new Date(Date.now() - 120000).toISOString() },
    { id: 'dl2', message: 'Installing dependencies...', level: 'info', timestamp: new Date(Date.now() - 100000).toISOString() },
    { id: 'dl3', message: 'Running health checks...', level: 'info', timestamp: new Date(Date.now() - 80000).toISOString() },
    { id: 'dl4', message: 'Health check passed', level: 'success', timestamp: new Date(Date.now() - 60000).toISOString() },
    { id: 'dl5', message: 'Agent deployed successfully', level: 'success', timestamp: new Date(Date.now() - 40000).toISOString() },
  ])

  const handleDeploy = useCallback(async () => {
    setIsDeploying(true)
    try {
      // Simulate deploy
      await new Promise(resolve => setTimeout(resolve, 2000))
      const deployUrl = `https://${agent.name.toLowerCase().replace(/\s+/g, '-')}-${selectedEnv}.humain-uno.dev`
      onUpdate({ status: 'deployed', deployUrl, lastDeployedAt: new Date().toISOString() })
      toast({
        title: 'Agent deployed',
        description: `Successfully deployed to ${selectedEnv}.`,
      })
    } catch {
      toast({ title: 'Deploy failed', variant: 'destructive' })
    } finally {
      setIsDeploying(false)
    }
  }, [agent.name, selectedEnv, onUpdate])

  const handleUndeploy = useCallback(async () => {
    setIsDeploying(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      onUpdate({ status: 'active', deployUrl: null })
      toast({ title: 'Agent undeployed', description: 'The agent has been taken offline.' })
    } catch {
      toast({ title: 'Undeploy failed', variant: 'destructive' })
    } finally {
      setIsDeploying(false)
    }
  }, [onUpdate])

  const maskKey = (key: string) => key.slice(0, 10) + '...' + key.slice(-4)

  return (
    <div className="space-y-6">
      {/* Current Deployment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-500" />
            Deployment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              agent.status === 'deployed'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-muted text-muted-foreground'
            }`}>
              <div className={`h-2 w-2 rounded-full ${
                agent.status === 'deployed' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'
              }`} />
              <span className="text-sm font-medium">
                {agent.status === 'deployed' ? 'Live' : 'Not Deployed'}
              </span>
            </div>
            {agent.deployUrl && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <code className="bg-muted px-2 py-1 rounded text-xs">{agent.deployUrl}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { navigator.clipboard.writeText(agent.deployUrl || ''); toast({ title: 'URL copied' }) }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="space-y-2">
              <Label>Environment</Label>
              <Select value={selectedEnv} onValueChange={setSelectedEnv}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              {agent.status === 'deployed' ? (
                <Button variant="outline" onClick={handleUndeploy} disabled={isDeploying} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                  {isDeploying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                  Undeploy
                </Button>
              ) : (
                <Button onClick={handleDeploy} disabled={isDeploying} className="bg-emerald-600 hover:bg-emerald-700">
                  {isDeploying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Rocket className="h-4 w-4 mr-2" />}
                  Deploy
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Deployment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deployHistory.map((dep) => (
              <div key={dep.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                  dep.status === 'running' ? 'bg-emerald-500' :
                  dep.status === 'stopped' ? 'bg-gray-400' :
                  'bg-rose-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{dep.env}</Badge>
                    <Badge variant="secondary" className="text-xs">v{dep.version}</Badge>
                    <Badge className={`text-xs ${
                      dep.status === 'running' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                      dep.status === 'stopped' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                    } border-0`}>
                      {dep.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatRelativeTime(dep.timestamp)}</span>
                    {dep.url && (
                      <>
                        <span>·</span>
                        <code className="truncate">{dep.url}</code>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="h-4 w-4 text-teal-500" />
            Deployment Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-64">
            <div className="space-y-1.5 font-mono text-xs">
              {deployLogs.map((log) => (
                <div key={log.id} className={`flex items-start gap-2 py-1 px-2 rounded ${
                  log.level === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/10' :
                  log.level === 'warn' ? 'bg-amber-50 dark:bg-amber-900/10' :
                  log.level === 'error' ? 'bg-rose-50 dark:bg-rose-900/10' :
                  'bg-muted/30'
                }`}>
                  <span className="text-muted-foreground flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className={
                    log.level === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                    log.level === 'warn' ? 'text-amber-600 dark:text-amber-400' :
                    log.level === 'error' ? 'text-rose-600 dark:text-rose-400' :
                    'text-muted-foreground'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* API Key Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4 text-amber-500" />
            API Keys
          </CardTitle>
          <CardDescription>Manage API keys for accessing your deployed agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <Key className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{apiKey.name}</p>
                  <code className="text-xs text-muted-foreground">{maskKey(apiKey.key)}</code>
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(apiKey.key); toast({ title: 'Key copied' }) }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy key</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-3 w-full" onClick={() => toast({ title: 'New API key generated' })}>
            <Plus className="h-4 w-4 mr-2" />
            Generate New Key
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Analytics Tab ──────────────────────────────────────────────

function AnalyticsTab({ agent }: { agent: AgentWorkspaceData }) {
  const analyticsData = useMemo(() => generateAnalyticsData(), [])

  const totalRequests = analyticsData.reduce((sum, d) => sum + d.requests, 0)
  const avgLatency = Math.round(analyticsData.reduce((sum, d) => sum + d.latency, 0) / analyticsData.length)
  const avgErrorRate = +(analyticsData.reduce((sum, d) => sum + d.errorRate, 0) / analyticsData.length).toFixed(1)
  const totalCost = analyticsData.reduce((sum, d) => sum + d.cost, 0)



  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Weekly Requests" value={totalRequests.toLocaleString()} icon={Activity} trend="up" trendLabel="+8.3%" color="text-emerald-600" />
        <StatCard title="Avg Latency" value={`${avgLatency}ms`} icon={Clock} trend="down" trendLabel="-12ms" color="text-amber-600" />
        <StatCard title="Avg Error Rate" value={`${avgErrorRate}%`} icon={AlertTriangle} trend="up" trendLabel="-0.3%" color="text-rose-600" />
        <StatCard title="Est. Cost" value={`$${totalCost.toFixed(2)}`} icon={Gauge} trend="neutral" trendLabel="7 days" color="text-purple-600" />
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Requests Over Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LazyWorkspaceCharts analyticsData={analyticsData.map(d => ({ date: d.day, requests: d.requests, latency: d.latency, errorRate: d.errorRate }))} />
        </CardContent>
      </Card>

      {/* Cost Estimation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="h-4 w-4 text-purple-500" />
            Cost Estimation
          </CardTitle>
          <CardDescription>Estimated costs based on LLM token usage and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-xs text-muted-foreground">Daily Average</p>
              <p className="text-xl font-bold">${(totalCost / 7).toFixed(3)}</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-xs text-muted-foreground">Monthly Estimate</p>
              <p className="text-xl font-bold">${(totalCost / 7 * 30).toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-xs text-muted-foreground">Yearly Estimate</p>
              <p className="text-xl font-bold">${(totalCost / 7 * 365).toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <p className="font-medium">Cost estimates are approximate</p>
                <p className="mt-1">Actual costs depend on LLM provider pricing, token counts, and request patterns. Based on {agent.llm || 'default'} pricing.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Daily Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Day</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Requests</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Latency</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Errors</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Error Rate</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Cost</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.map((row) => (
                  <tr key={row.day} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3">{row.day}</td>
                    <td className="py-2 px-3 text-right font-mono">{row.requests}</td>
                    <td className="py-2 px-3 text-right font-mono">{row.latency}ms</td>
                    <td className="py-2 px-3 text-right font-mono">{row.errors}</td>
                    <td className="py-2 px-3 text-right font-mono">{row.errorRate}%</td>
                    <td className="py-2 px-3 text-right font-mono">${row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Agent Workspace Component ─────────────────────────────

interface AgentWorkspaceProps {
  agent: AgentWorkspaceData
  onUpdate: (data: Partial<AgentWorkspaceData>) => void
}

export function AgentWorkspace({ agent, onUpdate }: AgentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'configuration', label: 'Configuration', icon: Settings },
    { id: 'prompt-lab', label: 'Prompt Lab', icon: FlaskConical },
    { id: 'testing', label: 'Testing', icon: Terminal },
    { id: 'deployment', label: 'Deployment', icon: Rocket },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Workspace Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/browse')} className="flex-shrink-0">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold truncate">{agent.name}</h2>
                <Badge variant="outline" className="text-xs flex-shrink-0">v{agent.version}</Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              {agent.framework && <Badge variant="secondary" className="text-xs">{agent.framework}</Badge>}
              {agent.llm && <Badge variant="secondary" className="text-xs">{agent.llm}</Badge>}
            </div>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto h-auto p-0 bg-transparent gap-0">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 sm:px-4 py-2.5 text-xs sm:text-sm"
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab agent={agent} onTabChange={setActiveTab} />
            )}
            {activeTab === 'configuration' && (
              <ConfigurationTab agent={agent} onUpdate={onUpdate} />
            )}
            {activeTab === 'prompt-lab' && (
              <PromptLabTab agent={agent} onUpdate={onUpdate} />
            )}
            {activeTab === 'testing' && (
              <TestingTab agent={agent} />
            )}
            {activeTab === 'deployment' && (
              <DeploymentTab agent={agent} onUpdate={onUpdate} />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsTab agent={agent} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AgentWorkspace
