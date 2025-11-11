import { createRouteHandler } from '@/lib/api/route-handler'
import { success, error } from '@/lib/api/response'
import { logger } from '@/lib/utils/logger'
import { categorizeTransactions } from '@/lib/categorization/auto-categorize'
import { createServerClient } from '@/lib/supabase/server'
import { handleDatabaseError } from '@/lib/supabase/utils'
import { z } from 'zod'
import { NextRequest } from 'next/server'
import type { Transaction } from '@/types/transaction'
import type { Category } from '@/types/category'

/**
 * Request body schema for POST /api/transactions/categorize
 */
const categorizationRequestSchema = z.object({
  transactionIds: z.array(z.string()).optional(),
  transactions: z
    .array(
      z.object({
        id: z.string().optional(),
        merchant: z.string(),
        description: z.string().nullable(),
      })
    )
    .optional(),
})

/**
 * POST /api/transactions/categorize
 * Categorize transactions using rule-based matching
 *
 * Request body:
 * - transactionIds: Array of transaction IDs to categorize (will fetch from DB)
 * - transactions: Array of transaction objects to categorize directly
 *
 * At least one of transactionIds or transactions must be provided.
 *
 * Response: Array<{
 *   transactionId?: string,
 *   category_id: string | null,
 *   confidence: number,
 *   matchReason: string
 * }>
 *
 * Errors: 400 (validation error, no transactions provided), 401 (unauthorized), 404 (transaction not found)
 */
export const POST = createRouteHandler(async (request: NextRequest, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedBody = categorizationRequestSchema.parse(body)

    const { transactionIds, transactions: providedTransactions } = validatedBody

    // Validate that at least one input is provided
    if (
      (!transactionIds || transactionIds.length === 0) &&
      (!providedTransactions || providedTransactions.length === 0)
    ) {
      logger.warn('Categorization request with no transactions', {
        requestId: context.requestId,
        userId: context.userId,
      })
      return error(
        'At least one of transactionIds or transactions must be provided',
        400,
        'MISSING_INPUT'
      )
    }

    const supabase = await createServerClient()

    // Fetch user's categories
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', context.userId)

    if (categoryError) {
      const { message, code } = handleDatabaseError(categoryError, 'fetch categories')
      logger.error('Failed to fetch user categories for categorization', {
        requestId: context.requestId,
        userId: context.userId,
        error: message,
        code,
      })
      throw new Error(message)
    }

    // Transform categories from database format to API format
    const userCategories: Category[] = (categoryData || []).map((cat) => ({
      id: cat.id,
      userId: cat.user_id,
      name: cat.name,
      description: cat.description,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at,
    }))

    let transactionsToCategorize: Array<{
      id?: string
      merchant: string
      description: string | null
    }> = []

    // If transaction IDs provided, fetch from database
    if (transactionIds && transactionIds.length > 0) {
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('id, merchant, description')
        .eq('user_id', context.userId)
        .in('id', transactionIds)

      if (txError) {
        const { message, code } = handleDatabaseError(txError, 'fetch transactions')
        logger.error('Failed to fetch transactions for categorization', {
          requestId: context.requestId,
          userId: context.userId,
          transactionIds,
          error: message,
          code,
        })
        throw new Error(message)
      }

      if (!txData || txData.length === 0) {
        logger.warn('No transactions found for provided IDs', {
          requestId: context.requestId,
          userId: context.userId,
          requestedIds: transactionIds,
        })
        return error('No transactions found for the provided IDs', 404, 'NOT_FOUND')
      }

      // Check if all requested transactions were found
      if (txData.length !== transactionIds.length) {
        const foundIds = txData.map((tx) => tx.id)
        const missingIds = transactionIds.filter((id) => !foundIds.includes(id))
        logger.warn('Some transaction IDs not found', {
          requestId: context.requestId,
          userId: context.userId,
          requestedCount: transactionIds.length,
          foundCount: txData.length,
          missingIds,
        })
      }

      transactionsToCategorize = txData
    } else if (providedTransactions) {
      // Use provided transaction objects directly
      transactionsToCategorize = providedTransactions
    }

    logger.info('Starting transaction categorization', {
      requestId: context.requestId,
      userId: context.userId,
      transactionCount: transactionsToCategorize.length,
      categoryCount: userCategories.length,
    })

    // Categorize all transactions (with userId for learned patterns)
    const results = await categorizeTransactions(transactionsToCategorize, userCategories, context.userId)

    // Calculate summary statistics
    const categorized = results.filter((r) => r.category_id !== null).length
    const uncategorized = results.filter((r) => r.category_id === null).length
    const totalConfidence = results.reduce((sum, r) => sum + r.confidence, 0)
    const averageConfidence = results.length > 0 ? totalConfidence / results.length : 0

    logger.info('Transaction categorization completed', {
      requestId: context.requestId,
      userId: context.userId,
      totalTransactions: results.length,
      categorized,
      uncategorized,
      averageConfidence: averageConfidence.toFixed(2),
    })

    return success(results)
  } catch (err) {
    // Check if it's a Zod validation error
    if (err instanceof z.ZodError) {
      logger.warn('Categorization request validation failed', {
        requestId: context.requestId,
        userId: context.userId,
        errors: err.errors,
      })
      return error('Invalid request body', 400, 'VALIDATION_ERROR')
    }

    // Log and re-throw for global error handler
    logger.error('Categorization error', {
      requestId: context.requestId,
      userId: context.userId,
      error: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
})
