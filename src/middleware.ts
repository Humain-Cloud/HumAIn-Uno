import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

/**
 * Next.js middleware that runs on every matched request.
 *
 * It refreshes the Supabase auth session so that users
 * stay authenticated across page navigations, and enforces
 * route protection for authenticated-only pages.
 *
 * Routes matched:
 * - Page routes only (excludes static files, API routes, and assets)
 */
export async function middleware(request: NextRequest) {
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
