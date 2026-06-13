'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { motion } from 'framer-motion'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { OnboardingStep } from '@/components/auth/onboarding-step'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  UserPlus,
  BarChart3,
  Layers,
  Building2,
  Rocket,
  Sprout,
  TreePine,
  Crown,
  Bot,
  Users,
  Network,
  BookOpen,
  FlaskConical,
  HeartPulse,
  Landmark,
  Monitor,
  GraduationCap,
  Megaphone,
  Scale,
  Wrench,
  ShoppingBag,
  Factory,
  Shield,
  Zap,
  TrainFront,
  Clapperboard,
  Home,
  Wheat,
  Swords,
  Wifi,
  Hotel,
  Trophy,
  Leaf,
  Code2,
  Search,
  UsersRound,
  Workflow,
  BarChart2,
  Headphones,
  PenTool,
  Terminal,
  MapPin,
  Briefcase,
  Building,
  CheckCircle2,
  Sparkles,
  LogIn,
  Compass,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OnboardingData } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'

// ─── Step Configuration ──────────────────────────────────────────────────────

const TOTAL_STEPS = 5

const STEP_CONFIG = [
  {
    icon: <UserPlus className="h-4 w-4" />,
    title: 'Welcome & Profile',
    subtitle: 'Tell us a bit about yourself so we can personalize your experience.',
  },
  {
    icon: <BarChart3 className="h-4 w-4" />,
    title: 'Experience Level',
    subtitle: 'How familiar are you with AI agents? This helps us tailor recommendations.',
  },
  {
    icon: <Layers className="h-4 w-4" />,
    title: 'Framework Preferences',
    subtitle: 'Select the frameworks you\'re interested in exploring.',
  },
  {
    icon: <Building2 className="h-4 w-4" />,
    title: 'Industry Interests',
    subtitle: 'Choose the industries relevant to your work and goals.',
  },
  {
    icon: <Rocket className="h-4 w-4" />,
    title: 'Use Cases & Finish',
    subtitle: 'What do you want to accomplish with AI agents?',
  },
]

// ─── Data Constants ──────────────────────────────────────────────────────────

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner' as const,
    title: 'Beginner',
    description: "I'm new to AI agents",
    icon: <Sprout className="h-8 w-8" />,
    color: 'emerald',
  },
  {
    id: 'intermediate' as const,
    title: 'Intermediate',
    description: "I've built or used AI agents before",
    icon: <TreePine className="h-8 w-8" />,
    color: 'amber',
  },
  {
    id: 'advanced' as const,
    title: 'Advanced',
    description: "I'm an expert in AI agent development",
    icon: <Crown className="h-8 w-8" />,
    color: 'violet',
  },
]

const FRAMEWORKS = [
  {
    id: 'langgraph',
    name: 'LangGraph',
    description: 'Stateful multi-agent orchestration with graph-based workflows',
    agentCount: '180+',
    color: 'emerald',
    icon: <Network className="h-6 w-6" />,
  },
  {
    id: 'crewai',
    name: 'CrewAI',
    description: 'Role-playing autonomous agents that collaborate as a crew',
    agentCount: '160+',
    color: 'amber',
    icon: <Users className="h-6 w-6" />,
  },
  {
    id: 'autogen',
    name: 'AutoGen',
    description: 'Multi-agent conversations with customizable speakers',
    agentCount: '140+',
    color: 'rose',
    icon: <Bot className="h-6 w-6" />,
  },
  {
    id: 'agno',
    name: 'Agno',
    description: 'Lightning-fast agent building with minimal abstractions',
    agentCount: '120+',
    color: 'violet',
    icon: <FlaskConical className="h-6 w-6" />,
  },
  {
    id: 'llamaindex',
    name: 'LlamaIndex',
    description: 'Data framework for LLM-powered agents and RAG pipelines',
    agentCount: '100+',
    color: 'teal',
    icon: <BookOpen className="h-6 w-6" />,
  },
]

