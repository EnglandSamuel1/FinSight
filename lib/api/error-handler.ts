import { NextRequest, NextResponse } from 'next/server'
import { isApiError } from './errors'
import { error } from './response'
import { logger } from '@/lib/utils/logger'

/**
 * Centralized error handler for API routes
 * Converts errors to consistent API response format
 * Logs errors with context for debugging
 * 
 * @param err - Error to handle
 * @param request - Next.js request object (for context)
 * @param requestId - Request ID for tracing
 * @param userId - User ID (if authenticated)
 * @returns NextResponse with error format
 */
export function handleApiError(
  err: unknown,
  request: NextRequest,
  requestId: string,
  userId?: string
): NextResponse {
  // Handle known API errors
  if (isApiError(err)) {
    logger.error('API Error', {
      error: {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
      },
      requestId,
      userId,
      path: request.nextUrl.pathname,
      method: request.method,
    })

    return error(err.message, err.statusCode, err.code)
  }

  // Handle unexpected errors
  const message = err instanceof Error ? err.message : 'Internal server error'
  const errorDetails = err instanceof Error ? err.stack : String(err)

  logger.error('Unexpected API Error', {
    error: {
      message,
      details: errorDetails,
    },
    requestId,
    userId,
    path: request.nextUrl.pathname,
    method: request.method,
  })

  // Don't expose internal error details to client
  return error('Internal server error', 500, 'INTERNAL_ERROR')
}
