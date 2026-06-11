'use client'

import { useState, useEffect, useSyncExternalStore, useCallback, useRef, useMemo } from 'react'
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
import { KnowledgeHubView } from '@/components/views/knowledge-hub-view'
import { SettingsView } from '@/components/views/settings-view'
import { AuthModal } from '@/components/auth/auth-modal'
import { CompareBar } from '@/components/agents/compare-bar'
import { CompareModal } from '@/components/agents/compare-modal'
import { AiChatButton } from '@/components/ai/ai-chat-button'
import { AiChatPanel } from '@/components/ai/ai-chat-panel'
import { NotificationCenter } from '@/components/notifications/notification-center'
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
  Library,
  Github,
  Twitter,
  MessageCircle,
  Youtube,
  Rss,
  Mail,
  BookOpen,
  FileText,
  Scale,
  HeartHandshake,
  GraduationCap,
  BookMarked,
  Settings,
  Bookmark,
  X as XIcon,
  Clock,
  Trash2,
  ArrowUp,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { api } from '@/lib/api-client'

function Navbar() {
  const { currentView, setCurrentView, searchQuery, setSearchQuery, setSelectedAgentId, bookmarkedAgentIds, toggleBookmark, searchHistory, addSearchHistory, clearSearchHistory } = useAppStore()
  const { data: session, status } = useSession()
  const { setShowAuthModal } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [bookmarkAgents, setBookmarkAgents] = useState<any[]>([])
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchDropdownRef = useRef<HTMLDivElement>(null)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const navItems = [
    { key: 'home' as const, label: 'Home', icon: Home },
    { key: 'hub' as const, label: 'Knowledge Hub', icon: Library },
    { key: 'browse' as const, label: 'Browse', icon: Compass },
    { key: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, badge: bookmarkedAgentIds.length > 0 ? bookmarkedAgentIds.length : undefined },
    { key: 'settings' as const, label: 'Settings', icon: Settings },
  ]

  const handleNav = (view: any) => {
    setCurrentView(view)
    setSelectedAgentId(null)
    setMobileOpen(false)
    window.scrollTo(0, 0)
  }

  const loadBookmarkAgents = useCallback(async () => {
    if (bookmarkedAgentIds.length === 0) {
      setBookmarkAgents([])
      return
    }
    setBookmarkLoading(true)
    const agents: any[] = []
    for (const id of bookmarkedAgentIds.slice(0, 8)) {
      try {
        const agent = await api.knowledge.get(id)
        agents.push(agent)
      } catch {
        try {
          const agent = await api.agents.get(id)
          agents.push(agent)
        } catch { /* ignore */ }
      }
    }
    setBookmarkAgents(agents)
    setBookmarkLoading(false)
  }, [bookmarkedAgentIds])

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
            Humain<span className="text-emerald-600 dark:text-emerald-400">-Uno</span>
          </span>
          <span className="font-bold text-lg sm:hidden">
            H<span className="text-emerald-600 dark:text-emerald-400">-U</span>
          </span>
        </button>

        {/* Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ key, label, icon: Icon, badge }) => (
            <Button
              key={key}
              variant={currentView === key ? 'secondary' : 'ghost'}
              size="sm"
              className={`text-sm transition-all min-h-[36px] ${currentView === key ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => handleNav(key)}
            >
              <Icon className="h-4 w-4 mr-1.5" />
              {label}
              {badge && (
                <span className="ml-1 h-4 min-w-[16px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Button>
          ))}
          {session && (session as any).role === 'admin' && (
            <Button
              variant={currentView === 'admin' ? 'secondary' : 'ghost'}
              size="sm"
              className={`text-sm transition-all min-h-[36px] ${currentView === 'admin' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}`}
              onClick={() => handleNav('admin')}
            >
              <Shield className="h-4 w-4 mr-1.5" />
              Admin
            </Button>
          )}
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-md mx-2">
          <div ref={searchDropdownRef} className={`relative transition-all duration-200 ${searchFocused ? 'scale-105' : ''}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              ref={searchInputRef}
              placeholder="Search 500+ agents..."
              className="pl-9 h-9 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-full focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 dark:focus:border-emerald-600 input-focus"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearchDropdown(false)
                if (currentView !== 'browse') {
                  setCurrentView('browse')
                  setSelectedAgentId(null)
                }
              }}
              onFocus={() => {
                setSearchFocused(true)
                if (!searchQuery && searchHistory.length > 0) {
                  setShowSearchDropdown(true)
                }
              }}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (searchQuery.trim()) {
                    addSearchHistory(searchQuery.trim())
                  }
                  setShowSearchDropdown(false)
                  if (currentView !== 'browse') {
                    setCurrentView('browse')
                    setSelectedAgentId(null)
                  }
                }
                if (e.key === 'Escape') {
                  setShowSearchDropdown(false)
                  searchInputRef.current?.blur()
                }
              }}
            />
            {/* Search History Dropdown */}
            <AnimatePresence>
              {showSearchDropdown && searchHistory.length > 0 && !searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Recent Searches
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    {searchHistory.map((query, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-2.5"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setSearchQuery(query)
                          addSearchHistory(query)
                          setShowSearchDropdown(false)
                          if (currentView !== 'browse') {
                            setCurrentView('browse')
                            setSelectedAgentId(null)
                          }
                        }}
                      >
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{query}</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-2">
                    <button
                      className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors flex items-center gap-1.5"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        clearSearchHistory()
                        setShowSearchDropdown(false)
                      }}
                    >
                      <Trash2 className="h-3 w-3" /> Clear history
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Bookmarks Quick View */}
          <Popover onOpenChange={(open) => { if (open) loadBookmarkAgents() }}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 min-h-[36px] min-w-[36px] btn-hover relative"
              >
                <Bookmark className={`h-4 w-4 ${bookmarkedAgentIds.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`} />
                {bookmarkedAgentIds.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {bookmarkedAgentIds.length > 9 ? '9+' : bookmarkedAgentIds.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-amber-600" />
                    Bookmarked Agents
                    {bookmarkedAgentIds.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5">{bookmarkedAgentIds.length}</Badge>
                    )}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 text-xs h-7"
                    onClick={() => {
                      setCurrentView('dashboard')
                      setSelectedAgentId(null)
                    }}
                  >
                    View All
                  </Button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                {bookmarkLoading ? (
                  <div className="p-4 text-center">
                    <div className="h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : bookmarkAgents.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bookmark className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No bookmarked agents yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Click the bookmark icon on any agent to save it</p>
                  </div>
                ) : (
                  <div className="py-1">
                    {bookmarkAgents.map((agent: any) => (
                      <div
                        key={agent.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                        onClick={() => {
                          setSelectedAgentId(agent.id)
                          setCurrentView('detail')
                        }}
                      >
                        <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{agent.name}</p>
                          <div className="flex items-center gap-1.5">
                            {agent.framework && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{agent.framework}</Badge>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleBookmark(agent.id)
                            setBookmarkAgents(prev => prev.filter((a: any) => a.id !== agent.id))
                          }}
                          className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {bookmarkedAgentIds.length > bookmarkAgents.length && (
                      <div className="px-4 py-2 text-center">
                        <p className="text-xs text-muted-foreground">
                          +{bookmarkedAgentIds.length - bookmarkAgents.length} more bookmarked
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          {/* Notification Center */}
          <NotificationCenter />
          {/* Dark Mode Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 min-h-[36px] min-w-[36px] btn-hover"
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
            className="hidden sm:flex bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 transition-all btn-hover min-h-[36px]"
            onClick={() => handleNav('wizard')}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Create
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="sm:hidden h-9 w-9 min-h-[36px] min-w-[36px] text-emerald-600 dark:text-emerald-400"
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
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 min-h-[36px] min-w-[36px]" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:flex rounded-full min-h-[36px] btn-hover"
              onClick={() => setShowAuthModal(true)}
            >
              <LogIn className="h-4 w-4 mr-1.5" />
              Sign In
            </Button>
          )}

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
                {navItems.map(({ key, label, icon: Icon, badge }) => (
                  <Button
                    key={key}
                    variant={currentView === key ? 'secondary' : 'ghost'}
                    className={`justify-start h-11 min-h-[44px] ${currentView === key ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium' : ''}`}
                    onClick={() => handleNav(key)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {label}
                    {badge && (
                      <span className="ml-auto h-4 min-w-[16px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </Button>
                ))}
                <Button
                  variant={currentView === 'wizard' ? 'secondary' : 'ghost'}
                  className="justify-start h-11 min-h-[44px] text-emerald-600 dark:text-emerald-400"
                  onClick={() => handleNav('wizard')}
                >
                  <Sparkles className="h-4 w-4 mr-3" />
                  Create Agent
                </Button>
                {session && (session as any).role === 'admin' && (
                  <Button
                    variant={currentView === 'admin' ? 'secondary' : 'ghost'}
                    className="justify-start h-11 min-h-[44px]"
                    onClick={() => handleNav('admin')}
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    Admin
                  </Button>
                )}
                <div className="border-t my-3 dark:border-gray-800" />
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <Button variant="ghost" size="sm" className="min-h-[36px]" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="border-t my-3 dark:border-gray-800" />
                {status === 'authenticated' && session ? (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Signed in as <strong>{session.user?.name || session.user?.email}</strong>
                    </div>
                    <Button variant="ghost" className="justify-start h-11 min-h-[44px] text-destructive" onClick={() => { signOut(); setMobileOpen(false) }}>
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" className="justify-start h-11 min-h-[44px]" onClick={() => { setShowAuthModal(true); setMobileOpen(false) }}>
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
  const footerLinks = {
    product: {
      title: 'Product',
      links: [
        { label: 'Browse Agents', icon: Compass, view: 'browse' as const },
        { label: 'Create Agent', icon: PlusCircle, view: 'wizard' as const },
        { label: 'Knowledge Hub', icon: Library, view: 'hub' as const },
        { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' as const },
      ],
    },
    resources: {
      title: 'Resources',
      links: [
        { label: 'Documentation', icon: BookOpen, href: '#' },
        { label: 'API Reference', icon: FileText, href: '#' },
        { label: 'Tutorials', icon: GraduationCap, href: '#' },
        { label: 'Blog', icon: BookMarked, href: '#' },
      ],
    },
    community: {
      title: 'Community',
      links: [
        { label: 'GitHub', icon: Github, href: 'https://github.com' },
        { label: 'Discord', icon: MessageCircle, href: 'https://discord.gg' },
        { label: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
        { label: 'Contributing', icon: HeartHandshake, href: '#' },
      ],
    },
    legal: {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', icon: Shield, href: '#' },
        { label: 'Terms of Service', icon: Scale, href: '#' },
        { label: 'License', icon: FileText, href: '#' },
        { label: 'Contact', icon: Mail, href: '#' },
      ],
    },
  }

  const handleFooterNav = (view: any) => {
    const store = useAppStore.getState()
    store.setCurrentView(view)
    store.setSelectedAgentId(null)
    window.scrollTo(0, 0)
  }

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {Object.entries(footerLinks).map(([, section]) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {'view' in link ? (
                      <button
                        onClick={() => handleFooterNav(link.view)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 min-h-[24px]"
                      >
                        <link.icon className="h-3.5 w-3.5" />
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 min-h-[24px]"
                      >
                        <link.icon className="h-3.5 w-3.5" />
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8" />
        
        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">
              Humain<span className="text-emerald-600 dark:text-emerald-400">-Uno</span>
            </span>
          </div>
          
          {/* Social Icons */}
          <div className="flex items-center gap-2">
            {[
              { icon: Github, href: 'https://github.com', label: 'GitHub' },
              { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
              { icon: MessageCircle, href: 'https://discord.gg', label: 'Discord' },
              { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
              { icon: Rss, href: '#', label: 'RSS' },
            ].map(social => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 min-h-[36px] min-w-[36px] rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          
          {/* Copyright and frameworks */}
          <div className="flex flex-col items-center sm:items-end gap-2">
            <p className="text-xs text-muted-foreground">
              © 2025 Humain-Uno. Powered by 500+ AI Agents Knowledge Base
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors">LangGraph</span>
              <span>·</span>
              <span className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors">CrewAI</span>
              <span>·</span>
              <span className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors">AutoGen</span>
              <span>·</span>
              <span className="hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors">Agno</span>
              <span>·</span>
              <span className="hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition-colors">LlamaIndex</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

const viewComponents: Record<string, React.ComponentType> = {
  home: HomeView,
  hub: KnowledgeHubView,
  browse: BrowseView,
  detail: DetailView,
  dashboard: DashboardView,
  wizard: WizardView,
  admin: AdminView,
  settings: SettingsView,
}

export function AppLayout() {
  const { currentView } = useAppStore()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showProgressBar, setShowProgressBar] = useState(false)

  const ViewComponent = viewComponents[currentView] || HomeView

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentView])

  // Reading progress bar + scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        setScrollProgress(Math.min(100, (window.scrollY / scrollHeight) * 100))
      }
      setShowScrollTop(window.scrollY > 400)
      setShowProgressBar(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Top gradient line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shrink-0" aria-hidden="true" />
      <Navbar />

      {/* Reading Progress Bar - below navbar */}
      <AnimatePresence>
        {showProgressBar && scrollProgress > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="reading-progress"
            style={{ top: '4rem', width: `${scrollProgress}%` }}
          />
        )}
      </AnimatePresence>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <ViewComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <AuthModal />
      <CompareBar />
      <CompareModal />
      {currentView !== 'wizard' && (
        <>
          <AiChatButton />
          <AiChatPanel />
        </>
      )}

      {/* Scroll to Top Button - positioned above AI chat button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-40 right-6 z-40 h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 flex items-center justify-center hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
