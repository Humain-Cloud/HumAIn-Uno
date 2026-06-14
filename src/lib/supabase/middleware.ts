import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Lightweight Supabase auth session refresh middleware.
 *
 * This middleware ONLY refreshes auth tokens when they exist in cookies.
 * It does NOT call supabase.auth.getUser() on every request when no auth
 * cookies are present, avoiding unnecessary external HTTP calls to the
 * Supabase API which could cause performance issues or server crashes.
 *
 * Session validation happens client-side via the AuthProvider.
 */

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if there are any Supabase auth cookies present.
  // If not, there's nothing to refresh — skip entirely.
  const allCookies = request.cookies.getAll()
  const hasAuthCookies = allCookies.some((c) => c.name.startsWith('sb-'))

  if (!hasAuthCookies) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh the session by calling getUser() — this also refreshes the
    // access token if it's expired. Wrapped in a timeout for safety.
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ])

    if (result && 'data' in result && result.data?.user) {
      // If user is signed in and trying to access auth pages, redirect to dashboard
      const pathname = request.nextUrl.pathname
      if (pathname === '/auth/signin' || pathname === '/auth/signup') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  } catch (error) {
    // Gracefully handle errors — don't block the request
    console.warn('[Middleware] Auth session refresh failed:',
      error instanceof Error ? error.message : 'Unknown error')
  }

  return supabaseResponse
}
