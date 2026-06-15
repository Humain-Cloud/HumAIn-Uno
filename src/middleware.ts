import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Next.js middleware that runs on every matched request.
 *
 * It refreshes the Supabase auth session so that users
 * stay authenticated across page navigations, and enforces
 * route protection for authenticated-only pages.
 *
 * If Supabase is not configured, the middleware passes through.
 */
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, skip middleware entirely
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static        (static files)
     * - _next/image         (image optimization files)
     * - favicon.ico         (favicon file)
     * - public files        (svg, png, jpg, jpeg, gif, webp, ico, webp, woff2, woff, ttf, eot)
     * - api/                (all API routes)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot|css|js)$|api/).*)',
  ],
}
