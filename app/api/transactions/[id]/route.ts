import { createRouteHandler } from '@/lib/api/route-handler'
import { validateBody, dateSchema, uuidSchema } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { ValidationError } from '@/lib/api/errors'
import { getTransactionById, updateTransaction, deleteTransaction } from '@/lib/api/transactions'
import { learnFromCorrection } from '@/lib/categorization/learning'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'
import { NextRequest } from 'next/server'

/**
 * Transaction update schema
 */
const transactionUpdateSchema = z.object({
  date: dateSchema.optional(),
  amount_cents: z.number().int('Amount must be an integer').optional(),
  merchant: z.string().min(1, 'Merchant is required').max(255, 'Merchant must be 255 characters or less').optional(),
  description: z.string().max(1000, 'Description must be 1000 characters or less').nullable().optional(),
  category_id: uuidSchema.nullable().optional(),
  is_duplicate: z.boolean().optional(),
})

/**
 * GET /api/transactions/[id]
 * Get a single transaction by ID
 * 
 * Response: Transaction
 * Errors: 404 (not found), 401 (unauthorized)
 */
export const GET = createRouteHandler(async (request: NextRequest, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  // Extract transaction ID from URL pathname (format: /api/transactions/{id})
  const pathname = request.nextUrl.pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const transactionId = pathParts[pathParts.length - 1]

  if (!transactionId || transactionId === 'transactions') {
    return error('Transaction ID is required', 400, 'MISSING_ID')
  }

  try {
    logger.info('Getting transaction', {
      requestId: context.requestId,
      userId: context.userId,
      transactionId,
    })

    const transaction = await getTransactionById(transactionId, context.userId)

    if (!transaction) {
      return error('Transaction not found', 404, 'NOT_FOUND')
    }

    logger.info('Transaction retrieved successfully', {
      requestId: context.requestId,
      userId: context.userId,
      transactionId,
    })

    return success(transaction)
  } catch (err) {
    if (err instanceof ValidationError) {
      return error(err.message, 400, err.code)
    }
    throw err
  }
})

/**
 * PUT /api/transactions/[id]
 * Update a transaction
 * 
 * Request: { date?: string, amount_cents?: number, merchant?: string, description?: string | null, category_id?: string | null, is_duplicate?: boolean }
 * Response: Transaction
 * Errors: 404 (not found), 400 (validation error), 401 (unauthorized)
 */
export const PUT = createRouteHandler(async (request: NextRequest, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  // Extract transaction ID from URL pathname (format: /api/transactions/{id})
  const pathname = request.nextUrl.pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const transactionId = pathParts[pathParts.length - 1]

  if (!transactionId || transactionId === 'transactions') {
    return error('Transaction ID is required', 400, 'MISSING_ID')
  }

  try {
    // Validate request body
    const updates = await validateBody(request, transactionUpdateSchema)

    logger.info('Updating transaction', {
      requestId: context.requestId,
      userId: context.userId,
      transactionId,
      updates,
    })

    // Get existing transaction to check if category_id is changing
    const existingTransaction = await getTransactionById(transactionId, context.userId)
    if (!existingTransaction) {
      return error('Transaction not found', 404, 'NOT_FOUND')
    }

    const categoryChanged =
      updates.category_id !== undefined && updates.category_id !== existingTransaction.category_id

    const updatedTransaction = await updateTransaction(transactionId, context.userId, updates)

    // Trigger learning if category was changed (and new category is not null)
    if (categoryChanged && updates.category_id !== null && updates.category_id !== undefined) {
      try {
        await learnFromCorrection(
          context.userId,
          {
            merchant: updatedTransaction.merchant,
            description: updatedTransaction.description,
          },
          updates.category_id
        )
        logger.info('Learning triggered from category correction', {
          requestId: context.requestId,
          userId: context.userId,
          transactionId,
          categoryId: updates.category_id,
        })
      } catch (learnError) {
        // Log learning error but don't fail the transaction update
        logger.error('Failed to learn from category correction', {
          requestId: context.requestId,
          userId: context.userId,
          transactionId,
          error: learnError instanceof Error ? learnError.message : String(learnError),
        })
      }
    }

    logger.info('Transaction updated successfully', {
      requestId: context.requestId,
      userId: context.userId,
      transactionId,
    })

    return success(updatedTransaction)
  } catch (err) {
    if (err instanceof ValidationError) {
      return error(err.message, 400, err.code)
    }
    if (err instanceof Error) {
      if (err.message === 'Transaction not found') {
        return error('Transaction not found', 404, 'NOT_FOUND')
      }
      if (err.message.includes('Category does not belong')) {
        return error(err.message, 400, 'INVALID_CATEGORY_ID')
      }
    }
    throw err
  }
})

/**
 * DELETE /api/transactions/[id]
 * Delete a transaction
 * 
 * Note: Per Story AC #4, transaction history should be preserved.
 * This endpoint performs a hard delete. Consider implementing soft delete
 * if transaction history preservation is required.
 * 
 * Response: { success: true }
 * Errors: 404 (not found), 401 (unauthorized)
 */
export const DELETE = createRouteHandler(async (request: NextRequest, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  // Extract transaction ID from URL pathname (format: /api/transactions/{id})
  const pathname = request.nextUrl.pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const transactionId = pathParts[pathParts.length - 1]

  if (!transactionId || transactionId === 'transactions') {
    return error('Transaction ID is required', 400, 'MISSING_ID')
  }

  try {
    logger.info('Deleting transaction', {
      requestId: context.requestId,
      userId: context.userId,
      transactionId,
    })

    await deleteTransaction(transactionId, context.userId)

    logger.info('Transaction deleted successfully', {
      requestId: context.requestId,
      userId: context.userId,
      transactionId,
    })

    return success({ success: true })
  } catch (err) {
    if (err instanceof ValidationError) {
      return error(err.message, 400, err.code)
    }
    if (err instanceof Error && err.message === 'Transaction not found') {
      return error('Transaction not found', 404, 'NOT_FOUND')
    }
    throw err
  }
})
