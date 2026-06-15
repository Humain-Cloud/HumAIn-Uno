'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Paintbrush,
  LayoutTemplate,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { ScratchWizard } from '@/components/create/scratch-wizard'
import { TemplateGallery } from '@/components/create/template-gallery'
import { AIAssisted } from '@/components/create/ai-assisted'

type CreationMode = 'choose' | 'scratch' | 'template' | 'knowledge' | 'ai'

const creationOptions = [
  {
    id: 'scratch' as const,
    title: 'From Scratch',
    description: 'Start with a blank canvas. Define your agent\'s name, description, framework, LLM model, and behavior from the ground up. Full control over every aspect of your agent.',
    icon: Paintbrush,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'Most Flexible',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  {
    id: 'template' as const,
    title: 'From Template',
    description: 'Choose from curated agent templates across popular frameworks. Customize and deploy in minutes. Each template includes pre-configured tools, prompts, and workflows.',
    icon: LayoutTemplate,
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badge: 'Fastest',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  {
    id: 'knowledge' as const,
    title: 'From Knowledge Base',
    description: 'Explore our curated knowledge base of 800+ agents. Fork any agent, customize it to your needs, and make it your own. Learn from the best implementations.',
    icon: BookOpen,
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    badge: '800+ Agents',
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  },
  {
    id: 'ai' as const,
    title: 'AI-Assisted',
    description: 'Describe what you want in plain English. Our AI will generate a complete agent specification, recommend the best framework and model, and help you refine it step by step.',
    icon: Sparkles,
    gradient: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    badge: 'Smartest',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  },
]

export function CreatePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { setShowAuthModal } = useAppStore()
  const [mode, setMode] = useState<CreationMode>('choose')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true)
    }
  }, [authLoading, user, setShowAuthModal])

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Paintbrush className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Sign in to Create Agents</h2>
          <p className="text-muted-foreground max-w-md">
            You need to be signed in to create AI agents. Sign in or create an account to get started.
          </p>
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            onClick={() => setShowAuthModal(true)}
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <AnimatePresence mode="wait">
        {/* Choose Creation Mode */}
        {mode === 'choose' && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Create an Agent
              </h1>
              <p className="text-muted-foreground mt-2 text-base sm:text-lg">
                Choose how you&apos;d like to build your AI agent. Each path leads to a production-ready agent.
              </p>
            </div>

            {/* Creation Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {creationOptions.map((option, i) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Card
                    className="group cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20 hover:-translate-y-1 h-full"
                    onClick={() => {
                      if (option.id === 'knowledge') {
                        router.push('/knowledge-base')
                      } else {
                        setMode(option.id)
                      }
                    }}
                  >
                    <div className={`h-2 bg-gradient-to-r ${option.gradient}`} />
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`h-14 w-14 rounded-xl ${option.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          <option.icon className={`h-7 w-7 ${option.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold">{option.title}</h3>
                            <Badge className={`text-[10px] px-2 py-0.5 ${option.badgeClass}`}>
                              {option.badge}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Bottom hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-muted-foreground">
                All agents are saved to your dashboard and can be edited anytime after creation.
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* From Scratch Wizard */}
        {mode === 'scratch' && (
          <motion.div
            key="scratch"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={() => setMode('choose')} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to options
              </Button>
            </div>
            <ScratchWizard onCreated={() => router.push('/dashboard')} />
          </motion.div>
        )}

        {/* From Template Gallery */}
        {mode === 'template' && (
          <motion.div
            key="template"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={() => setMode('choose')} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to options
              </Button>
            </div>
            <TemplateGallery onCreated={() => router.push('/dashboard')} />
          </motion.div>
        )}

        {/* AI-Assisted Creation */}
        {mode === 'ai' && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={() => setMode('choose')} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to options
              </Button>
            </div>
            <AIAssisted onCreated={() => router.push('/dashboard')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
