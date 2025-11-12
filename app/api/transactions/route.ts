import { createRouteHandler } from '@/lib/api/route-handler'
import { validateBody, validateQuery, dateSchema, uuidSchema } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { ValidationError } from '@/lib/api/errors'
import { createTransactions, queryTransactions } from '@/lib/api/transactions'
import { findDuplicates, filterDuplicates } from '@/lib/utils/duplicate-detection'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'
import { NextRequest } from 'next/server'

/**
 * Transaction insert schema (without user_id - added from session)
 */
const transactionInsertSchema = z.object({
  date: dateSchema,
  amount_cents: z.number().int('Amount must be an integer'),
  merchant: z.string().min(1, 'Merchant is required').max(255, 'Merchant must be 255 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').nullable().optional(),
  category_id: uuidSchema.nullable().optional(),
  transaction_type: z.enum(['expense', 'income', 'transfer']).optional().default('expense'),
  is_duplicate: z.boolean().optional().default(false),
})

/**
 * Bulk transaction insert schema
 */
const bulkTransactionInsertSchema = z.array(transactionInsertSchema).min(1, 'At least one transaction is required')

/**
 * Query parameters schema for GET /api/transactions
 */
const queryTransactionsSchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  categoryId: uuidSchema.optional(),
  transactionType: z.enum(['expense', 'income', 'transfer']).optional(),
  search: z.string().optional(),
  minAmount: z.coerce.number().int().optional(),
  maxAmount: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
})

/**
 * GET /api/transactions
 * Query transactions with optional filters
 *
 * Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&categoryId=uuid&transactionType=expense|income|transfer&search=string&minAmount=number&maxAmount=number&limit=number&offset=number
 * Response: Transaction[]
 * Errors: 401 (unauthorized), 400 (validation error)
 */
export const GET = createRouteHandler(async (request: NextRequest, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  try {
    // Validate query parameters
    const filters = validateQuery(request, queryTransactionsSchema)

    logger.info('Querying transactions', {
      requestId: context.requestId,
      userId: context.userId,
      filters,
    })

    // Query transactions
    const transactions = await queryTransactions(context.userId, filters)

    logger.info('Transactions queried successfully', {
      requestId: context.requestId,
      userId: context.userId,
      count: transactions.length,
    })

    return success(transactions)
  } catch (err) {
    if (err instanceof ValidationError) {
      return error(err.message, 400, err.code)
    }
    throw err
  }
})

/**
 * Query parameters schema for POST /api/transactions
 */
const createTransactionsQuerySchema = z.object({
  skipDuplicates: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'), // Default to true if not specified
})

/**
 * POST /api/transactions
 * Create multiple transactions in bulk with duplicate detection
 * 
 * Request: ParsedTransaction[] (from Story 3.2 parser output)
 * Query params: ?skipDuplicates=true|false (default: true)
 * Response: { created: number, duplicates: number, transactions: Transaction[] }
 * Errors: 400 (validation error), 401 (unauthorized)
 */
export const POST = createRouteHandler(async (request: NextRequest, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  try {
    // Validate request body
    const parsedTransactions = await validateBody(request, bulkTransactionInsertSchema)

    // Validate query parameters for duplicate handling
    const queryParams = validateQuery(request, createTransactionsQuerySchema)
    const skipDuplicates = queryParams.skipDuplicates ?? true // Default to skipping duplicates

    logger.info('Creating transactions with duplicate check', {
      requestId: context.requestId,
      userId: context.userId,
      transactionCount: parsedTransactions.length,
      skipDuplicates,
    })

    // Map ParsedTransaction to TransactionInsert format
    // Note: user_id will be added by createTransactions function
    const transactionsToCheck = parsedTransactions.map((tx) => ({
      date: tx.date,
      amount_cents: tx.amount_cents,
      merchant: tx.merchant,
      description: tx.description || null,
      category_id: tx.category_id || null,
      is_duplicate: false, // Will be set by filterDuplicates if needed
    }))

    // Check for duplicates
    const { duplicateHashes } = await findDuplicates(transactionsToCheck, context.userId)
    const duplicateCount = duplicateHashes.size

    // Filter duplicates based on user choice
    const transactionsToInsert = filterDuplicates(
      transactionsToCheck,
      duplicateHashes,
      skipDuplicates
    )

    // Create transactions (only non-duplicates if skipDuplicates is true)
    const createdTransactions = await createTransactions(transactionsToInsert, context.userId)

    logger.info('Transactions created successfully', {
      requestId: context.requestId,
      userId: context.userId,
      createdCount: createdTransactions.length,
      requestedCount: parsedTransactions.length,
      duplicateCount,
      skippedDuplicates: skipDuplicates,
    })

    return success({
      created: createdTransactions.length,
      duplicates: duplicateCount,
      transactions: createdTransactions,
    })
  } catch (err) {
    if (err instanceof ValidationError) {
      return error(err.message, 400, err.code)
    }
    throw err
  }
})
