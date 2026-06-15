'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/supabase/types'

// ─────────────────────────────────────────────────
// Timeout helper – races a promise against a timer
// and returns `fallback` if the timer wins.
// ─────────────────────────────────────────────────
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      timer = setTimeout(() => resolve(fallback), ms)
    }),
  ]).finally(() => clearTimeout(timer))
}

// Maximum time the auth provider will stay in "loading" state
const MAX_LOADING_MS = 8_000
const SESSION_TIMEOUT_MS = 5_000
const PROFILE_TIMEOUT_MS = 3_000

type SupabaseClientType = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<UserProfile | null>
  supabase: SupabaseClientType | null
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  session: null,
  loading: false,
  signOut: async () => {},
  refreshProfile: async () => null,
  supabase: null,
  isConfigured: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const configured = isSupabaseConfigured()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(configured) // Only show loading if Supabase is configured

  // Build a fallback UserProfile from the auth User object
  const buildProfileFallback = useCallback(
    (u: User): UserProfile => ({
      id: u.id,
      email: u.email ?? '',
      full_name: u.user_metadata?.full_name || u.user_metadata?.name || null,
      avatar_url: u.user_metadata?.avatar_url || null,
      bio: null,
      company: null,
      job_title: null,
      location: null,
      website: null,
      preferred_framework: null,
      preferred_industry: null,
      onboarding_completed: false,
      onboarding_step: 0,
      created_at: u.created_at,
      updated_at: new Date().toISOString(),
    }),
    [],
  )

  // Fetch user profile from the `profiles` table.
  // Falls back to auth user metadata if the table doesn't exist or times out.
  const fetchProfile = useCallback(
    async (userId: string, u?: User | null): Promise<UserProfile | null> => {
      if (!supabase) return null

      try {
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        const { data, error } = await withTimeout(
          profilePromise,
          PROFILE_TIMEOUT_MS,
          { data: null, error: { message: 'Profile fetch timed out', code: 'TIMEOUT' } } as any,
        )

        if (error) {
          // If the profiles table doesn't exist yet, construct a profile from auth metadata
          if (
            error.code === '42P01' ||
            error.message?.includes('not find the table') ||
            error.code === 'TIMEOUT'
          ) {
            console.info(
              error.code === 'TIMEOUT'
                ? 'Profile fetch timed out – using auth metadata as fallback'
                : 'Profiles table not yet created – using auth metadata as fallback',
            )
          } else {
            console.warn('Failed to fetch profile:', error.message)
          }

          // Fallback: construct profile from auth user metadata
          if (u) return buildProfileFallback(u)
          return null
        }
        return data as UserProfile
      } catch {
        // Fallback: construct profile from auth user metadata
        if (u) return buildProfileFallback(u)
        return null
      }
    },
    [supabase, buildProfileFallback],
  )

  // Public refreshProfile so consumers can manually reload
  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user || !supabase) return null
    const updated = await fetchProfile(user.id, user)
    setProfile(updated)
    return updated
  }, [user, fetchProfile])

  // Sign out handler
  const signOut = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut()
      } catch {
        // Ignore sign-out errors (e.g. network failure)
      }
    }
    setUser(null)
    setProfile(null)
    setSession(null)
    router.push('/')
  }, [supabase, router])

  // Subscribe to auth state changes on mount — only if Supabase is configured
  useEffect(() => {
    if (!supabase) return

    let cancelled = false

    // ── Maximum-loading safeguard ──
    // No matter what happens, after MAX_LOADING_MS we flip loading to false
    // so the UI never gets stuck on the loading skeleton forever.
    const maxLoadingTimer = setTimeout(() => {
      if (!cancelled) {
        console.warn('Auth provider: max loading time reached – forcing loading=false')
        setLoading(false)
      }
    }, MAX_LOADING_MS)

    // ── Get initial session (with timeout) ──
    const sessionPromise = supabase.auth.getSession()

    withTimeout(
      sessionPromise,
      SESSION_TIMEOUT_MS,
      { data: { session: null }, error: null } as any,
    )
      .then(({ data: { session: currentSession } }) => {
        if (cancelled) return

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          fetchProfile(currentSession.user.id, currentSession.user).then((p) => {
            if (!cancelled) setProfile(p)
          })
        }

        setLoading(false)
        clearTimeout(maxLoadingTimer)
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false)
          clearTimeout(maxLoadingTimer)
        }
      })

    // ── Listen for auth state changes ──
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (cancelled) return

      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (newSession?.user) {
        fetchProfile(newSession.user.id, newSession.user).then((p) => {
          if (!cancelled) setProfile(p)
        })
      } else {
        setProfile(null)
      }

      setLoading(false)
      clearTimeout(maxLoadingTimer)
    })

    return () => {
      cancelled = true
      clearTimeout(maxLoadingTimer)
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, signOut, refreshProfile, supabase, isConfigured: configured }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
