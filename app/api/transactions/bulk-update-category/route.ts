import { createRouteHandler } from '@/lib/api/route-handler'
import { validateBody, uuidSchema } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { ValidationError } from '@/lib/api/errors'
import { bulkUpdateTransactionCategory } from '@/lib/api/transactions'
import { learnFromCorrection } from '@/lib/categorization/learning'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'
import { NextRequest } from 'next/server'

/**
 * Bulk category update request schema
 */
const bulkUpdateCategorySchema = z.object({
  transactionIds: z.array(uuidSchema).min(1, 'At least one transaction ID is required'),
  category_id: uuidSchema.nullable(),
  transaction_type: z.enum(['expense', 'income', 'transfer']).optional(),
})

/**
 * POST /api/transactions/bulk-update-category
 * Bulk update category and/or transaction type for multiple transactions
 *
 * Request: { transactionIds: string[], category_id?: string | null, transaction_type?: 'expense' | 'income' | 'transfer' }
 * Response: { updated: number, transactions: Transaction[] }
 * Errors: 400 (validation error), 401 (unauthorized)
 */
export const POST = createRouteHandler(async (request: NextRequest, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const userId = context.userId

  try {
    // Validate request body
    const { transactionIds, category_id, transaction_type } = await validateBody(request, bulkUpdateCategorySchema)

    logger.info('Bulk updating transaction categories', {
      requestId: context.requestId,
      userId: userId,
      transactionCount: transactionIds.length,
      categoryId: category_id,
      transactionType: transaction_type,
    })

    // Use service function to handle bulk update
    const updatedTransactions = await bulkUpdateTransactionCategory(
      transactionIds,
      category_id,
      userId,
      transaction_type
    )

    // Trigger learning for each transaction category change (if category is not null)
    if (category_id !== null) {
      const learningPromises = updatedTransactions.map(async (transaction) => {
        try {
          await learnFromCorrection(
            userId,
            {
              merchant: transaction.merchant,
              description: transaction.description,
            },
            category_id
          )
        } catch (learnError) {
          // Log learning error but don't fail the bulk update
          logger.error('Failed to learn from bulk category correction', {
            requestId: context.requestId,
            userId: context.userId,
            transactionId: transaction.id,
            error: learnError instanceof Error ? learnError.message : String(learnError),
          })
        }
      })

      await Promise.all(learningPromises)

      logger.info('Learning triggered for bulk category update', {
        requestId: context.requestId,
        userId: context.userId,
        transactionCount: updatedTransactions.length,
        categoryId: category_id,
      })
    }

    logger.info('Bulk category update successful', {
      requestId: context.requestId,
      userId: context.userId,
      updatedCount: updatedTransactions.length,
    })

    return success({
      updated: updatedTransactions.length,
      transactions: updatedTransactions,
    })
  } catch (err) {
    if (err instanceof ValidationError) {
      return error(err.message, 400, err.code)
    }
    if (err instanceof Error) {
      // Handle service-level errors
      if (err.message.includes('do not belong')) {
        return error(err.message, 400, 'INVALID_TRANSACTION_IDS')
      }
      if (err.message.includes('Category does not belong')) {
        return error(err.message, 400, 'INVALID_CATEGORY_ID')
      }
      if (err.message.includes('not found')) {
        return error(err.message, 404, 'NOT_FOUND')
      }
      // Generic server error
      return error(err.message, 500, 'SERVER_ERROR')
    }
    throw err
  }
})
