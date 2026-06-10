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
  Lightbulb,
  Rocket,
  Users,
  Eye,
  Heart,
  Shield,
  Wrench,
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
  'Data Analytics': Database,
  'Customer Service': MessageSquare,
  'Communication': MessageSquare,
  'Marketing': Globe,
  'Code Generation': Code2,
  'Workflow Automation': Workflow,
  'Finance': Building2,
  'Healthcare': Heart,
  'Cybersecurity': Shield,
  'DevOps': Wrench,
}

const frameworks = [
  {
    name: 'LangGraph',
    description: 'Build stateful, multi-actor applications with LLMs. Cycle through graph-based agent workflows.',
    color: 'from-emerald-500 to-emerald-600',
    shadowColor: 'shadow-emerald-200 dark:shadow-emerald-900/30',
    icon: GitBranch,
    tag: 'Most Popular',
    agents: 18,
  },
  {
    name: 'CrewAI',
    description: 'Orchestrate role-playing autonomous AI agents that work together to accomplish complex tasks.',
    color: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-200 dark:shadow-amber-900/30',
    icon: Brain,
    tag: 'Collaborative',
    agents: 22,
  },
  {
    name: 'AutoGen',
    description: 'Enable next-gen LLM applications with multi-agent conversations and flexible conversation patterns.',
    color: 'from-rose-500 to-pink-500',
    shadowColor: 'shadow-rose-200 dark:shadow-rose-900/30',
    icon: MessageSquare,
    tag: 'Microsoft',
    agents: 28,
  },
  {
    name: 'Agno',
    description: 'Build AI agents with lightning-fast performance and minimal abstractions. Lightweight and efficient.',
    color: 'from-violet-500 to-purple-500',
    shadowColor: 'shadow-violet-200 dark:shadow-violet-900/30',
    icon: Zap,
    tag: 'Fast',
    agents: 17,
  },
  {
    name: 'LlamaIndex',
    description: 'Connect custom data sources to large language models. Build context-augmented agent applications.',
    color: 'from-teal-500 to-cyan-500',
    shadowColor: 'shadow-teal-200 dark:shadow-teal-900/30',
    icon: Database,
    tag: 'RAG Expert',
    agents: 1,
  },
]

