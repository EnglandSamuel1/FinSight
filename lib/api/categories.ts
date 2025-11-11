import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types/category'

const API_BASE = '/api/categories'

/**
 * Fetch all categories for the authenticated user
 */
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(API_BASE, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch categories')
  }

  return response.json()
}

/**
 * Get a single category by ID
 */
export async function getCategory(id: string): Promise<Category> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Category not found')
    }
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch category')
  }

  return response.json()
}

/**
 * Create a new category
 */
export async function createCategory(input: CreateCategoryInput): Promise<Category> {
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
    if (response.status === 409) {
      throw new Error('Category with this name already exists')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to create category')
  }

  return response.json()
}

/**
 * Update a category
 */
export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
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
      throw new Error('Category not found')
    }
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    if (response.status === 409) {
      throw new Error('Category with this name already exists')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to update category')
  }

  return response.json()
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; hadTransactions?: boolean }> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Category not found')
    }
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to delete category')
  }

  return response.json()
}

/**
 * Check if a category name is unique for the current user
 * (Client-side validation helper)
 */
export async function checkCategoryNameUnique(name: string, excludeId?: string): Promise<boolean> {
  try {
    const categories = await getCategories()
    const normalizedName = name.trim().toLowerCase()
    return !categories.some(
      (cat) => cat.name.toLowerCase() === normalizedName && cat.id !== excludeId
    )
  } catch {
    // If fetch fails, assume unique (server will validate)
    return true
  }
}
