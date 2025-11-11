import { createServerClient } from '@/lib/supabase/server'
import { createRouteHandler } from '@/lib/api/route-handler'
import { success, error } from '@/lib/api/response'

/**
 * POST /api/auth/logout
 * User logout endpoint
 * 
 * Request: None (uses session)
 * Response: { success: true }
 */
export const POST = createRouteHandler(async (request, context) => {
  const supabase = await createServerClient()

  // Sign out the user
  const { error: logoutError } = await supabase.auth.signOut()

  if (logoutError) {
    return error('Failed to logout', 500, 'LOGOUT_FAILED')
  }

  // Return success response (direct data, no wrapper)
  return success({ success: true })
})
