'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

const AgentDetailView = dynamic(
  () => import('@/components/agents/agent-detail-page').then(m => ({ default: m.AgentDetailPage })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading Agent Details...</p>
        </div>
      </div>
    ),
  }
)

export default function AgentPage() {
  const { setCurrentView } = useAppStore()

  useEffect(() => {
    setCurrentView('detail')
  }, [setCurrentView])

  return <AgentDetailView />
}
