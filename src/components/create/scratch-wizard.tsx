'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
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
  Loader2,
  AlertCircle,
  X,
  Paintbrush,
  Settings2,
  MessageSquare,
  Eye,
  Cpu,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

interface ScratchWizardProps {
  onCreated: () => void
}

const STEPS = [
  { title: 'Basic Info', description: 'Name, description, and categorization', icon: Paintbrush },
  { title: 'Framework & Model', description: 'Choose your tech stack', icon: Cpu },
  { title: 'Agent Configuration', description: 'System prompt, tools, and behavior', icon: Settings2 },
  { title: 'Review & Create', description: 'Review all settings and create', icon: Eye },
]

interface FormData {
  name: string
  description: string
  category: string
  industry: string
  difficulty: string
  language: string
  framework: string
  llm: string
  systemPrompt: string
  tools: string[]
  tags: string[]
  privacy: string
  code: string
}

const initialFormData: FormData = {
  name: '',
  description: '',
  category: '',
  industry: '',
  difficulty: 'intermediate',
  language: 'python',
  framework: '',
  llm: '',
  systemPrompt: '',
  tools: [],
  tags: [],
  privacy: 'PUBLIC',
  code: '',
}

export function ScratchWizard({ onCreated }: ScratchWizardProps) {
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [categories, setCategories] = useState<any[]>([])
  const [llmModels, setLlmModels] = useState<any[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [modelsLoading, setModelsLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [toolInput, setToolInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load categories
  useEffect(() => {
    api.categories.list().then((data: any) => {
      setCategories(Array.isArray(data) ? data : [])
      setCategoriesLoading(false)
    }).catch(() => setCategoriesLoading(false))
  }, [])

  // Load LLM models when step 1 is reached
  useEffect(() => {
    if (step >= 1 && llmModels.length === 0) {
      setModelsLoading(true)
      fetch('/api/llm-models?pageSize=50&sort=rating&userSelectable=true')
        .then(res => res.json())
        .then(data => {
          const models = data?.models || []
          setLlmModels(models)
        })
        .catch(console.error)
        .finally(() => setModelsLoading(false))
    }
  }, [step, llmModels.length])

  const updateField = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for that field
    setErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {}
    if (s === 0) {
      if (!formData.name.trim() || formData.name.trim().length < 3) {
        newErrors.name = 'Agent name must be at least 3 characters'
      }
      if (!formData.description.trim() || formData.description.trim().length < 10) {
        newErrors.description = 'Description must be at least 10 characters'
      }
      if (!formData.category) {
        newErrors.category = 'Please select a category'
      }
    }
    if (s === 1) {
      if (!formData.framework) {
        newErrors.framework = 'Please select a framework'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 0))
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    if (!formData.tags.includes(tagInput.trim())) {
      updateField('tags', [...formData.tags, tagInput.trim()])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tag: string) => {
    updateField('tags', formData.tags.filter(t => t !== tag))
  }

  const handleAddTool = () => {
    if (!toolInput.trim()) return
    if (!formData.tools.includes(toolInput.trim())) {
      updateField('tools', [...formData.tools, toolInput.trim()])
    }
    setToolInput('')
  }

  const handleRemoveTool = (tool: string) => {
    updateField('tools', formData.tools.filter(t => t !== tool))
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const cat = categories.find(c => c.id === formData.category || c.name === formData.category)
      const readme = `# ${formData.name}\n\n${formData.description}\n\n## Configuration\n\n- **Framework**: ${formData.framework}\n- **LLM**: ${formData.llm || 'Not specified'}\n- **Language**: ${formData.language}\n- **Difficulty**: ${formData.difficulty}\n- **Industry**: ${formData.industry || 'General'}\n\n## System Prompt\n\n${formData.systemPrompt || 'No system prompt defined.'}\n\n## Tools\n\n${formData.tools.length > 0 ? formData.tools.map(t => `- ${t}`).join('\n') : 'No tools configured.'}\n\n## Tags\n\n${formData.tags.length > 0 ? formData.tags.map(t => `\`${t}\``).join(', ') : 'No tags'}\n`

      const result: any = await api.agents.create({
        name: formData.name,
        description: formData.description,
        categoryId: cat?.id || formData.category || categories[0]?.id,
        privacy: formData.privacy,
        source: 'scratch',
        readme,
        code: formData.code || null,
        tags: formData.tags,
        framework: formData.framework,
        llm: formData.llm,
        industry: formData.industry,
        difficulty: formData.difficulty,
        language: formData.language,
      })

      toast({ title: 'Agent created!', description: `${formData.name} has been created successfully.` })
      onCreated()
    } catch (err: any) {
      toast({ title: 'Creation failed', description: err.message || 'Please try again', variant: 'destructive' })
    } finally {
      setPublishing(false)
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  // Generate scaffolded code based on framework
  const generateCode = (): string => {
    const fw = formData.framework
    const name = formData.name.replace(/[^a-zA-Z0-9]/g, '') || 'MyAgent'
    const llm = formData.llm || 'gpt-4o'

    switch (fw) {
      case 'langgraph':
        return `from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class ${name}State(TypedDict):
    input: str
    output: str
    messages: Annotated[list, operator.add]

def process_input(state: ${name}State) -> dict:
    """Process the input and generate a response."""
    return {"output": "Response generated", "messages": ["Processing complete"]}

workflow = StateGraph(${name}State)
workflow.add_node("process", process_input)
workflow.add_edge("__start__", "process")
workflow.add_edge("process", END)

app = workflow.compile()`

      case 'crewai':
        return `from crewai import Agent, Task, Crew, Process

${name}_agent = Agent(
    role="${formData.name}",
    goal="${formData.description}",
    backstory="An expert AI agent designed for specific tasks",
    verbose=True,
    allow_delegation=False,
    llm="${llm}",
)

main_task = Task(
    description="Execute the main workflow",
    agent=${name}_agent,
    expected_output="Completed task result",
)

crew = Crew(
    agents=[${name}_agent],
    tasks=[main_task],
    process=Process.sequential,
)

result = crew.kickoff()`

      case 'autogen':
        return `import autogen

config_list = autogen.config_list_from_json("OAI_CONFIG_LIST")
llm_config = {"config_list": config_list, "timeout": 120}

${name}_agent = autogen.AssistantAgent(
    name="${name}",
    llm_config=llm_config,
    system_message="""${formData.systemPrompt || `You are ${formData.name}. ${formData.description}`}""",
)

user_proxy = autogen.UserProxyAgent(
    name="User",
    human_input_mode="TERMINATE",
    max_consecutive_auto_reply=5,
)

user_proxy.initiate_chat(${name}_agent, message="Hello!")`

      case 'agno':
        return `from agno.agent import Agent
from agno.models.openai import OpenAIChat

${name}_agent = Agent(
    name="${name}",
    model=OpenAIChat(id="${llm}"),
    instructions=[
        "${formData.systemPrompt || formData.description}",
        "Always provide thorough and helpful responses.",
    ],
    show_tool_calls=True,
    markdown=True,
)

${name}_agent.print_response("Hello! How can you help me today?")`

      case 'llamaindex':
        return `from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.openai import OpenAI
from llama_index.core.agent import ReActAgent

Settings.llm = OpenAI(model="${llm}")

documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

agent = ReActAgent.from_tools(
    [],
    llm=OpenAI(model="${llm}"),
    verbose=True,
)

response = agent.chat("Hello!")`

      default:
        return `# ${formData.name}\n# Framework: ${fw}\n# LLM: ${llm}\n\n# TODO: Implement your agent logic here`
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">From Scratch</h2>
            <p className="text-sm text-muted-foreground mt-1">{STEPS[step].description}</p>
          </div>
          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
            {Math.round(progress)}% complete
          </Badge>
        </div>
        <Progress value={progress} className="mt-4 h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                i === step
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : i < step
                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'text-muted-foreground'
              }`}
            >
              {i < step ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <s.icon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{s.title}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-6 ${i < step ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <Card className="rounded-2xl">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1">
                    Agent Name *
                    {errors.name && (
                      <span className="text-rose-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.name}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="name"
                    placeholder="My Awesome Agent"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    className={errors.name ? 'border-rose-300' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-1">
                    Description *
                    {errors.description && (
                      <span className="text-rose-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.description}
                      </span>
                    )}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your agent does in detail..."
                    value={formData.description}
                    onChange={e => updateField('description', e.target.value)}
                    className={`min-h-[100px] ${errors.description ? 'border-rose-300' : ''}`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Category *
                      {errors.category && (
                        <span className="text-rose-500 text-xs">{errors.category}</span>
                      )}
                    </Label>
                    {categoriesLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        value={formData.category}
                        onValueChange={v => updateField('category', v)}
                      >
                        <SelectTrigger className={errors.category ? 'border-rose-300' : ''}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={v => updateField('industry', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="ecommerce">E-Commerce</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={v => updateField('difficulty', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
                      value={formData.language}
                      onValueChange={v => updateField('language', v)}
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Framework & Model */}
          {step === 1 && (
            <div className="space-y-6">
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Framework</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {errors.framework && (
                    <p className="text-rose-500 text-xs mb-3 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.framework}
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { id: 'langgraph', label: 'LangGraph', color: 'emerald' },
                      { id: 'crewai', label: 'CrewAI', color: 'amber' },
                      { id: 'autogen', label: 'AutoGen', color: 'rose' },
                      { id: 'agno', label: 'Agno', color: 'violet' },
                      { id: 'llamaindex', label: 'LlamaIndex', color: 'teal' },
                    ].map(fw => (
                      <button
                        key={fw.id}
                        onClick={() => updateField('framework', fw.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all text-center hover:shadow-md ${
                          formData.framework === fw.id
                            ? `border-${fw.color}-400 bg-${fw.color}-50 dark:bg-${fw.color}-900/20`
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {formData.framework === fw.id && (
                          <Check className="absolute top-2 right-2 h-4 w-4 text-emerald-600" />
                        )}
                        <span className="text-sm font-semibold">{fw.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">LLM Model</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {modelsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <Select
                        value={formData.llm}
                        onValueChange={v => updateField('llm', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select LLM model" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {llmModels.length > 0 ? (
                            llmModels.map((model: any) => (
                              <SelectItem key={model.id} value={model.name}>
                                <span className="flex items-center gap-2">
                                  {model.name}
                                  <span className="text-xs text-muted-foreground">({model.organization})</span>
                                </span>
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                              <SelectItem value="gpt-4o-mini">GPT-4o Mini (OpenAI)</SelectItem>
                              <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet (Anthropic)</SelectItem>
                              <SelectItem value="claude-3-opus">Claude 3 Opus (Anthropic)</SelectItem>
                              <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Google)</SelectItem>
                              <SelectItem value="llama-3.1-70b">Llama 3.1 70B (Meta)</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      {formData.llm && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Selected: {formData.llm}
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Agent Configuration */}
          {step === 2 && (
            <Card className="rounded-2xl">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    System Prompt
                  </Label>
                  <Textarea
                    id="systemPrompt"
                    placeholder="Define your agent's behavior, personality, and instructions. This is the core prompt that guides your agent's responses..."
                    value={formData.systemPrompt}
                    onChange={e => updateField('systemPrompt', e.target.value)}
                    className="min-h-[150px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    A good system prompt defines the agent&apos;s role, behavior, constraints, and output format.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Tools</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tool (e.g., web_search, calculator)"
                      value={toolInput}
                      onChange={e => setToolInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTool() }}}
                    />
                    <Button variant="outline" size="sm" onClick={handleAddTool}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* Common tool suggestions */}
                    {['web_search', 'calculator', 'database', 'email', 'filesystem', 'api'].map(tool => (
                      !formData.tools.includes(tool) && (
                        <button
                          key={tool}
                          onClick={() => updateField('tools', [...formData.tools, tool])}
                          className="px-2.5 py-1 text-xs rounded-full border border-dashed border-gray-300 dark:border-gray-600 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                        >
                          + {tool}
                        </button>
                      )
                    ))}
                  </div>
                  {formData.tools.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.tools.map(tool => (
                        <Badge key={tool} variant="secondary" className="gap-1">
                          {tool}
                          <button onClick={() => handleRemoveTool(tool)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() }}}
                    />
                    <Button variant="outline" size="sm" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.tags.map(tag => (
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

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <Label className="text-sm font-medium">Public Visibility</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Make your agent discoverable by other users
                    </p>
                  </div>
                  <Switch
                    checked={formData.privacy === 'PUBLIC'}
                    onCheckedChange={checked => updateField('privacy', checked ? 'PUBLIC' : 'PRIVATE')}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Create */}
          {step === 3 && (
            <div className="space-y-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Review Your Agent</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
                      <p className="font-medium">{formData.name || 'Untitled'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
                      <p className="font-medium">{categories.find(c => c.id === formData.category)?.name || formData.category || 'Not selected'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Framework</p>
                      <Badge className="capitalize">{formData.framework || 'Not selected'}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">LLM Model</p>
                      <p className="font-medium">{formData.llm || 'Not selected'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Industry</p>
                      <p className="font-medium capitalize">{formData.industry || 'General'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Difficulty</p>
                      <p className="font-medium capitalize">{formData.difficulty}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Language</p>
                      <p className="font-medium capitalize">{formData.language}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Visibility</p>
                      <Badge variant={formData.privacy === 'PUBLIC' ? 'default' : 'secondary'}>
                        {formData.privacy}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Description</p>
                    <p className="text-sm">{formData.description || 'No description'}</p>
                  </div>

                  {formData.systemPrompt && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">System Prompt</p>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-sm font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {formData.systemPrompt}
                      </div>
                    </div>
                  )}

                  {formData.tools.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Tools</p>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.tools.map(t => (
                          <Badge key={t} variant="secondary">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.tags.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.tags.map(t => (
                          <Badge key={t} variant="outline">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Code Preview */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Generated Code</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const code = generateCode()
                        updateField('code', code)
                        navigator.clipboard.writeText(code)
                        toast({ title: 'Code copied!' })
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="p-4 rounded-lg bg-gray-950 text-gray-100 font-mono text-xs overflow-x-auto max-h-64 overflow-y-auto">
                    <pre>{formData.code || generateCode()}</pre>
                  </div>
                </CardContent>
              </Card>

              {/* Create Button */}
              <div className="flex justify-end">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg px-8"
                  onClick={handlePublish}
                  disabled={publishing}
                >
                  {publishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Agent...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create Agent
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step < 3 && (
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleNext}
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
