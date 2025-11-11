import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * Next.js middleware for route protection and session refresh
 * 
 * This middleware:
 * - Refreshes Supabase session cookies on every request
 * - Ensures RLS policies work correctly by maintaining valid sessions
 * 
 * Note: Actual authentication checking is handled by:
 * - ProtectedRoute component for pages
 * - requireAuthMiddleware for API routes
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[ERROR] Missing Supabase environment variables')
    return response
  }

  // Create Supabase client for middleware
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // Refresh session - this ensures cookies are properly set and session is valid
  // This is critical for RLS policies to work correctly
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
