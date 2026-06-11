'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Bot, Cpu, Building2, Layers, AlertCircle, RefreshCw } from 'lucide-react'
import { AnimatedCounter } from './animated-counter'
import type { Stats } from '@/lib/types'

function MiniSparkline({ color = '#10b981', data = [20, 45, 30, 60, 40, 70, 55, 80, 65, 90] }: { color?: string; data?: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80
  const h = 28
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ')

  return (
    <svg width={w} height={h} className="opacity-40" aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

interface StatsSectionProps {
  stats: Stats | null
  loading: boolean
  error?: string
  onRetry: () => void
}

export function StatsSection({ stats, loading, error, onRetry }: StatsSectionProps) {
  return (
    <section className="py-14 sm:py-18 relative overflow-hidden bg-grid-pattern" role="region" aria-label="Platform statistics">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950/20" aria-hidden="true" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-100/30 dark:bg-teal-900/10 rounded-full blur-3xl" aria-hidden="true" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Updated daily badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <RefreshCw className="h-3 w-3 text-emerald-500" aria-hidden="true" />
            Updated daily
          </Badge>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-900/20 mb-3">
                <AlertCircle className="h-6 w-6 text-rose-500 dark:text-rose-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">{error}</p>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={onRetry}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
              </Button>
            </div>
          ) : stats ? (
            [
              { label: 'Total Agents', value: stats.totalAgents, icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', sparkColor: '#10b981', sparkData: [20, 45, 30, 60, 40, 70, 55, 80, 65, 90] },
              { label: 'Frameworks', value: stats.frameworks, icon: Cpu, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', sparkColor: '#f59e0b', sparkData: [30, 25, 40, 35, 50, 45, 55, 50, 60, 55] },
              { label: 'Industries', value: stats.industries || stats.topIndustries?.length || 0, icon: Building2, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', sparkColor: '#f43f5e', sparkData: [10, 20, 15, 30, 25, 40, 35, 50, 45, 55] },
              { label: 'Categories', value: stats.categories, icon: Layers, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', sparkColor: '#8b5cf6', sparkData: [15, 30, 25, 45, 40, 55, 50, 65, 60, 75] },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group will-change-transform rounded-xl">
                  {/* Animated border gradient on hover */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1.5px] bg-gradient-to-br from-emerald-400 via-cyan-400 to-violet-400 will-change-transform" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} aria-hidden="true" />
                  <CardContent className="p-5 sm:p-6 text-center relative">
                    <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${stat.bg} mb-3`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold tracking-tight">
                      <AnimatedCounter target={stat.value} />
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</div>
                    {/* Sparkline decoration */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
                      <MiniSparkline color={stat.sparkColor} data={stat.sparkData} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : null}
        </div>
      </div>
    </section>
  )
}
