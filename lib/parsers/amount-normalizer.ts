/**
 * Parse and normalize an amount string to cents (integer)
 * 
 * Handles:
 * - Currency symbols ($, €, £, etc.)
 * - Commas and whitespace
 * - Negative amounts (debits) and positive amounts (credits)
 * - Parentheses for negative amounts (e.g., (50.00) = -50.00)
 * 
 * @param amountString - Amount string (e.g., "$1,234.56", "-50.00", "(100.00)")
 * @returns Object with amount_cents (integer) and transaction_type ('debit' | 'credit')
 * @throws Error if amount cannot be parsed
 */
export function normalizeAmount(amountString: string | number): {
  amount_cents: number
  transaction_type: 'debit' | 'credit'
} {
  let input: string

  // Handle number input
  if (typeof amountString === 'number') {
    input = amountString.toString()
  } else if (typeof amountString === 'string') {
    input = amountString.trim()
  } else {
    throw new Error('Amount must be a string or number')
  }

  if (!input) {
    throw new Error('Amount string cannot be empty')
  }

  // Check for parentheses (common format for negative amounts)
  const isNegative = input.startsWith('(') && input.endsWith(')')

  // Remove currency symbols, commas, whitespace, and parentheses
  let cleaned = input
    .replace(/[$€£¥₹,()\s]/g, '') // Remove currency symbols, commas, parentheses, whitespace
    .trim()

  // Handle negative sign
  if (cleaned.startsWith('-')) {
    cleaned = cleaned.substring(1)
  }

  // Parse to number
  const amount = parseFloat(cleaned)

  if (isNaN(amount)) {
    throw new Error(`Unable to parse amount: "${amountString}"`)
  }

  // Determine if negative (parentheses or negative sign)
  const isNegativeAmount = isNegative || (typeof amountString === 'string' && amountString.trim().startsWith('-'))

  // Convert to cents (multiply by 100 and round to avoid floating point issues)
  const amount_cents = Math.round(amount * 100)

  // Determine transaction type
  // Debits are negative (money going out), credits are positive (money coming in)
  const finalAmount = isNegativeAmount ? -amount_cents : amount_cents
  const transaction_type = finalAmount < 0 ? 'debit' : 'credit'

  // Return absolute value in cents (amount_cents is always positive)
  // The sign is captured in transaction_type
  return {
    amount_cents: Math.abs(finalAmount),
    transaction_type,
  }
}

/**
 * Validate that an amount string can be parsed
 * 
 * @param amountString - Amount string to validate
 * @returns true if amount can be parsed, false otherwise
 */
export function isValidAmount(amountString: string | number): boolean {
  try {
    normalizeAmount(amountString)
    return true
  } catch {
    return false
  }
}
