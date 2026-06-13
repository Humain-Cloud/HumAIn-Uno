// Dual-layer cache: file-based (persistent across restarts) + in-memory (fast access)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const memoryCache = new Map<string, { data: any; timestamp: number }>()
const DEFAULT_TTL = 30 * 60 * 1000 // 30 minutes (longer since we have file cache)
const CACHE_DIR = '/home/z/my-project/.cache-api'

// Ensure cache directory exists
try {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true })
  }
} catch {}

function getCacheFilePath(key: string): string {
  // Sanitize key for use as filename
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 200)
  return join(CACHE_DIR, `${safeKey}.json`)
}

export function getCached<T>(key: string): T | null {
  // Check memory cache first (fastest)
  const memEntry = memoryCache.get(key)
  if (memEntry && Date.now() - memEntry.timestamp <= DEFAULT_TTL) {
    return memEntry.data as T
  }

  // Check file cache (persists across restarts)
  try {
    const filePath = getCacheFilePath(key)
    const raw = readFileSync(filePath, 'utf-8')
    const entry = JSON.parse(raw)
    if (Date.now() - entry.timestamp <= DEFAULT_TTL) {
      // Restore to memory cache
      memoryCache.set(key, entry)
      return entry.data as T
    }
    // Expired - delete file
    try { require('fs').unlinkSync(filePath) } catch {}
  } catch {}

  return null
}

export function setCache(key: string, data: any, ttl = DEFAULT_TTL): void {
  const entry = { data, timestamp: Date.now() }

  // Set in memory cache
  memoryCache.set(key, entry)

  // Set in file cache (persistent)
  try {
    const filePath = getCacheFilePath(key)
    writeFileSync(filePath, JSON.stringify(entry), 'utf-8')
  } catch {}

  // Simple eviction for memory cache
  if (memoryCache.size > 500) {
    const entries = Array.from(memoryCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    const toDelete = entries.slice(0, 100)
    toDelete.forEach(([k]) => memoryCache.delete(k))
  }
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    memoryCache.clear()
    // Also clear file cache
    try {
      const fs = require('fs')
      const files = fs.readdirSync(CACHE_DIR)
      files.forEach((f: string) => {
        try { fs.unlinkSync(join(CACHE_DIR, f)) } catch {}
      })
    } catch {}
    return
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key)
    }
  }
  // Also clear matching file cache entries
  try {
    const fs = require('fs')
    const safePattern = pattern.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 200)
    const files = fs.readdirSync(CACHE_DIR)
    files.forEach((f: string) => {
      if (f.includes(safePattern)) {
        try { fs.unlinkSync(join(CACHE_DIR, f)) } catch {}
      }
    })
  } catch {}
}
