import { createServerClient } from '@/lib/supabase/server'
import type { TransactionInsert } from '@/types/transaction'
import { logger } from '@/lib/utils/logger'

/**
 * Normalize merchant name for duplicate comparison
 * - Convert to lowercase
 * - Remove extra whitespace
 * - Remove common prefixes/suffixes that might vary
 * 
 * @param merchant - Merchant name to normalize
 * @returns Normalized merchant name
 */
export function normalizeMerchant(merchant: string): string {
  return merchant
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/^the\s+/i, '') // Remove "the" prefix
    .replace(/\s+inc\.?$/i, '') // Remove "inc" suffix
    .replace(/\s+llc\.?$/i, '') // Remove "llc" suffix
    .replace(/\s+corp\.?$/i, '') // Remove "corp" suffix
    .trim()
}

/**
 * Create a hash key for duplicate detection
 * Uses date, amount_cents, and normalized merchant name
 * 
 * @param transaction - Transaction to create hash for
 * @returns Hash string for duplicate comparison
 */
export function createDuplicateHash(transaction: {
  date: string
  amount_cents: number
  merchant: string
}): string {
  const normalizedMerchant = normalizeMerchant(transaction.merchant)
  // Use ISO date format (YYYY-MM-DD) for consistent comparison
  const dateStr = transaction.date.split('T')[0] // Extract date part if ISO datetime
  return `${dateStr}|${transaction.amount_cents}|${normalizedMerchant}`
}

/**
 * Check for duplicate transactions in the database
 * Compares by date, amount_cents, and normalized merchant name
 * 
 * @param transactions - Array of transactions to check for duplicates
 * @param userId - Authenticated user ID
 * @returns Object with duplicate information: { duplicates: Transaction[], duplicateHashes: Set<string> }
 */
export async function findDuplicates(
  transactions: Omit<TransactionInsert, 'user_id'>[],
  userId: string
): Promise<{
  duplicates: Array<{
    transaction: Omit<TransactionInsert, 'user_id'>
    existingTransactionId: string
    duplicateHash: string
  }>
  duplicateHashes: Set<string>
}> {
  if (transactions.length === 0) {
    return { duplicates: [], duplicateHashes: new Set() }
  }

  const supabase = await createServerClient()

  // Create hash set for incoming transactions
  const incomingHashes = new Map<string, Omit<TransactionInsert, 'user_id'>>()
  for (const tx of transactions) {
    const hash = createDuplicateHash(tx)
    incomingHashes.set(hash, tx)
  }

  // Query existing transactions for this user
  // We need to check transactions that match any of the incoming transaction dates
  const dates = [...new Set(transactions.map((tx) => tx.date.split('T')[0]))]
  
  // Build query to find potential duplicates
  // We'll query by date range and then filter in memory for exact matches
  const minDate = dates.reduce((min, date) => (date < min ? date : min), dates[0])
  const maxDate = dates.reduce((max, date) => (date > max ? date : max), dates[0])

  const { data: existingTransactions, error } = await supabase
    .from('transactions')
    .select('id, date, amount_cents, merchant')
    .eq('user_id', userId)
    .gte('date', minDate)
    .lte('date', maxDate)

  if (error) {
    logger.error('Failed to query existing transactions for duplicate check', {
      userId,
      error: error.message,
      code: error.code,
    })
    throw new Error(`Failed to check for duplicates: ${error.message}`)
  }

  // Create hash set for existing transactions
  const existingHashes = new Map<string, { id: string; date: string; amount_cents: number; merchant: string }>()
  for (const tx of existingTransactions || []) {
    const hash = createDuplicateHash({
      date: tx.date,
      amount_cents: tx.amount_cents,
      merchant: tx.merchant,
    })
    existingHashes.set(hash, tx)
  }

  // Find duplicates by comparing hashes
  const duplicates: Array<{
    transaction: Omit<TransactionInsert, 'user_id'>
    existingTransactionId: string
    duplicateHash: string
  }> = []
  const duplicateHashes = new Set<string>()

  for (const [hash, incomingTx] of incomingHashes.entries()) {
    if (existingHashes.has(hash)) {
      const existingTx = existingHashes.get(hash)!
      duplicates.push({
        transaction: incomingTx,
        existingTransactionId: existingTx.id,
        duplicateHash: hash,
      })
      duplicateHashes.add(hash)
    }
  }

  logger.info('Duplicate check completed', {
    userId,
    totalIncoming: transactions.length,
    duplicatesFound: duplicates.length,
  })

  return { duplicates, duplicateHashes }
}

/**
 * Filter out duplicate transactions based on user choice
 * 
 * @param transactions - Array of transactions to filter
 * @param duplicateHashes - Set of duplicate hashes to filter out
 * @param skipDuplicates - If true, skip duplicates; if false, include all
 * @returns Filtered transactions array
 */
export function filterDuplicates(
  transactions: Omit<TransactionInsert, 'user_id'>[],
  duplicateHashes: Set<string>,
  skipDuplicates: boolean
): Omit<TransactionInsert, 'user_id'>[] {
  if (!skipDuplicates) {
    // User chose to import anyway - mark duplicates but don't filter
    return transactions.map((tx) => ({
      ...tx,
      is_duplicate: duplicateHashes.has(createDuplicateHash(tx)),
    }))
  }

  // User chose to skip duplicates - filter them out
  return transactions
    .filter((tx) => !duplicateHashes.has(createDuplicateHash(tx)))
    .map((tx) => ({
      ...tx,
      is_duplicate: false,
    }))
}
