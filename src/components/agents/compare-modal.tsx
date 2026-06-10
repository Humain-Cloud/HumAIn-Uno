'use client'

import { useState, useEffect, Fragment } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Eye,
  Cpu,
  Globe,
  BarChart3,
  Languages,
  Tag,
  Wrench,
  Trophy,
  Loader2,
  BookOpen,
  User,
  GitCompareArrows,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'

interface CompareAgent {
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
  author: string | null
  isCurated: boolean
  sourceUrl: string | null
  source: string
}

const columnColors = [
  { header: 'from-emerald-500 to-emerald-600', border: 'border-emerald-200 dark:border-emerald-800', light: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { header: 'from-amber-500 to-amber-600', border: 'border-amber-200 dark:border-amber-800', light: 'bg-amber-50 dark:bg-amber-950/20' },
  { header: 'from-rose-500 to-rose-600', border: 'border-rose-200 dark:border-rose-800', light: 'bg-rose-50 dark:bg-rose-950/20' },
  { header: 'from-violet-500 to-violet-600', border: 'border-violet-200 dark:border-violet-800', light: 'bg-violet-50 dark:bg-violet-950/20' },
]

const frameworkColors: Record<string, string> = {
  langgraph: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  crewai: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  autogen: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  agno: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  llamaindex: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
}

const difficultyConfig: Record<string, { value: number; color: string; textColor: string }> = {
  beginner: { value: 33, color: '[&>div]:bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
  intermediate: { value: 66, color: '[&>div]:bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
  advanced: { value: 100, color: '[&>div]:bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400' },
}

type FeatureRow = {
  label: string
  icon: React.ReactNode
  render: (agent: CompareAgent) => React.ReactNode
  compare?: (agents: CompareAgent[]) => number | null
}

function renderFramework(agent: CompareAgent) {
  if (!agent.framework) return <span className="text-xs text-muted-foreground">—</span>
  return <Badge variant="secondary" className={`text-xs ${frameworkColors[(agent.framework || '').toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>{agent.framework}</Badge>
}

function renderDifficulty(agent: CompareAgent) {
  if (!agent.difficulty) return <span className="text-xs text-muted-foreground">—</span>
  const config = difficultyConfig[(agent.difficulty || '').toLowerCase()]
  if (!config) return <span className="text-xs font-medium capitalize">{agent.difficulty}</span>
  return (
    <div className="space-y-1">
      <span className={`text-xs font-medium capitalize ${config.textColor}`}>{agent.difficulty}</span>
      <Progress value={config.value} className={`h-1.5 w-full ${config.color}`} />
    </div>
  )
}

function renderTools(agent: CompareAgent) {
  if (!agent.tools || agent.tools.length === 0) return <span className="text-xs text-muted-foreground">None</span>
  return (
    <div className="flex flex-wrap gap-1">
      {agent.tools.map((tool) => (
        <Badge key={tool} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {tool}
        </Badge>
      ))}
    </div>
  )
}

function renderTags(agent: CompareAgent) {
  if (!agent.tags || agent.tags.length === 0) return <span className="text-xs text-muted-foreground">None</span>
  return (
    <div className="flex flex-wrap gap-1">
      {agent.tags.map((tag) => (
        <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-5">
          {tag}
        </Badge>
      ))}
    </div>
  )
}

function renderSource(agent: CompareAgent) {
  return (
    <Badge variant="secondary" className={`text-xs ${agent.isCurated ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
      {agent.source}
    </Badge>
  )
}

function compareDifficulty(agents: CompareAgent[]): number | null {
  const order: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 }
  let minVal = Infinity
  let winnerIdx: number | null = null
  agents.forEach((a, i) => {
    const val = order[(a.difficulty || '').toLowerCase()] ?? 99
    if (val < minVal) { minVal = val; winnerIdx = i }
  })
  const allSame = agents.every(a => (order[(a.difficulty || '').toLowerCase()] ?? 99) === minVal)
  return allSame ? null : winnerIdx
}

function compareTools(agents: CompareAgent[]): number | null {
  let maxTools = 0
  let winnerIdx: number | null = null
  let hasTie = false
  agents.forEach((a, i) => {
    const count = a.tools?.length || 0
    if (count > maxTools) { maxTools = count; winnerIdx = i; hasTie = false }
    else if (count === maxTools && count > 0) { hasTie = true }
  })
  return hasTie || maxTools === 0 ? null : winnerIdx
}

const featureRows: FeatureRow[] = [
  { label: 'Framework', icon: <Cpu className="h-4 w-4" />, render: renderFramework },
  { label: 'Category', icon: <Globe className="h-4 w-4" />, render: (a) => <Badge variant="outline" className="text-xs">{a.category}</Badge> },
  { label: 'Industry', icon: <BarChart3 className="h-4 w-4" />, render: (a) => a.industry ? <span className="text-xs font-medium">{a.industry}</span> : <span className="text-xs text-muted-foreground">—</span> },
  { label: 'Difficulty', icon: <BarChart3 className="h-4 w-4" />, render: renderDifficulty, compare: compareDifficulty },
  { label: 'Language', icon: <Languages className="h-4 w-4" />, render: (a) => a.language ? <Badge variant="outline" className="text-xs font-mono">{a.language}</Badge> : <span className="text-xs text-muted-foreground">—</span> },
  { label: 'LLM Provider', icon: <Cpu className="h-4 w-4" />, render: (a) => a.llm ? <span className="text-xs font-medium">{a.llm}</span> : <span className="text-xs text-muted-foreground">—</span> },
  { label: 'Tools', icon: <Wrench className="h-4 w-4" />, render: renderTools, compare: compareTools },
  { label: 'Tags', icon: <Tag className="h-4 w-4" />, render: renderTags },
  { label: 'Source', icon: <BookOpen className="h-4 w-4" />, render: renderSource },
  { label: 'Author', icon: <User className="h-4 w-4" />, render: (a) => a.author ? <span className="text-xs font-medium">{a.author}</span> : <span className="text-xs text-muted-foreground">—</span> },
  { label: 'Description', icon: <Globe className="h-4 w-4" />, render: (a) => <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{a.description}</p> },
]

export function CompareModal() {
  const { showCompareModal, setShowCompareModal, compareAgentIds, navigateToAgent } = useAppStore()
  const [agents, setAgents] = useState<CompareAgent[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!showCompareModal || compareAgentIds.length < 2) {
      setAgents([])
      return
    }

    let cancelled = false
    const fetchAgents = async () => {
      setLoading(true)
      try {
        const result = await api.knowledge.compare(compareAgentIds) as { data: CompareAgent[] }
        if (!cancelled) {
          setAgents(result.data || [])
        }
      } catch (err) {
        console.error('Failed to load comparison data:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAgents()
    return () => { cancelled = true }
  }, [showCompareModal, compareAgentIds])

  const handleViewDetails = (id: string) => {
    setShowCompareModal(false)
    navigateToAgent(id)
  }

  // Pre-calculate winners
  const winners: Record<number, number | null> = {}
  if (agents.length >= 2) {
    featureRows.forEach((row, rowIdx) => {
      if (row.compare) {
        winners[rowIdx] = row.compare(agents)
      }
    })
  }

  // Build grid items as a flat array to avoid Fragment-in-map issues
  const gridItems: React.ReactNode[] = []

  // Empty corner cell
  gridItems.push(<div key="corner" />)

  // Agent column headers
  agents.forEach((agent, idx) => {
    const color = columnColors[idx % columnColors.length]
    gridItems.push(
      <motion.div
        key={`header-${agent.id}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.1 }}
        className={`rounded-xl border-2 ${color.border} ${color.light} p-4 text-center`}
      >
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color.header} flex items-center justify-center text-white font-bold text-sm mx-auto mb-2 shadow-md`}>
          {agent.name.charAt(0)}
        </div>
        <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{agent.name}</h3>
        <Button
          size="sm"
          variant="outline"
          className="mt-2 text-xs h-7"
          onClick={() => handleViewDetails(agent.id)}
        >
          <Eye className="h-3 w-3 mr-1" /> View Details
        </Button>
      </motion.div>
    )
  })

  // Feature rows
  featureRows.forEach((row, rowIdx) => {
    const winnerIdx = winners[rowIdx]
    const rowBg = rowIdx % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-900/20' : ''

    // Row label
    gridItems.push(
      <div key={`label-${rowIdx}`} className={`flex items-center gap-2 py-3 px-3 text-sm font-medium text-muted-foreground ${rowBg} rounded-lg`}>
        {row.icon}
        <span>{row.label}</span>
      </div>
    )

    // Row values for each agent
    agents.forEach((agent, agentIdx) => {
      const isWinner = winnerIdx === agentIdx
      gridItems.push(
        <motion.div
          key={`value-${agent.id}-${rowIdx}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 + rowIdx * 0.03 + agentIdx * 0.02 }}
          className={`py-3 px-3 ${rowBg} rounded-lg relative ${isWinner ? 'ring-2 ring-emerald-400/50 dark:ring-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/10' : ''}`}
        >
          {row.render(agent)}
          {isWinner && (
            <div className="absolute top-1 right-1">
              <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center" title="Winner">
                <Trophy className="h-3 w-3 text-white" />
              </div>
            </div>
          )}
        </motion.div>
      )
    })
  })

  // Bottom spacer
  gridItems.push(<div key="bottom-spacer" className="py-3" />)

  // Bottom View Details buttons
  agents.forEach((agent, idx) => {
    gridItems.push(
      <div key={`bottom-${agent.id}`} className="py-3 flex justify-center">
        <Button
          size="sm"
          className={`bg-gradient-to-r ${columnColors[idx % columnColors.length].header} text-white shadow-md h-8`}
          onClick={() => handleViewDetails(agent.id)}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          View Full Details
        </Button>
      </div>
    )
  })

  return (
    <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
      <DialogContent className="max-w-[95vw] lg:max-w-[1200px] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <GitCompareArrows className="h-4 w-4 text-white" />
              </div>
              Compare Agents
              <Badge variant="secondary" className="text-xs ml-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {agents.length} agents
              </Badge>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="ml-3 text-muted-foreground">Loading comparison data...</span>
            </div>
          ) : agents.length < 2 ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              Select at least 2 agents to compare
            </div>
          ) : (
            <div className="p-6">
              <div className="grid gap-4 overflow-x-auto" style={{ gridTemplateColumns: `160px repeat(${agents.length}, 1fr)` }}>
                {gridItems}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
