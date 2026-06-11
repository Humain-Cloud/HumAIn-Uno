'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
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
  LayoutTemplate,
  Copy,
  Download,
  AlertCircle,
  Wrench,
  Cpu,
  HeadphonesIcon,
  Code2,
  PenTool,
  Mail,
  BarChart3,
  BookOpen,
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

// Template Library
const TEMPLATES = [
  {
    id: 'customer-support',
    name: 'Customer Support Bot',
    description: 'Automated customer support with ticket categorization and response drafting',
    framework: 'autogen',
    difficulty: 'beginner',
    category: 'Customer Support',
    industry: 'technology',
    llm: 'gpt-4o',
    language: 'python',
    tools: ['search', 'email', 'database'],
    tags: ['support', 'automation', 'customer-service'],
    codeScaffold: `import autogen

# Configure the LLM
config_list = autogen.config_list_from_json("OAI_CONFIG_LIST")

# Create the customer support agent
support_agent = autogen.AssistantAgent(
    name="CustomerSupportBot",
    llm_config={"config_list": config_list},
    system_message="""You are a helpful customer support agent.
    Categorize incoming tickets by urgency and type.
    Draft appropriate response templates."""
)

# Create the user proxy
user_proxy = autogen.UserProxyAgent(
    name="Customer",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=3,
)

# Start the conversation
user_proxy.initiate_chat(
    support_agent,
    message="I need help with my order"
)`,
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Automated code review with best practices checking and suggestions',
    framework: 'langgraph',
    difficulty: 'intermediate',
    category: 'Development',
    industry: 'technology',
    llm: 'gpt-4o',
    language: 'python',
    tools: ['github', 'filesystem', 'search'],
    tags: ['code-review', 'development', 'automation'],
    codeScaffold: `from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class CodeReviewState(TypedDict):
    code: str
    issues: list
    suggestions: list
    score: int

def analyze_code(state: CodeReviewState) -> CodeReviewState:
    """Analyze code for issues and best practices."""
    # Code analysis logic here
    return {**state, "issues": [], "suggestions": []}

def generate_review(state: CodeReviewState) -> CodeReviewState:
    """Generate review comments and score."""
    # Review generation logic here
    return {**state, "score": 85}

# Build the graph
workflow = StateGraph(CodeReviewState)
workflow.add_node("analyze", analyze_code)
workflow.add_node("review", generate_review)
workflow.add_edge("analyze", "review")
workflow.add_edge("review", END)
workflow.set_entry_point("analyze")

app = workflow.compile()`,
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Data analysis agent with visualization and insight generation capabilities',
    framework: 'crewai',
    difficulty: 'intermediate',
    category: 'Data Analysis',
    industry: 'technology',
    llm: 'gpt-4o',
    language: 'python',
    tools: ['python_repl', 'search', 'database'],
    tags: ['data-analysis', 'visualization', 'insights'],
    codeScaffold: `from crewai import Agent, Task, Crew, Process

# Define the data analyst agent
analyst = Agent(
    role="Senior Data Analyst",
    goal="Analyze datasets and extract meaningful insights",
    backstory="Expert analyst with 10+ years of experience",
    verbose=True,
    allow_delegation=False,
    tools=[]  # Add your tools here
)

# Define analysis task
analysis_task = Task(
    description="Analyze the provided dataset and generate insights",
    agent=analyst,
    expected_output="Detailed analysis report with visualizations"
)

# Create the crew
crew = Crew(
    agents=[analyst],
    tasks=[analysis_task],
    process=Process.sequential
)

result = crew.kickoff()`,
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'Research agent that searches, summarizes, and synthesizes information',
    framework: 'agno',
    difficulty: 'beginner',
    category: 'Research',
    industry: 'education',
    llm: 'gpt-4o',
    language: 'python',
    tools: ['search', 'web_scraper'],
    tags: ['research', 'summarization', 'knowledge'],
    codeScaffold: `from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools

# Create the research assistant
research_agent = Agent(
    name="Research Assistant",
    model=OpenAIChat(id="gpt-4o"),
    tools=[DuckDuckGoTools()],
    instructions=[
        "Search for information on the given topic",
        "Summarize key findings from multiple sources",
        "Synthesize information into a coherent report",
        "Always cite your sources",
    ],
    show_tool_calls=True,
)

# Run research
research_agent.print_response(
    "What are the latest developments in AI agents?"
)`,
  },
  {
    id: 'email-drafter',
    name: 'Email Drafter',
    description: 'Professional email drafting agent with tone adjustment and templates',
    framework: 'langgraph',
    difficulty: 'beginner',
    category: 'Automation',
    industry: 'marketing',
    llm: 'gpt-4o',
    language: 'python',
    tools: ['email', 'search'],
    tags: ['email', 'communication', 'automation'],
    codeScaffold: `from langgraph.graph import StateGraph, END
from typing import TypedDict

class EmailState(TypedDict):
    topic: str
    recipient: str
    tone: str
    draft: str
    revised: str

def generate_draft(state: EmailState) -> EmailState:
    """Generate initial email draft."""
    return {**state, "draft": "Draft email content..."}

def revise_draft(state: EmailState) -> EmailState:
    """Revise draft for tone and clarity."""
    return {**state, "revised": "Revised email content..."}

workflow = StateGraph(EmailState)
workflow.add_node("draft", generate_draft)
workflow.add_node("revise", revise_draft)
workflow.add_edge("draft", "revise")
workflow.add_edge("revise", END)
workflow.set_entry_point("draft")

app = workflow.compile()`,
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    description: 'Blog and content writing agent with SEO optimization and style matching',
    framework: 'crewai',
    difficulty: 'beginner',
    category: 'Content Creation',
    industry: 'marketing',
    llm: 'gpt-4o',
    language: 'python',
    tools: ['search', 'web_scraper'],
    tags: ['content', 'writing', 'seo'],
    codeScaffold: `from crewai import Agent, Task, Crew, Process

# Define the content writer agent
writer = Agent(
    role="Content Writer",
    goal="Write engaging, SEO-optimized content",
    backstory="Professional writer specializing in tech content",
    verbose=True,
    allow_delegation=False,
)

# Define the SEO reviewer
seo_reviewer = Agent(
    role="SEO Reviewer",
    goal="Optimize content for search engines",
    backstory="SEO expert with deep knowledge of ranking factors",
    verbose=True,
    allow_delegation=False,
)

# Create tasks
write_task = Task(
    description="Write a blog post on the given topic",
    agent=writer,
    expected_output="Complete blog post draft"
)

review_task = Task(
    description="Review and optimize for SEO",
    agent=seo_reviewer,
    expected_output="SEO-optimized blog post"
)

crew = Crew(
    agents=[writer, seo_reviewer],
    tasks=[write_task, review_task],
    process=Process.sequential
)

result = crew.kickoff()`,
  },
]

