import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Returns true if Supabase credentials are configured.
 * Use this for display purposes only.
 */
export function isSupabaseServerConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
}

/**
 * Creates a Supabase client for use in server components,
 * server actions, and route handlers.
 *
 * In Next.js 15+, cookies() returns a Promise that must be awaited.
 * This function properly handles the async cookie API to read,
 * set, and remove Supabase auth cookies for SSR.
 *
 * Throws in development if Supabase env vars are not configured.
 * Returns null in production if env vars are missing (graceful fallback).
 */
export async function createSupabaseServerClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        'Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
      )
    }
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method is called from a Server Component where
            // cookies cannot be set. This can be ignored if you have
            // middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
