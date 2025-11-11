import { createServerClient } from '@/lib/supabase/server'
import { createRouteHandler } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { ValidationError } from '@/lib/api/errors'
import { z } from 'zod'
import { checkRateLimit, defaultRateLimitConfig } from '@/lib/api/rate-limit'

/**
 * Signup request schema
 */
const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

/**
 * POST /api/auth/signup
 * User registration endpoint
 * 
 * Request: { email: string, password: string }
 * Response: { user: User, session: Session }
 * Errors: 400 (validation error), 409 (email exists)
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
    const { email, password } = await validateBody(request, signupSchema)

    const supabase = await createServerClient()

    // Attempt to sign up the user
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signupError) {
      // Check if error is due to email already existing
      if (
        signupError.message.includes('already registered') ||
        signupError.message.includes('already exists') ||
        signupError.message.includes('User already registered')
      ) {
        return error('Email already registered', 409, 'EMAIL_EXISTS')
      }

      // Other validation errors
      throw new ValidationError(signupError.message, 'SIGNUP_ERROR')
    }

    if (!data.user || !data.session) {
      return error('Failed to create user account', 500, 'SIGNUP_FAILED')
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
  { requireAuth: false } // Signup doesn't require authentication
)