// Framework colors for step indicator
const frameworkColors: Record<string, { active: string; ring: string; bg: string }> = {
  langgraph: { active: 'text-emerald-700', ring: 'ring-emerald-600', bg: 'bg-emerald-100' },
  crewai: { active: 'text-amber-700', ring: 'ring-amber-600', bg: 'bg-amber-100' },
  autogen: { active: 'text-rose-700', ring: 'ring-rose-600', bg: 'bg-rose-100' },
  agno: { active: 'text-violet-700', ring: 'ring-violet-600', bg: 'bg-violet-100' },
  llamaindex: { active: 'text-teal-700', ring: 'ring-teal-600', bg: 'bg-teal-100' },
}

// Template icon mapping
const templateIcons: Record<string, typeof HeadphonesIcon> = {
  'customer-support': HeadphonesIcon,
  'code-reviewer': Code2,
  'data-analyst': BarChart3,
  'research-assistant': BookOpen,
  'email-drafter': Mail,
  'content-writer': PenTool,
}

// Framework badge colors for templates
const templateFrameworkBadge: Record<string, string> = {
  autogen: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  langgraph: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  crewai: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  agno: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  llamaindex: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
}

const difficultyBadge: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

// Generate scaffolded code based on current wizard data
function generateScaffoldedCode(data: Record<string, any>): string {
  const framework = data.framework || 'langgraph'
  const name = data.name || 'MyAgent'
  const language = data.language || 'python'
  const tools = data.suggestedTools || data.tags || []
  const llm = data.llm || 'gpt-4o'
  const description = data.description || 'A helpful AI agent'

  if (language === 'typescript') {
    if (framework === 'langgraph') {
      return `import { StateGraph, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

// Define state interface
interface ${name}State {
  input: string;
  output: string;
  messages: Array<{role: string; content: string}>;
}

// Initialize the LLM
const llm = new ChatOpenAI({ modelName: "${llm}" });

// Define nodes
async function processInput(state: ${name}State): Promise<Partial<${name}State>> {
  const response = await llm.invoke(state.messages);
  return {
    output: response.content as string,
    messages: [...state.messages, { role: "assistant", content: response.content as string }]
  };
}

// Build the graph
const workflow = new StateGraph<${name}State>({
  channels: {
    input: { value: null },
    output: { value: null },
    messages: { value: (x: any, y: any) => y ?? x ?? [] },
  }
});

workflow.addNode("process", processInput);
workflow.addEdge("__start__", "process");
workflow.addEdge("process", END);

const app = workflow.compile();

export { app };`
    }
    return `// ${name} - ${description}
// Framework: ${framework}
// LLM: ${llm}

interface AgentConfig {
  name: string;
  description: string;
  model: string;
}

const config: AgentConfig = {
  name: "${name}",
  description: "${description}",
  model: "${llm}",
};

class ${name} {
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async run(input: string): Promise<string> {
    // TODO: Implement agent logic
    return "Agent response for: " + input;
  }
}

export default ${name};`
  }

  // Python scaffolds
  switch (framework) {
    case 'langgraph':
      return `from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator
${tools.length > 0 ? `from langchain.tools import tool` : ''}

# Define the state
class ${name.replace(/[^a-zA-Z0-9]/g, '')}State(TypedDict):
    input: str
    output: str
    messages: Annotated[list, operator.add]
${tools.map((t: string, i: number) => `
@tool
def ${t.replace(/[^a-zA-Z0-9]/g, '_')}_tool(query: str) -> str:
    """Tool for ${t} operations."""
    # TODO: Implement ${t} tool
    return f"Result from ${t}: {{query}}"
`).join('')}

def process_input(state: ${name.replace(/[^a-zA-Z0-9]/g, '')}State) -> dict:
    """Process the input and generate a response."""
    # TODO: Add your processing logic
    return {"output": "Response generated", "messages": ["Processing complete"]}

# Build the graph
workflow = StateGraph(${name.replace(/[^a-zA-Z0-9]/g, '')}State)
workflow.add_node("process", process_input)
workflow.add_edge("__start__", "process")
workflow.add_edge("process", END)
workflow.set_entry_point("process")

# Compile the application
app = workflow.compile()

if __name__ == "__main__":
    result = app.invoke({"input": "Hello, ${name}!"})
    print(result)`

    case 'crewai':
      return `from crewai import Agent, Task, Crew, Process
${tools.length > 0 ? `from crewai_tools import tool` : ''}

# Define the agent
${name.replace(/[^a-zA-Z0-9]/g, '')}_agent = Agent(
    role="${name}",
    goal="${description}",
    backstory="An expert AI agent designed for ${typeof description === 'string' && description ? description.toLowerCase() : 'specific tasks'}",
    verbose=True,
    allow_delegation=False,
    llm="${llm}",
)
${tools.map((t: string) => `
@tool("${t} tool")
def ${t.replace(/[^a-zA-Z0-9]/g, '_')}_tool(query: str) -> str:
    """Perform ${t} operations."""
    # TODO: Implement ${t} tool
    return f"Result from ${t}: {query}"
`).join('')}

# Define the task
main_task = Task(
    description="Execute the main workflow for ${name}",
    agent=${name.replace(/[^a-zA-Z0-9]/g, '')}_agent,
    expected_output="Completed task result with relevant details",
)

# Create the crew
crew = Crew(
    agents=[${name.replace(/[^a-zA-Z0-9]/g, '')}_agent],
    tasks=[main_task],
    process=Process.sequential,
)

if __name__ == "__main__":
    result = crew.kickoff()
    print(result)`

    case 'autogen':
      return `import autogen

# Configure the LLM
config_list = autogen.config_list_from_json("OAI_CONFIG_LIST")
llm_config = {
    "config_list": config_list,
    "timeout": 120,
}

# Create the assistant agent
${name.replace(/[^a-zA-Z0-9]/g, '')}_agent = autogen.AssistantAgent(
    name="${name.replace(/[^a-zA-Z0-9]/g, '')}",
    llm_config=llm_config,
    system_message="""You are ${name}.
${description}
Always provide clear, actionable responses.""",
)

# Create the user proxy
user_proxy = autogen.UserProxyAgent(
    name="User",
    human_input_mode="TERMINATE",
    max_consecutive_auto_reply=5,
    code_execution_config={"work_dir": "coding"},
)
${tools.map((t: string) => `
# Register ${t} tool
# TODO: Implement ${t} tool function
`).join('')}

if __name__ == "__main__":
    user_proxy.initiate_chat(
        ${name.replace(/[^a-zA-Z0-9]/g, '')}_agent,
        message="Hello! I need help with a task.",
    )`

    case 'agno':
      return `from agno.agent import Agent
from agno.models.openai import OpenAIChat
${tools.includes('search') ? `from agno.tools.duckduckgo import DuckDuckGoTools` : ''}

# Create the agent
${name.replace(/[^a-zA-Z0-9]/g, '')}_agent = Agent(
    name="${name}",
    model=OpenAIChat(id="${llm}"),
    tools=[${tools.includes('search') ? 'DuckDuckGoTools()' : ''}],
    instructions=[
        "You are ${name}.",
        "${description}",
        "Always provide thorough and helpful responses.",
        "Cite sources when providing information.",
    ],
    show_tool_calls=True,
    markdown=True,
)

if __name__ == "__main__":
    ${name.replace(/[^a-zA-Z0-9]/g, '')}_agent.print_response(
        "Hello! How can you help me today?"
    )`

    case 'llamaindex':
      return `from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.openai import OpenAI

# Configure the LLM
Settings.llm = OpenAI(model="${llm}")

# Load documents (adjust path as needed)
documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents)

# Create query engine
query_engine = index.as_query_engine()

# Create the agent
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import QueryEngineTool, ToolMetadata

query_tool = QueryEngineTool(
    query_engine=query_engine,
    metadata=ToolMetadata(
        name="${name.replace(/[^a-zA-Z0-9]/g, '_')}",
        description="${description}",
    ),
)

agent = ReActAgent.from_tools(
    [query_tool],
    llm=OpenAI(model="${llm}"),
    verbose=True,
)

if __name__ == "__main__":
    response = agent.chat("Hello! How can you help me?")
    print(response)`

    default:
      return `# ${name}
# ${description}
# Framework: ${framework}
# LLM: ${llm}

# TODO: Implement your agent logic here
`
  }
}

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
  const [descriptionGenerating, setDescriptionGenerating] = useState(false)
  const [codePreviewCode, setCodePreviewCode] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  const [startingPoint, setStartingPoint] = useState<'scratch' | 'fork' | 'template' | 'knowledge_base'>(
    wizardData.source === 'fork' ? 'fork' : wizardData.source === 'template' ? 'template' : wizardData.source === 'knowledge_base' ? 'knowledge_base' : 'scratch'
  )
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

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

  // Generate live code preview
  useEffect(() => {
    if (wizardStep === 3) {
      const scaffold = generateScaffoldedCode(wizardData)
      setCodePreviewCode(scaffold)
    }
  }, [wizardStep, wizardData.framework, wizardData.name, wizardData.language, wizardData.llm, wizardData.description, wizardData.suggestedTools, wizardData.tags])

  // Validate current step
  const validateStep = (step: number): Record<string, string> => {
    const errors: Record<string, string> = {}
    switch (step) {
      case 2:
        if (!wizardData.name?.trim()) {
          errors.name = 'Agent name is required'
        } else if (wizardData.name.trim().length < 3) {
          errors.name = 'Agent name must be at least 3 characters'
        }
        if (!wizardData.description?.trim()) {
          errors.description = 'Description is required'
        } else if (wizardData.description.trim().length < 10) {
          errors.description = 'Description must be at least 10 characters'
        }
        if (!wizardData.category) {
          errors.category = 'At least one category must be selected'
        }
        break
    }
    return errors
  }

  // Update validation errors when step changes
  useEffect(() => {
    const errors = validateStep(wizardStep)
    setValidationErrors(errors)
  }, [wizardStep, wizardData.name, wizardData.description, wizardData.category])

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

  const handleAIDescription = async () => {
    if (!wizardData.name?.trim()) {
      toast({ title: 'Name required', description: 'Please enter an agent name first', variant: 'destructive' })
      return
    }
    setDescriptionGenerating(true)
    try {
      const suggestion: any = await api.ai.suggest(`Generate a description for an AI agent named "${wizardData.name}" in the ${wizardData.framework || 'AI'} framework, category: ${wizardData.category || 'general'}`)
      if (suggestion.description) {
        setWizardData({ description: suggestion.description })
      } else if (suggestion.suggestion?.description) {
        setWizardData({ description: suggestion.suggestion.description })
      }
    } catch (err) {
      console.error('AI description failed:', err)
      toast({ title: 'AI generation failed', description: 'Using a template description instead', variant: 'destructive' })
      // Fallback template
      setWizardData({
        description: `${wizardData.name} is an AI-powered agent built with ${wizardData.framework || 'an AI framework'} that helps automate tasks and improve productivity. It leverages advanced language models to provide intelligent, context-aware responses and actions.`
      })
    } finally {
      setDescriptionGenerating(false)
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

  const handleUseTemplate = (template: typeof TEMPLATES[0]) => {
    setWizardData({
      name: template.name,
      description: template.description,
      framework: template.framework,
      category: template.category,
      difficulty: template.difficulty,
      industry: template.industry,
      llm: template.llm,
      language: template.language,
      tags: template.tags,
      suggestedTools: template.tools,
      code: template.codeScaffold,
      source: 'template',
    })
    setStartingPoint('template')
    setWizardStep(2)
    toast({ title: 'Template applied!', description: `${template.name} template has been loaded into the wizard.` })
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
    const errors = validateStep(wizardStep)
    switch (wizardStep) {
      case 0: return true // problem is optional
      case 1: return true // starting point is optional
      case 2: return Object.keys(errors).length === 0 && !!(wizardData.name && wizardData.category)
      case 3: return true
      case 4: return !!(wizardData.name && wizardData.description)
      default: return true
    }
  }

  const progress = ((wizardStep + 1) / STEPS.length) * 100

  // Get framework-specific color for current step
  const getStepColor = (stepIndex: number) => {
    const fw = wizardData.framework?.toLowerCase()
    if (stepIndex === wizardStep && fw && frameworkColors[fw]) {
      return frameworkColors[fw]
    }
    return null
  }

  // Get error count for a step
  const getStepErrorCount = (step: number): number => {
    return Object.keys(validateStep(step)).length
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(codePreviewCode || wizardData.code || '')
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
    toast({ title: 'Copied!', description: 'Code copied to clipboard' })
  }

  const handleDownloadCode = () => {
    const code = codePreviewCode || wizardData.code || ''
    const ext = wizardData.language === 'typescript' ? 'ts' : 'py'
    const blob = new Blob([code], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${(wizardData.name || 'agent').replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Create Agent</h1>
            <p className="text-sm text-muted-foreground mt-1">{STEPS[wizardStep].description}</p>
          </div>
          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
            {Math.round(progress)}% complete
          </Badge>
        </div>
        <Progress value={progress} className="mt-4 h-2" />
      </div>

      {/* Step Indicators - Enhanced */}
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
        {STEPS.map((step, i) => {
          const stepColor = getStepColor(i)
          const errorCount = getStepErrorCount(i)
          const isCompleted = i < wizardStep
          const isCurrent = i === wizardStep

          return (
            <div key={i} className="flex flex-col items-center relative z-10">
              <div className="relative">
                <div
                  className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all will-change-transform ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? stepColor
                        ? `${stepColor.bg} ${stepColor.active} ring-2 ${stepColor.ring}`
                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-600 dark:ring-emerald-500'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {/* Error count badge */}
                {errorCount > 0 && !isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold"
                  >
                    {errorCount}
                  </motion.div>
                )}
              </div>
              <span className={`text-[10px] sm:text-xs mt-1 text-center ${
                isCurrent
                  ? stepColor
                    ? stepColor.active + ' font-medium'
                    : 'text-emerald-700 dark:text-emerald-300 font-medium'
                  : isCompleted
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-muted-foreground'
              }`}>
                {step.title}
              </span>
            </div>
          )
        })}
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
                          <h5 className="font-medium text-sm">{suggestion.name || suggestion.suggestion?.name}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{suggestion.description || suggestion.suggestion?.description}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(suggestion.framework || suggestion.suggestion?.framework) && (
                              <Badge variant="secondary" className="text-[10px]">{suggestion.framework || suggestion.suggestion?.framework}</Badge>
                            )}
                            {(suggestion.category || suggestion.suggestion?.category) && (
                              <Badge variant="outline" className="text-[10px]">{suggestion.category || suggestion.suggestion?.category}</Badge>
                            )}
                            {(suggestion.tools || suggestion.suggestion?.tools || []).map((tool: string) => (
                              <Badge key={tool} variant="outline" className="text-[10px]">{tool}</Badge>
                            ))}
                          </div>
                          {(suggestion.codeScaffold || suggestion.suggestion?.codeScaffold) && (
                            <pre className="mt-3 p-2 bg-gray-900 text-gray-100 rounded text-[10px] overflow-x-auto max-h-32">
                              {(suggestion.codeScaffold || suggestion.suggestion?.codeScaffold).slice(0, 500)}
                            </pre>
                          )}
                          <Button
                            size="sm"
                            className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => {
                              const s = suggestion.suggestion || suggestion
                              setWizardData({
                                name: s.name,
                                description: s.description,
                                framework: s.framework,
                                category: s.category,
                                suggestedTools: s.tools,
                                code: s.codeScaffold || '',
                                llm: s.llm,
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

          {/* Step 1: Starting Point - Enhanced with Template Library */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card
                  className={`cursor-pointer transition-all card-hover min-h-[44px] ${startingPoint === 'scratch' ? 'ring-2 ring-emerald-600 dark:ring-emerald-500' : 'hover:shadow-md'}`}
                  onClick={() => {
                    setStartingPoint('scratch')
                    setWizardData({ source: 'scratch', parentId: undefined })
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                      <PlusCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold mb-1">From Scratch</h3>
                    <p className="text-xs text-muted-foreground">Start with a blank template</p>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all card-hover min-h-[44px] ${startingPoint === 'fork' ? 'ring-2 ring-emerald-600 dark:ring-emerald-500' : 'hover:shadow-md'}`}
                  onClick={() => {
                    setStartingPoint('fork')
                    setWizardData({ source: 'fork' })
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold mb-1">From Knowledge Base</h3>
                    <p className="text-xs text-muted-foreground">Start from an existing agent</p>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all card-hover min-h-[44px] ${startingPoint === 'template' ? 'ring-2 ring-emerald-600 dark:ring-emerald-500' : 'hover:shadow-md'}`}
                  onClick={() => {
                    setStartingPoint('template')
                    setWizardData({ source: 'template' })
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
                      <LayoutTemplate className="h-6 w-6 text-violet-600" />
                    </div>
                    <h3 className="font-semibold mb-1">From Template</h3>
                    <p className="text-xs text-muted-foreground">Use a pre-built template</p>
                  </CardContent>
                </Card>
              </div>

              {/* Template Library Grid */}
              {startingPoint === 'template' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <LayoutTemplate className="h-4 w-4 text-violet-500" />
                    Choose a Template
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TEMPLATES.map((template) => {
                      const IconComponent = templateIcons[template.id] || Bot
                      return (
                        <Card key={template.id} className="group hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center shrink-0">
                                <IconComponent className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm">{template.name}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                  <Badge className={`text-[10px] px-1.5 py-0 ${templateFrameworkBadge[template.framework] || ''}`}>
                                    {template.framework}
                                  </Badge>
                                  <Badge className={`text-[10px] px-1.5 py-0 ${difficultyBadge[template.difficulty] || ''}`}>
                                    {template.difficulty}
                                  </Badge>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-3 w-full h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleUseTemplate(template)}
                                >
                                  Use Template <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Knowledge Base Remix */}
              {startingPoint === 'fork' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
                </motion.div>
              )}
            </div>
          )}

          {/* Step 2: Specifications - Enhanced with AI Description Generator */}
          {wizardStep === 2 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="agent-name" className="flex items-center gap-1">
                      Agent Name *
                      {validationErrors.name && (
                        <span className="text-rose-500 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {validationErrors.name}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="agent-name"
                      placeholder="My Awesome Agent"
                      value={wizardData.name || ''}
                      onChange={(e) => setWizardData({ name: e.target.value })}
                      className={validationErrors.name ? 'border-rose-300 focus-visible:ring-rose-300' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Category *
                      {validationErrors.category && (
                        <span className="text-rose-500 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {validationErrors.category}
                        </span>
                      )}
                    </Label>
                    <Select
                      value={wizardData.category || ''}
                      onValueChange={(v) => setWizardData({ category: v })}
                    >
                      <SelectTrigger className={validationErrors.category ? 'border-rose-300' : ''}>
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
                    <Label htmlFor="agent-desc" className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        Description *
                        {validationErrors.description && (
                          <span className="text-rose-500 text-xs flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {validationErrors.description}
                          </span>
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/20"
                        onClick={handleAIDescription}
                        disabled={descriptionGenerating || !wizardData.name?.trim()}
                      >
                        {descriptionGenerating ? (
                          <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</>
                        ) : (
                          <><Sparkles className="h-3 w-3 mr-1" /> Generate with AI</>
                        )}
                      </Button>
                    </Label>
                    <Textarea
                      id="agent-desc"
                      placeholder="Describe what your agent does..."
                      value={wizardData.description || ''}
                      onChange={(e) => setWizardData({ description: e.target.value })}
                      className={`min-h-[80px] ${validationErrors.description ? 'border-rose-300 focus-visible:ring-rose-300' : ''}`}
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

          {/* Step 3: Code - Enhanced with Live Code Preview */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Code Editor */}
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

                {/* Right: Live Code Preview */}
                <div className="lg:sticky lg:top-4 lg:self-start">
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Eye className="h-4 w-4" /> Live Preview
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={handleCopyCode}
                          >
                            {codeCopied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                            {codeCopied ? 'Copied!' : 'Copy'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={handleDownloadCode}
                          >
                            <Download className="h-3 w-3 mr-1" /> Download
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="relative">
                        <ScrollArea className="h-[600px]">
                          <pre className="p-4 text-xs font-mono bg-gray-950 text-gray-100 overflow-x-auto">
                            <code>{codePreviewCode || wizardData.code || '// Your code will appear here as you configure your agent...'}</code>
                          </pre>
                        </ScrollArea>
                        {/* Gradient overlay at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
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
                            ? 'ring-2 ring-emerald-600 dark:ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 gradient-border'
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
