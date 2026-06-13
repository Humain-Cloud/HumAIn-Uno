'use client'

import React from 'react'
import type { KnowledgeAgent } from '@/lib/types'
import {
  Pagination as PaginationNav,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Bot,
  BarChart3,
  ShoppingBag,
  Sprout,
  Mail,
  GraduationCap,
  Briefcase,
  Plane,
  Music,
  Gamepad2,
  Palette,
  Scale,
  Cpu,
  Layers,
  ArrowRight,
  Star,
  Bookmark,
  Share2,
  Copy,
  ExternalLink,
  Clock,
  Tag,
  User,
  FileCode,
  BookOpen,
  CheckCircle2,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Loader2,
} from 'lucide-react'

// ─── Parse helper ───

export function parseAgent(a: any): KnowledgeAgent {
  return {
    ...a,
    tools: typeof a.tools === 'string' ? JSON.parse(a.tools || '[]') : a.tools || [],
    models: typeof a.models === 'string' ? JSON.parse(a.models || '[]') : a.models || [],
    tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags || [],
  }
}

// ─── Category Visual Config ───

export type CategoryStyle = {
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  hoverGradient: string
  iconBg: string
  iconHoverBg: string
  iconColor: string
  accent: string
  border: string
  hoverBorder: string
}

export const categoryStyleMap: Record<string, CategoryStyle> = {
  'Research': {
    icon: Search,
    gradient: 'bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/30',
    hoverGradient: 'hover:from-blue-100 hover:to-sky-100 dark:hover:from-blue-950/60 dark:hover:to-sky-950/50',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconHoverBg: 'group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
    accent: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-100 dark:border-blue-900/30',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700/50',
  },
  'Data Analytics': {
    icon: BarChart3,
    gradient: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30',
    hoverGradient: 'hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-950/60 dark:hover:to-teal-950/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconHoverBg: 'group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    accent: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-100 dark:border-emerald-900/30',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700/50',
  },
  'Customer Service': {
    icon: MessageSquare,
    gradient: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30',
    hoverGradient: 'hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-950/60 dark:hover:to-purple-950/50',
    iconBg: 'bg-violet-100 dark:bg-violet-900/50',
    iconHoverBg: 'group-hover:bg-violet-200 dark:group-hover:bg-violet-800/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
    accent: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-100 dark:border-violet-900/30',
    hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-700/50',
  },
  'Communication': {
    icon: Mail,
    gradient: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-rose-950/30',
    hoverGradient: 'hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-950/60 dark:hover:to-rose-950/50',
    iconBg: 'bg-pink-100 dark:bg-pink-900/50',
    iconHoverBg: 'group-hover:bg-pink-200 dark:group-hover:bg-pink-800/60',
    iconColor: 'text-pink-600 dark:text-pink-400',
    accent: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-100 dark:border-pink-900/30',
    hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-700/50',
  },
  'Marketing': {
    icon: Globe,
    gradient: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30',
    hoverGradient: 'hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-950/60 dark:hover:to-yellow-950/50',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconHoverBg: 'group-hover:bg-amber-200 dark:group-hover:bg-amber-800/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
    accent: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-100 dark:border-amber-900/30',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700/50',
  },
  'Code Generation': {
    icon: Code2,
    gradient: 'bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/60 dark:to-slate-900/40',
    hoverGradient: 'hover:from-gray-100 hover:to-slate-200 dark:hover:from-gray-800/60 dark:hover:to-slate-800/50',
    iconBg: 'bg-gray-200 dark:bg-gray-700/60',
    iconHoverBg: 'group-hover:bg-gray-300 dark:group-hover:bg-gray-600/70',
    iconColor: 'text-gray-700 dark:text-gray-300',
    accent: 'text-gray-800 dark:text-gray-200',
    border: 'border-gray-200 dark:border-gray-800/50',
    hoverBorder: 'hover:border-gray-400 dark:hover:border-gray-600/60',
  },
  'Workflow Automation': {
    icon: Workflow,
    gradient: 'bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/30',
    hoverGradient: 'hover:from-cyan-100 hover:to-sky-100 dark:hover:from-cyan-950/60 dark:hover:to-sky-950/50',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/50',
    iconHoverBg: 'group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800/60',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    accent: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-100 dark:border-cyan-900/30',
    hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-700/50',
  },
  'Finance': {
    icon: Building2,
    gradient: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/30',
    hoverGradient: 'hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-950/60 dark:hover:to-emerald-950/50',
    iconBg: 'bg-green-100 dark:bg-green-900/50',
    iconHoverBg: 'group-hover:bg-green-200 dark:group-hover:bg-green-800/60',
    iconColor: 'text-green-600 dark:text-green-400',
    accent: 'text-green-700 dark:text-green-300',
    border: 'border-green-100 dark:border-green-900/30',
    hoverBorder: 'hover:border-green-300 dark:hover:border-green-700/50',
  },
  'Healthcare': {
    icon: Heart,
    gradient: 'bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/30',
    hoverGradient: 'hover:from-rose-100 hover:to-red-100 dark:hover:from-rose-950/60 dark:hover:to-red-950/50',
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
    iconHoverBg: 'group-hover:bg-rose-200 dark:group-hover:bg-rose-800/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
    accent: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-100 dark:border-rose-900/30',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700/50',
  },
  'Cybersecurity': {
    icon: Shield,
    gradient: 'bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-slate-950/40 dark:to-zinc-900/30',
    hoverGradient: 'hover:from-slate-100 hover:to-zinc-200 dark:hover:from-slate-950/60 dark:hover:to-zinc-900/50',
    iconBg: 'bg-slate-200 dark:bg-slate-800/60',
    iconHoverBg: 'group-hover:bg-slate-300 dark:group-hover:bg-slate-700/70',
    iconColor: 'text-slate-700 dark:text-slate-300',
    accent: 'text-slate-800 dark:text-slate-200',
    border: 'border-slate-200 dark:border-slate-800/50',
    hoverBorder: 'hover:border-slate-400 dark:hover:border-slate-600/60',
  },
  'DevOps': {
    icon: Wrench,
    gradient: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30',
    hoverGradient: 'hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-950/60 dark:hover:to-amber-950/50',
    iconBg: 'bg-orange-100 dark:bg-orange-900/50',
    iconHoverBg: 'group-hover:bg-orange-200 dark:group-hover:bg-orange-800/60',
    iconColor: 'text-orange-600 dark:text-orange-400',
    accent: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-100 dark:border-orange-900/30',
    hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-700/50',
  },
  'Agriculture': {
    icon: Sprout,
    gradient: 'bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950/40 dark:to-green-950/30',
    hoverGradient: 'hover:from-lime-100 hover:to-green-100 dark:hover:from-lime-950/60 dark:hover:to-green-950/50',
    iconBg: 'bg-lime-100 dark:bg-lime-900/50',
    iconHoverBg: 'group-hover:bg-lime-200 dark:group-hover:bg-lime-800/60',
    iconColor: 'text-lime-600 dark:text-lime-400',
    accent: 'text-lime-700 dark:text-lime-300',
    border: 'border-lime-100 dark:border-lime-900/30',
    hoverBorder: 'hover:border-lime-300 dark:hover:border-lime-700/50',
  },
  'Business': {
    icon: Briefcase,
    gradient: 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30',
    hoverGradient: 'hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-950/60 dark:hover:to-blue-950/50',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
    iconHoverBg: 'group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    accent: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-100 dark:border-indigo-900/30',
    hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700/50',
  },
  'E-commerce': {
    icon: ShoppingBag,
    gradient: 'bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/40 dark:to-pink-950/30',
    hoverGradient: 'hover:from-fuchsia-100 hover:to-pink-100 dark:hover:from-fuchsia-950/60 dark:hover:to-pink-950/50',
    iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-900/50',
    iconHoverBg: 'group-hover:bg-fuchsia-200 dark:group-hover:bg-fuchsia-800/60',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    accent: 'text-fuchsia-700 dark:text-fuchsia-300',
    border: 'border-fuchsia-100 dark:border-fuchsia-900/30',
    hoverBorder: 'hover:border-fuchsia-300 dark:hover:border-fuchsia-700/50',
  },
  'Education': {
    icon: GraduationCap,
    gradient: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/30',
    hoverGradient: 'hover:from-teal-100 hover:to-cyan-100 dark:hover:from-teal-950/60 dark:hover:to-cyan-950/50',
    iconBg: 'bg-teal-100 dark:bg-teal-900/50',
    iconHoverBg: 'group-hover:bg-teal-200 dark:group-hover:bg-teal-800/60',
    iconColor: 'text-teal-600 dark:text-teal-400',
    accent: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-100 dark:border-teal-900/30',
    hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-700/50',
  },
  'Travel': {
    icon: Plane,
    gradient: 'bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/30',
    hoverGradient: 'hover:from-sky-100 hover:to-blue-100 dark:hover:from-sky-950/60 dark:hover:to-blue-950/50',
    iconBg: 'bg-sky-100 dark:bg-sky-900/50',
    iconHoverBg: 'group-hover:bg-sky-200 dark:group-hover:bg-sky-800/60',
    iconColor: 'text-sky-600 dark:text-sky-400',
    accent: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-100 dark:border-sky-900/30',
    hoverBorder: 'hover:border-sky-300 dark:hover:border-sky-700/50',
  },
  'Entertainment': {
    icon: Music,
    gradient: 'bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/30',
    hoverGradient: 'hover:from-purple-100 hover:to-fuchsia-100 dark:hover:from-purple-950/60 dark:hover:to-fuchsia-950/50',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconHoverBg: 'group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60',
    iconColor: 'text-purple-600 dark:text-purple-400',
    accent: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-100 dark:border-purple-900/30',
    hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-700/50',
  },
  'Gaming': {
    icon: Gamepad2,
    gradient: 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/30',
    hoverGradient: 'hover:from-red-100 hover:to-orange-100 dark:hover:from-red-950/60 dark:hover:to-orange-950/50',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
    iconHoverBg: 'group-hover:bg-red-200 dark:group-hover:bg-red-800/60',
    iconColor: 'text-red-600 dark:text-red-400',
    accent: 'text-red-700 dark:text-red-300',
    border: 'border-red-100 dark:border-red-900/30',
    hoverBorder: 'hover:border-red-300 dark:hover:border-red-700/50',
  },
  'Creative': {
    icon: Palette,
    gradient: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/40 dark:to-orange-950/30',
    hoverGradient: 'hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-950/60 dark:hover:to-orange-950/50',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
    iconHoverBg: 'group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/60',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    accent: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-100 dark:border-yellow-900/30',
    hoverBorder: 'hover:border-yellow-300 dark:hover:border-yellow-700/50',
  },
  'Legal': {
    icon: Scale,
    gradient: 'bg-gradient-to-br from-stone-50 to-neutral-100 dark:from-stone-950/40 dark:to-neutral-900/30',
    hoverGradient: 'hover:from-stone-100 hover:to-neutral-200 dark:hover:from-stone-950/60 dark:hover:to-neutral-900/50',
    iconBg: 'bg-stone-200 dark:bg-stone-800/60',
    iconHoverBg: 'group-hover:bg-stone-300 dark:group-hover:bg-stone-700/70',
    iconColor: 'text-stone-700 dark:text-stone-300',
    accent: 'text-stone-800 dark:text-stone-200',
    border: 'border-stone-200 dark:border-stone-800/50',
    hoverBorder: 'hover:border-stone-400 dark:hover:border-stone-600/60',
  },
  'AI/ML': {
    icon: Brain,
    gradient: 'bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/30',
    hoverGradient: 'hover:from-violet-100 hover:to-indigo-100 dark:hover:from-violet-950/60 dark:hover:to-indigo-950/50',
    iconBg: 'bg-violet-100 dark:bg-violet-900/50',
    iconHoverBg: 'group-hover:bg-violet-200 dark:group-hover:bg-violet-800/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
    accent: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-100 dark:border-violet-900/30',
    hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-700/50',
  },
  'IoT': {
    icon: Cpu,
    gradient: 'bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30',
    hoverGradient: 'hover:from-teal-100 hover:to-emerald-100 dark:hover:from-teal-950/60 dark:hover:to-emerald-950/50',
    iconBg: 'bg-teal-100 dark:bg-teal-900/50',
    iconHoverBg: 'group-hover:bg-teal-200 dark:group-hover:bg-teal-800/60',
    iconColor: 'text-teal-600 dark:text-teal-400',
    accent: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-100 dark:border-teal-900/30',
    hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-700/50',
  },
}

