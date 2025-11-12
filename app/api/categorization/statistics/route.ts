import { createRouteHandler } from '@/lib/api/route-handler'
import { validateQuery, dateSchema } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { ValidationError } from '@/lib/api/errors'
import { createServerClient } from '@/lib/supabase/server'
import { handleDatabaseError } from '@/lib/supabase/utils'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'
import { NextRequest } from 'next/server'

/**
 * Query parameters schema for GET /api/categorization/statistics
 */
const statisticsQuerySchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
})

/**
 * Category distribution item
 */
export interface CategoryDistributionItem {
  categoryId: string
  categoryName: string
  count: number
}

/**
 * Categorization statistics response
 */
export interface CategorizationStatistics {
  total: number
  categorized: number
  uncategorized: number
  averageConfidence: number
  categoryDistribution: CategoryDistributionItem[]
}

/**
 * GET /api/categorization/statistics
 * Get categorization statistics for user's transactions
 *
 * Query params (optional):
 * - startDate: Filter transactions from this date (YYYY-MM-DD)
 * - endDate: Filter transactions to this date (YYYY-MM-DD)
 *
 * Response: {
 *   total: number,
 *   categorized: number,
 *   uncategorized: number,
 *   averageConfidence: number,
 *   categoryDistribution: Array<{ categoryId: string, categoryName: string, count: number }>
 * }
 * Errors: 401 (unauthorized), 400 (validation error)
 */
export const GET = createRouteHandler(async (request: NextRequest, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  try {
    // Validate query parameters
    const queryParams = validateQuery(request, statisticsQuerySchema)

    const supabase = await createServerClient()

    // Build base query for user's transactions
    let query = supabase
      .from('transactions')
      .select('category_id, confidence', { count: 'exact' })
      .eq('user_id', context.userId)

    // Apply date range filters
    if (queryParams.startDate) {
      query = query.gte('date', queryParams.startDate)
    }
    if (queryParams.endDate) {
      query = query.lte('date', queryParams.endDate)
    }

    // Get all transactions with category_id and confidence
    const { data: transactions, error: queryError, count } = await query

    if (queryError) {
      const { message, code } = handleDatabaseError(queryError, 'fetch categorization statistics')
      logger.error('Failed to fetch categorization statistics', {
        requestId: context.requestId,
        userId: context.userId,
        error: message,
        code,
      })
      throw new Error(message)
    }

    const total = count || 0

    // Calculate categorized and uncategorized counts
    const categorized = transactions?.filter((tx) => tx.category_id !== null).length || 0
    const uncategorized = total - categorized

    // Calculate average confidence (only for categorized transactions with confidence values)
    const confidenceValues = transactions
      ?.filter((tx) => tx.category_id !== null && tx.confidence !== null)
      .map((tx) => tx.confidence as number) || []

    const averageConfidence =
      confidenceValues.length > 0
        ? Math.round(
            (confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length) * 100
          ) / 100
        : 0

    // Get category distribution
    // Count transactions per category
    const categoryCounts = new Map<string, number>()
    transactions?.forEach((tx) => {
      if (tx.category_id) {
        const count = categoryCounts.get(tx.category_id) || 0
        categoryCounts.set(tx.category_id, count + 1)
      }
    })

    // Fetch category names for distribution
    const categoryIds = Array.from(categoryCounts.keys())
    let categoryDistribution: CategoryDistributionItem[] = []

    if (categoryIds.length > 0) {
      const { data: categories, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', context.userId)
        .in('id', categoryIds)

      if (categoryError) {
        const { message, code } = handleDatabaseError(categoryError, 'fetch categories for statistics')
        logger.error('Failed to fetch categories for statistics', {
          requestId: context.requestId,
          userId: context.userId,
          error: message,
          code,
        })
        // Continue without category names - use category IDs as fallback
      }

      // Build category distribution with names
      categoryDistribution = categoryIds.map((categoryId) => {
        const category = categories?.find((c) => c.id === categoryId)
        return {
          categoryId,
          categoryName: category?.name || 'Unknown',
          count: categoryCounts.get(categoryId) || 0,
        }
      })

      // Sort by count descending
      categoryDistribution.sort((a, b) => b.count - a.count)
    }

    const statistics: CategorizationStatistics = {
      total,
      categorized,
      uncategorized,
      averageConfidence,
      categoryDistribution,
    }

    logger.info('Categorization statistics retrieved successfully', {
      requestId: context.requestId,
      userId: context.userId,
      statistics,
      filters: {
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
      },
    })

    return success(statistics)
  } catch (err) {
    if (err instanceof ValidationError) {
      return error(err.message, 400, err.code)
    }
    if (err instanceof z.ZodError) {
      logger.warn('Invalid query parameters for categorization statistics', {
        requestId: context.requestId,
        userId: context.userId,
        errors: err.issues,
      })
      return error('Invalid query parameters', 400, 'VALIDATION_ERROR')
    }
    throw err
  }
})
