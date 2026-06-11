import {
  Lightbulb,
  Upload,
  Settings,
  FileCode,
  Eye,
  HeadphonesIcon,
  Code2,
  BarChart3,
  BookOpen,
  Mail,
  PenTool,
} from 'lucide-react'

export const STEPS = [
  { title: 'Problem', description: 'What problem does your agent solve?', icon: Lightbulb },
  { title: 'Starting Point', description: 'Choose a starting point', icon: Upload },
  { title: 'Specifications', description: 'Define your agent details', icon: Settings },
  { title: 'Code', description: 'Write your agent code', icon: FileCode },
  { title: 'Publish', description: 'Review and publish', icon: Eye },
]

export const TEMPLATES = [
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

export const frameworkColors: Record<string, { active: string; ring: string; bg: string }> = {
  langgraph: { active: 'text-emerald-700', ring: 'ring-emerald-600', bg: 'bg-emerald-100' },
  crewai: { active: 'text-amber-700', ring: 'ring-amber-600', bg: 'bg-amber-100' },
  autogen: { active: 'text-rose-700', ring: 'ring-rose-600', bg: 'bg-rose-100' },
  agno: { active: 'text-violet-700', ring: 'ring-violet-600', bg: 'bg-violet-100' },
  llamaindex: { active: 'text-teal-700', ring: 'ring-teal-600', bg: 'bg-teal-100' },
}

export const templateIcons: Record<string, typeof HeadphonesIcon> = {
  'customer-support': HeadphonesIcon,
  'code-reviewer': Code2,
  'data-analyst': BarChart3,
  'research-assistant': BookOpen,
  'email-drafter': Mail,
  'content-writer': PenTool,
}

export const templateFrameworkBadge: Record<string, string> = {
  autogen: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  langgraph: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  crewai: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  agno: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  llamaindex: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
}

export const difficultyBadge: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

// Generate scaffolded code based on current wizard data
export function generateScaffoldedCode(data: Record<string, any>): string {
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
