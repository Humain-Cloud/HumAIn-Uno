'use client'

import dynamic from 'next/dynamic'

const Navbar = dynamic(() => import("@/components/layout/navbar-lite").then(m => ({ default: m.Navbar })), {
  ssr: false,
  loading: () => <div className="h-16 border-b bg-white/80 dark:bg-gray-950/80" />,
});

const Footer = dynamic(() => import("@/components/layout/footer-lite").then(m => ({ default: m.Footer })), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-950" />,
});

export function DynamicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-[1px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
