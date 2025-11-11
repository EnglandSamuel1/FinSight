import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js middleware for route protection
 * 
 * Note: Actual authentication checking is handled by:
 * - ProtectedRoute component for pages
 * - requireAuthMiddleware for API routes
 * 
 * This middleware provides basic redirects for better UX
 */
export async function middleware(request: NextRequest) {
  // The ProtectedRoute component handles actual authentication checks
  // This middleware can be extended for additional route-level logic if needed

  return NextResponse.next()
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
