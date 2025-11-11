import { createRouteHandler } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { ValidationError, NotFoundError } from '@/lib/api/errors'
import { createServerClient } from '@/lib/supabase/server'
import { handleDatabaseError } from '@/lib/supabase/utils'
import { z } from 'zod'
import type { Category, UpdateCategoryInput } from '@/types/category'

/**
 * Update category request schema
 */
const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name must be 100 characters or less').optional(),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
})

/**
 * GET /api/categories/[id]
 * Get a single category by ID
 * 
 * Response: Category
 * Errors: 404 (not found), 401 (unauthorized)
 */
export const GET = createRouteHandler(async (request, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const supabase = await createServerClient()
  const userId = context.userId

  // Extract category ID from URL pathname (format: /api/categories/{id})
  const pathname = request.nextUrl.pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const id = pathParts[pathParts.length - 1]

  if (!id || id === 'categories') {
    return error('Category ID is required', 400, 'MISSING_ID')
  }

  const { data, error: dbError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (dbError) {
    const { message, code } = handleDatabaseError(dbError, 'get category')
    return error(message, 500, code)
  }

  if (!data) {
    return error('Category not found', 404, 'NOT_FOUND')
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

  return success(category)
})

/**
 * PUT /api/categories/[id]
 * Update a category
 * 
 * Request: { name?: string, description?: string }
 * Response: Category
 * Errors: 400 (validation error), 404 (not found), 409 (duplicate name), 401 (unauthorized)
 */
export const PUT = createRouteHandler(async (request, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const supabase = await createServerClient()
  const userId = context.userId

  // Extract category ID from URL pathname (format: /api/categories/{id})
  const pathname = request.nextUrl.pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const id = pathParts[pathParts.length - 1]

  if (!id || id === 'categories') {
    return error('Category ID is required', 400, 'MISSING_ID')
  }

  // Validate request body
  const body = await validateBody(request, updateCategorySchema)

  // Check if category exists and belongs to user
  const { data: existingCategory, error: checkError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (checkError) {
    const { message, code } = handleDatabaseError(checkError, 'check category')
    return error(message, 500, code)
  }

  if (!existingCategory) {
    return error('Category not found', 404, 'NOT_FOUND')
  }

  // If name is being updated, check for duplicates
  if (body.name && body.name !== existingCategory.name) {
    const { data: duplicateCategory, error: duplicateError } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', body.name)
      .neq('id', id)
      .maybeSingle()

    if (duplicateError) {
      const { message, code } = handleDatabaseError(duplicateError, 'check duplicate category')
      return error(message, 500, code)
    }

    if (duplicateCategory) {
      return error('Category with this name already exists', 409, 'DUPLICATE_CATEGORY')
    }
  }

  // Prepare update data
  const updateData: { name?: string; description?: string | null } = {}
  if (body.name !== undefined) {
    updateData.name = body.name.trim()
  }
  if (body.description !== undefined) {
    updateData.description = body.description?.trim() || null
  }

  // Update the category
  const { data, error: updateError } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (updateError) {
    // Check for unique constraint violation
    if (updateError.code === '23505' || updateError.message.includes('unique')) {
      return error('Category with this name already exists', 409, 'DUPLICATE_CATEGORY')
    }

    const { message, code } = handleDatabaseError(updateError, 'update category')
    return error(message, 500, code)
  }

  if (!data) {
    return error('Failed to update category', 500, 'UPDATE_FAILED')
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

  return success(category)
})

/**
 * DELETE /api/categories/[id]
 * Delete a category
 * 
 * Response: { success: true }
 * Errors: 404 (not found), 401 (unauthorized)
 */
export const DELETE = createRouteHandler(async (request, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const supabase = await createServerClient()
  const userId = context.userId

  // Extract category ID from URL pathname (format: /api/categories/{id})
  const pathname = request.nextUrl.pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const id = pathParts[pathParts.length - 1]

  if (!id || id === 'categories') {
    return error('Category ID is required', 400, 'MISSING_ID')
  }

  // Check if category exists and belongs to user
  const { data: existingCategory, error: checkError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (checkError) {
    const { message, code } = handleDatabaseError(checkError, 'check category')
    return error(message, 500, code)
  }

  if (!existingCategory) {
    return error('Category not found', 404, 'NOT_FOUND')
  }

  // Check if category has associated transactions
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('id')
    .eq('category_id', id)
    .limit(1)

  if (transactionsError) {
    const { message, code } = handleDatabaseError(transactionsError, 'check transactions')
    return error(message, 500, code)
  }

  const hasTransactions = transactions && transactions.length > 0

  // Delete the category (transactions will have category_id set to null via foreign key constraint)
  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (deleteError) {
    const { message, code } = handleDatabaseError(deleteError, 'delete category')
    return error(message, 500, code)
  }

  return success({ success: true, hadTransactions: hasTransactions })
})
