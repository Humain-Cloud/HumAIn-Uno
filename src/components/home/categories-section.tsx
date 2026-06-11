'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Bot, Layers, AlertCircle, RefreshCw } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { categoryIcons } from './shared-data'
import type { Category } from '@/lib/types'

interface CategoriesSectionProps {
  categories: Category[]
  loading: boolean
  error?: string
  onRetry: () => void
  onNavigate: (view: any) => void
}

export function CategoriesSection({ categories, loading, error, onRetry, onNavigate }: CategoriesSectionProps) {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-gray-950" role="region" aria-label="Explore by category">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 relative text-gray-900 dark:text-gray-100">Explore by Category<span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" /></h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Find agents for your specific use case and industry</p>
        </motion.div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-900/20 mb-3">
              <AlertCircle className="h-6 w-6 text-rose-500 dark:text-rose-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">{error}</p>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={onRetry}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.filter(c => (c.agentCount || 0) > 0).slice(0, 10).map((cat, i) => {
              const IconComp = categoryIcons[cat.name] || Bot
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.04, y: -2 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden group will-change-transform rounded-xl"
                    onClick={() => {
                      const store = useAppStore.getState()
                      store.setSelectedCategory(cat.id)
                      store.setCurrentView('browse')
                      store.setSelectedAgentId(null)
                      window.scrollTo(0, 0)
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${cat.name}: ${cat.agentCount || 0} agents`}
                  >
                    <CardContent className="p-5 text-center">
                      <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 mb-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors group-hover:scale-110 transition-transform duration-200">
                        <IconComp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        {cat.agentCount || 0} agents
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
        <div className="mt-8 text-center">
          <Button variant="outline" className="rounded-lg" onClick={() => onNavigate('browse')} aria-label="View all categories">
            <Layers className="h-4 w-4 mr-2" aria-hidden="true" /> View All Categories
          </Button>
        </div>
      </div>
    </section>
  )
}
