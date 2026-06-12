import { create } from 'zustand'

export type ViewType = 'home' | 'browse' | 'detail' | 'dashboard' | 'wizard' | 'admin' | 'hub' | 'settings'

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  defaultView: 'home' | 'browse' | 'hub'
  defaultViewMode: 'grid' | 'list' | 'compact'
  defaultSortOrder: 'newest' | 'popular' | 'most-starred' | 'az' | 'za' | 'recently-added'
  defaultFramework: string | null
  itemsPerPage: 12 | 24 | 48
  showAiChatSuggestions: boolean
  showCompareBar: boolean
  enableKeyboardShortcuts: boolean
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  suggestedAgents?: Array<{ id: string; name: string; framework: string | null; description: string }>
}

export interface Collection {
  id: string
  name: string
  agentIds: string[]
  createdAt: string
}

export type NotificationType = 'agent_update' | 'new_agent' | 'bookmark_reminder' | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

interface AppState {
  // Navigation
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  selectedAgentId: string | null
  setSelectedAgentId: (id: string | null) => void
  
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // Filters
  selectedCategory: string | null
  setSelectedCategory: (category: string | null) => void
  selectedFramework: string | null
  setSelectedFramework: (framework: string | null) => void
  selectedIndustry: string | null
  setSelectedIndustry: (industry: string | null) => void
  selectedDifficulty: string | null
  setSelectedDifficulty: (difficulty: string | null) => void
  sortBy: 'newest' | 'popular' | 'most-starred' | 'az' | 'za' | 'recently-added'
  setSortBy: (sort: 'newest' | 'popular' | 'most-starred' | 'az' | 'za' | 'recently-added') => void
  
  // View
  viewMode: 'grid' | 'list' | 'compact'
  setViewMode: (mode: 'grid' | 'list' | 'compact') => void
  
  // Wizard
  wizardStep: number
  setWizardStep: (step: number) => void
  wizardData: Record<string, any>
  setWizardData: (data: Record<string, any>) => void

  // Auth
  showAuthModal: boolean
  setShowAuthModal: (show: boolean) => void
  authCallback: (() => void) | null
  setAuthCallback: (cb: (() => void) | null) => void
  
  // Compare
  compareAgentIds: string[]
  addCompareAgent: (id: string) => void
  removeCompareAgent: (id: string) => void
  clearCompareAgents: () => void
  showCompareModal: boolean
  setShowCompareModal: (show: boolean) => void

  // AI Chat
  chatOpen: boolean
  setChatOpen: (open: boolean) => void
  chatMessages: ChatMessage[]
  addChatMessage: (msg: ChatMessage) => void
  clearChatMessages: () => void

  // Settings
  settings: AppSettings
  updateSettings: (settings: Partial<AppSettings>) => void

  // Search History
  searchHistory: string[]
  addSearchHistory: (query: string) => void
  clearSearchHistory: () => void

  // Recently Viewed
  recentlyViewedAgentIds: string[]
  addRecentlyViewed: (agentId: string) => void
  clearRecentlyViewed: () => void

  // Ratings
  ratings: Record<string, number>
  setRating: (agentId: string, rating: number) => void
  getRating: (agentId: string) => number | undefined

  // Bookmarks
  bookmarkedAgentIds: string[]
  toggleBookmark: (agentId: string) => void

  // Collections
  collections: Collection[]
  createCollection: (name: string) => void
  deleteCollection: (id: string) => void
  renameCollection: (id: string, name: string) => void
  addToCollection: (collectionId: string, agentId: string) => void
  removeFromCollection: (collectionId: string, agentId: string) => void

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void
  unreadCount: number

  // Reset filters
  resetFilters: () => void
  
