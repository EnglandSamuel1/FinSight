import { createRouteHandler } from '@/lib/api/route-handler'
import { validateBody, dateSchema, uuidSchema } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { ValidationError } from '@/lib/api/errors'
import { findDuplicates } from '@/lib/utils/duplicate-detection'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'
import { NextRequest } from 'next/server'

/**
 * Transaction schema for duplicate check (without user_id - added from session)
 */
const transactionCheckSchema = z.object({
  date: dateSchema,
  amount_cents: z.number().int('Amount must be an integer'),
  merchant: z.string().min(1, 'Merchant is required').max(255, 'Merchant must be 255 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').nullable().optional(),
  category_id: uuidSchema.nullable().optional(),
})

/**
 * Bulk transaction check schema
 */
const bulkTransactionCheckSchema = z.array(transactionCheckSchema).min(1, 'At least one transaction is required')

/**
 * POST /api/transactions/check-duplicates
 * Check for duplicate transactions before importing
 * 
 * Request: Transaction[] (transactions to check)
 * Response: {
 *   duplicates: Array<{
 *     transaction: Transaction,
 *     existingTransactionId: string,
 *     duplicateHash: string
 *   }>,
 *   duplicateCount: number,
 *   totalChecked: number
 * }
 * Errors: 400 (validation error), 401 (unauthorized)
 */
export const POST = createRouteHandler(async (request: NextRequest, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  try {
    // Validate request body
    const transactionsToCheck = await validateBody(request, bulkTransactionCheckSchema)

    logger.info('Checking for duplicates', {
      requestId: context.requestId,
      userId: context.userId,
      transactionCount: transactionsToCheck.length,
    })

    // Find duplicates
    const { duplicates, duplicateHashes } = await findDuplicates(
      transactionsToCheck,
      context.userId
    )

    logger.info('Duplicate check completed', {
      requestId: context.requestId,
      userId: context.userId,
      totalChecked: transactionsToCheck.length,
      duplicatesFound: duplicates.length,
    })

    return success({
      duplicates: duplicates.map((dup) => ({
        transaction: dup.transaction,
        existingTransactionId: dup.existingTransactionId,
        duplicateHash: dup.duplicateHash,
      })),
      duplicateCount: duplicates.length,
      totalChecked: transactionsToCheck.length,
    })
  } catch (err) {
    if (err instanceof ValidationError) {
      return error(err.message, 400, err.code)
    }
    throw err
  }
})
