/**
 * Parser types and interfaces for CSV parsing
 */

/**
 * Parsed transaction from CSV
 * Matches the transaction schema but without user_id (added during storage)
 */
export interface ParsedTransaction {
  date: string // ISO date string (YYYY-MM-DD)
  amount_cents: number // Amount in cents (e.g., 1000 = $10.00)
  merchant: string
  description: string | null
  transaction_type?: 'debit' | 'credit' // Optional, can be inferred from amount sign
}

/**
 * Parsing error with context
 */
export interface ParseError {
  row: number // Row number (1-indexed, includes header)
  column?: string // Column name where error occurred
  message: string // Human-readable error message
  originalRow?: Record<string, string> // Original row data for debugging
}

/**
 * Result of CSV parsing operation
 */
export interface ParseResult {
  transactions: ParsedTransaction[] // Successfully parsed transactions
  errors: ParseError[] // Parsing errors
  totalRows: number // Total rows processed (including header)
  successCount: number // Number of successfully parsed transactions
  errorCount: number // Number of rows with errors
  detectedFormat?: string // Detected bank format (e.g., 'chase', 'bofa', 'wells-fargo', 'generic')
}
