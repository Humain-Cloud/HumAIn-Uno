'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

const KnowledgeHubView = dynamic(
  () => import('@/components/views/knowledge-hub-view').then(m => ({ default: m.KnowledgeHubView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading Knowledge Hub...</p>
        </div>
      </div>
    ),
  }
)

export default function KnowledgeBasePage() {
  const { setCurrentView } = useAppStore()

  // Sync the store's currentView so navigation works consistently
  useEffect(() => {
    setCurrentView('hub')
  }, [setCurrentView])

  return <KnowledgeHubView />
}
