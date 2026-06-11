'use client'

import { Bot, Globe, Heart, FolderOpen, PlusCircle, Compass, Library, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'

interface UserStatsSectionProps {
  session: any
  myAgentsCount: number
  publicCount: number
  bookmarkedCount: number
  collectionsCount: number
  onNavigate: (view: string) => void
}

export function UserStatsSection({ session, myAgentsCount, publicCount, bookmarkedCount, collectionsCount, onNavigate }: UserStatsSectionProps) {
  return (
    <>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 mb-6 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-white/30 shadow-lg">
            <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
              {(session?.user?.name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> Hello!
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'Developer'}!
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {myAgentsCount > 0
                ? `You have ${myAgentsCount} agent${myAgentsCount !== 1 ? 's' : ''} — keep building!`
                : 'Ready to create your first AI agent?'}
            </p>
          </div>
          <Button
            className="bg-white text-emerald-700 hover:bg-white/90 font-semibold shadow-lg hidden sm:flex rounded-xl"
            onClick={() => onNavigate('wizard')}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Create Agent
          </Button>
        </div>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -right-4 -bottom-8 h-24 w-24 rounded-full bg-white/5 blur-xl" />
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Agents', value: myAgentsCount, icon: Bot, gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
          { label: 'Public Agents', value: publicCount, icon: Globe, gradient: 'from-cyan-500 to-blue-600', iconBg: 'bg-cyan-100 dark:bg-cyan-900/30', iconColor: 'text-cyan-600' },
          { label: 'Bookmarks', value: bookmarkedCount, icon: Heart, gradient: 'from-rose-500 to-pink-600', iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-600' },
          { label: 'Collections', value: collectionsCount, icon: FolderOpen, gradient: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="overflow-hidden rounded-xl">
              <div className={`h-1.5 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md rounded-xl"
            onClick={() => onNavigate('wizard')}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Create Agent
          </Button>
          <Button variant="outline" className="rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200" onClick={() => onNavigate('browse')}>
            <Compass className="h-4 w-4 mr-2" /> Browse Templates
          </Button>
          <Button variant="outline" className="rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200" onClick={() => onNavigate('hub')}>
            <Library className="h-4 w-4 mr-2" /> Knowledge Hub
          </Button>
        </div>
      </div>
    </>
  )
}
