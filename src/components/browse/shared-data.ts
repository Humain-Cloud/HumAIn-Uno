import {
  Flame,
  Clock,
  Star,
  CalendarPlus,
  ArrowUpAZ,
  ArrowUpZA,
  GraduationCap,
  Users,
} from 'lucide-react'

export interface Industry {
  name: string
  count: number
}

// Saved filter presets
export const SAVED_FILTERS = [
  {
    id: 'popular',
    label: 'Popular',
    icon: Flame,
    color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    apply: { sortBy: 'popular' as const, category: null, framework: null, industry: null, difficulty: null },
  },
  {
    id: 'recently-added',
    label: 'Recently Added',
    icon: CalendarPlus,
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    apply: { sortBy: 'recently-added' as const, category: null, framework: null, industry: null, difficulty: null },
  },
  {
    id: 'beginner-friendly',
    label: 'Beginner Friendly',
    icon: GraduationCap,
    color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    apply: { sortBy: 'popular' as const, category: null, framework: null, industry: null, difficulty: 'beginner' },
  },
  {
    id: 'multi-agent',
    label: 'Multi-Agent',
    icon: Users,
    color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    apply: { sortBy: 'popular' as const, category: null, framework: null, industry: null, difficulty: null },
    // We'll handle multi-agent specially
  },
]

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular', icon: Flame },
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'most-starred', label: 'Most Starred', icon: Star },
  { value: 'recently-added', label: 'Recently Added', icon: CalendarPlus },
  { value: 'az', label: 'A-Z', icon: ArrowUpAZ },
  { value: 'za', label: 'Z-A', icon: ArrowUpZA },
]

export const FRAMEWORK_OPTIONS = [
  { value: 'langgraph', label: 'LangGraph', color: 'text-emerald-600' },
  { value: 'crewai', label: 'CrewAI', color: 'text-amber-600' },
  { value: 'autogen', label: 'AutoGen', color: 'text-rose-600' },
  { value: 'agno', label: 'Agno', color: 'text-violet-600' },
  { value: 'llamaindex', label: 'LlamaIndex', color: 'text-teal-600' },
]
