'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { motion } from 'framer-motion'
import {
  Loader2,
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
}

const COUNTDOWN_SECONDS = 60

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [verified, setVerified] = useState(false)

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  // Check if the user has verified their email by polling the session
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    const checkVerification = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data } = await supabase.auth.getSession()

        if (data.session?.user?.email_confirmed_at) {
          setVerified(true)
          if (interval) clearInterval(interval)
        }
      } catch {
        // Silently ignore - we'll retry
      }
    }

    // Check every 3 seconds
    interval = setInterval(checkVerification, 3000)

    // Also check immediately
    checkVerification()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  const handleResend = useCallback(async () => {
    if (!email || countdown > 0) return

    setError('')
    setSuccess('')
    setResendLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()
      const { error: resendError } = await supabase.auth.signUp({
        email,
        password: '', // Supabase will resend verification if user exists
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      // If signUp fails because user exists, that's expected - we use resend
      // The signUp method for existing unconfirmed users will resend the verification email
      if (resendError) {
        // Try the resend method as fallback
        const { error: resendErr } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (resendErr) {
          if (resendErr.message.includes('rate limit')) {
            setError('Too many attempts. Please wait before trying again.')
          } else {
            setError('Failed to resend verification email. Please try again.')
          }
          return
        }
      }

      setSuccess('Verification email sent! Check your inbox.')
      setCountdown(COUNTDOWN_SECONDS)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }, [email, countdown])

  const formatCountdown = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`
  }

  // Verified state
  if (verified) {
    return (
      <motion.div initial="hidden" animate="visible" className="w-full">
        <motion.div custom={0} variants={fadeUp}>
          <Card className="border-0 shadow-xl shadow-black/5 dark:shadow-black/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950"
              >
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </motion.div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Email Verified!
              </CardTitle>
              <CardDescription className="text-base">
                Your email has been verified successfully
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-4 text-sm text-emerald-700 dark:text-emerald-300 text-center">
                You&apos;re all set! You can now sign in to your account.
              </div>
              <Button
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all"
                onClick={() => router.push('/auth/signin')}
              >
                Continue to Sign In
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" className="w-full">
      <motion.div custom={0} variants={fadeUp}>
        <Card className="border-0 shadow-xl shadow-black/5 dark:shadow-black/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950"
            >
              <Mail className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Check your email
            </CardTitle>
            <CardDescription className="text-base">
              We&apos;ve sent a verification link to your email
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Email display */}
            {email && (
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Verification email sent to</p>
                <p className="mt-1 text-sm font-semibold text-foreground break-all">{email}</p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-700 dark:text-red-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Success message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-3 text-sm text-emerald-700 dark:text-emerald-300"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Instructions */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">What to do next:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs">
                <li>Open your email inbox (and spam folder)</li>
                <li>Find the email from Humain-Uno</li>
                <li>Click the verification link in the email</li>
                <li>You&apos;ll be automatically verified</li>
              </ol>
            </div>

            {/* Resend Button */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-11 font-medium"
                onClick={handleResend}
                disabled={countdown > 0 || resendLoading || !email}
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <RefreshCw className="h-4 w-4 opacity-50" />
                    Resend in {formatCountdown(countdown)}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              {countdown > 0 && !resendLoading && (
                <p className="text-xs text-center text-muted-foreground">
                  You can request a new link after the countdown ends
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="justify-center pb-6">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
