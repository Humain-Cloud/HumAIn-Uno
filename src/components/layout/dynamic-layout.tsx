'use client'

import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth')

  // Auth pages have their own layout with header/footer
  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-[1px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
