import { create } from 'zustand'

export type ViewType = 'home' | 'browse' | 'detail' | 'dashboard' | 'wizard' | 'admin' | 'hub'

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
  sortBy: 'newest' | 'popular' | 'most-starred'
  setSortBy: (sort: 'newest' | 'popular' | 'most-starred') => void
  
  // View
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  
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
