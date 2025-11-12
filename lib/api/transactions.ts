import { createServerClient } from '@/lib/supabase/server'
import { handleDatabaseError } from '@/lib/supabase/utils'
import type { Transaction, TransactionInsert } from '@/types/transaction'
import { logger } from '@/lib/utils/logger'

/**
 * Create multiple transactions in batch
 * 
 * @param transactions - Array of transactions to insert (user_id will be set from session)
 * @param userId - Authenticated user ID
 * @returns Created transactions with IDs
 */
export async function createTransactions(
  transactions: Omit<TransactionInsert, 'user_id'>[],
  userId: string
): Promise<Transaction[]> {
  if (transactions.length === 0) {
    return []
  }

  const supabase = await createServerClient()

  // Add user_id to each transaction
  const transactionsWithUserId: TransactionInsert[] = transactions.map((tx) => ({
    ...tx,
    user_id: userId,
  }))

  // Batch insert transactions
  const { data, error: insertError } = await supabase
    .from('transactions')
    .insert(transactionsWithUserId)
    .select()

  if (insertError) {
    const { message, code } = handleDatabaseError(insertError, 'create transactions')
    logger.error('Failed to create transactions', {
      userId,
      transactionCount: transactions.length,
      error: message,
      code,
    })
    throw new Error(message)
  }

  if (!data || data.length === 0) {
    logger.warn('No transactions created', {
      userId,
      transactionCount: transactions.length,
    })
    return []
  }

  logger.info('Transactions created successfully', {
    userId,
    createdCount: data.length,
    requestedCount: transactions.length,
  })

  // Transform database format (snake_case) to API format (camelCase)
  const result: Transaction[] = data.map((tx) => ({
    id: tx.id,
    user_id: tx.user_id,
    date: tx.date,
    amount_cents: tx.amount_cents,
    merchant: tx.merchant,
    description: tx.description,
    category_id: tx.category_id,
    confidence: tx.confidence,
    transaction_type: tx.transaction_type,
    is_duplicate: tx.is_duplicate,
    created_at: tx.created_at,
    updated_at: tx.updated_at,
  }))

  return result
}

/**
 * Query transactions with filters
 * 
 * @param userId - Authenticated user ID
 * @param filters - Query filters (date range, category, search, amount range, pagination)
 * @returns Array of transactions
 */
