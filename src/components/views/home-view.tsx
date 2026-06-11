'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent, Stats, Category } from '@/lib/types'
import { getCachedStats, getCachedCategories, getCachedRecentAgents, getCachedFeaturedAgents } from '@/lib/data-cache'

import { HeroSection } from '@/components/home/hero-section'
import { TrendingSection } from '@/components/home/trending-section'
import { StatsSection } from '@/components/home/stats-section'
import { HowItWorksSection } from '@/components/home/how-it-works-section'
import { FeaturedAgentsSection } from '@/components/home/featured-agents-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { FrameworksSection } from '@/components/home/frameworks-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { CommunitySection } from '@/components/home/community-section'
import { CtaSection } from '@/components/home/cta-section'

export function HomeView() {
  const { setCurrentView, setSelectedAgentId, recentlyViewedAgentIds } = useAppStore()
  const [stats, setStats] = useState<Stats | null>(() => getCachedStats() as Stats || null)
  const [featuredAgents, setFeaturedAgents] = useState<KnowledgeAgent[]>(() => (getCachedFeaturedAgents() || []) as KnowledgeAgent[])
  const [trendingAgents, setTrendingAgents] = useState<KnowledgeAgent[]>(() => (getCachedRecentAgents() || []) as KnowledgeAgent[])
  const [recentlyViewedAgents, setRecentlyViewedAgents] = useState<any[]>([])
  const [recentlyViewedLoading, setRecentlyViewedLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>(() => (getCachedCategories() || []) as Category[])
  const [loading, setLoading] = useState(() => !getCachedStats())
  const [trendingIndex, setTrendingIndex] = useState(0)
  const [sectionErrors, setSectionErrors] = useState<{stats?: string; featured?: string; trending?: string; categories?: string}>({})

  // Parse the agents data
  const parseAgents = (raw: any) => {
    const arr = (raw as any)?.data || raw || []
    return arr.map((a: any) => ({
      ...a,
      tools: typeof a.tools === 'string' ? JSON.parse(a.tools || '[]') : a.tools || [],
      models: typeof a.models === 'string' ? JSON.parse(a.models || '[]') : a.models || [],
      tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags || [],
    }))
  }

  useEffect(() => {
    // If we have cached data from server prefetch, skip API calls
    if (getCachedStats()) {
      return
    }

    async function load() {
      const newErrors: {stats?: string; featured?: string; trending?: string; categories?: string} = {}

      try {
        const statsData = await api.stats.get()
        setStats(statsData as Stats)
      } catch (err) {
        console.error('Failed to load stats:', err)
        newErrors.stats = 'Unable to load statistics.'
      }

      try {
        const agentsData = await api.knowledge.list({ page: 1, pageSize: 6 })
        setFeaturedAgents(parseAgents(agentsData))
      } catch (err) {
        console.error('Failed to load featured agents:', err)
        newErrors.featured = 'Unable to load featured agents.'
      }

      try {
        const trendingData = await api.knowledge.list({ page: 1, pageSize: 8 })
        setTrendingAgents(parseAgents(trendingData))
      } catch (err) {
        console.error('Failed to load trending agents:', err)
        newErrors.trending = 'Unable to load trending agents.'
      }

      try {
        const catsData = await api.categories.list()
        setCategories(Array.isArray(catsData) ? catsData : [])
      } catch (err) {
        console.error('Failed to load categories:', err)
        newErrors.categories = 'Unable to load categories.'
      }

      setSectionErrors(newErrors)
      setLoading(false)
    }
    load()
  }, [])

  // Retry a specific section
  const retrySection = async (section: 'stats' | 'featured' | 'trending' | 'categories') => {
    setSectionErrors(prev => ({ ...prev, [section]: undefined }))
    try {
      if (section === 'stats') {
        const statsData = await api.stats.get()
        setStats(statsData as Stats)
      } else if (section === 'featured') {
        const agentsData = await api.knowledge.list({ page: 1, pageSize: 6 })
        setFeaturedAgents(parseAgents(agentsData))
      } else if (section === 'trending') {
        const trendingData = await api.knowledge.list({ page: 1, pageSize: 8 })
        setTrendingAgents(parseAgents(trendingData))
      } else if (section === 'categories') {
        const catsData = await api.categories.list()
        setCategories(Array.isArray(catsData) ? catsData : [])
      }
    } catch (err) {
      console.error(`Failed to retry ${section}:`, err)
      setSectionErrors(prev => ({ ...prev, [section]: 'Still unable to load. Please try again.' }))
    }
  }

  // Auto-cycle trending agents
  useEffect(() => {
    if (trendingAgents.length === 0) return
    const timer = setInterval(() => {
      setTrendingIndex(prev => (prev + 1) % trendingAgents.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [trendingAgents.length])

  // Load recently viewed agents
  useEffect(() => {
    async function loadRecentlyViewed() {
      if (recentlyViewedAgentIds.length === 0) {
        setRecentlyViewedAgents([])
        return
      }
      setRecentlyViewedLoading(true)
      const agents: any[] = []
      for (const id of recentlyViewedAgentIds.slice(0, 4)) {
        try {
          const agent = await api.knowledge.get(id)
          agents.push(agent)
        } catch {
          try {
            const agent = await api.agents.get(id)
            agents.push(agent)
          } catch { /* ignore */ }
        }
      }
      setRecentlyViewedAgents(agents)
      setRecentlyViewedLoading(false)
    }
    loadRecentlyViewed()
  }, [recentlyViewedAgentIds])

  const handleNav = (view: any) => {
    setCurrentView(view)
    setSelectedAgentId(null)
    window.scrollTo(0, 0)
  }

  const handleViewAgent = (agent: any) => {
    setSelectedAgentId(agent.id)
    setCurrentView('detail')
    window.scrollTo(0, 0)
  }

  return (
    <div>
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:text-sm"
      >
        Skip to main content
      </a>

      <HeroSection stats={stats} onNavigate={handleNav} />

      <TrendingSection
        trendingAgents={trendingAgents}
        loading={loading}
        error={sectionErrors.trending}
        trendingIndex={trendingIndex}
        onRetry={() => retrySection('trending')}
        onViewAgent={handleViewAgent}
        recentlyViewedAgentIds={recentlyViewedAgentIds}
        recentlyViewedAgents={recentlyViewedAgents}
        recentlyViewedLoading={recentlyViewedLoading}
      />

      <StatsSection
        stats={stats}
        loading={loading}
        error={sectionErrors.stats}
        onRetry={() => retrySection('stats')}
      />

      <HowItWorksSection />

      <TestimonialsSection />

      <FeaturedAgentsSection
        featuredAgents={featuredAgents}
        loading={loading}
        error={sectionErrors.featured}
        onRetry={() => retrySection('featured')}
        onNavigate={handleNav}
      />

      <CategoriesSection
        categories={categories}
        loading={loading}
        error={sectionErrors.categories}
        onRetry={() => retrySection('categories')}
        onNavigate={handleNav}
      />

      <FrameworksSection />

      <CommunitySection />

      <CtaSection stats={stats} onNavigate={handleNav} />
    </div>
  )
}
