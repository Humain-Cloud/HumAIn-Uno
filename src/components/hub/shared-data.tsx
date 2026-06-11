'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Layers,
  GitBranch,
  Brain,
  MessageSquare,
  Zap,
  Database,
} from 'lucide-react'

// Framework configuration with colors, icons, etc.
export const frameworkConfig: Record<string, {
  label: string
  color: string
  gradient: string
  shadowColor: string
  icon: React.ComponentType<{ className?: string }>
  bgLight: string
  bgDark: string
  textLight: string
  textDark: string
  barColor: string
  dotColor: string
}> = {
  all: {
    label: 'All',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-200 dark:shadow-emerald-900/30',
    icon: Layers,
    bgLight: 'bg-emerald-100',
    bgDark: 'dark:bg-emerald-900/30',
    textLight: 'text-emerald-700',
    textDark: 'dark:text-emerald-300',
    barColor: 'bg-emerald-500',
    dotColor: 'bg-emerald-500',
  },
  langgraph: {
    label: 'LangGraph',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    shadowColor: 'shadow-emerald-200 dark:shadow-emerald-900/30',
    icon: GitBranch,
    bgLight: 'bg-emerald-100',
    bgDark: 'dark:bg-emerald-900/30',
    textLight: 'text-emerald-700',
    textDark: 'dark:text-emerald-300',
    barColor: 'bg-emerald-500',
    dotColor: 'bg-emerald-500',
  },
  crewai: {
    label: 'CrewAI',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-200 dark:shadow-amber-900/30',
    icon: Brain,
    bgLight: 'bg-amber-100',
    bgDark: 'dark:bg-amber-900/30',
    textLight: 'text-amber-700',
    textDark: 'dark:text-amber-300',
    barColor: 'bg-amber-500',
    dotColor: 'bg-amber-500',
  },
  autogen: {
    label: 'AutoGen',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-500',
    shadowColor: 'shadow-rose-200 dark:shadow-rose-900/30',
    icon: MessageSquare,
    bgLight: 'bg-rose-100',
    bgDark: 'dark:bg-rose-900/30',
    textLight: 'text-rose-700',
    textDark: 'dark:text-rose-300',
    barColor: 'bg-rose-500',
    dotColor: 'bg-rose-500',
  },
  agno: {
    label: 'Agno',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    shadowColor: 'shadow-violet-200 dark:shadow-violet-900/30',
    icon: Zap,
    bgLight: 'bg-violet-100',
    bgDark: 'dark:bg-violet-900/30',
    textLight: 'text-violet-700',
    textDark: 'dark:text-violet-300',
    barColor: 'bg-violet-500',
    dotColor: 'bg-violet-500',
  },
  llamaindex: {
    label: 'LlamaIndex',
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-500',
    shadowColor: 'shadow-teal-200 dark:shadow-teal-900/30',
    icon: Database,
    bgLight: 'bg-teal-100',
    bgDark: 'dark:bg-teal-900/30',
    textLight: 'text-teal-700',
    textDark: 'dark:text-teal-300',
    barColor: 'bg-teal-500',
    dotColor: 'bg-teal-500',
  },
}

// Animated counter component
export function AnimatedCounter({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const increment = target / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

// Framework distribution chart component
export function FrameworkDistributionChart({ topFrameworks }: { topFrameworks: { name: string; count: number }[] }) {
  if (!topFrameworks || topFrameworks.length === 0) return null

  const maxCount = Math.max(...topFrameworks.map((f) => f.count))

  return (
    <div className="space-y-3">
      {topFrameworks.map((fw, i) => {
        const config = frameworkConfig[fw.name.toLowerCase()] || frameworkConfig.all
        const percentage = maxCount > 0 ? (fw.count / maxCount) * 100 : 0
        return (
          <motion.div
            key={fw.name}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3"
          >
            <div className={`h-8 w-8 rounded-lg ${config.bgLight} ${config.bgDark} flex items-center justify-center shrink-0`}>
              <config.icon className={`h-4 w-4 ${config.textLight} ${config.textDark}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate">{fw.name}</span>
                <span className="text-xs text-muted-foreground font-medium ml-2">{fw.count}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${config.gradient} will-change-transform`}
                />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Difficulty config for progress bars
export const difficultyConfig: Record<string, { value: number; color: string; progressColor: string }> = {
  beginner: { value: 33, color: 'text-green-600 dark:text-green-400', progressColor: '[&>div]:bg-green-500' },
  intermediate: { value: 66, color: 'text-amber-600 dark:text-amber-400', progressColor: '[&>div]:bg-amber-500' },
  advanced: { value: 100, color: 'text-rose-600 dark:text-rose-400', progressColor: '[&>div]:bg-rose-500' },
}
