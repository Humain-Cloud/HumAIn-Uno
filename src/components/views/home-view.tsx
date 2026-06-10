'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent, Stats, Category } from '@/lib/types'
import { AgentCard } from '@/components/agents/agent-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Bot,
  Search,
  PlusCircle,
  Sparkles,
  Cpu,
  Building2,
  Layers,
  ArrowRight,
  Code2,
  Workflow,
  Brain,
  MessageSquare,
  BookOpen,
  Zap,
  Globe,
  Database,
  GitBranch,
} from 'lucide-react'

function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const increment = target / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Research': Search,
  'Data Analysis': Database,
  'Customer Support': MessageSquare,
  'Content Creation': BookOpen,
  'Code Generation': Code2,
  'Workflow Automation': Workflow,
  'Sales & Marketing': Globe,
  'Finance': Building2,
}

const frameworks = [
  {
    name: 'LangGraph',
    description: 'Build stateful, multi-actor applications with LLMs. Cycle through graph-based agent workflows.',
    color: 'bg-emerald-500',
    icon: GitBranch,
    tag: 'Most Popular',
  },
  {
    name: 'CrewAI',
    description: 'Orchestrate role-playing autonomous AI agents that work together to accomplish complex tasks.',
    color: 'bg-amber-500',
    icon: Brain,
    tag: 'Collaborative',
  },
  {
    name: 'AutoGen',
    description: 'Enable next-gen LLM applications with multi-agent conversations and flexible conversation patterns.',
    color: 'bg-rose-500',
    icon: MessageSquare,
    tag: 'Microsoft',
  },
  {
    name: 'Agno',
    description: 'Build AI agents with lightning-fast performance and minimal abstractions. Lightweight and efficient.',
    color: 'bg-violet-500',
    icon: Zap,
    tag: 'Fast',
  },
  {
    name: 'LlamaIndex',
    description: 'Connect custom data sources to large language models. Build context-augmented agent applications.',
    color: 'bg-teal-500',
    icon: Database,
    tag: 'RAG Expert',
  },
]

export function HomeView() {
  const { setCurrentView, setSelectedAgentId } = useAppStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [featuredAgents, setFeaturedAgents] = useState<KnowledgeAgent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statsData, agentsData, catsData] = await Promise.all([
          api.stats.get(),
          api.knowledge.list({ page: 1, pageSize: 6 }),
          api.categories.list(),
        ])
        setStats(statsData as Stats)
        setFeaturedAgents((agentsData as any)?.data || agentsData || [])
        setCategories((catsData as any) || [])
      } catch (err) {
        console.error('Failed to load home data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleNav = (view: any) => {
    setCurrentView(view)
    setSelectedAgentId(null)
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMkgydjJoMzR6TTIgMjJoMzR2LTJIMnYyek0yIDEydjJoMzR2LTJIMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Bot className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Discover & Build<br />
              <span className="text-emerald-200">AI Agents</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto mb-8 sm:mb-10">
              Explore 500+ curated AI agents across 5 frameworks. Find the perfect starting point, 
              remix with your own twist, or build from scratch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8 h-12 text-base w-full sm:w-auto"
                onClick={() => handleNav('browse')}
              >
                <Search className="h-5 w-5 mr-2" />
                Browse Agents
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12 text-base w-full sm:w-auto"
                onClick={() => handleNav('wizard')}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Agent
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-950 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </CardContent>
                </Card>
              ))
            ) : stats ? (
              [
                { label: 'Total Agents', value: stats.totalAgents, icon: Bot, color: 'text-emerald-600' },
                { label: 'Frameworks', value: stats.frameworks, icon: Cpu, color: 'text-amber-600' },
                { label: 'Industries', value: stats.topIndustries?.length || 0, icon: Building2, color: 'text-rose-600' },
                { label: 'Categories', value: stats.categories, icon: Layers, color: 'text-violet-600' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                      <div className="text-2xl sm:text-3xl font-bold">
                        <AnimatedCounter target={stat.value} />
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : null}
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-amber-500" />
                Featured Agents
              </h2>
              <p className="text-muted-foreground mt-1">Hand-picked from our knowledge base</p>
            </div>
            <Button variant="outline" className="hidden sm:flex" onClick={() => handleNav('browse')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredAgents.map((agent, i) => (
                <AgentCard key={agent.id} agent={agent} index={i} />
              ))}
            </div>
          )}
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" onClick={() => handleNav('browse')}>
              View All Agents <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Category Cloud */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
              <Layers className="h-6 w-6 text-emerald-600" />
              Explore by Category
            </h2>
            <p className="text-muted-foreground mb-8">Find agents for your specific use case</p>
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat, i) => {
                const IconComp = categoryIcons[cat.name] || Bot
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-md transition-all"
                      onClick={() => {
                        const store = useAppStore.getState()
                        store.setSelectedCategory(cat.id)
                        store.setCurrentView('browse')
                        store.setSelectedAgentId(null)
                        window.scrollTo(0, 0)
                      }}
                    >
                      <CardContent className="p-4 sm:p-5 text-center">
                        <IconComp className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                        <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {cat.agentCount || 0} agents
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Framework Showcase */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
              <Cpu className="h-6 w-6 text-emerald-600" />
              Supported Frameworks
            </h2>
            <p className="text-muted-foreground mb-8">Build agents with the tools you already know</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {frameworks.map((fw, i) => (
              <motion.div
                key={fw.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <Card className="h-full hover:shadow-lg transition-all overflow-hidden">
                  <div className={`h-1 ${fw.color}`} />
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-10 w-10 rounded-lg ${fw.color} flex items-center justify-center`}>
                          <fw.icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg">{fw.name}</h3>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {fw.tag}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{fw.description}</p>
                    <div className="mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-600 hover:text-emerald-700 p-0 h-auto"
                        onClick={() => {
                          const store = useAppStore.getState()
                          store.setSelectedFramework(fw.name.toLowerCase())
                          store.setCurrentView('browse')
                          store.setSelectedAgentId(null)
                          window.scrollTo(0, 0)
                        }}
                      >
                        Browse {fw.name} agents <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              Ready to build your AI agent?
            </h2>
            <p className="text-emerald-100 text-lg mb-8">
              Start from scratch or remix from 500+ curated templates. Deploy in minutes.
            </p>
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8 h-12 text-base"
              onClick={() => handleNav('wizard')}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Your Agent Now
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
