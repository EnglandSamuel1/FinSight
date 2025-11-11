/**
 * Extract merchant name from transaction description
 * 
 * Handles common patterns:
 * - Merchant name at start: "STARBUCKS STORE #1234"
 * - Merchant name at end: "Purchase at AMAZON.COM"
 * - Merchant name in middle: "POS DEBIT AMAZON.COM 123456"
 * - Full description if no pattern matches
 * 
 * @param description - Full transaction description
 * @returns Extracted merchant name (cleaned)
 */
export function extractMerchant(description: string | null | undefined): string {
  if (!description || typeof description !== 'string') {
    return 'Unknown'
  }

  const trimmed = description.trim()

  if (!trimmed) {
    return 'Unknown'
  }

  // Common patterns to extract merchant name
  const patterns = [
    // Pattern: "MERCHANT NAME" or "MERCHANT NAME #123"
    /^([A-Z0-9\s&]+?)(?:\s+#\d+|\s+\d{4,}|\s+POS|\s+DEBIT|\s+CREDIT|$)/i,
    // Pattern: "Purchase at MERCHANT" or "Transaction at MERCHANT"
    /(?:Purchase|Transaction|Payment)\s+at\s+([A-Z0-9\s&.]+)/i,
    // Pattern: "POS DEBIT MERCHANT NAME"
    /POS\s+(?:DEBIT|CREDIT)\s+([A-Z0-9\s&.]+)/i,
    // Pattern: "MERCHANT.COM" or "MERCHANT.COM 123456"
    /([A-Z0-9\s&.]+\.(?:COM|NET|ORG|IO))\s*/i,
    // Pattern: "MERCHANT NAME" followed by location or reference number
    /^([A-Z][A-Z0-9\s&]+?)(?:\s+\d{4,}|\s+[A-Z]{2}\s+\d{5}|\s*$)/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match && match[1]) {
      return cleanMerchantName(match[1])
    }
  }

  // If no pattern matches, try to extract first meaningful word/phrase
  // Remove common prefixes
  let cleaned = trimmed
    .replace(/^(POS\s+)?(DEBIT|CREDIT|PURCHASE|TRANSACTION|PAYMENT)\s+/i, '')
    .replace(/\s+(POS|DEBIT|CREDIT|PURCHASE|TRANSACTION|PAYMENT)$/i, '')
    .trim()

  // If still long, take first part (before common separators)
  const separators = ['  ', ' - ', ' #', ' REF', ' ID']
  for (const sep of separators) {
    const index = cleaned.indexOf(sep)
    if (index > 0) {
      cleaned = cleaned.substring(0, index)
    }
  }

  return cleanMerchantName(cleaned || trimmed)
}

/**
 * Clean merchant name (remove extra whitespace, normalize case)
 * 
 * @param merchantName - Raw merchant name
 * @returns Cleaned merchant name
 */
function cleanMerchantName(merchantName: string): string {
  return merchantName
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/^\s+|\s+$/g, '') // Remove leading/trailing spaces
    .substring(0, 255) // Limit length (database constraint)
}
