import { createRouteHandler } from '@/lib/api/route-handler'
import { validateQuery, uuidSchema } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { ValidationError } from '@/lib/api/errors'
import { createServerClient } from '@/lib/supabase/server'
import { handleDatabaseError } from '@/lib/supabase/utils'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'
import { NextRequest } from 'next/server'

/**
 * Query parameters schema for GET /api/categorization/learned-patterns
 */
const learnedPatternsQuerySchema = z.object({
  categoryId: uuidSchema.optional(),
  merchantPattern: z.string().optional(),
})

/**
 * GET /api/categorization/learned-patterns
 * Get user's learned categorization patterns
 *
 * Query params (optional):
 * - categoryId: Filter by category ID
 * - merchantPattern: Filter by merchant pattern (partial match)
 *
 * Response: Array<{
 *   id: string,
 *   merchant_pattern: string,
 *   category_id: string,
 *   confidence: number,
 *   created_at: string,
 *   updated_at: string
 * }>
 * Errors: 401 (unauthorized)
 */
export const GET = createRouteHandler(async (request: NextRequest, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  try {
    // Validate query parameters
    const queryParams = validateQuery(request, learnedPatternsQuerySchema)

    const supabase = await createServerClient()

    // Build query for user's learned patterns
    let query = supabase
      .from('categorization_rules')
      .select('id, merchant_pattern, category_id, confidence, created_at, updated_at')
      .eq('user_id', context.userId)
      .order('updated_at', { ascending: false })

    // Apply optional filters
    if (queryParams.categoryId) {
      query = query.eq('category_id', queryParams.categoryId)
    }

    if (queryParams.merchantPattern) {
      // Use ilike for case-insensitive partial match
      query = query.ilike('merchant_pattern', `%${queryParams.merchantPattern}%`)
    }

    const { data, error: queryError } = await query

    if (queryError) {
      const { message, code } = handleDatabaseError(queryError, 'fetch learned patterns')
      logger.error('Failed to fetch learned patterns', {
        requestId: context.requestId,
        userId: context.userId,
        error: message,
        code,
      })
      throw new Error(message)
    }

    logger.info('Learned patterns retrieved successfully', {
      requestId: context.requestId,
      userId: context.userId,
      patternCount: data?.length || 0,
      filters: {
        categoryId: queryParams.categoryId,
        merchantPattern: queryParams.merchantPattern,
      },
    })

    return success(data || [])
  } catch (err) {
    if (err instanceof ValidationError) {
      return error(err.message, 400, err.code)
    }
    if (err instanceof z.ZodError) {
      logger.warn('Invalid query parameters for learned patterns', {
        requestId: context.requestId,
        userId: context.userId,
        errors: err.errors,
      })
      return error('Invalid query parameters', 400, 'VALIDATION_ERROR')
    }
    throw err
  }
})
