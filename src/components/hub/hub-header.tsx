'use client'

import type { Stats } from '@/lib/types'
import { AnimatedCounter } from './shared-data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Bot,
  Search,
  Cpu,
  Building2,
  Layers,
  Library,
  Shuffle,
  Clock,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface HubHeaderProps {
  stats: Stats | null
  searchQuery: string
  setSearchQuery: (v: string) => void
  randomSpinning: boolean
  onRandomPick: () => void
  allAgentsCount: number
  minutesAgo: number
}

export function HubHeader({
  stats,
  searchQuery,
  setSearchQuery,
  randomSpinning,
  onRandomPick,
  allAgentsCount,
  minutesAgo,
}: HubHeaderProps) {
  return (
    <>
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800" aria-label="Knowledge Hub Header">
        {/* Animated background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-300/5 rounded-full blur-3xl" />
          {/* Constellation / Particle effect */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white constellation-particle"
              style={{
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                left: `${5 + (i * 4.7) % 90}%`,
                top: `${5 + (i * 6.3) % 85}%`,
                '--twinkle-duration': `${2 + (i % 4)}s`,
                '--twinkle-delay': `${i * 0.3}s`,
              } as React.CSSProperties}
            />
          ))}
          {/* Constellation lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" aria-hidden="true">
            {[...Array(8)].map((_, i) => {
              const x1 = 10 + (i * 12) % 80
              const y1 = 15 + (i * 17) % 70
              const x2 = 15 + ((i + 3) * 11) % 75
              const y2 = 20 + ((i + 2) * 14) % 65
              return (
                <line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="white" strokeWidth="0.5" />
              )
            })}
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-100 text-sm mb-6"
            >
              <Library className="h-4 w-4" />
              Curated from 500-AI-Agents-Projects
            </motion.div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-[1.1] tracking-tight gradient-text" style={{ WebkitTextFillColor: 'unset' }}>
                  Knowledge Hub
                </h1>
                <p className="text-lg sm:text-xl text-emerald-100/90 max-w-2xl leading-relaxed">
                  Explore our curated collection of 500+ AI agent templates from the open-source community
                </p>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                {/* Random Agent Picker */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRandomPick}
                  disabled={randomSpinning || allAgentsCount === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all shrink-0 disabled:opacity-50"
                  aria-label="Discover a random agent"
                >
                  <motion.div
                    animate={randomSpinning ? { rotate: 360 } : { rotate: 0 }}
                    transition={randomSpinning ? { duration: 0.8, ease: 'linear' } : {}}
                  >
                    <Shuffle className="h-4 w-4" />
                  </motion.div>
                  <span className="hidden sm:inline">Discover Random</span>
                  <span className="sm:hidden">Random</span>
                </motion.button>

                {/* Search in Knowledge Hub */}
                <div className="w-full lg:w-80 shrink-0">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300" />
                    <Input
                      placeholder="Search knowledge base..."
                      className="pl-9 h-11 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-emerald-200/60 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search knowledge base"
                    />
                    {/* Animated border gradient on focus */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 p-[1.5px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 pointer-events-none" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
                    {searchQuery && (
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200/60 hover:text-white transition-colors"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-white dark:bg-gray-950" aria-label="Platform statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto">
              {stats ? (
                [
                  { label: 'Total Agents', value: stats.knowledgeAgents, icon: Bot, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                  { label: 'Frameworks', value: stats.frameworks, icon: Cpu, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                  { label: 'Categories', value: stats.categories, icon: Layers, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                  { label: 'Industries', value: stats.topIndustries?.length || 0, icon: Building2, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 shrink-0"
                  >
                    <div className={`h-9 w-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-lg font-bold tracking-tight">
                        <AnimatedCounter target={stat.value} duration={1} />
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                  </motion.div>
                ))
              ) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 shrink-0">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-10 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Last updated indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <Clock className="h-3 w-3" />
              <span>Updated {minutesAgo === 0 ? 'just now' : `${minutesAgo}m ago`}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
