import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Updates the Supabase auth session in middleware.
 *
 * This function:
 * 1. Creates a Supabase server client using the request's cookies
 * 2. Refreshes the auth session (handling token refresh automatically)
 * 3. Returns a NextResponse with any updated auth cookies set
 *
 * IMPORTANT: The middleware only handles session refresh. Route protection
 * is handled client-side by each page component (e.g., UnauthenticatedView
 * in the Dashboard page). This avoids redirect loops and ensures the auth
 * session is always properly refreshed before the page loads.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is signed in and trying to access auth sign-in/sign-up pages,
  // redirect to dashboard. This prevents logged-in users from seeing the
  // sign-in form again. Other auth pages (callback, verify, reset) are allowed.
  if (user) {
    const isAuthMainPage =
      request.nextUrl.pathname === '/auth/signin' ||
      request.nextUrl.pathname === '/auth/signup'

    if (isAuthMainPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
