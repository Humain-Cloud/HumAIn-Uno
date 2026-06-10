'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

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
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2 sm:gap-4">
        {/* Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:inline">
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
              className={`text-sm ${currentView === key ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}`}
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
              className={`text-sm ${currentView === 'admin' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}`}
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
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              className="pl-9 h-8 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
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
          <Button
            size="sm"
            className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => handleNav('wizard')}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Create
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="sm:hidden h-8 w-8"
            onClick={() => handleNav('wizard')}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>

          {status === 'authenticated' && session ? (
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {(session as any).role === 'admin' ? '👑 Admin' : session.user?.name || 'User'}
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:flex"
              onClick={() => setShowAuthModal(true)}
            >
              <LogIn className="h-4 w-4 mr-1.5" />
              Sign In
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">Humain-Uno</span>
              </SheetTitle>
              <nav className="flex flex-col gap-1">
                {navItems.map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={currentView === key ? 'secondary' : 'ghost'}
                    className={`justify-start ${currentView === key ? 'bg-emerald-50 text-emerald-700' : ''}`}
                    onClick={() => handleNav(key)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                ))}
                <Button
                  variant={currentView === 'wizard' ? 'secondary' : 'ghost'}
                  className="justify-start text-emerald-600"
                  onClick={() => handleNav('wizard')}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Agent
                </Button>
                {session && (session as any).role === 'admin' && (
                  <Button
                    variant={currentView === 'admin' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => handleNav('admin')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
                <div className="border-t my-2" />
                {status === 'authenticated' && session ? (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Signed in as <strong>{session.user?.name || session.user?.email}</strong>
                    </div>
                    <Button variant="ghost" className="justify-start text-destructive" onClick={() => { signOut(); setMobileOpen(false) }}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" className="justify-start" onClick={() => { setShowAuthModal(true); setMobileOpen(false) }}>
                    <LogIn className="h-4 w-4 mr-2" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm">
              Humain<span className="text-emerald-600">-Uno</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © 2025 Humain-Uno. Powered by 500+ AI Agents Knowledge Base
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>LangGraph</span>
            <span>CrewAI</span>
            <span>AutoGen</span>
            <span>Agno</span>
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

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ViewComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <AuthModal />
    </div>
  )
}
