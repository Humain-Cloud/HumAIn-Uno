import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth error from provider
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/auth/signin?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  // Exchange code for session
  if (code) {
    try {
      const supabase = await createSupabaseServerClient()
      if (!supabase) {
        console.error('Supabase server client is not configured')
        return NextResponse.redirect(
          `${origin}/auth/signin?error=${encodeURIComponent('Authentication service is unavailable. Please try again later.')}`
        )
      }
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError.message)
        return NextResponse.redirect(
          `${origin}/auth/signin?error=${encodeURIComponent('Authentication failed. Please try again.')}`
        )
      }

      // Successful authentication - redirect to the intended page
      return NextResponse.redirect(`${origin}${redirect}`)
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(
        `${origin}/auth/signin?error=${encodeURIComponent('An unexpected error occurred. Please try again.')}`
      )
    }
  }

  // No code parameter - check for hash fragment (handled client-side)
  // If we get here without a code, redirect to sign in
  return NextResponse.redirect(
    `${origin}/auth/signin?error=${encodeURIComponent('Invalid authentication link. Please try again.')}`
  )
}
