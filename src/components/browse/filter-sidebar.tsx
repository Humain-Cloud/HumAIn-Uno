'use client'

import type { Category } from '@/lib/types'
import type { Industry } from './shared-data'
import { FRAMEWORK_OPTIONS, SORT_OPTIONS } from './shared-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowUpDown, Search, X } from 'lucide-react'

interface FilterSidebarProps {
  selectedCategory: string | null
  setSelectedCategory: (v: string | null) => void
  selectedFramework: string | null
  setSelectedFramework: (v: string | null) => void
  selectedIndustry: string | null
  setSelectedIndustry: (v: string | null) => void
  selectedDifficulty: string | null
  setSelectedDifficulty: (v: string | null) => void
  sortBy: string
  setSortBy: (v: any) => void
  categories: Category[]
  industries: Industry[]
  activeFilterCount: number
  resetFilters: () => void
}

export function FilterSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedFramework,
  setSelectedFramework,
  selectedIndustry,
  setSelectedIndustry,
  selectedDifficulty,
  setSelectedDifficulty,
  sortBy,
  setSortBy,
  categories,
  industries,
  activeFilterCount,
  resetFilters,
}: FilterSidebarProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Category
        </h3>
        <Select value={selectedCategory || 'all'} onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name} ({cat.agentCount || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-amber-500" /> Framework
        </h3>
        <Select value={selectedFramework || 'all'} onValueChange={(v) => setSelectedFramework(v === 'all' ? null : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All frameworks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All frameworks</SelectItem>
            {FRAMEWORK_OPTIONS.map((fw) => (
              <SelectItem key={fw.value} value={fw.value}>
                <span className={fw.color}>{fw.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-violet-500" /> Industry
        </h3>
        <Select value={selectedIndustry || 'all'} onValueChange={(v) => setSelectedIndustry(v === 'all' ? null : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All industries</SelectItem>
            {industries.map((ind) => (
              <SelectItem key={ind.name} value={ind.name}>
                {ind.name} ({ind.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Difficulty</h3>
        <Select value={selectedDifficulty || 'all'} onValueChange={(v) => setSelectedDifficulty(v === 'all' ? null : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="beginner">🟢 Beginner</SelectItem>
            <SelectItem value="intermediate">🟡 Intermediate</SelectItem>
            <SelectItem value="advanced">🔴 Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Sort By</h3>
        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-1.5">
                  <opt.icon className="h-3.5 w-3.5" />
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full rounded-xl border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 min-h-[44px]" onClick={resetFilters}>
          <X className="h-4 w-4 mr-1" /> Clear Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  )
}
