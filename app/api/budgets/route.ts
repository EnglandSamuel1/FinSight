import { createRouteHandler } from '@/lib/api/route-handler'
import { validateBody, validateQuery } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { ValidationError, NotFoundError } from '@/lib/api/errors'
import { createServerClient } from '@/lib/supabase/server'
import { handleDatabaseError } from '@/lib/supabase/utils'
import { z } from 'zod'
import type { Budget, BudgetWithCategory, CreateBudgetInput } from '@/types/budget'
import { monthToDate, getCurrentMonth } from '@/types/budget'

/**
 * Create budget request schema
 */
const createBudgetSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID format'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  amountCents: z.number().int().positive('Amount must be a positive integer'),
})

/**
 * Query params schema for GET
 */
const getBudgetsQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
})

/**
 * GET /api/budgets
 * List all budgets for the authenticated user
 * 
 * Query params: ?month=YYYY-MM (optional, defaults to current month)
 * Response: BudgetWithCategory[]
 * Errors: 401 (unauthorized)
 */
export const GET = createRouteHandler(async (request, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const supabase = await createServerClient()
  const userId = context.userId

  // Parse and validate query params
  let monthFilter: string | undefined
  try {
    const query = validateQuery(request, getBudgetsQuerySchema)
    monthFilter = query.month || getCurrentMonth()
  } catch (err) {
    if (err instanceof ValidationError) {
      return error(err.message, 400, 'VALIDATION_ERROR')
    }
    // Default to current month if no query param
    monthFilter = getCurrentMonth()
  }

  // Convert YYYY-MM to first day of month (YYYY-MM-01)
  const monthDate = monthToDate(monthFilter)

  // Query budgets with category information
  const { data, error: dbError } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (
        id,
        name,
        description
      )
    `)
    .eq('user_id', userId)
    .eq('month', monthDate)
    .order('created_at', { ascending: false })

  if (dbError) {
    const { message, code } = handleDatabaseError(dbError, 'list budgets')
    return error(message, 500, code)
  }

  // Transform database format to API format (include category information)
  const budgets: BudgetWithCategory[] = (data || [])
    .filter((budget: any) => budget.categories) // Filter out budgets with missing categories
    .map((budget: any) => ({
      id: budget.id,
      user_id: budget.user_id,
      category_id: budget.category_id,
      month: budget.month,
      amount_cents: budget.amount_cents,
      created_at: budget.created_at,
      updated_at: budget.updated_at,
      category: {
        id: budget.categories.id,
        name: budget.categories.name,
        description: budget.categories.description || undefined,
      },
    }))

  return success(budgets)
})

/**
 * POST /api/budgets
 * Create or update a monthly budget for a category (upsert)
 * 
 * Request: { categoryId: string, month: string (YYYY-MM), amountCents: number }
 * Response: Budget
 * Errors: 400 (validation error), 404 (category not found), 401 (unauthorized)
 */
export const POST = createRouteHandler(async (request, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const supabase = await createServerClient()
  const userId = context.userId

  // Validate request body
  const body = await validateBody(request, createBudgetSchema)

  // Verify category exists and belongs to user
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('id', body.categoryId)
    .eq('user_id', userId)
    .maybeSingle()

  if (categoryError) {
    const { message, code } = handleDatabaseError(categoryError, 'check category')
    return error(message, 500, code)
  }

  if (!category) {
    return error('Category not found', 404, 'NOT_FOUND')
  }

  // Convert YYYY-MM to first day of month (YYYY-MM-01)
  const monthDate = monthToDate(body.month)

  // Upsert budget (create if doesn't exist, update if exists)
  const { data, error: upsertError } = await supabase
    .from('budgets')
    .upsert(
      {
        user_id: userId,
        category_id: body.categoryId,
        month: monthDate,
        amount_cents: body.amountCents,
      },
      {
        onConflict: 'user_id,category_id,month',
      }
    )
    .select()
    .single()

  if (upsertError) {
    const { message, code } = handleDatabaseError(upsertError, 'create/update budget')
    return error(message, 500, code)
  }

  if (!data) {
    return error('Failed to create/update budget', 500, 'UPSERT_FAILED')
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

  return success(budget, 201)
})
