import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Returns true if Supabase credentials are configured.
 * Use this for display purposes only (e.g., showing/hiding auth UI).
 * Do NOT use this to gate getSupabaseBrowserClient() calls.
 */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
}

let client: ReturnType<typeof createBrowserClient> | null = null

/**
 * Returns a singleton Supabase client for use in browser/client components.
 * All components sharing this instance will receive auth state change events.
 *
 * Throws in development if Supabase env vars are not configured.
 * Returns null in production if env vars are missing (graceful fallback).
 */
export function getSupabaseBrowserClient(): ReturnType<typeof createBrowserClient> | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        'Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
      )
    }
    return null
  }

  if (!client) {
    client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return client
}

// Keep backward compatibility
export function createSupabaseBrowserClient() {
  return getSupabaseBrowserClient()
}
