import { useEffect, useState } from 'react'
import { Globe, Link2, Lock, Rocket, Star, Heart, Crown, FolderPlus } from 'lucide-react'

// Animated counter component
export function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) return
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return <>{target === 0 ? 0 : count}</>
}

// Privacy icon helper
export function privacyIcon(privacy: string) {
  switch (privacy) {
    case 'PUBLIC': return <Globe className="h-3 w-3" />
    case 'UNLISTED': return <Link2 className="h-3 w-3" />
    default: return <Lock className="h-3 w-3" />
  }
}

// Recent activity data
export const recentActivity = [
  { id: '1', icon: Rocket, text: 'Created "Customer Support Bot"', time: '2 hours ago', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { id: '2', icon: Star, text: 'Starred "LangGraph Research Agent"', time: '5 hours ago', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
  { id: '3', icon: Heart, text: 'Bookmarked "CrewAI Code Reviewer"', time: '1 day ago', color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400' },
  { id: '4', icon: Crown, text: 'Made "Data Pipeline Agent" public', time: '2 days ago', color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400' },
  { id: '5', icon: FolderPlus, text: 'Added 3 agents to "My Favorites"', time: '3 days ago', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400' },
]
