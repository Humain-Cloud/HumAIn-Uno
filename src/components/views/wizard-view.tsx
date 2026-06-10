'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { useRequireAuth } from '@/components/auth/auth-modal'
import type { KnowledgeAgent, Category, AISuggestion } from '@/lib/types'
import { AgentCard } from '@/components/agents/agent-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Search,
  FileCode,
  Settings,
  Eye,
  Loader2,
  PlusCircle,
  Bot,
  X,
  Lightbulb,
  Upload,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

const STEPS = [
  { title: 'Problem', description: 'What problem does your agent solve?', icon: Lightbulb },
  { title: 'Starting Point', description: 'Choose a starting point', icon: Upload },
  { title: 'Specifications', description: 'Define your agent details', icon: Settings },
  { title: 'Code', description: 'Write your agent code', icon: FileCode },
  { title: 'Publish', description: 'Review and publish', icon: Eye },
]

export function WizardView() {
  const { wizardStep, setWizardStep, wizardData, setWizardData, setCurrentView, setSelectedAgentId } = useAppStore()
  const { requireAuth, isAuthenticated } = useRequireAuth()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [knowledgeSearch, setKnowledgeSearch] = useState('')
  const [knowledgeResults, setKnowledgeResults] = useState<KnowledgeAgent[]>([])
  const [knowledgeLoading, setKnowledgeLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    api.categories.list().then((data: any) => {
      setCategories(Array.isArray(data) ? data : [])
    }).catch(console.error)
  }, [])

  // Search knowledge base for remix
  useEffect(() => {
    if (wizardStep !== 1 || !knowledgeSearch.trim()) {
      if (wizardStep === 1 && !knowledgeSearch.trim()) {
        // Load default agents
        api.knowledge.list({ page: 1, pageSize: 12 }).then((data: any) => {
          setKnowledgeResults(data?.data || data || [])
        }).catch(console.error)
      }
      return
    }

    const timer = setTimeout(async () => {
      setKnowledgeLoading(true)
      try {
        const data: any = await api.knowledge.search({ q: knowledgeSearch, pageSize: 12 })
        setKnowledgeResults(data?.data || data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setKnowledgeLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [knowledgeSearch, wizardStep])

  const handleAISuggest = async () => {
    if (!wizardData.problem?.trim()) return
    setAiLoading(true)
    try {
      const suggestion: any = await api.ai.suggest(wizardData.problem)
      setAiSuggestions([suggestion])
      // Auto-fill some fields
      if (suggestion.name) setWizardData({ suggestedName: suggestion.name })
      if (suggestion.framework) setWizardData({ framework: suggestion.framework })
      if (suggestion.category) setWizardData({ suggestedCategory: suggestion.category })
      if (suggestion.tools) setWizardData({ suggestedTools: suggestion.tools })
    } catch (err) {
      console.error('AI suggestion failed:', err)
      toast({ title: 'AI suggestion failed', description: 'Please try again or fill in manually', variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  const handleRemixAgent = (agent: KnowledgeAgent) => {
    setWizardData({
      name: `${agent.name} (Remix)`,
      description: agent.description,
      code: agent.codeSnippet || '',
      readme: agent.readme || '',
      framework: agent.framework || '',
      category: agent.category,
      source: 'fork',
      parentId: agent.id,
      difficulty: agent.difficulty || '',
      industry: agent.industry || '',
      language: agent.language || 'python',
    })
    setWizardStep(2)
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    const tags = [...(wizardData.tags || []), tagInput.trim()]
    setWizardData({ tags })
    setTagInput('')
  }

  const handleRemoveTag = (tag: string) => {
    setWizardData({ tags: (wizardData.tags || []).filter((t: string) => t !== tag) })
  }

  const handlePublish = async () => {
    if (!requireAuth()) return

    setPublishing(true)
    try {
      const cat = categories.find(c => c.name === wizardData.category || c.id === wizardData.category)
      const result: any = await api.agents.create({
        name: wizardData.name,
        description: wizardData.description,
        categoryId: cat?.id || wizardData.category || categories[0]?.id,
        privacy: wizardData.privacy || 'PUBLIC',
        source: wizardData.source || 'scratch',
        parentId: wizardData.parentId,
        readme: wizardData.readme || `# ${wizardData.name}\n\n${wizardData.description || ''}`,
        code: wizardData.code,
        tags: wizardData.tags || [],
        framework: wizardData.framework,
        llm: wizardData.llm,
        industry: wizardData.industry,
        difficulty: wizardData.difficulty,
        language: wizardData.language || 'python',
      })

      toast({ title: 'Agent published!', description: `${wizardData.name} is now live` })

      // Navigate to the new agent
      if (result?.id) {
        setSelectedAgentId(result.id)
        setCurrentView('detail')
      } else {
        setCurrentView('dashboard')
        setSelectedAgentId(null)
      }
    } catch (err: any) {
      toast({ title: 'Publish failed', description: err.message || 'Please try again', variant: 'destructive' })
    } finally {
      setPublishing(false)
    }
  }

  const canGoNext = () => {
    switch (wizardStep) {
      case 0: return true // problem is optional
      case 1: return true // starting point is optional
      case 2: return !!(wizardData.name && wizardData.category)
      case 3: return true
      case 4: return !!(wizardData.name && wizardData.description)
      default: return true
    }
  }

  const progress = ((wizardStep + 1) / STEPS.length) * 100

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => {
          setCurrentView('home')
          setSelectedAgentId(null)
        }}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Cancel
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Create Agent</h1>
        <p className="text-sm text-muted-foreground mt-1">{STEPS[wizardStep].description}</p>
        <Progress value={progress} className="mt-4 h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8 relative">
        {/* Gradient connecting line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 mx-10 sm:mx-12 z-0">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(wizardStep / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        {STEPS.map((step, i) => (
          <div key={i} className="flex flex-col items-center relative z-10">
            <div
              className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all will-change-transform ${
                i < wizardStep
                  ? 'bg-emerald-600 text-white'
                  : i === wizardStep
                  ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < wizardStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-[10px] sm:text-xs mt-1 ${
              i === wizardStep ? 'text-emerald-700 font-medium' : 'text-muted-foreground'
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={wizardStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Step 0: Problem */}
          {wizardStep === 0 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    What problem does your agent solve?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Describe what you want your agent to do in natural language. Our AI will suggest the best approach.
                  </p>
                </div>
                <Textarea
                  placeholder="e.g., I need an agent that can analyze customer support tickets, categorize them by urgency, and draft response templates..."
                  className="min-h-[120px]"
                  value={wizardData.problem || ''}
                  onChange={(e) => setWizardData({ problem: e.target.value })}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAISuggest}
                  disabled={!wizardData.problem?.trim() || aiLoading}
                >
                  {aiLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Getting AI suggestions...</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2 text-amber-500" /> Get AI Suggestions</>
                  )}
                </Button>

                {aiSuggestions.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h4 className="text-sm font-semibold">AI Suggestions</h4>
                    {aiSuggestions.map((suggestion, i) => (
                      <Card key={i} className="border-emerald-200 bg-emerald-50/50 gradient-border shimmer">
                        <CardContent className="p-4">
                          <h5 className="font-medium text-sm">{suggestion.name}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {suggestion.framework && (
                              <Badge variant="secondary" className="text-[10px]">{suggestion.framework}</Badge>
                            )}
                            {suggestion.category && (
                              <Badge variant="outline" className="text-[10px]">{suggestion.category}</Badge>
                            )}
                            {suggestion.tools?.map((tool: string) => (
                              <Badge key={tool} variant="outline" className="text-[10px]">{tool}</Badge>
                            ))}
                          </div>
                          {suggestion.codeScaffold && (
                            <pre className="mt-3 p-2 bg-gray-900 text-gray-100 rounded text-[10px] overflow-x-auto max-h-32">
                              {suggestion.codeScaffold.slice(0, 500)}
                            </pre>
                          )}
                          <Button
                            size="sm"
                            className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => {
                              setWizardData({
                                name: suggestion.name,
                                description: suggestion.description,
                                framework: suggestion.framework,
                                category: suggestion.category,
                                suggestedTools: suggestion.tools,
                                code: suggestion.codeScaffold || '',
                                llm: suggestion.llm,
                              })
                              setWizardStep(2)
                            }}
                          >
                            Use This Suggestion <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 1: Starting Point */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${wizardData.source !== 'fork' ? 'ring-2 ring-emerald-600' : 'hover:shadow-md'}`}
                  onClick={() => setWizardData({ source: 'scratch', parentId: undefined })}
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                      <PlusCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold mb-1">From Scratch</h3>
                    <p className="text-xs text-muted-foreground">Start with a blank template</p>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all ${wizardData.source === 'fork' ? 'ring-2 ring-emerald-600' : 'hover:shadow-md'}`}
                  onClick={() => setWizardData({ source: 'fork' })}
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold mb-1">Remix from Knowledge Base</h3>
                    <p className="text-xs text-muted-foreground">Start from an existing agent</p>
                  </CardContent>
                </Card>
              </div>

              {wizardData.source === 'fork' && (
                <div>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search knowledge base..."
                      className="pl-9"
                      value={knowledgeSearch}
                      onChange={(e) => setKnowledgeSearch(e.target.value)}
                    />
                  </div>
                  {knowledgeLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                      {knowledgeResults.map((agent) => (
                        <div key={agent.id} className="relative group">
                          <AgentCard agent={agent} viewMode="grid" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleRemixAgent(agent)}>
                              Use as Template
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Specifications */}
          {wizardStep === 2 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="agent-name">Agent Name *</Label>
                    <Input
                      id="agent-name"
                      placeholder="My Awesome Agent"
                      value={wizardData.name || ''}
                      onChange={(e) => setWizardData({ name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={wizardData.category || ''}
                      onValueChange={(v) => setWizardData({ category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Framework</Label>
                    <Select
                      value={wizardData.framework || ''}
                      onValueChange={(v) => setWizardData({ framework: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="langgraph">LangGraph</SelectItem>
                        <SelectItem value="crewai">CrewAI</SelectItem>
                        <SelectItem value="autogen">AutoGen</SelectItem>
                        <SelectItem value="agno">Agno</SelectItem>
                        <SelectItem value="llamaindex">LlamaIndex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="agent-desc">Description</Label>
                    <Textarea
                      id="agent-desc"
                      placeholder="Describe what your agent does..."
                      value={wizardData.description || ''}
                      onChange={(e) => setWizardData({ description: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select
                      value={wizardData.industry || ''}
                      onValueChange={(v) => setWizardData({ industry: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="ecommerce">E-Commerce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={wizardData.difficulty || ''}
                      onValueChange={(v) => setWizardData({ difficulty: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>LLM Provider</Label>
                    <Input
                      placeholder="e.g., gpt-4o, claude-3.5"
                      value={wizardData.llm || ''}
                      onChange={(e) => setWizardData({ llm: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={wizardData.language || 'python'}
                      onValueChange={(v) => setWizardData({ language: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                    {wizardData.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {wizardData.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)}>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Code */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agent Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="# Write your agent code here...&#10;&#10;from langchain.chat_models import ChatOpenAI&#10;from langgraph.graph import StateGraph&#10;&#10;# Define your agent logic..."
                    className="font-mono text-sm min-h-[300px] bg-gray-950 text-gray-100 border-gray-800 relative"
                    value={wizardData.code || ''}
                    onChange={(e) => setWizardData({ code: e.target.value })}
                  />
                  {/* Gradient overlay for "scroll for more" hint */}
                  <div className="h-8 bg-gradient-to-t from-gray-950 to-transparent -mt-8 relative pointer-events-none" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Prompt Template (optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Define the system prompt or template your agent uses..."
                    className="min-h-[120px]"
                    value={wizardData.promptTemplate || ''}
                    onChange={(e) => setWizardData({ promptTemplate: e.target.value })}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">README (Markdown)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={`# ${wizardData.name || 'My Agent'}\n\n## Description\n${wizardData.description || ''}\n\n## Usage\nInstructions on how to use this agent...`}
                    className="min-h-[150px] font-mono text-sm"
                    value={wizardData.readme || ''}
                    onChange={(e) => setWizardData({ readme: e.target.value })}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Review & Publish */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Review Your Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Name</span>
                      <p className="font-medium">{wizardData.name || 'Untitled Agent'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Category</span>
                      <p className="font-medium">{wizardData.category || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Framework</span>
                      <p className="font-medium">{wizardData.framework || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Difficulty</span>
                      <p className="font-medium capitalize">{wizardData.difficulty || 'Not set'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-xs text-muted-foreground">Description</span>
                      <p className="text-sm">{wizardData.description || 'No description'}</p>
                    </div>
                    {wizardData.tags?.length > 0 && (
                      <div className="sm:col-span-2">
                        <span className="text-xs text-muted-foreground">Tags</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {wizardData.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {wizardData.code && (
                      <div className="sm:col-span-2">
                        <span className="text-xs text-muted-foreground">Code</span>
                        <pre className="mt-1 p-3 bg-gray-950 text-gray-100 rounded text-xs overflow-x-auto max-h-32">
                          {wizardData.code.slice(0, 300)}{wizardData.code.length > 300 ? '...' : ''}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'PUBLIC', label: 'Public', desc: 'Visible to everyone', icon: '🌐' },
                      { value: 'UNLISTED', label: 'Unlisted', desc: 'Only via direct link', icon: '🔗' },
                      { value: 'PRIVATE', label: 'Private', desc: 'Only you can see', icon: '🔒' },
                    ].map((option) => (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all will-change-transform ${
                          wizardData.privacy === option.value
                            ? 'ring-2 ring-emerald-600 bg-emerald-50/50 gradient-border'
                            : 'hover:shadow-md'
                        }`
                        }
                        onClick={() => setWizardData({ privacy: option.value })}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <h4 className="font-semibold text-sm">{option.label}</h4>
                          <p className="text-xs text-muted-foreground">{option.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Publishing...</>
                ) : (
                  <><Check className="h-5 w-5 mr-2" /> Publish Agent</>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setWizardStep(Math.max(0, wizardStep - 1))}
          disabled={wizardStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {wizardStep < STEPS.length - 1 && (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setWizardStep(wizardStep + 1)}
            disabled={!canGoNext()}
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
