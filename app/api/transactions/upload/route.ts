import { createRouteHandler } from '@/lib/api/route-handler'
import { success, error } from '@/lib/api/response'
import { validateQuery } from '@/lib/api/validation'
import { logger } from '@/lib/utils/logger'
import { parseCSVFile } from '@/lib/parsers/csv-parser'
import { createTransactions } from '@/lib/api/transactions'
import { findDuplicates, filterDuplicates } from '@/lib/utils/duplicate-detection'
import { categorizeTransactions } from '@/lib/categorization/auto-categorize'
import { createServerClient } from '@/lib/supabase/server'
import { handleDatabaseError } from '@/lib/supabase/utils'
import { z } from 'zod'
import { NextRequest } from 'next/server'
import type { Category } from '@/types/category'

/**
 * Maximum file size: 10MB
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

/**
 * Allowed file types
 */
const ALLOWED_FILE_TYPES = ['text/csv', 'application/vnd.ms-excel']

/**
 * Query parameters schema for POST /api/transactions/upload
 */
const uploadQuerySchema = z.object({
  skipDuplicates: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'), // Default to true if not specified
})

/**
 * Validate uploaded file
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
    return {
      valid: false,
      error: 'Invalid file type. Only CSV files are allowed.',
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of 10MB. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    }
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty. Please upload a valid CSV file.',
    }
  }

  return { valid: true }
}

/**
 * POST /api/transactions/upload
 * Upload and parse a CSV transaction file with duplicate detection
 *
 * Request: FormData with 'file' field containing CSV file
 * Query params: ?skipDuplicates=true|false (default: true)
 * Response: {
 *   message: string,
 *   fileName: string,
 *   fileSize: number,
 *   fileType: string,
 *   transactions: Transaction[],
 *   duplicates: Array<{ transaction: ParsedTransaction, existingTransactionId: string }>,
 *   duplicateCount: number,
 *   errors: ParseError[],
 *   summary: { totalRows: number, successCount: number, errorCount: number, storedCount: number, duplicateCount: number },
 *   dateRange: { minDate: string | null, maxDate: string | null },
 *   detectedFormat: string
 * }
 * Errors: 400 (invalid file), 413 (file too large), 401 (unauthorized)
 */
