'use client'

import dynamic from 'next/dynamic'

const HomeView = dynamic(() => import('@/components/views/home-view').then(m => ({ default: m.HomeView })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading Humain-Uno...</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  return <HomeView />
}
