import type { Transaction, TransactionUpdate } from '@/types/transaction'

const CLIENT_API_BASE = '/api/transactions'

/**
 * Fetch transactions with optional filters (client-side)
 *
 * @param filters - Query filters (date range, category, transaction type, search, amount range, pagination)
 * @returns Array of transactions
 */
export async function getTransactionsClient(filters?: {
  startDate?: string
  endDate?: string
  categoryId?: string
  transactionType?: 'expense' | 'income' | 'transfer'
  search?: string
  minAmount?: number
  maxAmount?: number
  limit?: number
  offset?: number
}): Promise<Transaction[]> {
  const params = new URLSearchParams()
  if (filters?.startDate) params.set('startDate', filters.startDate)
  if (filters?.endDate) params.set('endDate', filters.endDate)
  if (filters?.categoryId) params.set('categoryId', filters.categoryId)
  if (filters?.transactionType) params.set('transactionType', filters.transactionType)
  if (filters?.search) params.set('search', filters.search)
  if (filters?.minAmount !== undefined) params.set('minAmount', filters.minAmount.toString())
  if (filters?.maxAmount !== undefined) params.set('maxAmount', filters.maxAmount.toString())
  if (filters?.limit) params.set('limit', filters.limit.toString())
  if (filters?.offset) params.set('offset', filters.offset.toString())

  const url = `${CLIENT_API_BASE}${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch transactions')
  }

  return response.json()
}

/**
 * Update a transaction (client-side)
 * 
 * @param transactionId - Transaction ID
 * @param updates - Fields to update
 * @returns Updated transaction
 */
export async function updateTransactionClient(
  transactionId: string,
  updates: TransactionUpdate
): Promise<Transaction> {
  const response = await fetch(`${CLIENT_API_BASE}/${transactionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Transaction not found')
    }
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to update transaction')
  }

  return response.json()
}

/**
 * Bulk update category and/or transaction type for multiple transactions (client-side)
 *
 * @param transactionIds - Array of transaction IDs to update
 * @param categoryId - Category ID to set (null to uncategorize)
 * @param transactionType - Optional transaction type to set
 * @returns Response with updated count and transactions
 */
export async function bulkUpdateTransactionCategoryClient(
  transactionIds: string[],
  categoryId: string | null,
  transactionType?: 'expense' | 'income' | 'transfer'
): Promise<{ updated: number; transactions: Transaction[] }> {
  const body: { transactionIds: string[]; category_id: string | null; transaction_type?: 'expense' | 'income' | 'transfer' } = {
    transactionIds,
    category_id: categoryId,
  }
  if (transactionType) {
    body.transaction_type = transactionType
  }

  const response = await fetch(`${CLIENT_API_BASE}/bulk-update-category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to bulk update transactions')
  }

  return response.json()
}
