'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useAppStore } from '@/lib/store'
import { HomeView } from '@/components/views/home-view'
import { BrowseView } from '@/components/views/browse-view'
import { DetailView } from '@/components/views/detail-view'
import { DashboardView } from '@/components/views/dashboard-view'
import { WizardView } from '@/components/views/wizard-view'
import { AdminView } from '@/components/views/admin-view'
import { AuthModal } from '@/components/auth/auth-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  Search,
  Home,
  Compass,
  LayoutDashboard,
  PlusCircle,
  Shield,
  LogIn,
  LogOut,
  Menu,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'

function Navbar() {
  const { currentView, setCurrentView, searchQuery, setSearchQuery, setSelectedAgentId } = useAppStore()
  const { data: session, status } = useSession()
  const { setShowAuthModal } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const navItems = [
    { key: 'home' as const, label: 'Home', icon: Home },
    { key: 'browse' as const, label: 'Browse', icon: Compass },
    { key: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  ]

  const handleNav = (view: any) => {
    setCurrentView(view)
    setSelectedAgentId(null)
    setMobileOpen(false)
    window.scrollTo(0, 0)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-2 sm:gap-4">
        {/* Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity group"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 group-hover:shadow-lg group-hover:shadow-emerald-200 dark:group-hover:shadow-emerald-900/40 transition-shadow">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:inline tracking-tight">
            Humain<span className="text-emerald-600">-Uno</span>
          </span>
          <span className="font-bold text-lg sm:hidden">
            H<span className="text-emerald-600">-U</span>
          </span>
        </button>

        {/* Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={currentView === key ? 'secondary' : 'ghost'}
              size="sm"
              className={`text-sm transition-all ${currentView === key ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => handleNav(key)}
            >
              <Icon className="h-4 w-4 mr-1.5" />
              {label}
            </Button>
          ))}
          {session && (session as any).role === 'admin' && (
            <Button
              variant={currentView === 'admin' ? 'secondary' : 'ghost'}
              size="sm"
              className={`text-sm transition-all ${currentView === 'admin' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}`}
              onClick={() => handleNav('admin')}
            >
              <Shield className="h-4 w-4 mr-1.5" />
              Admin
            </Button>
          )}
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-md mx-2">
          <div className={`relative transition-all duration-200 ${searchFocused ? 'scale-105' : ''}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search 500+ agents..."
              className="pl-9 h-9 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-full focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (currentView !== 'browse') {
                  setCurrentView('browse')
                  setSelectedAgentId(null)
                }
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && currentView !== 'browse') {
                  setCurrentView('browse')
                  setSelectedAgentId(null)
                }
              }}
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
              className="h-9 w-9"
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
            className="hidden sm:flex bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 transition-all"
            onClick={() => handleNav('wizard')}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Create
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="sm:hidden h-9 w-9 text-emerald-600"
            onClick={() => handleNav('wizard')}
          >
            <PlusCircle className="h-5 w-5" />
          </Button>

          {status === 'authenticated' && session ? (
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1.5 px-2.5 py-1">
                {(session as any).role === 'admin' ? '👑 ' : ''}
                {session.user?.name || 'User'}
              </Badge>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:flex rounded-full"
              onClick={() => setShowAuthModal(true)}
            >
              <LogIn className="h-4 w-4 mr-1.5" />
              Sign In
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="flex items-center gap-2.5 mb-8">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold tracking-tight">Humain<span className="text-emerald-600">-Uno</span></span>
              </SheetTitle>
              <nav className="flex flex-col gap-1">
                {navItems.map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={currentView === key ? 'secondary' : 'ghost'}
                    className={`justify-start h-10 ${currentView === key ? 'bg-emerald-50 text-emerald-700 font-medium' : ''}`}
                    onClick={() => handleNav(key)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {label}
                  </Button>
                ))}
                <Button
                  variant={currentView === 'wizard' ? 'secondary' : 'ghost'}
                  className="justify-start h-10 text-emerald-600"
                  onClick={() => handleNav('wizard')}
                >
                  <Sparkles className="h-4 w-4 mr-3" />
                  Create Agent
                </Button>
                {session && (session as any).role === 'admin' && (
                  <Button
                    variant={currentView === 'admin' ? 'secondary' : 'ghost'}
                    className="justify-start h-10"
                    onClick={() => handleNav('admin')}
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    Admin
                  </Button>
                )}
                <div className="border-t my-3" />
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="border-t my-3" />
                {status === 'authenticated' && session ? (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Signed in as <strong>{session.user?.name || session.user?.email}</strong>
                    </div>
                    <Button variant="ghost" className="justify-start h-10 text-destructive" onClick={() => { signOut(); setMobileOpen(false) }}>
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" className="justify-start h-10" onClick={() => { setShowAuthModal(true); setMobileOpen(false) }}>
                    <LogIn className="h-4 w-4 mr-3" />
                    Sign In
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-auto border-t bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">
              Humain<span className="text-emerald-600">-Uno</span>
            </span>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-2">
            <p className="text-xs text-muted-foreground">
              © 2025 Humain-Uno. Powered by 500+ AI Agents Knowledge Base
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="hover:text-emerald-600 cursor-pointer transition-colors">LangGraph</span>
              <span>·</span>
              <span className="hover:text-amber-600 cursor-pointer transition-colors">CrewAI</span>
              <span>·</span>
              <span className="hover:text-rose-600 cursor-pointer transition-colors">AutoGen</span>
              <span>·</span>
              <span className="hover:text-violet-600 cursor-pointer transition-colors">Agno</span>
              <span>·</span>
              <span className="hover:text-teal-600 cursor-pointer transition-colors">LlamaIndex</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

const viewComponents: Record<string, React.ComponentType> = {
  home: HomeView,
  browse: BrowseView,
  detail: DetailView,
  dashboard: DashboardView,
  wizard: WizardView,
  admin: AdminView,
}

export function AppLayout() {
  const { currentView } = useAppStore()

  const ViewComponent = viewComponents[currentView] || HomeView

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentView])

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="flex-1">
        <ViewComponent />
      </main>
      <Footer />
      <AuthModal />
    </div>
  )
}