const INDUSTRIES = [
  { id: 'healthcare', name: 'Healthcare', icon: <HeartPulse className="h-4 w-4" /> },
  { id: 'finance', name: 'Finance', icon: <Landmark className="h-4 w-4" /> },
  { id: 'technology', name: 'Technology', icon: <Monitor className="h-4 w-4" /> },
  { id: 'education', name: 'Education', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'marketing', name: 'Marketing', icon: <Megaphone className="h-4 w-4" /> },
  { id: 'legal', name: 'Legal', icon: <Scale className="h-4 w-4" /> },
  { id: 'engineering', name: 'Engineering', icon: <Wrench className="h-4 w-4" /> },
  { id: 'retail', name: 'Retail', icon: <ShoppingBag className="h-4 w-4" /> },
  { id: 'manufacturing', name: 'Manufacturing', icon: <Factory className="h-4 w-4" /> },
  { id: 'public-safety', name: 'Public Safety', icon: <Shield className="h-4 w-4" /> },
  { id: 'energy', name: 'Energy', icon: <Zap className="h-4 w-4" /> },
  { id: 'transportation', name: 'Transportation', icon: <TrainFront className="h-4 w-4" /> },
  { id: 'entertainment', name: 'Entertainment', icon: <Clapperboard className="h-4 w-4" /> },
  { id: 'real-estate', name: 'Real Estate', icon: <Home className="h-4 w-4" /> },
  { id: 'agriculture', name: 'Agriculture', icon: <Wheat className="h-4 w-4" /> },
  { id: 'defense', name: 'Defense', icon: <Swords className="h-4 w-4" /> },
  { id: 'telecommunications', name: 'Telecommunications', icon: <Wifi className="h-4 w-4" /> },
  { id: 'hospitality', name: 'Hospitality', icon: <Hotel className="h-4 w-4" /> },
  { id: 'sports', name: 'Sports', icon: <Trophy className="h-4 w-4" /> },
  { id: 'environmental', name: 'Environmental', icon: <Leaf className="h-4 w-4" /> },
]

const USE_CASES = [
  { id: 'build-agents', name: 'Build AI Agents', description: 'Create and deploy custom AI agents', icon: <Code2 className="h-5 w-5" /> },
  { id: 'research-learning', name: 'Research & Learning', description: 'Explore and learn about AI agent patterns', icon: <Search className="h-5 w-5" /> },
  { id: 'team-collaboration', name: 'Team Collaboration', description: 'Enable multi-agent team workflows', icon: <UsersRound className="h-5 w-5" /> },
  { id: 'process-automation', name: 'Process Automation', description: 'Automate repetitive business processes', icon: <Workflow className="h-5 w-5" /> },
  { id: 'data-analysis', name: 'Data Analysis', description: 'Analyze and extract insights from data', icon: <BarChart2 className="h-5 w-5" /> },
  { id: 'customer-support', name: 'Customer Support', description: 'AI-powered customer service agents', icon: <Headphones className="h-5 w-5" /> },
  { id: 'content-creation', name: 'Content Creation', description: 'Generate and curate content at scale', icon: <PenTool className="h-5 w-5" /> },
  { id: 'code-generation', name: 'Code Generation', description: 'Auto-generate and review code', icon: <Terminal className="h-5 w-5" /> },
]

// ─── Color mapping helpers ───────────────────────────────────────────────────

function getFrameworkColorClasses(color: string, selected: boolean) {
  const map: Record<string, { border: string; bg: string; text: string; badge: string; ring: string }> = {
    emerald: {
      border: selected ? 'border-emerald-500' : 'border-border',
      bg: selected ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-card',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      ring: 'ring-emerald-500/30',
    },
    amber: {
      border: selected ? 'border-amber-500' : 'border-border',
      bg: selected ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-card',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      ring: 'ring-amber-500/30',
    },
    rose: {
      border: selected ? 'border-rose-500' : 'border-border',
      bg: selected ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-card',
      text: 'text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
      ring: 'ring-rose-500/30',
    },
    violet: {
      border: selected ? 'border-violet-500' : 'border-border',
      bg: selected ? 'bg-violet-50 dark:bg-violet-950/30' : 'bg-card',
      text: 'text-violet-600 dark:text-violet-400',
      badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
      ring: 'ring-violet-500/30',
    },
    teal: {
      border: selected ? 'border-teal-500' : 'border-border',
      bg: selected ? 'bg-teal-50 dark:bg-teal-950/30' : 'bg-card',
      text: 'text-teal-600 dark:text-teal-400',
      badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
      ring: 'ring-teal-500/30',
    },
  }
  return map[color] || map.emerald
}

