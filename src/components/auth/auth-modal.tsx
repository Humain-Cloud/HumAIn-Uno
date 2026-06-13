'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { LogIn, Loader2, Mail, Lock, Eye, EyeOff, Chrome, Github, Sparkles, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

function getSupabaseErrorMessage(error: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password. Please try again.',
    'Email not confirmed': 'Please verify your email before signing in.',
    'Too many requests': 'Too many attempts. Please wait a moment and try again.',
    'User not found': 'No account found with this email.',
    'Invalid password': 'Invalid password. Please try again.',
    'Email rate limit exceeded': 'Too many emails sent. Please wait before trying again.',
  }
  for (const [key, msg] of Object.entries(map)) {
    if (error.includes(key)) return msg
  }
  return 'Something went wrong. Please try again.'
}

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, authCallback, setAuthCallback } = useAppStore()
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
    setSuccess('')
    setShowPassword(false)
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setShowAuthModal(false)
      resetForm()
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createSupabaseBrowserClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        setError(getSupabaseErrorMessage(authError.message))
        return
      }

      setSuccess('Signed in successfully!')
      setTimeout(() => {
        setShowAuthModal(false)
        resetForm()
        if (authCallback) {
          authCallback()
          setAuthCallback(null)
        }
      }, 500)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Email and password are required')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createSupabaseBrowserClient()
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim() || undefined,
          },
        },
      })

      if (authError) {
        setError(getSupabaseErrorMessage(authError.message))
        return
      }

      setSuccess('Account created! Check your email to verify your account.')
      setTimeout(() => {
        setShowAuthModal(false)
        resetForm()
        router.push('/auth/verify-email?email=' + encodeURIComponent(email.trim()))
      }, 1500)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('')
    setOauthLoading(provider)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (authError) {
        setError(getSupabaseErrorMessage(authError.message))
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setOauthLoading(null)
    }
  }

  const handleMagicLink = async () => {
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Enter your email to receive a magic link')
      return
    }

    setLoading(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        setError(getSupabaseErrorMessage(authError.message))
        return
      }

      setSuccess('Magic link sent! Check your email.')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={showAuthModal} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-emerald-600" />
            {mode === 'signin' ? 'Sign in to Humain-Uno' : 'Create an account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin'
              ? 'Sign in to access your personalized dashboard and agents.'
              : 'Join Humain-Uno and start exploring 800+ AI agents.'}
          </DialogDescription>
        </DialogHeader>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-11 font-medium"
            onClick={() => handleOAuth('google')}
            disabled={oauthLoading !== null || loading}
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="h-4 w-4" />
            )}
            Google
          </Button>
          <Button
            variant="outline"
            className="h-11 font-medium"
            onClick={() => handleOAuth('github')}
            disabled={oauthLoading !== null || loading}
          >
            {oauthLoading === 'github' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Github className="h-4 w-4" />
            )}
            GitHub
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-3 text-xs text-muted-foreground">
            or continue with email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="auth-name">Full Name</Label>
              <Input
                id="auth-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || oauthLoading !== null}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || oauthLoading !== null}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || oauthLoading !== null}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || oauthLoading !== null}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        {/* Magic Link */}
        {mode === 'signin' && (
          <Button
            variant="ghost"
            className="w-full text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 font-medium"
            onClick={handleMagicLink}
            disabled={loading || oauthLoading !== null}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Send Magic Link
          </Button>
        )}

        {/* Mode toggle */}
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError('')
              setSuccess('')
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </span>
          </button>
          {mode === 'signin' && (
            <button
              type="button"
              onClick={() => {
                setShowAuthModal(false)
                router.push('/auth/forgot-password')
              }}
              className="text-xs text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Forgot password?
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function useRequireAuth() {
  const { user, loading } = useAuth()
  const { setShowAuthModal, setAuthCallback } = useAppStore()

  const requireAuth = (callback?: () => void): boolean => {
    if (user) {
      return true
    }
    setAuthCallback(callback || null)
    setShowAuthModal(true)
    return false
  }

  return { user, loading, requireAuth, isAuthenticated: !!user }
}
