'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Bot,
  Home,
  Compass,
  Library,
  Settings,
  Search,
  Sun,
  Moon,
  Menu,
  PlusCircle,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'

const navItems = [
  { key: 'home', label: 'Home', icon: Home, route: '/' },
  { key: 'hub', label: 'Knowledge Hub', icon: Library, route: '/knowledge-base' },
  { key: 'browse', label: 'Browse', icon: Compass, route: '/browse' },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/#dashboard' },
  { key: 'settings', label: 'Settings', icon: Settings, route: '/settings' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  // Determine current active view from pathname
  const getActiveKey = () => {
    if (pathname === '/') return 'home'
    if (pathname.startsWith('/knowledge-base')) return 'hub'
    if (pathname.startsWith('/browse')) return 'browse'
    if (pathname.startsWith('/settings')) return 'settings'
    if (pathname.startsWith('/dashboard')) return 'dashboard'
    return ''
  }
  const activeKey = getActiveKey()

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-2 sm:gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity group"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 group-hover:shadow-lg transition-shadow">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:inline tracking-tight">
            Humain<span className="text-emerald-600 dark:text-emerald-400">-Uno</span>
          </span>
          <span className="font-bold text-lg sm:hidden">
            H<span className="text-emerald-600 dark:text-emerald-400">-U</span>
          </span>
        </Link>

        {/* Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ key, label, icon: Icon, route }) => (
            <Button
              key={key}
              variant={activeKey === key ? 'secondary' : 'ghost'}
              size="sm"
              className={`text-sm transition-all min-h-[36px] ${
                activeKey === key
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => router.push(route)}
            >
              <Icon className="h-4 w-4 mr-1.5" />
              {label}
            </Button>
          ))}
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder="Search 800+ agents..."
              className="pl-9 h-9 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-full focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 dark:focus:border-emerald-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dark Mode Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 min-h-[36px] min-w-[36px]"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}

          <Button
            size="sm"
            className="hidden sm:flex bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 transition-all min-h-[36px]"
            onClick={() => router.push('/?view=create')}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Create
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 min-h-[36px] min-w-[36px]">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 dark:bg-gray-950">
              <SheetTitle className="flex items-center gap-2.5 mb-8">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold tracking-tight">Humain<span className="text-emerald-600 dark:text-emerald-400">-Uno</span></span>
              </SheetTitle>
              <nav className="flex flex-col gap-1">
                {navItems.map(({ key, label, icon: Icon, route }) => (
                  <Button
                    key={key}
                    variant={activeKey === key ? 'secondary' : 'ghost'}
                    className={`justify-start h-11 min-h-[44px] ${
                      activeKey === key
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium'
                        : ''
                    }`}
                    onClick={() => { router.push(route); setMobileOpen(false) }}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="justify-start h-11 min-h-[44px] text-emerald-600 dark:text-emerald-400"
                  onClick={() => { router.push('/?view=create'); setMobileOpen(false) }}
                >
                  <Sparkles className="h-4 w-4 mr-3" />
                  Create Agent
                </Button>
                <div className="border-t my-3 dark:border-gray-800" />
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <Button variant="ghost" size="sm" className="min-h-[36px]" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