export const POST = createRouteHandler(async (request: NextRequest, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  try {
    // Validate query parameters for duplicate handling
    const queryParams = validateQuery(request, uploadQuerySchema)
    const skipDuplicates = queryParams.skipDuplicates ?? true // Default to skipping duplicates

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      logger.warn('File upload missing file', {
        requestId: context.requestId,
        userId: context.userId,
      })
      return error('No file provided', 400, 'MISSING_FILE')
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      logger.warn('File validation failed', {
        requestId: context.requestId,
        userId: context.userId,
        fileName: file.name,
        fileSize: file.size,
        error: validation.error,
      })
      return error(validation.error || 'Invalid file', 400, 'INVALID_FILE')
    }

    // Read file content (in-memory processing)
    const fileBuffer = await file.arrayBuffer()
    const fileContent = Buffer.from(fileBuffer).toString('utf-8')

    // Parse CSV file
    logger.info('Starting CSV parsing', {
      requestId: context.requestId,
      userId: context.userId,
      fileName: file.name,
      fileSize: file.size,
    })

    const parseResult = await parseCSVFile(fileContent, file.name)

    // Log parsing results
    logger.info('CSV parsing completed', {
      requestId: context.requestId,
      userId: context.userId,
      fileName: file.name,
      detectedFormat: parseResult.detectedFormat,
      totalRows: parseResult.totalRows,
      successCount: parseResult.successCount,
      errorCount: parseResult.errorCount,
    })

    // Check for duplicates and store transactions if any were successfully parsed
    let duplicateInfo: {
      duplicates: Array<{ transaction: any; existingTransactionId: string; duplicateHash: string }>
      duplicateHashes: Set<string>
    } = { duplicates: [], duplicateHashes: new Set() }
    let duplicateCount = 0
    let storedTransactions = []
    let storedCount = 0

    if (parseResult.transactions.length > 0) {
      logger.info('Checking for duplicates', {
        requestId: context.requestId,
        userId: context.userId,
        transactionCount: parseResult.transactions.length,
      })

      // Map ParsedTransaction to TransactionInsert format for duplicate check and storage
      const transactionsToCheck = parseResult.transactions.map((tx) => ({
        date: tx.date,
        amount_cents: tx.amount_cents,
        merchant: tx.merchant,
        description: tx.description || null,
        category_id: null, // Categories assigned later via categorization
        is_duplicate: false, // Will be set by filterDuplicates if needed
      }))

      // Find duplicates
      duplicateInfo = await findDuplicates(transactionsToCheck, context.userId)
      duplicateCount = duplicateInfo.duplicates.length

      logger.info('Duplicate check completed', {
        requestId: context.requestId,
        userId: context.userId,
        duplicatesFound: duplicateCount,
        skipDuplicates,
      })

      // Filter duplicates based on user choice
      const transactionsToInsert = filterDuplicates(
        transactionsToCheck,
        duplicateInfo.duplicateHashes,
        skipDuplicates
      )

      // Categorize transactions automatically before storing
      if (transactionsToInsert.length > 0) {
        logger.info('Categorizing transactions', {
          requestId: context.requestId,
          userId: context.userId,
          transactionCount: transactionsToInsert.length,
        })

        // Fetch user's categories
        const supabase = await createServerClient()
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', context.userId)

        if (categoryError) {
          const { message, code } = handleDatabaseError(categoryError, 'fetch categories')
          logger.error('Failed to fetch categories for categorization during import', {
            requestId: context.requestId,
            userId: context.userId,
            error: message,
            code,
          })
          // Continue without categorization if category fetch fails
        } else {
          // Transform categories from database format to API format
          const userCategories: Category[] = (categoryData || []).map((cat) => ({
            id: cat.id,
            userId: cat.user_id,
            name: cat.name,
            description: cat.description,
            createdAt: cat.created_at,
            updatedAt: cat.updated_at,
          }))

          // Categorize each transaction (with userId for learned patterns)
          const categorizationResults = await categorizeTransactions(transactionsToInsert, userCategories, context.userId)

          // Apply categorization results to transactions
          transactionsToInsert.forEach((tx, index) => {
            const result = categorizationResults[index]
            if (result) {
              tx.category_id = result.category_id
              tx.confidence = result.confidence
            }
          })

          const categorizedCount = categorizationResults.filter((r) => r.category_id !== null).length
          const uncategorizedCount = categorizationResults.filter((r) => r.category_id === null).length

          logger.info('Transaction categorization completed', {
            requestId: context.requestId,
            userId: context.userId,
            totalTransactions: transactionsToInsert.length,
            categorizedCount,
            uncategorizedCount,
          })
        }
      }

      // Store transactions (only non-duplicates if skipDuplicates is true)
      if (transactionsToInsert.length > 0) {
        logger.info('Storing parsed transactions', {
          requestId: context.requestId,
          userId: context.userId,
          transactionCount: transactionsToInsert.length,
          skipDuplicates,
        })

        storedTransactions = await createTransactions(transactionsToInsert, context.userId)
        storedCount = storedTransactions.length

        logger.info('Transactions stored successfully', {
          requestId: context.requestId,
          userId: context.userId,
          storedCount,
          requestedCount: parseResult.transactions.length,
          duplicateCount,
          skippedDuplicates: skipDuplicates,
        })
      }
    }

    // Calculate date range from stored transactions
    let dateRange: { minDate: string | null; maxDate: string | null } = {
      minDate: null,
      maxDate: null,
    }

    if (storedTransactions.length > 0) {
      const dates = storedTransactions.map((tx) => new Date(tx.date).getTime())
      const minTimestamp = Math.min(...dates)
      const maxTimestamp = Math.max(...dates)
      dateRange.minDate = new Date(minTimestamp).toISOString()
      dateRange.maxDate = new Date(maxTimestamp).toISOString()
    }

    // Calculate categorization summary from stored transactions
    const categorizationSummary =
      storedTransactions.length > 0
        ? {
            categorized: storedTransactions.filter((tx) => tx.category_id !== null).length,
            uncategorized: storedTransactions.filter((tx) => tx.category_id === null).length,
            averageConfidence:
              storedTransactions.filter((tx) => tx.confidence !== null).length > 0
                ? storedTransactions
                    .filter((tx) => tx.confidence !== null)
                    .reduce((sum, tx) => sum + (tx.confidence || 0), 0) /
                  storedTransactions.filter((tx) => tx.confidence !== null).length
                : 0,
          }
        : undefined

    // Return parsing, duplicate detection, categorization, and storage results
    return success({
      message: 'File uploaded, parsed, and stored successfully',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      transactions: storedTransactions,
      duplicates: duplicateInfo.duplicates.map((dup) => ({
        transaction: dup.transaction,
        existingTransactionId: dup.existingTransactionId,
      })),
      duplicateCount,
      errors: parseResult.errors,
      summary: {
        totalRows: parseResult.totalRows,
        successCount: parseResult.successCount,
        errorCount: parseResult.errorCount,
        storedCount,
        duplicateCount,
      },
      categorizationSummary,
      dateRange,
      detectedFormat: parseResult.detectedFormat,
    })
  } catch (err) {
    // Error handling is done by createRouteHandler's error handler
    // But we can add specific logging here if needed
    logger.error('File upload error', {
      requestId: context.requestId,
      userId: context.userId,
      error: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
})
