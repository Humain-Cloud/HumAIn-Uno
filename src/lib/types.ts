// Humain-Uno Shared Types

export type Privacy = 'PRIVATE' | 'PUBLIC' | 'UNLISTED'
export type Source = 'knowledge_base' | 'fork' | 'scratch'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface KnowledgeAgent {
  id: string
  name: string
  category: string
  description: string
  tools: string[]
  models: string[]
  repoPath: string
  readme: string
  codeSnippet: string | null
  framework: string | null
  llm: string | null
  industry: string | null
  difficulty: string | null
  language: string | null
  tags: string[]
  author: string | null
  isCurated: boolean
  sourceUrl: string | null
}

export interface Agent {
  id: string
  name: string
  description: string
  categoryId: string
  creatorId: string
  privacy: Privacy
  source: Source | null
  parentId: string | null
  readme: string
  code: string | null
  stars: number
  tags: string[]
  framework: string | null
  llm: string | null
  industry: string | null
  difficulty: string | null
  language: string | null
  createdAt: string
  updatedAt: string
  category?: Category
  creator?: User
  parent?: Agent
  starredBy?: Star[]
  comments?: Comment[]
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  parentId: string | null
  agentCount?: number
}

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  bio: string | null
}

export interface Star {
  id: string
  userId: string
  agentId: string
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  userId: string
  agentId: string
  createdAt: string
  user?: User
}

export interface AgentWithDetails extends Agent {
  category: Category
  creator: User
  _count?: {
    starredBy: number
    comments: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface SearchFilters {
  query?: string
  category?: string
  framework?: string
  industry?: string
  difficulty?: string
  sort?: 'newest' | 'popular' | 'most-starred'
  page?: number
  pageSize?: number
}

export interface CreateAgentInput {
  name: string
  description: string
  categoryId: string
  privacy: Privacy
  source?: Source
  parentId?: string
  readme: string
  code?: string
  tags: string[]
  framework?: string
  llm?: string
  industry?: string
  difficulty?: string
  language?: string
}

export interface AISuggestion {
  name: string
  description: string
  category: string
  framework: string
  llm: string
  tools: string[]
  codeScaffold: string
  promptTemplate: string
}

export interface Stats {
  totalAgents: number
  knowledgeAgents: number
  userAgents: number
  categories: number
  frameworks: number
  topFrameworks: { name: string; count: number }[]
  topIndustries: { name: string; count: number }[]
}
