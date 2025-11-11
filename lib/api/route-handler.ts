import { NextRequest, NextResponse } from 'next/server'
import { requireAuthMiddleware } from '@/lib/auth/middleware'
import { handleApiError } from './error-handler'
import { logger } from '@/lib/utils/logger'
import { v4 as uuidv4 } from 'uuid'

/**
 * Request context for API routes
 */
export interface RequestContext {
  requestId: string
  userId?: string
  startTime: number
}

/**
 * Options for API route handler
 */
export interface RouteHandlerOptions {
  /**
   * Whether authentication is required (default: true)
   */
  requireAuth?: boolean
  /**
   * Custom authentication check function
   */
  authCheck?: (request: NextRequest) => Promise<NextResponse | null>
}

/**
 * API route handler wrapper
 * Handles:
 * - Authentication check (if required)
 * - Error handling (try-catch with centralized error handler)
 * - Request logging (method, path, user ID, request ID)
 * - Response logging (status, duration)
 * - Request ID generation for tracing
 * 
 * @param handler - Route handler function
 * @param options - Handler options
 * @returns Wrapped route handler
 * 
 * @example
 * export const POST = createRouteHandler(async (request, context) => {
 *   const user = await getCurrentUser()
 *   return success({ message: 'Hello' })
 * })
 */
export function createRouteHandler(
  handler: (
    request: NextRequest,
    context: RequestContext
  ) => Promise<NextResponse>,
  options: RouteHandlerOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  const { requireAuth = true, authCheck } = options

  return async (request: NextRequest) => {
    const requestId = uuidv4()
    const startTime = Date.now()
    let userId: string | undefined

    try {
      // Log request
      logger.info('API Request', {
        method: request.method,
        path: request.nextUrl.pathname,
        requestId,
      })

      // Authentication check
      if (requireAuth) {
        const authMiddleware = authCheck || requireAuthMiddleware
        const authResponse = await authMiddleware(request)

        if (authResponse) {
          // Not authenticated
          logger.warn('Unauthorized API Request', {
            method: request.method,
            path: request.nextUrl.pathname,
            requestId,
          })
          return authResponse
        }

        // Get user ID for logging
        const { getAuthenticatedUser } = await import('@/lib/auth/middleware')
        const user = await getAuthenticatedUser(request)
        userId = user?.id
      }

      // Create request context
      const context: RequestContext = {
        requestId,
        userId,
        startTime,
      }

      // Execute handler
      const response = await handler(request, context)

      // Log response
      const duration = Date.now() - startTime
      logger.info('API Response', {
        status: response.status,
        duration: `${duration}ms`,
        requestId,
        userId,
      })

      return response
    } catch (err) {
      // Handle errors with centralized error handler
      return handleApiError(err, request, requestId, userId)
    }
  }
}

/**
 * Helper for async route handlers with error handling
 * Simplified version that doesn't require explicit context
 * 
 * @param handler - Route handler function
 * @param options - Handler options
 * @returns Wrapped route handler
 * 
 * @example
 * export const POST = asyncHandler(async (request) => {
 *   const user = await requireAuth()
 *   return success({ message: 'Hello' })
 * }, { requireAuth: true })
 */
export function asyncHandler(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: RouteHandlerOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  return createRouteHandler(async (request, context) => {
    return handler(request)
  }, options)
}