function getExperienceColorClasses(color: string, selected: boolean) {
  const map: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
    emerald: {
      border: selected ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-border',
      bg: selected ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-card hover:bg-muted/50',
      text: 'text-emerald-600 dark:text-emerald-400',
      iconBg: selected ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-muted',
    },
    amber: {
      border: selected ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-border',
      bg: selected ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-card hover:bg-muted/50',
      text: 'text-amber-600 dark:text-amber-400',
      iconBg: selected ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-muted',
    },
    violet: {
      border: selected ? 'border-violet-500 ring-2 ring-violet-500/30' : 'border-border',
      bg: selected ? 'bg-violet-50 dark:bg-violet-950/30' : 'bg-card hover:bg-muted/50',
      text: 'text-violet-600 dark:text-violet-400',
      iconBg: selected ? 'bg-violet-100 dark:bg-violet-900/50' : 'bg-muted',
    },
  }
  return map[color] || map.emerald
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { user: authUser, loading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Onboarding form data
  const [formData, setFormData] = useState<OnboardingData>({
    full_name: '',
    company: '',
    job_title: '',
    preferred_frameworks: [],
    preferred_industries: [],
    experience_level: 'beginner',
    use_cases: [],
    interests: [],
  })

  // Additional profile fields
  const [location, setLocation] = useState('')

  // Check Supabase auth state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserEmail(user.email ?? null)
          setFormData((prev) => ({
            ...prev,
            full_name: prev.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
          }))
        }
        // If no Supabase user, check NextAuth session
      } catch {
        // Supabase not configured - continue with NextAuth session
      }
      setAuthChecked(true)
    }
    checkAuth()
  }, [])

  // Pre-fill from Supabase auth
  useEffect(() => {
    if (authUser) {
      setFormData((prev) => ({
        ...prev,
        full_name: prev.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
      }))
      if (!userEmail && authUser.email) {
        setUserEmail(authUser.email)
      }
    }
  }, [authUser, userEmail])

  // Save progress to Supabase
  const saveProgress = useCallback(
    async (step: number, isComplete = false) => {
      setSaving(true)
      try {
        const userId = authUser?.id || userEmail || 'demo-user'
        const profileData: Record<string, unknown> = {}
        const preferencesData: Record<string, unknown> = {}

        if (step >= 1) {
          profileData.full_name = formData.full_name
          profileData.company = formData.company
          profileData.job_title = formData.job_title
          profileData.location = location
          profileData.email = userEmail || authUser?.email || ''
        }
        if (step >= 2) {
          profileData.preferred_framework = formData.experience_level
          preferencesData.experience_level = formData.experience_level
        }
        if (step >= 3) {
          preferencesData.framework_filter = formData.preferred_frameworks
        }
        if (step >= 4) {
          preferencesData.industry_filter = formData.preferred_industries
          profileData.preferred_industry = formData.preferred_industries[0] || null
        }
        if (step >= 5) {
          preferencesData.use_cases = formData.use_cases
          preferencesData.interests = formData.interests
        }

        await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            step,
            profileData,
            preferencesData,
            onboardingCompleted: isComplete,
          }),
        })
      } catch (error) {
        console.error('Failed to save progress:', error)
      } finally {
        setSaving(false)
      }
    },
    [formData, location, authUser, userEmail]
  )

  // Navigation handlers
  const goNext = useCallback(async () => {
    if (currentStep < TOTAL_STEPS) {
      await saveProgress(currentStep)
      setDirection(1)
      setCurrentStep((s) => s + 1)
    } else {
      // Complete onboarding
      await saveProgress(currentStep, true)
      setCompleted(true)
      setTimeout(() => {
        router.push('/')
      }, 2500)
    }
  }, [currentStep, saveProgress, router])

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  const goSkip = useCallback(async () => {
    await saveProgress(currentStep)
    if (currentStep < TOTAL_STEPS) {
      setDirection(1)
      setCurrentStep((s) => s + 1)
    } else {
      await saveProgress(currentStep, true)
      setCompleted(true)
      setTimeout(() => {
        router.push('/')
      }, 2500)
    }
  }, [currentStep, saveProgress, router])

  const skipAll = useCallback(async () => {
    await saveProgress(currentStep, true)
    setCompleted(true)
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }, [currentStep, saveProgress, router])

  // Validation
  const isNextDisabled = (() => {
    switch (currentStep) {
      case 1:
        return !formData.full_name.trim()
      case 2:
        return false // Experience level always has a default
      case 3:
        return formData.preferred_frameworks.length === 0
      case 4:
        return false // Industries are optional
      case 5:
        return false // Use cases are optional
      default:
        return false
    }
  })()

  // ─── Step Renderers ──────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 p-5 sm:p-6 border border-emerald-200/50 dark:border-emerald-800/30">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
              Welcome to Humain-Uno! 🎉
            </h2>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
              {userEmail || authUser?.email
                ? `Signed in as ${userEmail || authUser?.email}`
                : 'Let\'s set up your personalized experience'}
            </p>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="grid gap-5">
        <div className="space-y-2">
          <Label htmlFor="full-name" className="text-sm font-medium">
            Full Name <span className="text-emerald-500">*</span>
          </Label>
          <div className="relative">
            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="full-name"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData((d) => ({ ...d, full_name: e.target.value }))
              }
              className="pl-10 input-focus"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" />
                Company / Organization
              </span>
            </Label>
            <Input
              id="company"
              placeholder="Acme Inc."
              value={formData.company}
              onChange={(e) =>
                setFormData((d) => ({ ...d, company: e.target.value }))
              }
              className="input-focus"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-title" className="text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                Job Title
              </span>
            </Label>
            <Input
              id="job-title"
              placeholder="Software Engineer"
              value={formData.job_title}
              onChange={(e) =>
                setFormData((d) => ({ ...d, job_title: e.target.value }))
              }
              className="input-focus"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Location
            </span>
          </Label>
          <Input
            id="location"
            placeholder="San Francisco, CA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-focus"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {EXPERIENCE_LEVELS.map((level) => {
          const isSelected = formData.experience_level === level.id
          const colors = getExperienceColorClasses(level.color, isSelected)
          return (
            <motion.div
              key={level.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-200 border-2',
                  colors.border,
                  colors.bg
                )}
                onClick={() =>
                  setFormData((d) => ({ ...d, experience_level: level.id }))
                }
              >
                <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                  <div
                    className={cn(
                      'h-14 w-14 rounded-xl flex items-center justify-center transition-colors',
                      colors.iconBg,
                      isSelected && colors.text
                    )}
                  >
                    {level.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{level.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {level.description}
                    </p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-1"
                    >
                      <CheckCircle2 className={cn('h-5 w-5', colors.text)} />
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select at least one framework you&apos;re interested in.{' '}
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
          {formData.preferred_frameworks.length} selected
        </span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FRAMEWORKS.map((fw) => {
          const isSelected = formData.preferred_frameworks.includes(fw.id)
          const colors = getFrameworkColorClasses(fw.color, isSelected)
          return (
            <motion.div
              key={fw.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-200 border-2',
                  colors.border,
                  isSelected && `ring-2 ${colors.ring}`,
                  colors.bg
                )}
                onClick={() => {
                  setFormData((d) => ({
                    ...d,
                    preferred_frameworks: isSelected
                      ? d.preferred_frameworks.filter((f) => f !== fw.id)
                      : [...d.preferred_frameworks, fw.id],
                  }))
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                        isSelected ? colors.badge : 'bg-muted'
                      )}
                    >
                      {fw.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm">{fw.name}</h3>
                        <Badge
                          variant="secondary"
                          className={cn('text-[10px] px-1.5 py-0', colors.badge)}
                        >
                          {fw.agentCount}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {fw.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center gap-1.5 text-xs font-medium"
                    >
                      <CheckCircle2 className={cn('h-3.5 w-3.5', colors.text)} />
                      <span className={colors.text}>Selected</span>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose industries relevant to your work.{' '}
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
          {formData.preferred_industries.length} selected
        </span>
      </p>
      <div className="flex flex-wrap gap-2.5">
        {INDUSTRIES.map((ind) => {
          const isSelected = formData.preferred_industries.includes(ind.id)
          return (
            <motion.button
              key={ind.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFormData((d) => ({
                  ...d,
                  preferred_industries: isSelected
                    ? d.preferred_industries.filter((i) => i !== ind.id)
                    : [...d.preferred_industries, ind.id],
                }))
              }}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                isSelected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700'
                  : 'bg-card text-foreground border-border hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20'
              )}
            >
              {ind.icon}
              {ind.name}
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-0.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Select your primary use cases for AI agents.{' '}
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
          {formData.use_cases.length} selected
        </span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {USE_CASES.map((uc) => {
          const isSelected = formData.use_cases.includes(uc.id)
          return (
            <motion.div
              key={uc.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-200 border-2',
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-border hover:border-emerald-300 dark:hover:border-emerald-700'
                )}
                onClick={() => {
                  setFormData((d) => ({
                    ...d,
                    use_cases: isSelected
                      ? d.use_cases.filter((u) => u !== uc.id)
                      : [...d.use_cases, uc.id],
                  }))
                }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                      isSelected
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {uc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{uc.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {uc.description}
                    </p>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    className={cn(
                      isSelected && 'border-emerald-500 data-[state=checked]:bg-emerald-500'
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-3">
        <h4 className="text-sm font-semibold">Your Setup Summary</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Name</span>
            <p className="font-medium truncate">{formData.full_name || '—'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Experience</span>
            <p className="font-medium capitalize">{formData.experience_level}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Frameworks</span>
            <p className="font-medium">{formData.preferred_frameworks.length} selected</p>
          </div>
          <div>
            <span className="text-muted-foreground">Industries</span>
            <p className="font-medium">{formData.preferred_industries.length} selected</p>
          </div>
        </div>
      </div>
    </div>
  )

  // ─── Loading state while checking auth ──────────────────────────────────────

  if (!authChecked || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading onboarding...</p>
        </div>
      </div>
    )
  }

  // ─── Unauthenticated redirect ──────────────────────────────────────────────
  if (!authUser && authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full text-center"
        >
          <div className="mb-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to start the onboarding process and set up your personalized experience.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md rounded-xl h-11"
              onClick={() => router.push('/auth/signin?redirect=/onboarding')}
            >
              <LogIn className="h-4 w-4 mr-2" /> Sign In to Continue
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => router.push('/')}
            >
              <Compass className="h-4 w-4 mr-2" /> Go Home
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── Completion overlay ──────────────────────────────────────────────────

  if (completed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="h-20 w-20 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"
          >
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold"
          >
            You&apos;re All Set! 🚀
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground"
          >
            Redirecting you to the dashboard...
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.8, duration: 1.5 }}
            className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full mx-auto max-w-[200px]"
          />
        </motion.div>
      </div>
    )
  }

  // ─── Step renderer ───────────────────────────────────────────────────────

  const stepContent = (() => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      case 5:
        return renderStep5()
      default:
        return null
    }
  })()

  const config = STEP_CONFIG[currentStep - 1]

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* Skip all link */}
      <div className="absolute top-3 right-4 z-40">
        <button
          onClick={skipAll}
          disabled={saving}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          Skip all →
        </button>
      </div>

      <OnboardingStep
        stepNumber={currentStep}
        totalSteps={TOTAL_STEPS}
        title={config.title}
        subtitle={config.subtitle}
        icon={config.icon}
        onBack={currentStep > 1 ? goBack : undefined}
        onNext={goNext}
        onSkip={goSkip}
        isNextDisabled={isNextDisabled}
        isNextLoading={saving}
        isLastStep={currentStep === TOTAL_STEPS}
        showBack={currentStep > 1}
        direction={direction}
      >
        {stepContent}
      </OnboardingStep>
    </div>
  )
}
