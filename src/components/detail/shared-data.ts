// Shared constants and types for detail view components

export const frameworkGradients: Record<string, { from: string; to: string; badge: string; text: string; bar: string }> = {
  langgraph: {
    from: 'from-emerald-500',
    to: 'to-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    text: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
  },
  crewai: {
    from: 'from-amber-500',
    to: 'to-amber-600',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-400',
    bar: 'bg-amber-500',
  },
  autogen: {
    from: 'from-rose-500',
    to: 'to-rose-600',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    text: 'text-rose-600 dark:text-rose-400',
    bar: 'bg-rose-500',
  },
  agno: {
    from: 'from-violet-500',
    to: 'to-violet-600',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    text: 'text-violet-600 dark:text-violet-400',
    bar: 'bg-violet-500',
  },
  llamaindex: {
    from: 'from-teal-500',
    to: 'to-teal-600',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    text: 'text-teal-600 dark:text-teal-400',
    bar: 'bg-teal-500',
  },
}

export const defaultGradient = {
  from: 'from-gray-500',
  to: 'to-gray-600',
  badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  text: 'text-gray-600 dark:text-gray-400',
  bar: 'bg-gray-500',
}

export const difficultyConfig: Record<string, { value: number; color: string; barClass: string }> = {
  beginner: { value: 33, color: 'text-green-600 dark:text-green-400', barClass: '[&>div]:bg-green-500' },
  intermediate: { value: 66, color: 'text-amber-600 dark:text-amber-400', barClass: '[&>div]:bg-amber-500' },
  advanced: { value: 100, color: 'text-rose-600 dark:text-rose-400', barClass: '[&>div]:bg-rose-500' },
}

// Mock comments for demonstration
export interface MockComment {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: string
  likes: number
  liked: boolean
  replies: MockComment[]
}

export const MOCK_COMMENTS: MockComment[] = [
  {
    id: '1',
    author: 'Alex Chen',
    avatar: 'AC',
    content: 'This agent is incredibly well-structured! The state management pattern is exactly what I needed for my project. Thanks for sharing!',
    timestamp: '2025-01-15T10:30:00Z',
    likes: 12,
    liked: false,
    replies: [
      {
        id: '1r',
        author: 'Sarah Kim',
        avatar: 'SK',
        content: 'Agreed! I adapted this pattern for my own agent and it works great.',
        timestamp: '2025-01-15T11:45:00Z',
        likes: 3,
        liked: false,
        replies: [],
      },
    ],
  },
  {
    id: '2',
    author: 'Morgan Liu',
    avatar: 'ML',
    content: 'How does this handle edge cases with very long inputs? I noticed some truncation in my testing.',
    timestamp: '2025-01-14T08:15:00Z',
    likes: 5,
    liked: false,
    replies: [],
  },
  {
    id: '3',
    author: 'Jordan Park',
    avatar: 'JP',
    content: 'Great work! Would love to see a version with streaming output support added.',
    timestamp: '2025-01-13T16:20:00Z',
    likes: 8,
    liked: false,
    replies: [],
  },
]

// Dependency graph node colors
export const nodeColors: Record<string, string> = {
  agent: '#10b981', // emerald
  tool: '#f59e0b', // amber
  model: '#8b5cf6', // violet
  framework: '#06b6d4', // cyan
}

// Helper to get framework gradient
export function getFrameworkGradient(framework: string | null | undefined) {
  const fwKey = (framework || '').toLowerCase()
  return frameworkGradients[fwKey] || defaultGradient
}

// Helper to get difficulty config
export function getDifficultyConfig(difficulty: string | null | undefined) {
  const diffKey = (difficulty || '').toLowerCase()
  return difficultyConfig[diffKey] || null
}
