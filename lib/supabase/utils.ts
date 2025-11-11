import { createServerClient } from './server'

/**
 * Get an authenticated Supabase client for the current user.
 * Use this in API routes and server components.
 * 
 * @returns Supabase client with user session
 * @throws Error if user is not authenticated
 */
export async function getAuthenticatedClient() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('User not authenticated')
  }

  return supabase
}

/**
 * Get the current authenticated user ID.
 * 
 * @returns User ID
 * @throws Error if user is not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
  const supabase = await createServerClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('User not authenticated')
  }

  return user.id
}

/**
 * Handle database errors and log them appropriately.
 * 
 * @param error - Database error from Supabase
 * @param context - Additional context about the operation
 * @returns Formatted error message for user-facing errors
 */
export function handleDatabaseError(
  error: unknown,
  context?: string
): { message: string; code?: string } {
  console.error('[ERROR] Database error', {
    context,
    error: error instanceof Error ? error.message : String(error),
  })

  if (error instanceof Error) {
    // Supabase errors often have a message property
    if ('message' in error) {
      return {
        message: error.message as string,
        code: 'code' in error ? (error.code as string) : undefined,
      }
    }
  }

  return {
    message: 'An unexpected database error occurred',
    code: 'UNKNOWN_ERROR',
  }
}

/**
 * Retry a database operation with exponential backoff.
 * Useful for handling transient connection failures.
 * 
 * @param operation - Async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay in milliseconds (default: 1000)
 * @returns Result of the operation
 */
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry on the last attempt
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt)
        console.warn(`[WARN] Database operation failed, retrying in ${delay}ms`, {
          attempt: attempt + 1,
          maxRetries,
        })
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Database access patterns documentation
 * 
 * Read Patterns:
 * - Transactions by user and date range: Use idx_transactions_user_date index
 * - Categories by user: Use idx_categories_user_id index
 * - Budgets by user and month: Use idx_budgets_user_month index
 * - Spending aggregation by category: Join transactions with categories
 * 
 * Write Patterns:
 * - Bulk transaction insert: Use insert() with array of objects
 * - Category creation/update: Use upsert() for idempotent operations
 * - Budget creation/update: Use upsert() with unique constraint
 * - Categorization rule learning: Use upsert() with unique constraint
 * 
 * Connection Pooling:
 * - Supabase client handles connection pooling automatically
 * - No manual pool configuration needed
 * - Use getAuthenticatedClient() for user-scoped queries
 * - Use createAdminClient() sparingly for admin operations
 */
