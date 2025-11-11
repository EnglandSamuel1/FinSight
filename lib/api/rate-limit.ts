import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  max: number
  /**
   * Time window in milliseconds
   */
  windowMs: number
}

/**
 * In-memory rate limit store
 * Key: identifier (IP or user ID)
 * Value: { count: number, resetAt: number }
 */
const rateLimitStore = new Map<
  string,
  { count: number; resetAt: number }
>()

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

/**
 * Get rate limit identifier from request
 * Uses IP address or user ID if available
 * 
 * @param request - Next.js request object
 * @param userId - Optional user ID
 * @returns Identifier string
 */
function getRateLimitKey(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }
  // Use IP address as fallback
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

/**
 * Check rate limit for a request
 * 
 * @param request - Next.js request object
 * @param config - Rate limit configuration
 * @param userId - Optional user ID
 * @returns null if within limit, NextResponse with 429 if exceeded
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): NextResponse | null {
  const key = getRateLimitKey(request, userId)
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired entry
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    })
    return null
  }

  if (entry.count >= config.max) {
    // Rate limit exceeded
    logger.warn('Rate limit exceeded', {
      key,
      count: entry.count,
      max: config.max,
      path: request.nextUrl.pathname,
      method: request.method,
    })

    return NextResponse.json(
      {
        error: {
          message: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      }
    )
  }

  // Increment count
  entry.count++
  return null
}

/**
 * Default rate limit configuration
 * 100 requests per minute per IP/user
 */
export const defaultRateLimitConfig: RateLimitConfig = {
  max: 100,
  windowMs: 60 * 1000, // 1 minute
}
