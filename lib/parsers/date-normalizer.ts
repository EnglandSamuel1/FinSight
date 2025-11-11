import { parse, format, isValid, parseISO } from 'date-fns'

/**
 * Common date formats used by banks
 */
const DATE_FORMATS = [
  'MM/dd/yyyy', // 01/15/2024 (Chase, Bank of America)
  'yyyy-MM-dd', // 2024-01-15 (ISO format)
  'MM-dd-yyyy', // 01-15-2024
  'dd/MM/yyyy', // 15/01/2024 (European)
  'dd-MM-yyyy', // 15-01-2024
  'M/d/yyyy', // 1/15/2024 (no leading zeros)
  'MM/dd/yy', // 01/15/24 (2-digit year)
  'M/d/yy', // 1/15/24
] as const

/**
 * Parse and normalize a date string to ISO 8601 format (YYYY-MM-DD)
 * 
 * @param dateString - Date string in various formats
 * @returns Normalized date string (YYYY-MM-DD) or null if parsing fails
 * @throws Error if date cannot be parsed
 */
export function normalizeDate(dateString: string): string {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('Date string is required')
  }

  const trimmed = dateString.trim()

  if (!trimmed) {
    throw new Error('Date string cannot be empty')
  }

  // Try ISO format first (most common in modern systems)
  try {
    const isoDate = parseISO(trimmed)
    if (isValid(isoDate)) {
      return format(isoDate, 'yyyy-MM-dd')
    }
  } catch {
    // Continue to try other formats
  }

  // Try each date format
  for (const dateFormat of DATE_FORMATS) {
    try {
      const parsed = parse(trimmed, dateFormat, new Date())
      if (isValid(parsed)) {
        // Handle 2-digit years (assume 2000s)
        if (dateFormat.includes('yy') && !dateFormat.includes('yyyy')) {
          const year = parsed.getFullYear()
          if (year < 2000) {
            parsed.setFullYear(year + 100)
          }
        }
        return format(parsed, 'yyyy-MM-dd')
      }
    } catch {
      // Continue to next format
    }
  }

  // If all formats fail, throw error
  throw new Error(`Unable to parse date: "${trimmed}". Expected formats: MM/DD/YYYY, YYYY-MM-DD, etc.`)
}

/**
 * Validate that a date string is in a valid format
 * 
 * @param dateString - Date string to validate
 * @returns true if date can be parsed, false otherwise
 */
export function isValidDate(dateString: string): boolean {
  try {
    normalizeDate(dateString)
    return true
  } catch {
    return false
  }
}
