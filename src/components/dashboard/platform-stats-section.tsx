'use client'

import { Bot, Cpu, Database, TrendingUp, Sparkles, LogIn, ArrowRight, Compass, PlusCircle, Library, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { AnimatedCounter } from './shared-data'

interface PlatformStatsSectionProps {
  stats: any
  onSignIn: () => void
  onNavigate: (view: string) => void
}

export function PlatformStatsSection({ stats, onSignIn, onNavigate }: PlatformStatsSectionProps) {
  return (
    <>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 sm:p-10 mb-8 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <Badge className="bg-white/20 text-white border-white/30 mb-3">
            <Sparkles className="h-3 w-3 mr-1" /> Welcome to Humain-Uno
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Discover & Build AI Agents
          </h1>
          <p className="text-white/80 text-lg mb-6 max-w-xl">
            Browse 600+ curated agent projects, create your own, and organize them into collections.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-white text-emerald-700 hover:bg-white/90 font-semibold shadow-lg"
              onClick={onSignIn}
            >
              <LogIn className="h-4 w-4 mr-2" /> Sign In to Get Started
            </Button>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => onNavigate('browse')}
            >
              Browse Agents
            </Button>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -right-4 -bottom-12 h-32 w-32 rounded-full bg-white/5 blur-xl" />
      </motion.div>

      {/* Quick Start Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: 'Browse Agents',
              desc: 'Explore 600+ curated AI agents from top frameworks',
              icon: Compass,
              color: 'from-emerald-500 to-teal-600',
              iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
              iconColor: 'text-emerald-600 dark:text-emerald-400',
              action: () => onNavigate('browse'),
            },
            {
              title: 'Create Your First Agent',
              desc: 'Use our wizard to build a custom AI agent in minutes',
              icon: PlusCircle,
              color: 'from-amber-500 to-orange-600',
              iconBg: 'bg-amber-100 dark:bg-amber-900/30',
              iconColor: 'text-amber-600 dark:text-amber-400',
              action: () => onNavigate('wizard'),
            },
            {
              title: 'Explore Knowledge Hub',
              desc: 'Dive into the curated collection of agent projects',
              icon: Library,
              color: 'from-violet-500 to-purple-600',
              iconBg: 'bg-violet-100 dark:bg-violet-900/30',
              iconColor: 'text-violet-600 dark:text-violet-400',
              action: () => onNavigate('hub'),
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="cursor-pointer"
              onClick={item.action}
            >
              <Card className="h-full rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-1 bg-gradient-to-r ${item.color}`} />
                <CardContent className="p-6">
                  <div className={`h-12 w-12 rounded-xl ${item.iconBg} flex items-center justify-center mb-4`}>
                    <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Platform Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-600" /> Platform Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Agents', value: stats.totalAgents || 0, icon: Bot, color: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
              { label: 'Frameworks', value: stats.frameworks || 0, icon: Cpu, color: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
              { label: 'Categories', value: stats.categories || 0, icon: Database, color: 'from-violet-500 to-purple-600', iconBg: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600' },
              { label: 'Industries', value: stats.topIndustries?.length || 0, icon: TrendingUp, color: 'from-rose-500 to-pink-600', iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-600' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
              >
                <Card className="overflow-hidden rounded-xl">
                  <div className={`h-1.5 bg-gradient-to-r ${stat.color}`} />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold tracking-tight">
                          <AnimatedCounter target={stat.value} />
                        </div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-2xl bg-gradient-to-r from-gray-50 to-emerald-50/50 dark:from-gray-900 dark:to-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30 p-8 text-center"
      >
        <h2 className="text-xl font-bold mb-2">Sign in to create your own agents and build collections</h2>
        <p className="text-muted-foreground mb-4">Join thousands of developers building and sharing AI agents</p>
        <Button
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
          onClick={onSignIn}
        >
          <LogIn className="h-4 w-4 mr-2" /> Sign In Now
        </Button>
      </motion.div>
    </>
  )
}
