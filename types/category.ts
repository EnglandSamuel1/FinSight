/**
 * Category type definition
 * Matches the categories table schema in Supabase
 */
export interface Category {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface CategoryInsert {
  user_id: string
  name: string
  description?: string | null
}

export interface CategoryUpdate {
  name?: string
  description?: string | null
}
