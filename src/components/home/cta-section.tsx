'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { PlusCircle, Eye, Rocket, Play } from 'lucide-react'
import { AnimatedCounter } from './animated-counter'
import type { Stats } from '@/lib/types'

interface CtaSectionProps {
  stats: Stats | null
  onNavigate: (view: any) => void
}

export function CtaSection({ stats, onNavigate }: CtaSectionProps) {
  return (
    <section className="relative py-20 sm:py-24 overflow-hidden" role="region" aria-label="Call to action">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/30" aria-hidden="true" />
      {/* Animated gradient border at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400" style={{ backgroundSize: '200% 100%', animation: 'gradient-rotate 3s ease infinite' }} aria-hidden="true" />
      {/* Gradient border animation wrapper */}
      <div className="absolute inset-0 rounded-2xl m-2 p-[2px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 opacity-20 blur-sm" style={{ backgroundSize: '200% 100%', animation: 'gradient-rotate 4s ease infinite' }} aria-hidden="true" />
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-teal-400/20 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-6" aria-hidden="true">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Ready to build your AI agent?
          </h2>
          <p className="text-emerald-100 text-lg sm:text-xl mb-8 max-w-xl mx-auto leading-relaxed">
            Start from scratch or remix from 800+ curated templates. Deploy in minutes with AI assistance.
          </p>
          {/* Animated platform stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 mb-10">
            {[
              { value: stats?.totalAgents || 105, label: 'Agents', color: 'text-white' },
              { value: stats?.frameworks || 5, label: 'Frameworks', color: 'text-emerald-200' },
              { value: 2500, label: 'Developers', color: 'text-teal-200' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center"
              >
                <div className={`text-2xl sm:text-3xl font-bold ${item.color}`}>
                  <AnimatedCounter target={item.value} duration={1.5} />
                </div>
                <div className="text-xs text-emerald-200/80 font-medium">{item.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8 h-13 text-base shadow-lg shadow-emerald-900/20 rounded-xl"
              onClick={() => onNavigate('wizard')}
              aria-label="Create your agent now"
            >
              <PlusCircle className="h-5 w-5 mr-2" aria-hidden="true" />
              Create Your Agent Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-13 text-base rounded-xl"
              onClick={() => onNavigate('browse')}
              aria-label="Explore agent gallery"
            >
              <Eye className="h-5 w-5 mr-2" aria-hidden="true" />
              Explore Gallery
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-13 text-base rounded-xl"
              onClick={() => onNavigate('hub')}
              aria-label="Watch demo of knowledge hub"
            >
              <Play className="h-5 w-5 mr-2" aria-hidden="true" />
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
