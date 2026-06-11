'use client'

import type { Category } from '@/lib/types'
import { FRAMEWORK_OPTIONS } from './shared-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ActiveFiltersBarProps {
  selectedCategory: string | null
  setSelectedCategory: (v: string | null) => void
  selectedFramework: string | null
  setSelectedFramework: (v: string | null) => void
  selectedIndustry: string | null
  setSelectedIndustry: (v: string | null) => void
  selectedDifficulty: string | null
  setSelectedDifficulty: (v: string | null) => void
  categories: Category[]
  resetFilters: () => void
}

export function ActiveFiltersBar({
  selectedCategory,
  setSelectedCategory,
  selectedFramework,
  setSelectedFramework,
  selectedIndustry,
  setSelectedIndustry,
  selectedDifficulty,
  setSelectedDifficulty,
  categories,
  resetFilters,
}: ActiveFiltersBarProps) {
  const activeFilterCount = [
    selectedCategory,
    selectedFramework,
    selectedIndustry,
    selectedDifficulty,
  ].filter(Boolean).length

  const getFilterDisplayName = (type: string, value: string) => {
    if (type === 'framework') {
      return FRAMEWORK_OPTIONS.find(f => f.value === value)?.label || value
    }
    if (type === 'category') {
      const cat = categories.find(c => c.id === value || c.name === value)
      return cat?.name || value
    }
    if (type === 'difficulty') {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
    return value
  }

  return (
    <AnimatePresence>
      {activeFilterCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Active:</span>
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg px-2.5 py-1">
                {getFilterDisplayName('category', selectedCategory)}
                <button onClick={() => setSelectedCategory(null)} className="hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedFramework && (
              <Badge variant="secondary" className="gap-1.5 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-lg px-2.5 py-1">
                {getFilterDisplayName('framework', selectedFramework)}
                <button onClick={() => setSelectedFramework(null)} className="hover:bg-amber-200 dark:hover:bg-amber-800 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedIndustry && (
              <Badge variant="secondary" className="gap-1.5 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 rounded-lg px-2.5 py-1">
                {selectedIndustry}
                <button onClick={() => setSelectedIndustry(null)} className="hover:bg-violet-200 dark:hover:bg-violet-800 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedDifficulty && (
              <Badge variant="secondary" className="gap-1.5 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 rounded-lg px-2.5 py-1">
                {getFilterDisplayName('difficulty', selectedDifficulty)}
                <button onClick={() => setSelectedDifficulty(null)} className="hover:bg-rose-200 dark:hover:bg-rose-800 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground" onClick={resetFilters}>
              Clear all
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
