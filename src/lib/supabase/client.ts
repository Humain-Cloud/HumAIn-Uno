import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

/**
 * Returns a singleton Supabase client for use in browser/client components.
 * All components sharing this instance will receive auth state change events.
 */
export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}

// Keep backward compatibility
export function createSupabaseBrowserClient() {
  return getSupabaseBrowserClient()
}
