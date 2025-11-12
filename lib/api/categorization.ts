/**
 * Categorization API client
 */

export interface LearnedPattern {
  id: string
  merchant_pattern: string
  category_id: string
  confidence: number
  created_at: string
  updated_at: string
}

export interface CategoryDistributionItem {
  categoryId: string
  categoryName: string
  count: number
}

export interface CategorizationStatistics {
  total: number
  categorized: number
  uncategorized: number
  averageConfidence: number
  categoryDistribution: CategoryDistributionItem[]
}

const API_BASE = '/api/categorization'

/**
 * Fetch user's learned categorization patterns
 *
 * @param filters - Optional filters (categoryId, merchantPattern)
 * @returns Array of learned patterns
 */
export async function getLearnedPatterns(filters?: {
  categoryId?: string
  merchantPattern?: string
}): Promise<LearnedPattern[]> {
  const params = new URLSearchParams()
  if (filters?.categoryId) params.set('categoryId', filters.categoryId)
  if (filters?.merchantPattern) params.set('merchantPattern', filters.merchantPattern)

  const url = `${API_BASE}/learned-patterns${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch learned patterns')
  }

  return response.json()
}

/**
 * Fetch categorization statistics for user's transactions
 *
 * @param filters - Optional filters (startDate, endDate)
 * @returns Categorization statistics
 */
export async function getCategorizationStatistics(filters?: {
  startDate?: string
  endDate?: string
}): Promise<CategorizationStatistics> {
  const params = new URLSearchParams()
  if (filters?.startDate) params.set('startDate', filters.startDate)
  if (filters?.endDate) params.set('endDate', filters.endDate)

  const url = `${API_BASE}/statistics${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch categorization statistics')
  }

  return response.json()
}
