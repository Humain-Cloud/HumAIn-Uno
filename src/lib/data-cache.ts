// Client-side data cache for server-prefetched data
// This allows components to access initial data without making API calls

interface CachedData {
  stats?: any
  categories?: any[]
  recentAgents?: any[]
  featuredAgents?: any[]
  timestamp: number
}

let cachedData: CachedData | null = null

// Initialize from window variable if available (set by server-side prefetch)
function initFromWindow() {
  if (cachedData) return
  if (typeof window !== 'undefined' && (window as any).__HUMAIN_INITIAL_DATA__) {
    const data = (window as any).__HUMAIN_INITIAL_DATA__
    cachedData = {
      stats: data.stats,
      categories: data.categories,
      recentAgents: data.recentAgents,
      featuredAgents: data.featuredAgents,
      timestamp: Date.now(),
    }
    // Clean up window variable
    delete (window as any).__HUMAIN_INITIAL_DATA__
  }
}

export function setInitialData(data: any) {
  if (data) {
    cachedData = {
      stats: data.stats,
      categories: data.categories,
      recentAgents: data.recentAgents,
      featuredAgents: data.featuredAgents,
      timestamp: Date.now(),
    }
  }
}

export function getCachedData(): CachedData | null {
  initFromWindow()
  return cachedData
}

export function getCachedStats() {
  initFromWindow()
  return cachedData?.stats || null
}

export function getCachedCategories() {
  initFromWindow()
  return cachedData?.categories || null
}

export function getCachedRecentAgents() {
  initFromWindow()
  return cachedData?.recentAgents || null
}

export function getCachedFeaturedAgents() {
  initFromWindow()
  return cachedData?.featuredAgents || null
}

export function clearCache() {
  cachedData = null
}
