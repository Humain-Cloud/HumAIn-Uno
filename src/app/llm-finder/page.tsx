'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

const ModelsExplorer = dynamic(
  () => import('@/components/models/models-explorer'),
  { ssr: false, loading: () => <ModelsLoading /> }
)

function ModelsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-muted-foreground text-sm">Loading LLM Finder...</p>
      </div>
    </div>
  )
}

export default function LLMFinderPage() {
  const setCurrentView = useAppStore(s => s.setCurrentView)

  useEffect(() => {
    setCurrentView('llm-finder')
  }, [setCurrentView])

  return <ModelsExplorer />
}
