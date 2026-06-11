'use client'

import { frameworkConfig } from './shared-data'
import { motion } from 'framer-motion'

interface FrameworkTabsProps {
  selectedFramework: string
  setSelectedFramework: (v: string) => void
  frameworkCounts: Record<string, number>
  totalAgents: number
}

export function FrameworkTabs({
  selectedFramework,
  setSelectedFramework,
  frameworkCounts,
  totalAgents,
}: FrameworkTabsProps) {
  const frameworkTabs = Object.entries(frameworkConfig).map(([key, config]) => ({
    key,
    ...config,
    count: key === 'all' ? totalAgents : (frameworkCounts[key] || 0),
  }))

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {frameworkTabs.map((tab) => {
          const isActive = selectedFramework === tab.key
          return (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedFramework(tab.key)}
              aria-label={`Filter by ${tab.label}`}
              aria-pressed={isActive}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0
                ${isActive
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md ${tab.shadowColor}`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-sm'
                }
              `}
            >
              <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-white/60' : tab.dotColor}`} />
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
              `}>
                {tab.count}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-white/50 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
