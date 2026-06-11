'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { frameworks, frameworkComparison } from './shared-data'

export function FrameworksSection() {
  return (
    <>
      {/* Framework Showcase */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900" role="region" aria-label="Supported frameworks">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-4xl font-bold mb-3 relative text-gray-900 dark:text-gray-100">Supported Frameworks<span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" /></h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Build agents with the tools you already know and love</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {frameworks.map((fw, i) => (
              <motion.div
                key={fw.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-sm will-change-transform rounded-xl">
                  <div className={`h-1.5 bg-gradient-to-r ${fw.color}`} aria-hidden="true" />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${fw.color} flex items-center justify-center shadow-md ${fw.shadowColor} group-hover:scale-105 transition-transform duration-200`}>
                          <fw.icon className="h-6 w-6 text-white group-hover:animate-pulse" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{fw.name}</h3>
                          <span className="text-xs text-muted-foreground">{fw.agents} agents</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {fw.tag}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{fw.description}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-0 h-auto font-medium"
                      onClick={() => {
                        const store = useAppStore.getState()
                        store.setSelectedFramework(fw.name.toLowerCase())
                        store.setCurrentView('browse')
                        store.setSelectedAgentId(null)
                        window.scrollTo(0, 0)
                      }}
                      aria-label={`Browse ${fw.name} agents`}
                    >
                      Browse {fw.name} agents <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Framework Comparison Table */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-950" role="region" aria-label="Framework comparison">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-4xl font-bold mb-3 relative text-gray-900 dark:text-gray-100">Compare Frameworks<span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" /></h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Find the right framework for your specific needs</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            <div className="min-w-[600px]">
              <Card className="border-0 shadow-sm overflow-hidden rounded-xl">
                {/* Table Header */}
                <div className="grid grid-cols-6 bg-gray-50 dark:bg-gray-900 border-b" role="row">
                  <div className="p-4 font-semibold text-sm text-muted-foreground" role="columnheader">Feature</div>
                  {[
                    { key: 'langgraph', name: 'LangGraph' },
                    { key: 'crewai', name: 'CrewAI' },
                    { key: 'autogen', name: 'AutoGen' },
                    { key: 'agno', name: 'Agno' },
                    { key: 'llamaindex', name: 'LlamaIndex' },
                  ].map(fw => (
                    <div key={fw.key} className={`p-4 font-semibold text-sm text-center ${frameworkComparison.frameworkColors[fw.key as keyof typeof frameworkComparison.frameworkColors]}`} role="columnheader">
                      {fw.name}
                    </div>
                  ))}
                </div>
                {/* Table Rows */}
                {frameworkComparison.features.map((feature, i) => (
                  <div key={feature.name} className={`grid grid-cols-6 border-b last:border-b-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50/50 dark:bg-gray-900/50'}`} role="row">
                    <div className="p-4 text-sm font-medium" role="cell">{feature.name}</div>
                    {(['langgraph', 'crewai', 'autogen', 'agno', 'llamaindex'] as const).map(fw => {
                      const val = feature[fw]
                      return (
                        <div key={fw} className="p-4 flex items-center justify-center" role="cell">
                          {typeof val === 'boolean' ? (
                            val ? (
                              <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center" aria-label="Supported">
                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                              </div>
                            ) : (
                              <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center" aria-label="Not supported">
                                <X className="h-4 w-4 text-gray-400" aria-hidden="true" />
                              </div>
                            )
                          ) : (
                            <Badge
                              variant="secondary"
                              className={`text-[10px] ${frameworkComparison.frameworkBg[fw]}`}
                            >
                              {val}
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </Card>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
