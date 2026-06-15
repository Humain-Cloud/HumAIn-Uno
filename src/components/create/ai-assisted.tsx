'use client'

import { useState, useRef, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sparkles,
  Send,
  Loader2,
  Check,
  X,
  ArrowRight,
  Bot,
  User,
  Wand2,
  RefreshCw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

interface AIAssistedProps {
  onCreated: () => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AgentSpec {
  name: string
  description: string
  category: string
  framework: string
  llm: string
  industry: string
  difficulty: string
  language: string
  tools: string[]
  tags: string[]
  features: string[]
  architecture: string
  promptTemplate: string
  readme: string
}

export function AIAssisted({ onCreated }: AIAssistedProps) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your AI assistant for creating agents. Tell me what kind of agent you'd like to build, and I'll generate a complete specification for you.\n\nFor example: \"I want a customer support agent that can answer FAQs, handle complaints, and escalate issues to human agents.\""
    }
  ])
  const [userInput, setUserInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [spec, setSpec] = useState<AgentSpec | null>(null)
  const [phase, setPhase] = useState<'chat' | 'review'>('chat')
  const [publishing, setPublishing] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editedSpec, setEditedSpec] = useState<AgentSpec | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Load categories
  useEffect(() => {
    api.categories.list().then((data: any) => {
      setCategories(Array.isArray(data) ? data : [])
    }).catch(console.error)
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendMessage = async () => {
    if (!userInput.trim() || generating) return

    const message = userInput.trim()
    setUserInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: message }])
    setGenerating(true)

    try {
      // Use the AI generate-spec endpoint
      const result: any = await api.ai.generateSpec({
        description: message,
        name: '',
        framework: '',
        category: '',
        industry: '',
      })

      const specification = result?.specification || result
      const agentSpec: AgentSpec = {
        name: specification.name || 'Custom Agent',
        description: specification.description || message,
        category: specification.category || 'Automation',
        framework: specification.framework || 'langgraph',
        llm: specification.llm || 'gpt-4o',
        industry: specification.industry || 'General',
        difficulty: specification.difficulty || 'intermediate',
        language: specification.language || 'python',
        tools: specification.tools || [],
        tags: specification.tags || [],
        features: specification.features || [],
        architecture: specification.architecture || '',
        promptTemplate: specification.promptTemplate || '',
        readme: specification.readme || `# ${specification.name || 'Custom Agent'}\n\n${specification.description || message}`,
      }

      setSpec(agentSpec)
      setEditedSpec(agentSpec)

      const featuresText = agentSpec.features.length > 0
        ? `\n\n**Key Features:**\n${agentSpec.features.map(f => `- ${f}`).join('\n')}`
        : ''

      const toolsText = agentSpec.tools.length > 0
        ? `\n\n**Tools:** ${agentSpec.tools.join(', ')}`
        : ''

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Great! I've generated a complete agent specification based on your description. Here's what I came up with:\n\n**${agentSpec.name}**\n\n${agentSpec.description}\n\n**Framework:** ${agentSpec.framework} | **LLM:** ${agentSpec.llm}\n**Category:** ${agentSpec.category} | **Industry:** ${agentSpec.industry}\n**Difficulty:** ${agentSpec.difficulty} | **Language:** ${agentSpec.language}${featuresText}${toolsText}\n\nYou can review and edit this specification, or create the agent as-is. Click "Review & Edit" to proceed!`
      }])
    } catch (err) {
      console.error('AI generation failed:', err)
      // Fallback spec
      const fallbackSpec: AgentSpec = {
        name: 'Custom Agent',
        description: message,
        category: 'Automation',
        framework: 'langgraph',
        llm: 'gpt-4o',
        industry: 'General',
        difficulty: 'intermediate',
        language: 'python',
        tools: [],
        tags: [],
        features: ['AI-powered responses', 'Configurable behavior'],
        architecture: 'Single agent with tool integration',
        promptTemplate: `You are a helpful AI assistant that: ${message}`,
        readme: `# Custom Agent\n\n${message}`,
      }
      setSpec(fallbackSpec)
      setEditedSpec(fallbackSpec)

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've created a basic agent specification for you. You can review and customize it before creating.\n\n**Custom Agent** — ${message}\n\nFramework: LangGraph | LLM: GPT-4o\n\nClick "Review & Edit" to proceed!`
      }])
    } finally {
      setGenerating(false)
    }
  }

  const handleCreate = async () => {
    if (!spec) return
    setPublishing(true)
    try {
      const finalSpec = editMode && editedSpec ? editedSpec : spec
      const cat = categories.find(c =>
        c.name.toLowerCase() === finalSpec.category?.toLowerCase()
      )

      await api.agents.create({
        name: finalSpec.name,
        description: finalSpec.description,
        categoryId: cat?.id || categories[0]?.id,
        privacy: 'PUBLIC',
        source: 'scratch',
        readme: finalSpec.readme || `# ${finalSpec.name}\n\n${finalSpec.description}`,
        code: null,
        tags: finalSpec.tags || [],
        framework: finalSpec.framework,
        llm: finalSpec.llm,
        industry: finalSpec.industry,
        difficulty: finalSpec.difficulty,
        language: finalSpec.language,
      })

      toast({ title: 'Agent created!', description: `${finalSpec.name} has been created successfully.` })
      onCreated()
    } catch (err: any) {
      toast({ title: 'Creation failed', description: err.message || 'Please try again', variant: 'destructive' })
    } finally {
      setPublishing(false)
    }
  }

  const handleRegenerate = async () => {
    if (!spec || generating) return
    setGenerating(true)
    try {
      const result: any = await api.ai.generateSpec({
        description: spec.description,
        name: spec.name,
        framework: spec.framework,
        category: spec.category,
        industry: spec.industry,
      })
      const newSpec = result?.specification || result
      const agentSpec: AgentSpec = {
        ...spec,
        ...newSpec,
        tools: newSpec.tools || spec.tools,
        tags: newSpec.tags || spec.tags,
        features: newSpec.features || spec.features,
        readme: newSpec.readme || spec.readme,
      }
      setSpec(agentSpec)
      setEditedSpec(agentSpec)
      toast({ title: 'Regenerated!', description: 'New specification generated.' })
    } catch {
      toast({ title: 'Regeneration failed', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  const frameworkBadge: Record<string, string> = {
    langgraph: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    crewai: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    autogen: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    agno: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    llamaindex: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-rose-600" />
          AI-Assisted Creation
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Describe what you want and our AI will generate a complete agent specification.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Chat Phase */}
        {phase === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Chat Messages */}
            <Card className="rounded-2xl mb-4">
              <CardContent className="p-4 max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30'
                          : 'bg-rose-100 dark:bg-rose-900/30'
                      }`}>
                        {msg.role === 'user' ? (
                          <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Bot className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        )}
                      </div>
                      <div className={`flex-1 max-w-[85%] rounded-2xl p-3 text-sm ${
                        msg.role === 'user'
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-right'
                          : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </motion.div>
                  ))}
                  {generating && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                          <span className="text-sm text-muted-foreground">Generating specification...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </CardContent>
            </Card>

            {/* Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Describe the agent you want to build..."
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() }}}
                  disabled={generating}
                  className="pr-12"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={generating || !userInput.trim()}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Review button when spec is generated */}
            {spec && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex justify-center"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg px-8"
                  onClick={() => setPhase('review')}
                >
                  Review & Edit <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Review Phase */}
        {phase === 'review' && spec && (
          <motion.div
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Agent Specification</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={generating}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${generating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button
                  variant={editMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                  className={editMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                >
                  <Wand2 className="h-4 w-4 mr-1" />
                  {editMode ? 'Done Editing' : 'Edit'}
                </Button>
              </div>
            </div>

            <Card className="rounded-2xl">
              <CardContent className="p-6 space-y-5">
                {editMode ? (
                  /* Edit Mode */
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={editedSpec?.name || ''}
                          onChange={e => setEditedSpec(prev => prev ? { ...prev, name: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Framework</Label>
                        <Select
                          value={editedSpec?.framework || ''}
                          onValueChange={v => setEditedSpec(prev => prev ? { ...prev, framework: v } : null)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="langgraph">LangGraph</SelectItem>
                            <SelectItem value="crewai">CrewAI</SelectItem>
                            <SelectItem value="autogen">AutoGen</SelectItem>
                            <SelectItem value="agno">Agno</SelectItem>
                            <SelectItem value="llamaindex">LlamaIndex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>LLM Model</Label>
                        <Input
                          value={editedSpec?.llm || ''}
                          onChange={e => setEditedSpec(prev => prev ? { ...prev, llm: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Industry</Label>
                        <Input
                          value={editedSpec?.industry || ''}
                          onChange={e => setEditedSpec(prev => prev ? { ...prev, industry: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select
                          value={editedSpec?.difficulty || 'intermediate'}
                          onValueChange={v => setEditedSpec(prev => prev ? { ...prev, difficulty: v } : null)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select
                          value={editedSpec?.language || 'python'}
                          onValueChange={v => setEditedSpec(prev => prev ? { ...prev, language: v } : null)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={editedSpec?.description || ''}
                        onChange={e => setEditedSpec(prev => prev ? { ...prev, description: e.target.value } : null)}
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>System Prompt</Label>
                      <Textarea
                        value={editedSpec?.promptTemplate || ''}
                        onChange={e => setEditedSpec(prev => prev ? { ...prev, promptTemplate: e.target.value } : null)}
                        className="min-h-[100px] font-mono text-sm"
                      />
                    </div>
                  </>
                ) : (
                  /* View Mode */
                  <>
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold">{spec.name}</h3>
                      <Badge className={frameworkBadge[spec.framework?.toLowerCase()] || 'bg-gray-100 text-gray-700'}>
                        {spec.framework}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{spec.description}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'LLM', value: spec.llm },
                        { label: 'Category', value: spec.category },
                        { label: 'Industry', value: spec.industry },
                        { label: 'Difficulty', value: spec.difficulty },
                      ].map(item => (
                        <div key={item.label} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-medium capitalize">{item.value || 'N/A'}</p>
                        </div>
                      ))}
                    </div>

                    {spec.features?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Features</p>
                        <ul className="space-y-1">
                          {spec.features.map((f, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <Check className="h-3 w-3 text-emerald-600" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {spec.tools?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Tools</p>
                        <div className="flex flex-wrap gap-1.5">
                          {spec.tools.map(tool => (
                            <Badge key={tool} variant="secondary">{tool}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {spec.promptTemplate && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">System Prompt</p>
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-sm font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {spec.promptTemplate}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6">
              <Button variant="outline" onClick={() => setPhase('chat')}>
                <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Back to Chat
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg px-8"
                onClick={handleCreate}
                disabled={publishing}
              >
                {publishing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                ) : (
                  <><Check className="h-4 w-4 mr-2" /> Create Agent</>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
