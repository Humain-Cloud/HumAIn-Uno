import { create } from 'zustand'

export type ViewType = 'home' | 'browse' | 'detail' | 'dashboard' | 'wizard' | 'admin' | 'hub'

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
  
  resetFilters: () => set({
    searchQuery: '',
    selectedCategory: null,
    selectedFramework: null,
    selectedIndustry: null,
    selectedDifficulty: null,
    sortBy: 'popular',
  }),
  
  navigateToAgent: (id) => set({ selectedAgentId: id, currentView: 'detail' }),
}))