export async function queryTransactions(
  userId: string,
  filters: {
    startDate?: string
    endDate?: string
    categoryId?: string
    transactionType?: 'expense' | 'income' | 'transfer'
    search?: string
    minAmount?: number
    maxAmount?: number
    limit?: number
    offset?: number
  } = {}
): Promise<Transaction[]> {
  const supabase = await createServerClient()

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)

  // Apply date range filter
  if (filters.startDate) {
    query = query.gte('date', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('date', filters.endDate)
  }

  // Apply category filter
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }

  // Apply transaction type filter
  if (filters.transactionType) {
    query = query.eq('transaction_type', filters.transactionType)
  }

  // Apply amount range filter
  if (filters.minAmount !== undefined) {
    query = query.gte('amount_cents', filters.minAmount)
  }
  if (filters.maxAmount !== undefined) {
    query = query.lte('amount_cents', filters.maxAmount)
  }

  // Apply search filter (case-insensitive search on merchant and description)
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim().replace(/%/g, '\\%').replace(/_/g, '\\_')
    // Use ilike for case-insensitive pattern matching
    // Search in merchant or description fields (OR condition)
    query = query.or(`merchant.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
  }

  // Apply pagination
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  // Order by date DESC (most recent first)
  query = query.order('date', { ascending: false })

  const { data, error: queryError } = await query

  if (queryError) {
    const { message, code } = handleDatabaseError(queryError, 'query transactions')
    logger.error('Failed to query transactions', {
      userId,
      filters,
      error: message,
      code,
    })
    throw new Error(message)
  }

  // Transform database format to API format
  const result: Transaction[] = (data || []).map((tx) => ({
    id: tx.id,
    user_id: tx.user_id,
    date: tx.date,
    amount_cents: tx.amount_cents,
    merchant: tx.merchant,
    description: tx.description,
    category_id: tx.category_id,
    confidence: tx.confidence,
    transaction_type: tx.transaction_type,
    is_duplicate: tx.is_duplicate,
    created_at: tx.created_at,
    updated_at: tx.updated_at,
  }))

  return result
}

/**
 * Get a single transaction by ID
 * 
 * @param transactionId - Transaction ID
 * @param userId - Authenticated user ID (for authorization check)
 * @returns Transaction or null if not found
 */
export async function getTransactionById(
  transactionId: string,
  userId: string
): Promise<Transaction | null> {
  const supabase = await createServerClient()

  const { data, error: queryError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .eq('user_id', userId)
    .maybeSingle()

  if (queryError) {
    const { message, code } = handleDatabaseError(queryError, 'get transaction')
    logger.error('Failed to get transaction', {
      transactionId,
      userId,
      error: message,
      code,
    })
    throw new Error(message)
  }

  if (!data) {
    return null
  }

  // Transform database format to API format
  return {
    id: data.id,
    user_id: data.user_id,
    date: data.date,
    amount_cents: data.amount_cents,
    merchant: data.merchant,
    description: data.description,
    category_id: data.category_id,
    confidence: data.confidence,
    transaction_type: data.transaction_type,
    is_duplicate: data.is_duplicate,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

/**
 * Update a transaction
 * 
 * @param transactionId - Transaction ID
 * @param userId - Authenticated user ID (for authorization check)
 * @param updates - Fields to update
 * @returns Updated transaction
 */
export async function updateTransaction(
  transactionId: string,
  userId: string,
  updates: {
    date?: string
    amount_cents?: number
    merchant?: string
    description?: string | null
    category_id?: string | null
    confidence?: number | null
    transaction_type?: 'expense' | 'income' | 'transfer'
    is_duplicate?: boolean
  }
): Promise<Transaction> {
  const supabase = await createServerClient()

  // First verify transaction belongs to user
  const existing = await getTransactionById(transactionId, userId)
  if (!existing) {
    throw new Error('Transaction not found')
  }

  // Validate category_id belongs to user's categories if provided (not null)
  if (updates.category_id !== undefined && updates.category_id !== null) {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', updates.category_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (categoryError) {
      const { message, code } = handleDatabaseError(categoryError, 'validate category')
      logger.error('Failed to validate category for transaction update', {
        transactionId,
        userId,
        categoryId: updates.category_id,
        error: message,
        code,
      })
      throw new Error(message)
    }

    if (!category) {
      logger.warn('Category does not belong to user', {
        transactionId,
        userId,
        categoryId: updates.category_id,
      })
      throw new Error('Category does not belong to the authenticated user')
    }
  }

  // Update transaction
  const { data, error: updateError } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId)
    .eq('user_id', userId)
    .select()
    .single()

  if (updateError) {
    const { message, code } = handleDatabaseError(updateError, 'update transaction')
    logger.error('Failed to update transaction', {
      transactionId,
      userId,
      error: message,
      code,
    })
    throw new Error(message)
  }

  if (!data) {
    throw new Error('Failed to update transaction')
  }

  // Transform database format to API format
  return {
    id: data.id,
    user_id: data.user_id,
    date: data.date,
    amount_cents: data.amount_cents,
    merchant: data.merchant,
    description: data.description,
    category_id: data.category_id,
    confidence: data.confidence,
    transaction_type: data.transaction_type,
    is_duplicate: data.is_duplicate,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

/**
 * Delete a transaction (soft delete - sets is_duplicate flag or preserves data)
 * Note: Per architecture, transaction history should be preserved.
 * This function performs a hard delete, but consider implementing soft delete
 * if transaction history preservation is required.
 * 
 * @param transactionId - Transaction ID
 * @param userId - Authenticated user ID (for authorization check)
 */
export async function deleteTransaction(
  transactionId: string,
  userId: string
): Promise<void> {
  const supabase = await createServerClient()

  // First verify transaction belongs to user
  const existing = await getTransactionById(transactionId, userId)
  if (!existing) {
    throw new Error('Transaction not found')
  }

  // Delete transaction
  // Note: Per story AC #4, transaction history should be preserved.
  // Consider implementing soft delete instead of hard delete.
  const { error: deleteError } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', userId)

  if (deleteError) {
    const { message, code } = handleDatabaseError(deleteError, 'delete transaction')
    logger.error('Failed to delete transaction', {
      transactionId,
      userId,
      error: message,
      code,
    })
    throw new Error(message)
  }

  logger.info('Transaction deleted', {
    transactionId,
    userId,
  })
}

/**
 * Bulk update category and/or transaction type for multiple transactions
 *
 * @param transactionIds - Array of transaction IDs to update
 * @param categoryId - Category ID to set (null to uncategorize)
 * @param userId - Authenticated user ID (for authorization check)
 * @param transactionType - Optional transaction type to set
 * @returns Updated transactions
 */
export async function bulkUpdateTransactionCategory(
  transactionIds: string[],
  categoryId: string | null,
  userId: string,
  transactionType?: 'expense' | 'income' | 'transfer'
): Promise<Transaction[]> {
  if (transactionIds.length === 0) {
    return []
  }

  const supabase = await createServerClient()

  // Validate all transaction IDs belong to user
  const { data: userTransactions, error: checkError } = await supabase
    .from('transactions')
    .select('id')
    .eq('user_id', userId)
    .in('id', transactionIds)

  if (checkError) {
    const { message, code } = handleDatabaseError(checkError, 'validate transactions')
    logger.error('Failed to validate transactions for bulk update', {
      userId,
      transactionCount: transactionIds.length,
      error: message,
      code,
    })
    throw new Error(message)
  }

  if (!userTransactions || userTransactions.length !== transactionIds.length) {
    logger.warn('Some transaction IDs do not belong to user', {
      userId,
      requestedCount: transactionIds.length,
      foundCount: userTransactions?.length || 0,
    })
    throw new Error('One or more transaction IDs do not belong to the authenticated user')
  }

  // Validate category_id belongs to user's categories if provided (not null)
  if (categoryId !== null) {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('user_id', userId)
      .maybeSingle()

    if (categoryError) {
      const { message, code } = handleDatabaseError(categoryError, 'validate category')
      logger.error('Failed to validate category for bulk update', {
        userId,
        categoryId,
        error: message,
        code,
      })
      throw new Error(message)
    }

    if (!category) {
      logger.warn('Category does not belong to user', {
        userId,
        categoryId,
      })
      throw new Error('Category does not belong to the authenticated user')
    }
  }

  // Build update object with category_id and optionally transaction_type
  const updateData: { category_id: string | null; transaction_type?: 'expense' | 'income' | 'transfer' } = {
    category_id: categoryId,
  }
  if (transactionType) {
    updateData.transaction_type = transactionType
  }

  // Update all specified transactions with new category_id and/or transaction_type in single database operation
  const { data: updatedTransactions, error: updateError } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('user_id', userId)
    .in('id', transactionIds)
    .select()

  if (updateError) {
    const { message, code } = handleDatabaseError(updateError, 'bulk update transactions')
    logger.error('Failed to bulk update transactions', {
      userId,
      transactionCount: transactionIds.length,
      error: message,
      code,
    })
    throw new Error(message)
  }

  if (!updatedTransactions) {
    logger.warn('No transactions were updated', {
      userId,
      transactionCount: transactionIds.length,
    })
    throw new Error('Failed to update transactions')
  }

  // Transform database format to API format
  const result: Transaction[] = updatedTransactions.map((tx) => ({
    id: tx.id,
    user_id: tx.user_id,
    date: tx.date,
    amount_cents: tx.amount_cents,
    merchant: tx.merchant,
    description: tx.description,
    category_id: tx.category_id,
    confidence: tx.confidence,
    transaction_type: tx.transaction_type,
    is_duplicate: tx.is_duplicate,
    created_at: tx.created_at,
    updated_at: tx.updated_at,
  }))

  logger.info('Bulk category update successful', {
    userId,
    updatedCount: result.length,
  })

  return result
}
