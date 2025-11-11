import { createRouteHandler } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { ValidationError, NotFoundError } from '@/lib/api/errors'
import { createServerClient } from '@/lib/supabase/server'
import { handleDatabaseError } from '@/lib/supabase/utils'
import { z } from 'zod'
import type { Budget, UpdateBudgetInput } from '@/types/budget'

/**
 * Update budget request schema
 */
const updateBudgetSchema = z.object({
  amountCents: z.number().int().positive('Amount must be a positive integer'),
})

/**
 * GET /api/budgets/[id]
 * Get a single budget by ID
 * 
 * Response: Budget
 * Errors: 404 (not found), 401 (unauthorized)
 */
export const GET = createRouteHandler(async (request, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const supabase = await createServerClient()
  const userId = context.userId

  // Extract budget ID from URL pathname (format: /api/budgets/{id})
  const pathname = request.nextUrl.pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const id = pathParts[pathParts.length - 1]

  if (!id || id === 'budgets') {
    return error('Budget ID is required', 400, 'MISSING_ID')
  }

  const { data, error: dbError } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (dbError) {
    const { message, code } = handleDatabaseError(dbError, 'get budget')
    return error(message, 500, code)
  }

  if (!data) {
    return error('Budget not found', 404, 'NOT_FOUND')
  }

  // Transform database format to API format
  const budget: Budget = {
    id: data.id,
    user_id: data.user_id,
    category_id: data.category_id,
    month: data.month,
    amount_cents: data.amount_cents,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }

  return success(budget)
})

/**
 * PUT /api/budgets/[id]
 * Update a budget amount
 * 
 * Request: { amountCents: number }
 * Response: Budget
 * Errors: 400 (validation error), 404 (not found), 401 (unauthorized)
 */
export const PUT = createRouteHandler(async (request, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const supabase = await createServerClient()
  const userId = context.userId

  // Extract budget ID from URL pathname
  const pathname = request.nextUrl.pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const id = pathParts[pathParts.length - 1]

  if (!id || id === 'budgets') {
    return error('Budget ID is required', 400, 'MISSING_ID')
  }

  // Validate request body
  const body = await validateBody(request, updateBudgetSchema)

  // Check if budget exists and belongs to user
  const { data: existingBudget, error: checkError } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (checkError) {
    const { message, code } = handleDatabaseError(checkError, 'check budget')
    return error(message, 500, code)
  }

  if (!existingBudget) {
    return error('Budget not found', 404, 'NOT_FOUND')
  }

  // Update the budget
  const { data, error: updateError } = await supabase
    .from('budgets')
    .update({
      amount_cents: body.amountCents,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (updateError) {
    const { message, code } = handleDatabaseError(updateError, 'update budget')
    return error(message, 500, code)
  }

  if (!data) {
    return error('Failed to update budget', 500, 'UPDATE_FAILED')
  }

  // Transform database format to API format
  const budget: Budget = {
    id: data.id,
    user_id: data.user_id,
    category_id: data.category_id,
    month: data.month,
    amount_cents: data.amount_cents,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }

  return success(budget)
})

/**
 * DELETE /api/budgets/[id]
 * Delete a budget
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

  // Extract budget ID from URL pathname
  const pathname = request.nextUrl.pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const id = pathParts[pathParts.length - 1]

  if (!id || id === 'budgets') {
    return error('Budget ID is required', 400, 'MISSING_ID')
  }

  // Check if budget exists and belongs to user
  const { data: existingBudget, error: checkError } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (checkError) {
    const { message, code } = handleDatabaseError(checkError, 'check budget')
    return error(message, 500, code)
  }

  if (!existingBudget) {
    return error('Budget not found', 404, 'NOT_FOUND')
  }

  // Delete the budget
  const { error: deleteError } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (deleteError) {
    const { message, code } = handleDatabaseError(deleteError, 'delete budget')
    return error(message, 500, code)
  }

  return success({ success: true })
})
