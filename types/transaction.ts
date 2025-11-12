/**
 * Transaction type definition
 * Matches the transactions table schema in Supabase
 *
 * Note: amount_cents stores the amount in cents (integer) to avoid floating point issues
 */
export interface Transaction {
  id: string
  user_id: string
  date: string // ISO date string (YYYY-MM-DD)
  amount_cents: number // Amount in cents (e.g., 1000 = $10.00)
  merchant: string
  description: string | null
  category_id: string | null
  confidence: number | null // Categorization confidence score (0-100)
  transaction_type: 'expense' | 'income' | 'transfer' // Classification: expense (spending), income (revenue), or transfer (excluded from spending)
  is_duplicate: boolean
  created_at: string
  updated_at: string
}

export interface TransactionInsert {
  user_id: string
  date: string
  amount_cents: number
  merchant: string
  description?: string | null
  category_id?: string | null
  confidence?: number | null
  transaction_type?: 'expense' | 'income' | 'transfer' // Defaults to 'expense' if not provided
  is_duplicate?: boolean
}

export interface TransactionUpdate {
  date?: string
  amount_cents?: number
  merchant?: string
  description?: string | null
  category_id?: string | null
  confidence?: number | null
  transaction_type?: 'expense' | 'income' | 'transfer'
  is_duplicate?: boolean
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
