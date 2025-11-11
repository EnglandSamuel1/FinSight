import type {
  Budget,
  BudgetStatus,
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetWithCategory,
} from '@/types/budget'

const API_BASE = '/api/budgets'

/**
 * Fetch all budgets for the authenticated user
 * @param month - Optional month filter in YYYY-MM format (defaults to current month)
 */
export async function getBudgets(month?: string): Promise<Budget[]> {
  const url = month ? `${API_BASE}?month=${month}` : API_BASE
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch budgets')
  }

  return response.json()
}

/**
 * Get budgets with category information
 */
export async function getBudgetsWithCategories(month?: string): Promise<BudgetWithCategory[]> {
  const budgets = await getBudgets(month)
  // Note: The API should return budgets with categories joined
  // This is a placeholder - actual implementation depends on API response
  return budgets as unknown as BudgetWithCategory[]
}

/**
 * Get budget status with spending calculations
 * @param month - Optional month filter in YYYY-MM format (defaults to current month)
 */
export async function getBudgetStatus(month?: string): Promise<BudgetStatus[]> {
  const url = month ? `/api/budgets/status?month=${month}` : '/api/budgets/status'
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch budget status')
  }

  return response.json()
}

/**
 * Get a single budget by ID
 */
export async function getBudget(id: string): Promise<Budget> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Budget not found')
    }
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch budget')
  }

  return response.json()
}

/**
 * Create or update a budget (upsert)
 */
export async function createOrUpdateBudget(input: CreateBudgetInput): Promise<Budget> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    if (response.status === 404) {
      throw new Error('Category not found')
    }
    if (response.status === 400) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Validation failed')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to create/update budget')
  }

  return response.json()
}

/**
 * Update a budget amount
 */
export async function updateBudget(id: string, input: UpdateBudgetInput): Promise<Budget> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Budget not found')
    }
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    if (response.status === 400) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Validation failed')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to update budget')
  }

  return response.json()
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Budget not found')
    }
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to delete budget')
  }

  return response.json()
}