// Fallback palette for categories not in the map — cycles through distinctive colors
export const fallbackPalette: CategoryStyle[] = [
  categoryStyleMap['Research']!,
  categoryStyleMap['Marketing']!,
  categoryStyleMap['Communication']!,
  categoryStyleMap['Education']!,
  categoryStyleMap['E-commerce']!,
  categoryStyleMap['Entertainment']!,
  categoryStyleMap['Creative']!,
  categoryStyleMap['Finance']!,
  categoryStyleMap['Travel']!,
  categoryStyleMap['DevOps']!,
]

export function getCategoryStyle(name: string, index: number): CategoryStyle {
  if (categoryStyleMap[name]) return categoryStyleMap[name]!
  // Fallback: deterministic selection based on name hash + index
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
  return fallbackPalette[Math.abs(hash) % fallbackPalette.length]!
}

// ─── Constants ───

export const FRAMEWORKS = ['LangGraph', 'CrewAI', 'AutoGen', 'Agno', 'LlamaIndex'] as const
export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const
export const SORT_OPTIONS = [
  { value: 'az', label: 'Name A-Z' },
  { value: 'za', label: 'Name Z-A' },
  { value: 'newest', label: 'Newest' },
  { value: 'recently-added', label: 'Recently Added' },
] as const

// ─── Pagination Component ───