  // Navigate to agent detail
  navigateToAgent: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),
  selectedAgentId: null,
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  selectedFramework: null,
  setSelectedFramework: (framework) => set({ selectedFramework: framework }),
  selectedIndustry: null,
  setSelectedIndustry: (industry) => set({ selectedIndustry: industry }),
  selectedDifficulty: null,
  setSelectedDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),
  sortBy: 'popular',
  setSortBy: (sort) => set({ sortBy: sort }),
  
  viewMode: 'grid',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  wizardStep: 0,
  setWizardStep: (step) => set({ wizardStep: step }),
  wizardData: {},
  setWizardData: (data) => set((state) => ({ wizardData: { ...state.wizardData, ...data } })),
  
  showAuthModal: false,
  setShowAuthModal: (show) => set({ showAuthModal: show }),
  authCallback: null,
  setAuthCallback: (cb) => set({ authCallback: cb }),
  
  compareAgentIds: [],
  addCompareAgent: (id) => set((state) => {
    if (state.compareAgentIds.includes(id) || state.compareAgentIds.length >= 4) return state
    return { compareAgentIds: [...state.compareAgentIds, id] }
  }),
  removeCompareAgent: (id) => set((state) => ({
    compareAgentIds: state.compareAgentIds.filter((aid) => aid !== id),
  })),
  clearCompareAgents: () => set({ compareAgentIds: [] }),
  showCompareModal: false,
  setShowCompareModal: (show) => set({ showCompareModal: show }),

  chatOpen: false,
  setChatOpen: (open) => set({ chatOpen: open }),
  chatMessages: [],
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  clearChatMessages: () => set({ chatMessages: [] }),

  // Settings
  settings: (() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('humain-settings')
        if (saved) return JSON.parse(saved)
      } catch { /* ignore */ }
    }
    return {
      theme: 'system' as const,
      defaultView: 'home' as const,
      defaultViewMode: 'grid' as const,
      defaultSortOrder: 'popular' as const,
      defaultFramework: null,
      itemsPerPage: 24,
      showAiChatSuggestions: true,
      showCompareBar: true,
      enableKeyboardShortcuts: true,
    }
  })(),
  updateSettings: (partial) => set((state) => {
    const newSettings = { ...state.settings, ...partial }
    if (typeof window !== 'undefined') {
      localStorage.setItem('humain-settings', JSON.stringify(newSettings))
    }
    return { settings: newSettings }
  }),

  // Search History
  searchHistory: (() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('humain-search-history')
        return saved ? JSON.parse(saved) : []
      } catch { return [] }
    }
    return []
  })(),
  addSearchHistory: (query) => set((state) => {
    const trimmed = query.trim()
    if (!trimmed) return state
    const filtered = state.searchHistory.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())
    const newHistory = [trimmed, ...filtered].slice(0, 10)
    if (typeof window !== 'undefined') {
      localStorage.setItem('humain-search-history', JSON.stringify(newHistory))
    }
    return { searchHistory: newHistory }
  }),
  clearSearchHistory: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('humain-search-history')
    }
    set({ searchHistory: [] })
  },

  // Ratings
  ratings: (() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('humain-ratings')
        return saved ? JSON.parse(saved) : {}
      } catch { return {} }
    }
    return {}
  })(),
  setRating: (agentId, rating) => set((state) => {
    const newRatings = { ...state.ratings, [agentId]: rating }
    if (typeof window !== 'undefined') {
      localStorage.setItem('humain-ratings', JSON.stringify(newRatings))
    }
    return { ratings: newRatings }
  }),
  getRating: (agentId) => useAppStore.getState().ratings[agentId],

  // Bookmarks
  bookmarkedAgentIds: (() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('humain-bookmarks')
        return saved ? JSON.parse(saved) : []
      } catch { return [] }
    }
    return []
  })(),
  toggleBookmark: (agentId) => set((state) => {
    const isBookmarked = state.bookmarkedAgentIds.includes(agentId)
    const newBookmarkList = isBookmarked
      ? state.bookmarkedAgentIds.filter((id) => id !== agentId)
      : [...state.bookmarkedAgentIds, agentId]
    if (typeof window !== 'undefined') {
      localStorage.setItem('humain-bookmarks', JSON.stringify(newBookmarkList))
    }
    // Also add/remove from the default collection
    let newCollections = state.collections
    const defaultCol = state.collections.find((c) => c.id === 'default')
    if (defaultCol) {
      newCollections = state.collections.map((c) => {
        if (c.id === 'default') {
          if (isBookmarked) {
            // Remove from default collection
            return { ...c, agentIds: c.agentIds.filter((aid) => aid !== agentId) }
          } else {
            // Add to default collection (if not already there)
            if (!c.agentIds.includes(agentId)) {
              return { ...c, agentIds: [...c.agentIds, agentId] }
            }
          }
        }
        return c
      })
      if (typeof window !== 'undefined') {
        localStorage.setItem('humain-collections', JSON.stringify(newCollections))
      }
    }
    return { bookmarkedAgentIds: newBookmarkList, collections: newCollections }
  }),

  // Collections
  collections: (() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('humain-collections')
        if (saved) return JSON.parse(saved)
      } catch { /* ignore */ }
    }
    return [{
      id: 'default',
      name: 'My Favorites',
      agentIds: [],
      createdAt: new Date().toISOString(),
    }]
  })(),
  createCollection: (name) => set((state) => {
    const newCollection: Collection = {
      id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      agentIds: [],
      createdAt: new Date().toISOString(),
    }
    const newList = [...state.collections, newCollection]
    if (typeof window !== 'undefined') {
      localStorage.setItem('humain-collections', JSON.stringify(newList))
    }
    return { collections: newList }
  }),
  deleteCollection: (id) => set((state) => {
    const newList = state.collections.filter((c) => c.id !== id)
    if (typeof window !== 'undefined') {
      localStorage.setItem('humain-collections', JSON.stringify(newList))
    }
    return { collections: newList }
  }),
  renameCollection: (id, name) => set((state) => {
    const newList = state.collections.map((c) => c.id === id ? { ...c, name } : c)
    if (typeof window !== 'undefined') {
      localStorage.setItem('humain-collections', JSON.stringify(newList))
    }
    return { collections: newList }
  }),
  addToCollection: (collectionId, agentId) => set((state) => {
    const newList = state.collections.map((c) => {
      if (c.id === collectionId && !c.agentIds.includes(agentId)) {
        return { ...c, agentIds: [...c.agentIds, agentId] }
      }
      return c
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('humain-collections', JSON.stringify(newList))
    }
    return { collections: newList }
  }),
  removeFromCollection: (collectionId, agentId) => set((state) => {
    const newList = state.collections.map((c) => {
      if (c.id === collectionId) {
        return { ...c, agentIds: c.agentIds.filter((aid) => aid !== agentId) }
      }
      return c
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('humain-collections', JSON.stringify(newList))
    }
    return { collections: newList }
  }),

  // Notifications
  notifications: (() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('humain-notifications')
        if (saved) return JSON.parse(saved)
      } catch { /* ignore */ }
      // Generate initial sample notifications on first load
      const initial: Notification[] = [
        {
          id: 'notif-welcome',
          type: 'system',
          title: 'Welcome to Humain-Uno!',
          message: 'Explore 600+ curated AI agent projects across 5 frameworks. Start browsing or create your own agent.',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'notif-new-agents',
          type: 'new_agent',
          title: 'New agents added to Knowledge Base',
          message: 'Check out the latest AI agents added from the 500-AI-Agents-Projects repository.',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'notif-ai-chat',
          type: 'system',
          title: 'Try the AI Chat assistant',
          message: 'Click the sparkle button in the bottom-right corner to chat with our AI assistant about agents.',
          read: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ]
      if (typeof window !== 'undefined') {
        localStorage.setItem('humain-notifications', JSON.stringify(initial))
      }
      return initial
    }
    return []
  })(),
  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      read: false,
      createdAt: new Date().toISOString(),
    }
    const newList = [newNotification, ...state.notifications].slice(0, 50)
    if (typeof window !== 'undefined') {
      localStorage.setItem('humain-notifications', JSON.stringify(newList))
    }
    return { notifications: newList }
  }),
  markNotificationRead: (id) => set((state) => {
    const newList = state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
    if (typeof window !== 'undefined') {
      localStorage.setItem('humain-notifications', JSON.stringify(newList))
    }
    return { notifications: newList }
  }),
  markAllNotificationsRead: () => set((state) => {
    const newList = state.notifications.map((n) => ({ ...n, read: true }))
    if (typeof window !== 'undefined') {
      localStorage.setItem('humain-notifications', JSON.stringify(newList))
    }
    return { notifications: newList }
  }),
  clearNotifications: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('humain-notifications')
    }
    set({ notifications: [] })
  },
  unreadCount: 0,
  
  resetFilters: () => set({
    searchQuery: '',
    selectedCategory: null,
    selectedFramework: null,
    selectedIndustry: null,
    selectedDifficulty: null,
    sortBy: 'popular',
  }),
  
  // Recently Viewed
  recentlyViewedAgentIds: (() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('humain-recently-viewed')
        return saved ? JSON.parse(saved) : []
      } catch { return [] }
    }
    return []
  })(),
  addRecentlyViewed: (agentId) => set((state) => {
    const filtered = state.recentlyViewedAgentIds.filter((id) => id !== agentId)
    const newList = [agentId, ...filtered].slice(0, 10)
    if (typeof window !== 'undefined') {
      localStorage.setItem('humain-recently-viewed', JSON.stringify(newList))
    }
    return { recentlyViewedAgentIds: newList }
  }),
  clearRecentlyViewed: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('humain-recently-viewed')
    }
    set({ recentlyViewedAgentIds: [] })
  },

  navigateToAgent: (id) => {
    const state = useAppStore.getState()
    state.addRecentlyViewed(id)
    set({ selectedAgentId: id, currentView: 'detail' })
  },
}))
