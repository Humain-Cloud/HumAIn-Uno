'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { LogIn, Loader2 } from 'lucide-react'

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, authCallback, setAuthCallback } = useAppStore()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        name: name.trim() || undefined,
        redirect: false,
      })

      if (result?.error) {
        setError('Login failed. Please try again.')
      } else {
        setShowAuthModal(false)
        setEmail('')
        setName('')
        if (authCallback) {
          authCallback()
          setAuthCallback(null)
        }
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-emerald-600" />
            Sign in to Humain-Uno
          </DialogTitle>
          <DialogDescription>
            Enter your email and name to get started. New users will be automatically registered.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-name">Name (optional)</Label>
            <Input
              id="auth-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowAuthModal(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Use <strong>admin@humain-uno.dev</strong> for admin access
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function useRequireAuth() {
  const { data: session, status } = useSession()
  const { setShowAuthModal, setAuthCallback } = useAppStore()

  const requireAuth = (callback?: () => void): boolean => {
    if (status === 'authenticated' && session) {
      return true
    }
    setAuthCallback(callback || null)
    setShowAuthModal(true)
    return false
  }

  return { session, status, requireAuth, isAuthenticated: status === 'authenticated' }
}
