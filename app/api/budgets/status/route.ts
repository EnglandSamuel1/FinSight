import { createRouteHandler } from '@/lib/api/route-handler'
import { validateQuery } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { ValidationError } from '@/lib/api/errors'
import { createServerClient } from '@/lib/supabase/server'
import { handleDatabaseError } from '@/lib/supabase/utils'
import { z } from 'zod'
import type { BudgetStatus } from '@/types/budget'
import { monthToDate, getCurrentMonth } from '@/types/budget'
// Helper functions for date calculations
function getMonthStartEnd(month: string): { start: string; end: string } {
  // month is in YYYY-MM format, convert to YYYY-MM-01
  const start = `${month}-01`
  
  // Calculate end of month
  const [year, monthNum] = month.split('-').map(Number)
  const lastDay = new Date(year, monthNum, 0).getDate()
  const end = `${month}-${String(lastDay).padStart(2, '0')}`
  
  return { start, end }
}

/**
 * Query params schema for GET
 */
const getBudgetStatusQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
})

/**
 * GET /api/budgets/status
 * Get budgets with calculated remaining budget and spending
 * 
 * Query params: ?month=YYYY-MM (optional, defaults to current month)
 * Response: BudgetStatus[]
 * Errors: 401 (unauthorized)
 */
export const GET = createRouteHandler(async (request, context) => {
  if (!context.userId) {
    return error('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const supabase = await createServerClient()
  const userId = context.userId

  // Parse and validate query params
  let monthFilter: string
  try {
    const query = validateQuery(request, getBudgetStatusQuerySchema)
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
  const { start: monthStart, end: monthEnd } = getMonthStartEnd(monthFilter)

  // Get all budgets for the month
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', monthDate)
    .order('created_at', { ascending: false })

  if (budgetsError) {
    const { message, code } = handleDatabaseError(budgetsError, 'list budgets')
    return error(message, 500, code)
  }

  if (!budgets || budgets.length === 0) {
    return success([])
  }

  // Calculate spending for each budget
  const budgetStatuses: BudgetStatus[] = await Promise.all(
    budgets.map(async (budget) => {
      // Query transactions for this category in this month
      // Only include expense transactions (exclude transfers and income from budget spending)
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount_cents, transaction_type')
        .eq('user_id', userId)
        .eq('category_id', budget.category_id)
        .gte('date', monthStart)
        .lte('date', monthEnd)

      if (transactionsError) {
        const { message, code } = handleDatabaseError(transactionsError, 'get transactions')
        console.error(`[ERROR] Failed to get transactions for budget ${budget.id}:`, message)
        // Continue with zero spending if query fails
      }

      // Calculate total spending (sum of amount_cents for expense transactions only)
      // Exclude transfers and income from budget spending calculations
      const spentCents =
        transactions?.reduce((sum, txn) => {
          const transactionType = txn.transaction_type || 'expense' // Default to expense for backward compatibility

          // Only count expense transactions towards budget spending
          // Skip transfers and income
          if (transactionType === 'expense') {
            return sum + Math.abs(txn.amount_cents)
          }
          return sum
        }, 0) || 0

      // Calculate remaining budget
      const remainingCents = budget.amount_cents - spentCents

      // Calculate percentage used (cap at 100% minimum, can exceed 100% if over budget)
      const percentageUsed = budget.amount_cents > 0
        ? Math.max(0, (spentCents / budget.amount_cents) * 100)
        : 0

      return {
        id: budget.id,
        user_id: budget.user_id,
        category_id: budget.category_id,
        month: budget.month,
        amount_cents: budget.amount_cents,
        created_at: budget.created_at,
        updated_at: budget.updated_at,
        remainingCents,
        spentCents,
        percentageUsed,
      }
    })
  )

  return success(budgetStatuses)
})