export interface AgentPaginationProps {
  currentPage: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export function AgentPagination({ currentPage, totalPages, total, pageSize, onPageChange, onPageSizeChange }: AgentPaginationProps) {
  if (totalPages <= 1 && total <= pageSize) return null

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, total)

  // Generate page numbers to show
  const getVisiblePages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)

      if (currentPage > 3) pages.push('ellipsis')

      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      for (let i = startPage; i <= endPage; i++) pages.push(i)

      if (currentPage < totalPages - 2) pages.push('ellipsis')

      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
      {/* Results info + page size selector */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{start}</span>–<span className="font-medium text-foreground">{end}</span> of <span className="font-medium text-foreground">{total}</span> agents
        </span>
        {onPageSizeChange && (
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12 / page</SelectItem>
              <SelectItem value="24">24 / page</SelectItem>
              <SelectItem value="48">48 / page</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Page navigation */}
      <PaginationNav>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            />
          </PaginationItem>
          {getVisiblePages().map((page, i) =>
            page === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationNav>
    </div>
  )
}

// ─── Agent Card Component ───

export function AgentCard({ agent, onClick }: { agent: KnowledgeAgent; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-teal-50/0 group-hover:from-emerald-50/50 group-hover:to-teal-50/30 dark:group-hover:from-emerald-950/10 dark:group-hover:to-teal-950/5 transition-all duration-300" />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold leading-tight pr-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{agent.name}</h3>
          {agent.framework && (
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
              {agent.framework}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {agent.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
          {agent.difficulty && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              agent.difficulty === 'beginner'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : agent.difficulty === 'advanced'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            }`}>
              {agent.difficulty}
            </span>
          )}
          {agent.category && (
            <span className="text-xs bg-gray-50 dark:bg-gray-800/50 text-muted-foreground px-2 py-0.5 rounded-full">
              {agent.category}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
