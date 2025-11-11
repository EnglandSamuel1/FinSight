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
