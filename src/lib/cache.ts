// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>()

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > DEFAULT_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCache(key: string, data: any, ttl = DEFAULT_TTL): void {
  cache.set(key, { data, timestamp: Date.now() })
  // Simple eviction: if cache is too large, remove oldest entries
  if (cache.size > 500) {
    const entries = Array.from(cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    const toDelete = entries.slice(0, 100)
    toDelete.forEach(([k]) => cache.delete(k))
  }
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}
