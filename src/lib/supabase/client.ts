import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Returns true if Supabase credentials are configured.
 * Use this to guard Supabase-dependent code paths.
 */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
}

let client: ReturnType<typeof createBrowserClient> | undefined

/**
 * Returns a singleton Supabase client for use in browser/client components.
 * All components sharing this instance will receive auth state change events.
 *
 * Returns `null` if Supabase env vars are not configured.
 */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    return null
  }

  if (!client) {
    client = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  }
  return client
}

// Keep backward compatibility
export function createSupabaseBrowserClient() {
  return getSupabaseBrowserClient()
}