const howItWorks = [
  {
    step: 1,
    icon: Lightbulb,
    title: 'Describe Your Problem',
    description: 'Tell our AI assistant what challenge your agent should solve in plain language.',
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    step: 2,
    icon: Sparkles,
    title: 'Get Smart Suggestions',
    description: 'Our AI scans 500+ proven agents to recommend the best starting point and framework.',
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    step: 3,
    icon: Code2,
    title: 'Remix & Customize',
    description: 'Fork an existing agent or build from scratch with AI-generated code scaffolding.',
    color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  },
  {
    step: 4,
    icon: Rocket,
    title: 'Publish & Share',
    description: 'Deploy your agent publicly or keep it private. Get stars and feedback from the community.',
    color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
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
        // Parse the agents data
        const rawAgents = (agentsData as any)?.data || agentsData || []
        const parsed = rawAgents.map((a: any) => ({
          ...a,
          tools: typeof a.tools === 'string' ? JSON.parse(a.tools || '[]') : a.tools || [],
          models: typeof a.models === 'string' ? JSON.parse(a.models || '[]') : a.models || [],
          tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags || [],
        }))
        setFeaturedAgents(parsed)
        setCategories(Array.isArray(catsData) ? catsData : [])
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
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
        {/* Animated background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-300/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-100 text-sm mb-8"
            >
              <Sparkles className="h-4 w-4" />
              Powered by 500+ curated AI agent projects
            </motion.div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Discover & Build<br />
              <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
                AI Agents
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100/90 max-w-2xl mx-auto mb-10 leading-relaxed">
              Explore 500+ curated AI agents across 5 frameworks. Find the perfect starting point, 
              remix with your own twist, or build from scratch with AI assistance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8 h-13 text-base w-full sm:w-auto shadow-lg shadow-emerald-900/20 rounded-xl"
                onClick={() => handleNav('browse')}
              >
                <Search className="h-5 w-5 mr-2" />
                Browse Agents
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-13 text-base w-full sm:w-auto backdrop-blur-sm rounded-xl"
                onClick={() => handleNav('wizard')}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Agent
              </Button>
            </div>

            {/* Quick stats under hero */}
            {!loading && stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 flex items-center justify-center gap-6 sm:gap-10 text-emerald-100/80 text-sm"
              >
                <span className="flex items-center gap-1.5">
                  <Bot className="h-4 w-4" /> {stats.totalAgents}+ Agents
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-4 w-4" /> {stats.frameworks} Frameworks
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Open Source
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-14 sm:py-18 bg-white dark:bg-gray-950 border-b relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </CardContent>
                </Card>
              ))
            ) : stats ? (
              [
                { label: 'Total Agents', value: stats.totalAgents, icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { label: 'Frameworks', value: stats.frameworks, icon: Cpu, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                { label: 'Industries', value: stats.industries || stats.topIndustries?.length || 0, icon: Building2, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                { label: 'Categories', value: stats.categories, icon: Layers, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 sm:p-6 text-center">
                      <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${stat.bg} mb-3`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold tracking-tight">
                        <AnimatedCounter target={stat.value} />
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : null}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From idea to deployed AI agent in four simple steps
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-3 right-3 text-6xl font-black text-gray-100 dark:text-gray-800 select-none">
                    {item.step}
                  </div>
                  <CardContent className="p-6 pt-8 relative">
                    <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl mb-4 ${item.color}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                </div>
                Featured Agents
              </h2>
              <p className="text-muted-foreground mt-2 ml-[52px]">Hand-picked from our knowledge base</p>
            </div>
            <Button variant="outline" className="hidden sm:flex rounded-lg" onClick={() => handleNav('browse')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <Skeleton className="h-4 w-3/4 mb-3" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3 mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredAgents.map((agent, i) => (
                <AgentCard key={agent.id} agent={agent} index={i} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" className="rounded-lg" onClick={() => handleNav('browse')}>
              View All Agents <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Category Cloud */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Explore by Category</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Find agents for your specific use case and industry</p>
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categories.filter(c => (c.agentCount || 0) > 0).slice(0, 10).map((cat, i) => {
                const IconComp = categoryIcons[cat.name] || Bot
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.04, y: -2 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-all border-0 shadow-sm overflow-hidden group"
                      onClick={() => {
                        const store = useAppStore.getState()
                        store.setSelectedCategory(cat.id)
                        store.setCurrentView('browse')
                        store.setSelectedAgentId(null)
                        window.scrollTo(0, 0)
                      }}
                    >
                      <CardContent className="p-5 text-center">
                        <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 mb-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                          <IconComp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground font-medium">
                          {cat.agentCount || 0} agents
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
          <div className="mt-8 text-center">
            <Button variant="outline" className="rounded-lg" onClick={() => handleNav('browse')}>
              <Layers className="h-4 w-4 mr-2" /> View All Categories
            </Button>
          </div>
        </div>
      </section>

      {/* Framework Showcase */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Supported Frameworks</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Build agents with the tools you already know and love</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {frameworks.map((fw, i) => (
              <motion.div
                key={fw.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <Card className="h-full hover:shadow-xl transition-all overflow-hidden border-0 shadow-sm">
                  <div className={`h-1.5 bg-gradient-to-r ${fw.color}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${fw.color} flex items-center justify-center shadow-md ${fw.shadowColor}`}>
                          <fw.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{fw.name}</h3>
                          <span className="text-xs text-muted-foreground">{fw.agents} agents</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {fw.tag}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{fw.description}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-0 h-auto font-medium"
                      onClick={() => {
                        const store = useAppStore.getState()
                        store.setSelectedFramework(fw.name.toLowerCase())
                        store.setCurrentView('browse')
                        store.setSelectedAgentId(null)
                        window.scrollTo(0, 0)
                      }}
                    >
                      Browse {fw.name} agents <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800" />
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-emerald-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-teal-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Ready to build your AI agent?
            </h2>
            <p className="text-emerald-100 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
              Start from scratch or remix from 500+ curated templates. Deploy in minutes with AI assistance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8 h-13 text-base shadow-lg shadow-emerald-900/20 rounded-xl"
                onClick={() => handleNav('wizard')}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Your Agent Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-13 text-base rounded-xl"
                onClick={() => handleNav('browse')}
              >
                <Eye className="h-5 w-5 mr-2" />
                Explore Gallery
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
