'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

const BrowseView = dynamic(
  () => import('@/components/views/browse-view').then(m => ({ default: m.BrowseView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading Browse...</p>
        </div>
      </div>
    ),
  }
)

export default function BrowsePage() {
  const { setCurrentView } = useAppStore()

  // Sync the store's currentView so navigation works consistently
  useEffect(() => {
    setCurrentView('browse')
  }, [setCurrentView])

  return <BrowseView />
}
