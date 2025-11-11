/**
 * Category type definition
 * Matches the categories table schema in Supabase
 */
export interface Category {
  id: string
  userId: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Input type for creating a category (API request)
 */
export interface CreateCategoryInput {
  name: string
  description?: string
}

/**
 * Input type for updating a category (API request)
 */
export interface UpdateCategoryInput {
  name?: string
  description?: string
}

// Legacy types for database operations (snake_case)
export interface CategoryInsert {
  user_id: string
  name: string
  description?: string | null
}

export interface CategoryUpdate {
  name?: string
  description?: string | null
}
