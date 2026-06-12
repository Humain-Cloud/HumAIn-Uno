'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Search, PlusCircle, Sparkles, Bot, Cpu, Users } from 'lucide-react'
import type { Stats } from '@/lib/types'

interface HeroSectionProps {
  stats: Stats | null
  onNavigate: (view: any) => void
}

export function HeroSection({ stats, onNavigate }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/30" role="banner" aria-label="Hero section">
      {/* Animated background decorations */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-300/5 rounded-full blur-3xl" />
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 will-change-transform"
            style={{
              width: `${4 + (i % 3) * 3}px`,
              height: `${4 + (i % 3) * 3}px`,
              left: `${8 + (i * 7.5) % 85}%`,
              top: `${10 + (i * 11) % 75}%`,
              animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-100 text-sm mb-8"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Powered by 500+ curated AI agent projects
          </motion.div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            Discover &amp; Build<br />
            <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
              AI Agents
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-emerald-100/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Explore 500+ curated AI agents across 5 frameworks. Find the perfect starting point, 
            remix with your own twist, or build from scratch with AI assistance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8 h-13 text-base w-full sm:w-auto shadow-lg shadow-emerald-900/20 rounded-xl gradient-border-animated"
              onClick={() => onNavigate('browse')}
              aria-label="Browse agents"
            >
              <Search className="h-5 w-5 mr-2" aria-hidden="true" />
              Browse Agents
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-13 text-base w-full sm:w-auto backdrop-blur-sm rounded-xl gradient-border-animated"
              onClick={() => onNavigate('wizard')}
              aria-label="Create a new agent"
            >
              <PlusCircle className="h-5 w-5 mr-2" aria-hidden="true" />
              Create Agent
            </Button>
          </div>

          {/* Floating animated badges/pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            {stats ? [
              { label: `${stats.totalAgents}+ Agents`, icon: Bot },
              { label: `${stats.frameworks} Frameworks`, icon: Cpu },
              { label: 'Open Source', icon: Users },
            ].map((pill, pi) => (
              <motion.div
                key={pill.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + pi * 0.1 }}
                whileHover={{ scale: 1.08, y: -2 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-100 text-sm cursor-default"
              >
                <pill.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {pill.label}
              </motion.div>
            )) : null}
          </motion.div>
        </motion.div>

        {/* Scroll down indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-emerald-200/60"
          aria-hidden="true"
        >
          <span className="text-[10px] uppercase tracking-widest font-medium">Scroll</span>
          <div className="animate-bounce-down">
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 1l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
