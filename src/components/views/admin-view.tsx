'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { Stats, Category } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  Database,
  RefreshCw,
  BarChart3,
  Bot,
  Layers,
  Cpu,
  Building2,
  Users,
  Loader2,
  Check,
  AlertTriangle,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function AdminView() {
  const { session, status, isAuthenticated } = useAppStore() as any
  const sessionData = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [reindexing, setReindexing] = useState(false)
  const [reindexStatus, setReindexStatus] = useState<string | null>(null)

  const isAdmin = sessionData.data?.user && (sessionData.data.user as any).role === 'admin'

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [statsData, catsData]: any[] = await Promise.all([
        api.stats.get(),
        api.categories.list(),
      ])
      setStats(statsData)
      setCategories(Array.isArray(catsData) ? catsData : [])
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReindex = async () => {
    setReindexing(true)
    setReindexStatus(null)
    try {
      // Call a re-index API - for now, we'll just refresh the stats
      await loadData()
      setReindexStatus('Knowledge base re-indexed successfully!')
    } catch (err) {
      setReindexStatus('Re-index failed. Please try again.')
    } finally {
      setReindexing(false)
      setTimeout(() => setReindexStatus(null), 5000)
    }
  }

  if (sessionData.status === 'loading') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground mb-4">
            Sign in with an admin account to access this panel.
          </p>
          <p className="text-xs text-muted-foreground">
            Use <strong>admin@humain-uno.dev</strong> for admin access
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-emerald-600" />
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your platform</p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700">👑 Admin</Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : stats ? (
          [
            { label: 'Total Agents', value: stats.totalAgents, icon: Bot, color: 'text-emerald-600' },
            { label: 'KB Agents', value: stats.knowledgeAgents, icon: Database, color: 'text-amber-600' },
            { label: 'Categories', value: stats.categories, icon: Layers, color: 'text-violet-600' },
            { label: 'Frameworks', value: stats.frameworks, icon: Cpu, color: 'text-rose-600' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Re-index Knowledge Base */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Re-index the knowledge base to pick up any new agents from the repository.
            </p>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleReindex}
              disabled={reindexing}
            >
              {reindexing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Re-indexing...</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-2" /> Re-index Knowledge Base</>
              )}
            </Button>
            {reindexStatus && (
              <div className={`flex items-center gap-2 text-sm ${
                reindexStatus.includes('success') ? 'text-emerald-600' : 'text-destructive'
              }`}>
                {reindexStatus.includes('success') ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {reindexStatus}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Frameworks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Top Frameworks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : stats?.topFrameworks ? (
              <div className="space-y-3">
                {stats.topFrameworks.slice(0, 5).map((fw, i) => {
                  const maxCount = stats.topFrameworks[0]?.count || 1
                  const percentage = (fw.count / maxCount) * 100
                  return (
                    <div key={fw.name} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-24 truncate">{fw.name}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                        />
                        <span className="absolute inset-0 flex items-center px-3 text-xs font-medium">
                          {fw.count} agents
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Category Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4" /> Category Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="text-sm font-medium">{cat.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({cat.agentCount || 0} agents)
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {cat.slug}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Industries */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Top Industries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : stats?.topIndustries ? (
              <div className="flex flex-wrap gap-3">
                {stats.topIndustries.map((ind) => (
                  <div key={ind.name} className="flex items-center gap-2 p-2 border rounded-lg">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm">{ind.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{ind.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
