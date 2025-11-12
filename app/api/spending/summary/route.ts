import { createRouteHandler } from '@/lib/api/route-handler'
import { validateQuery } from '@/lib/api/validation'
import { success, error } from '@/lib/api/response'
import { ValidationError } from '@/lib/api/errors'
import { createServerClient } from '@/lib/supabase/server'
import { handleDatabaseError } from '@/lib/supabase/utils'
import { z } from 'zod'
import { getCurrentMonth } from '@/types/budget'

/**
 * Helper functions for date calculations
 */
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
const getSpendingSummaryQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
})

/**
 * Response type for spending summary
 */
export interface SpendingSummaryResponse {
  totalSpending: number // Total spending in cents
  totalIncome: number // Total income in cents
  netAmount: number // Income - Spending in cents
  categories: Array<{
    categoryId: string | null // null for uncategorized
    categoryName: string // "Uncategorized" if categoryId is null
    amount: number // Spending amount in cents
  }>
  month: string // YYYY-MM format
}

/**
 * GET /api/spending/summary
 * Get spending summary by category for a given month
 *
 * Query params: ?month=YYYY-MM (optional, defaults to current month)
 * Response: SpendingSummaryResponse
 * Errors: 401 (unauthorized), 400 (validation error)
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
    const query = validateQuery(request, getSpendingSummaryQuerySchema)
    monthFilter = query.month || getCurrentMonth()
  } catch (err) {
    if (err instanceof ValidationError) {
      return error(err.message, 400, 'VALIDATION_ERROR')
    }
    // Default to current month if no query param
    monthFilter = getCurrentMonth()
  }

  // Calculate month start and end dates
  const { start: monthStart, end: monthEnd } = getMonthStartEnd(monthFilter)

  // Query all transactions for the month
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('amount_cents, category_id, transaction_type')
    .eq('user_id', userId)
    .gte('date', monthStart)
    .lte('date', monthEnd)

  if (transactionsError) {
    const { message, code } = handleDatabaseError(transactionsError, 'get transactions')
    return error(message, 500, code)
  }

  if (!transactions || transactions.length === 0) {
    // No transactions for this month - return empty summary
    return success<SpendingSummaryResponse>({
      totalSpending: 0,
      totalIncome: 0,
      netAmount: 0,
      categories: [],
      month: monthFilter,
    })
  }

  // Group transactions by category and calculate spending and income
  // Exclude transfers from all calculations
  const categorySpendingMap = new Map<string | null, number>()
  let totalIncome = 0

  for (const txn of transactions) {
    const transactionType = txn.transaction_type || 'expense' // Default to expense for backward compatibility

    // Skip transfers entirely (they don't count as spending or income)
    if (transactionType === 'transfer') {
      continue
    }

    if (transactionType === 'income') {
      // Income transactions: add to total income (use absolute value)
      totalIncome += Math.abs(txn.amount_cents)
    } else {
      // Expense transactions (or uncategorized): add to category spending
      const categoryId = txn.category_id || null
      const currentSpending = categorySpendingMap.get(categoryId) || 0
      categorySpendingMap.set(categoryId, currentSpending + Math.abs(txn.amount_cents))
    }
  }

  // Calculate total spending (sum of all category spending)
  const totalSpending = Array.from(categorySpendingMap.values()).reduce((sum, amount) => sum + amount, 0)

  // Fetch category names for all category IDs
  const categoryIds = Array.from(categorySpendingMap.keys()).filter((id) => id !== null) as string[]

  let categoryNamesMap = new Map<string, string>()
  if (categoryIds.length > 0) {
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds)

    if (categoriesError) {
      const { message, code } = handleDatabaseError(categoriesError, 'get categories')
      return error(message, 500, code)
    }

    if (categories) {
      categoryNamesMap = new Map(categories.map((cat) => [cat.id, cat.name]))
    }
  }

  // Build response with category names
  const categoriesArray = Array.from(categorySpendingMap.entries()).map(([categoryId, amount]) => ({
    categoryId,
    categoryName: categoryId ? (categoryNamesMap.get(categoryId) || 'Unknown') : 'Uncategorized',
    amount,
  }))

  // Sort categories by spending amount (highest first)
  categoriesArray.sort((a, b) => b.amount - a.amount)

  // Calculate net amount (leftover = income - spending)
  const netAmount = totalIncome - totalSpending

  return success<SpendingSummaryResponse>({
    totalSpending,
    totalIncome,
    netAmount,
    categories: categoriesArray,
    month: monthFilter,
  })
})
