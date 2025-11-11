/**
 * Budget type definition
 * Matches the budgets table schema in Supabase
 * 
 * Note: month stores the first day of the month (YYYY-MM-01)
 * amount_cents stores the budget amount in cents to avoid floating point issues
 */
export interface Budget {
  id: string
  user_id: string
  category_id: string
  month: string // ISO date string for first day of month (YYYY-MM-01)
  amount_cents: number // Budget amount in cents (e.g., 50000 = $500.00)
  created_at: string
  updated_at: string
}

export interface BudgetInsert {
  user_id: string
  category_id: string
  month: string // First day of the month (YYYY-MM-01)
  amount_cents: number
}

export interface BudgetUpdate {
  category_id?: string
  month?: string
  amount_cents?: number
}

/**
 * Budget with category information
 */
export interface BudgetWithCategory extends Budget {
  category: {
    id: string
    name: string
    description?: string
  }
}

/**
 * Budget status with spending calculations
 */
export interface BudgetStatus extends Budget {
  remainingCents: number // budget - actual spending (can be negative)
  spentCents: number // actual spending for the month
  percentageUsed: number // (spending / budget) * 100, capped at 100% minimum
}

/**
 * Input for creating a budget
 */
export interface CreateBudgetInput {
  categoryId: string
  month: string // YYYY-MM format
  amountCents: number
}

/**
 * Input for updating a budget
 */
export interface UpdateBudgetInput {
  amountCents: number
}

/**
 * Helper function to convert dollars to cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

/**
 * Helper function to convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100
}

/**
 * Convert YYYY-MM format to first day of month (YYYY-MM-01)
 */
export function monthToDate(month: string): string {
  return `${month}-01`
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
