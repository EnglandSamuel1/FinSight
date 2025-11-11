/**
 * Bank format configurations for CSV parsing
 * Maps column names from different banks to standard schema
 */

export interface BankFormatConfig {
  name: string
  displayName: string
  // Column name mappings (case-insensitive matching)
  columnMappings: {
    date: string[] // Possible column names for date
    amount: string[] // Possible column names for amount
    description: string[] // Possible column names for description/merchant
    type?: string[] // Optional: transaction type column
  }
  // Additional detection patterns
  detectionPatterns?: {
    headerRow?: string[] // Keywords that appear in header row
    fileName?: string[] // Keywords in filename
  }
}

/**
 * Bank format configurations
 */
export const BANK_FORMATS: BankFormatConfig[] = [
  {
    name: 'chase',
    displayName: 'Chase',
    columnMappings: {
      date: ['Transaction Date', 'Date', 'Posting Date'],
      amount: ['Amount', 'Transaction Amount'],
      description: ['Description', 'Transaction Description', 'Details'],
      type: ['Type', 'Transaction Type'],
    },
    detectionPatterns: {
      headerRow: ['Transaction Date', 'Description', 'Amount'],
      fileName: ['chase', 'CHASE'],
    },
  },
  {
    name: 'bofa',
    displayName: 'Bank of America',
    columnMappings: {
      date: ['Date', 'Posted Date', 'Transaction Date'],
      amount: ['Amount', 'Transaction Amount'],
      description: ['Description', 'Payee', 'Merchant'],
      type: ['Type', 'Transaction Type'],
    },
    detectionPatterns: {
      headerRow: ['Date', 'Description', 'Amount'],
      fileName: ['bofa', 'bankofamerica', 'boa'],
    },
  },
  {
    name: 'wells-fargo',
    displayName: 'Wells Fargo',
    columnMappings: {
      date: ['Date', 'Post Date', 'Transaction Date'],
      amount: ['Amount', 'Transaction Amount'],
      description: ['Description', 'Merchant', 'Payee'],
      type: ['Type', 'Transaction Type'],
    },
    detectionPatterns: {
      headerRow: ['Date', 'Description', 'Amount'],
      fileName: ['wells', 'wellsfargo'],
    },
  },
  {
    name: 'generic',
    displayName: 'Generic CSV',
    columnMappings: {
      date: ['Date', 'Transaction Date', 'Post Date', 'Posted Date', 'Posting Date'],
      amount: ['Amount', 'Transaction Amount', 'Value', 'Total'],
      description: ['Description', 'Merchant', 'Payee', 'Vendor', 'Store', 'Details', 'Memo'],
      type: ['Type', 'Transaction Type', 'Category'],
    },
  },
]

/**
 * Detect bank format from CSV header row
 * 
 * @param headers - Array of column headers from CSV
 * @returns Detected bank format name or 'generic' if no match
 */
export function detectBankFormat(headers: string[]): string {
  if (!headers || headers.length === 0) {
    return 'generic'
  }

  // Normalize headers (lowercase, trim)
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim())

  // Score each format based on header matches
  const scores: Record<string, number> = {}

  for (const format of BANK_FORMATS) {
    let score = 0

    // Check column mappings
    for (const possibleNames of Object.values(format.columnMappings)) {
      for (const name of possibleNames) {
        if (normalizedHeaders.includes(name.toLowerCase())) {
          score += 2 // Strong match
        }
      }
    }

    // Check detection patterns
    if (format.detectionPatterns?.headerRow) {
      for (const pattern of format.detectionPatterns.headerRow) {
        if (normalizedHeaders.some((h) => h.includes(pattern.toLowerCase()))) {
          score += 3 // Very strong match
        }
      }
    }

    scores[format.name] = score
  }

  // Find format with highest score
  const bestMatch = Object.entries(scores).reduce((best, [name, score]) => {
    return score > best.score ? { name, score } : best
  }, { name: 'generic', score: 0 })

  return bestMatch.name
}

/**
 * Get bank format configuration by name
 * 
 * @param formatName - Format name (e.g., 'chase', 'bofa')
 * @returns Bank format configuration or generic if not found
 */
export function getBankFormat(formatName: string): BankFormatConfig {
  return BANK_FORMATS.find((f) => f.name === formatName) || BANK_FORMATS[BANK_FORMATS.length - 1] // Return generic
}

/**
 * Find column index by field name using bank format
 * 
 * @param headers - Array of column headers
 * @param format - Bank format configuration
 * @param field - Field name ('date', 'amount', 'description', 'type')
 * @returns Column index or -1 if not found
 */
export function findColumnIndex(
  headers: string[],
  format: BankFormatConfig,
  field: 'date' | 'amount' | 'description' | 'type'
): number {
  const possibleNames = format.columnMappings[field] || []
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim())

  for (const name of possibleNames) {
    const index = normalizedHeaders.indexOf(name.toLowerCase())
    if (index !== -1) {
      return index
    }
  }

  return -1
}
