'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/supabase/types'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null)

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Lazily create the Supabase browser client once
  const getSupabase = useCallback(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseBrowserClient()
    }
    return supabaseRef.current
  }, [])

  // Fetch user profile from the `profiles` table
  // Falls back to auth user metadata if profiles table doesn't exist yet
  const fetchProfile = useCallback(
    async (userId: string, user?: User | null): Promise<UserProfile | null> => {
      try {
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          // If the profiles table doesn't exist yet, construct a profile from auth metadata
          if (error.code === '42P01' || error.message?.includes('not find the table')) {
            console.info('Profiles table not yet created - using auth metadata as fallback')
          } else {
            console.warn('Failed to fetch profile:', error.message)
          }

          // Fallback: construct profile from auth user metadata
          if (user) {
            return {
              id: user.id,
              email: user.email ?? '',
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              avatar_url: user.user_metadata?.avatar_url || null,
              bio: null,
              company: null,
              job_title: null,
              location: null,
              website: null,
              preferred_framework: null,
              preferred_industry: null,
              onboarding_completed: false,
              onboarding_step: 0,
              created_at: user.created_at,
              updated_at: new Date().toISOString(),
            }
          }
          return null
        }
        return data as UserProfile
      } catch {
        // Fallback: construct profile from auth user metadata
        if (user) {
          return {
            id: user.id,
            email: user.email ?? '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            bio: null,
            company: null,
            job_title: null,
            location: null,
            website: null,
            preferred_framework: null,
            preferred_industry: null,
            onboarding_completed: false,
            onboarding_step: 0,
            created_at: user.created_at,
            updated_at: new Date().toISOString(),
          }
        }
        return null
      }
    },
    [getSupabase]
  )

  // Public refreshProfile so consumers can manually reload
  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) return null
    const updated = await fetchProfile(user.id, user)
    setProfile(updated)
    return updated
  }, [user, fetchProfile])

  // Sign out handler
  const signOut = useCallback(async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
    router.push('/')
  }, [getSupabase, router])

  // Subscribe to auth state changes on mount
  useEffect(() => {
    const supabase = getSupabase()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id, currentSession.user).then((p) => setProfile(p))
      }
      setLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (newSession?.user) {
        fetchProfile(newSession.user.id, newSession.user).then((p) => setProfile(p))
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [getSupabase, fetchProfile])

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, signOut, refreshProfile }}
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
