import {
  Search,
  Database,
  MessageSquare,
  Globe,
  Code2,
  Workflow,
  Building2,
  Heart,
  Shield,
  Wrench,
  GitBranch,
  Brain,
  Zap,
  Lightbulb,
  Sparkles,
  Rocket,
} from 'lucide-react'

export const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
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

export const frameworks = [
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

export const howItWorks = [
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
    description: 'Our AI scans 800+ proven agents to recommend the best starting point and framework.',
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

export const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'ML Engineer at DataFlow',
    initials: 'SC',
    color: 'bg-emerald-500',
    quote: "Humain-Uno saved me weeks of work. I found a LangGraph agent that did exactly what I needed, forked it, and had it running in production the same day. The knowledge base is incredibly well-curated.",
    stars: 5,
  },
  {
    name: 'Marcus Rivera',
    role: 'CTO at AgentLabs',
    initials: 'MR',
    color: 'bg-amber-500',
    quote: "We evaluated 5 different agent frameworks before choosing CrewAI. The comparison tools and ready-made templates on Humain-Uno made our decision process 10x faster. It's become our go-to resource.",
    stars: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Senior Developer at TechNova',
    initials: 'PP',
    color: 'bg-violet-500',
    quote: "The AI suggestion feature is magical. I described what I wanted in plain English and it recommended the perfect AutoGen template with code scaffolding. Remixed it and deployed within hours.",
    stars: 5,
  },
]

export const frameworkComparison = {
  features: [
    { name: 'Multi-Agent', langgraph: true, crewai: true, autogen: true, agno: true, llamaindex: false },
    { name: 'RAG Support', langgraph: true, crewai: false, autogen: true, agno: true, llamaindex: true },
    { name: 'Tool Use', langgraph: true, crewai: true, autogen: true, agno: true, llamaindex: true },
    { name: 'State Management', langgraph: true, crewai: false, autogen: true, agno: false, llamaindex: true },
    { name: 'Open Source', langgraph: true, crewai: true, autogen: true, agno: true, llamaindex: true },
    { name: 'Community Size', langgraph: 'Large', crewai: 'Large', autogen: 'Large', agno: 'Growing', llamaindex: 'Large' },
  ],
  frameworkColors: {
    langgraph: 'text-emerald-600 dark:text-emerald-400',
    crewai: 'text-amber-600 dark:text-amber-400',
    autogen: 'text-rose-600 dark:text-rose-400',
    agno: 'text-violet-600 dark:text-violet-400',
    llamaindex: 'text-teal-600 dark:text-teal-400',
  },
  frameworkBg: {
    langgraph: 'bg-emerald-50 dark:bg-emerald-900/20',
    crewai: 'bg-amber-50 dark:bg-amber-900/20',
    autogen: 'bg-rose-50 dark:bg-rose-900/20',
    agno: 'bg-violet-50 dark:bg-violet-900/20',
    llamaindex: 'bg-teal-50 dark:bg-teal-900/20',
  },
}
