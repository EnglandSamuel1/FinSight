import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Check if the current request is authenticated
 * 
 * @param request - Next.js request object
 * @returns User object if authenticated, null otherwise
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('[ERROR] Authentication check failed:', error)
    return null
  }
}

/**
 * Get current user from session (for server components)
 * 
 * @returns User object if authenticated, null otherwise
 */
export async function getCurrentUser() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('[ERROR] Get current user failed:', error)
    return null
  }
}

/**
 * Require authentication - throws if user is not authenticated
 * Use this in API routes and server components
 * 
 * @returns User object
 * @throws Error if user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  return user
}

/**
 * Middleware helper to protect API routes
 * Returns 401 if user is not authenticated
 * 
 * @param request - Next.js request object
 * @returns NextResponse with 401 if not authenticated, null if authenticated
 */
export async function requireAuthMiddleware(request: NextRequest) {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return null
}
