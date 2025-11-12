/**
 * Spending summary data from API
 */
export interface SpendingSummary {
  totalSpending: number // Total spending in cents
  totalIncome: number // Total income in cents
  netAmount: number // Income - Spending in cents (leftover)
  categories: Array<{
    categoryId: string | null // null for uncategorized
    categoryName: string // "Uncategorized" if categoryId is null
    amount: number // Spending amount in cents
  }>
  month: string // YYYY-MM format
}

const API_BASE = '/api/spending'

/**
 * Fetch spending summary by category for a given month
 * @param month - Optional month filter in YYYY-MM format (defaults to current month)
 * @returns Spending summary with total and category breakdown
 * @throws Error if request fails or user is unauthorized
 */
export async function getSpendingSummary(month?: string): Promise<SpendingSummary> {
  const url = month ? `${API_BASE}/summary?month=${month}` : `${API_BASE}/summary`
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    if (response.status === 400) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Invalid request parameters')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch spending summary')
  }

  return response.json()
}
