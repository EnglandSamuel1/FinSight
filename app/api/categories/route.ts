import { createRouteHandler } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { ValidationError, NotFoundError } from '@/lib/api/errors'
import { createServerClient } from '@/lib/supabase/server'
import { handleDatabaseError } from '@/lib/supabase/utils'
import { z } from 'zod'
import type { Category, CreateCategoryInput } from '@/types/category'

/**
 * Create category request schema
 */
const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
})

/**
 * GET /api/categories
 * List all categories for the authenticated user
 * 
 * Response: Category[]
 * Errors: 401 (unauthorized)
 */
export const GET = createRouteHandler(async (request, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const supabase = await createServerClient()
  const userId = context.userId

  const { data, error: dbError } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (dbError) {
    const { message, code } = handleDatabaseError(dbError, 'list categories')
    return error(message, 500, code)
  }

  // Transform database format (snake_case) to API format (camelCase)
  const categories: Category[] = (data || []).map((cat) => ({
    id: cat.id,
    userId: cat.user_id,
    name: cat.name,
    description: cat.description,
    createdAt: cat.created_at,
    updatedAt: cat.updated_at,
  }))

  return success(categories)
})

/**
 * POST /api/categories
 * Create a new category
 * 
 * Request: { name: string, description?: string }
 * Response: Category
 * Errors: 400 (validation error), 409 (duplicate name), 401 (unauthorized)
 */
export const POST = createRouteHandler(async (request, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const supabase = await createServerClient()
  const userId = context.userId

  // Validate request body
  const { name, description } = await validateBody(request, createCategorySchema)

  // Check if category with same name already exists for this user
  const { data: existingCategory, error: checkError } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .maybeSingle()

  if (checkError) {
    const { message, code } = handleDatabaseError(checkError, 'check duplicate category')
    return error(message, 500, code)
  }

  if (existingCategory) {
    return error('Category with this name already exists', 409, 'DUPLICATE_CATEGORY')
  }

  // Create the category
  const { data, error: insertError } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name: name.trim(),
      description: description?.trim() || null,
    })
    .select()
    .single()

  if (insertError) {
    // Check for unique constraint violation
    if (insertError.code === '23505' || insertError.message.includes('unique')) {
      return error('Category with this name already exists', 409, 'DUPLICATE_CATEGORY')
    }

    const { message, code } = handleDatabaseError(insertError, 'create category')
    return error(message, 500, code)
  }

  if (!data) {
    return error('Failed to create category', 500, 'CREATE_FAILED')
  }

  // Transform database format to API format
  const category: Category = {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }

  return success(category, 201)
})
