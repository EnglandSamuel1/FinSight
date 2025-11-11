import { createServerClient } from '@/lib/supabase/server'
import { createRouteHandler } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { AuthenticationError } from '@/lib/api/errors'
import { z } from 'zod'
import { checkRateLimit, defaultRateLimitConfig } from '@/lib/api/rate-limit'

/**
 * Login request schema
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * POST /api/auth/login
 * User login endpoint
 * 
 * Request: { email: string, password: string }
 * Response: { user: User, session: Session }
 * Errors: 401 (invalid credentials)
 */
export const POST = createRouteHandler(
  async (request, context) => {
    // Check rate limit (auth endpoints should have rate limiting)
    const rateLimitResponse = checkRateLimit(
      request,
      defaultRateLimitConfig,
      context.userId
    )
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Validate request body
    const { email, password } = await validateBody(request, loginSchema)

    const supabase = await createServerClient()

    // Attempt to sign in with password
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      // Invalid credentials
      throw new AuthenticationError('Invalid email or password', 'INVALID_CREDENTIALS')
    }

    if (!data.user || !data.session) {
      return error('Failed to create session', 500, 'LOGIN_FAILED')
    }

    // Return user and session on success (direct data, no wrapper)
    return success({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    })
  },
  { requireAuth: false } // Login doesn't require authentication
)
