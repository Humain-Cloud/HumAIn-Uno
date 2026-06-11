'use client'

import { SAVED_FILTERS } from './shared-data'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export function QuickFilters() {
  const {
    sortBy, setSortBy,
    selectedCategory, setSelectedCategory,
    selectedFramework, setSelectedFramework,
    selectedIndustry, setSelectedIndustry,
    selectedDifficulty, setSelectedDifficulty,
  } = useAppStore()

  const applySavedFilter = (filterId: string) => {
    const preset = SAVED_FILTERS.find(f => f.id === filterId)
    if (!preset) return

    if (filterId === 'multi-agent') {
      setSelectedCategory(null)
      setSelectedIndustry(null)
      setSelectedDifficulty(null)
      setSortBy(preset.apply.sortBy)
      setSelectedFramework('langgraph')
    } else if (filterId === 'beginner-friendly') {
      setSelectedCategory(null)
      setSelectedFramework(null)
      setSelectedIndustry(null)
      setSelectedDifficulty('beginner')
      setSortBy(preset.apply.sortBy)
    } else {
      setSelectedCategory(preset.apply.category)
      setSelectedFramework(preset.apply.framework)
      setSelectedIndustry(preset.apply.industry)
      setSelectedDifficulty(preset.apply.difficulty)
      setSortBy(preset.apply.sortBy)
    }
  }

  const isActiveSavedFilter = (filterId: string): boolean => {
    if (filterId === 'popular') return sortBy === 'popular' && !selectedCategory && !selectedFramework && !selectedIndustry && !selectedDifficulty
    if (filterId === 'recently-added') return sortBy === 'recently-added' && !selectedCategory && !selectedFramework && !selectedIndustry && !selectedDifficulty
    if (filterId === 'beginner-friendly') return selectedDifficulty === 'beginner' && sortBy === 'popular'
    if (filterId === 'multi-agent') return (selectedFramework === 'langgraph' || selectedFramework === 'crewai' || selectedFramework === 'autogen') && !selectedCategory && !selectedIndustry && !selectedDifficulty
    return false
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          <Zap className="h-3 w-3" /> Quick Filters:
        </span>
        {SAVED_FILTERS.map((filter) => {
          const active = isActiveSavedFilter(filter.id)
          return (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => applySavedFilter(filter.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 ${
                active
                  ? 'ring-2 ring-emerald-400 ring-offset-1 ' + filter.color
                  : filter.color + ' hover:shadow-sm'
              }`}
            >
              <filter.icon className="h-3 w-3" />
              {filter.label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
