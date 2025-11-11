/**
 * Automatic transaction categorization service
 *
 * This module provides rule-based automatic categorization for transactions
 * based on merchant names and keywords.
 */

import type { Category } from '@/types/category'
import { findLearnedPatterns, matchLearnedPattern } from './learning'

/**
 * Categorization rule definition
 */
export interface CategorizationRule {
  merchantPattern?: string // Exact merchant name match (case-insensitive)
  keywords?: string[] // Keywords to match in merchant or description
  categoryName: string // Category name to match against user's categories
  confidence: number // Base confidence score for this rule (0-100)
}

/**
 * Categorization result
 */
export interface CategorizationResult {
  category_id: string | null
  confidence: number
  matchReason: string
  matchSource?: 'learned' | 'default'
}

/**
 * Default merchant rules for common merchants
 * These map exact merchant names to category names
 */
export const DEFAULT_MERCHANT_RULES: CategorizationRule[] = [
  // Dining & Food
  { merchantPattern: 'STARBUCKS', categoryName: 'Dining', confidence: 100 },
  { merchantPattern: 'MCDONALDS', categoryName: 'Dining', confidence: 100 },
  { merchantPattern: 'SUBWAY', categoryName: 'Dining', confidence: 100 },
  { merchantPattern: 'CHIPOTLE', categoryName: 'Dining', confidence: 100 },
  { merchantPattern: 'PANERA BREAD', categoryName: 'Dining', confidence: 100 },
  { merchantPattern: 'DUNKIN', categoryName: 'Dining', confidence: 100 },
  { merchantPattern: 'TACO BELL', categoryName: 'Dining', confidence: 100 },
  { merchantPattern: 'PIZZA HUT', categoryName: 'Dining', confidence: 100 },
  { merchantPattern: 'DOMINOS', categoryName: 'Dining', confidence: 100 },
  { merchantPattern: 'BURGER KING', categoryName: 'Dining', confidence: 100 },
  { merchantPattern: 'WENDYS', categoryName: 'Dining', confidence: 100 },
  { merchantPattern: 'KFC', categoryName: 'Dining', confidence: 100 },

  // Shopping & Retail
  { merchantPattern: 'AMAZON', categoryName: 'Shopping', confidence: 100 },
  { merchantPattern: 'WALMART', categoryName: 'Shopping', confidence: 100 },
  { merchantPattern: 'TARGET', categoryName: 'Shopping', confidence: 100 },
  { merchantPattern: 'COSTCO', categoryName: 'Shopping', confidence: 100 },
  { merchantPattern: 'BEST BUY', categoryName: 'Shopping', confidence: 100 },
  { merchantPattern: 'HOME DEPOT', categoryName: 'Shopping', confidence: 100 },
  { merchantPattern: 'LOWES', categoryName: 'Shopping', confidence: 100 },
  { merchantPattern: 'IKEA', categoryName: 'Shopping', confidence: 100 },
  { merchantPattern: 'MACYS', categoryName: 'Shopping', confidence: 100 },
  { merchantPattern: 'NORDSTROM', categoryName: 'Shopping', confidence: 100 },

  // Groceries
  { merchantPattern: 'WHOLE FOODS', categoryName: 'Groceries', confidence: 100 },
  { merchantPattern: 'TRADER JOES', categoryName: 'Groceries', confidence: 100 },
  { merchantPattern: 'SAFEWAY', categoryName: 'Groceries', confidence: 100 },
  { merchantPattern: 'KROGER', categoryName: 'Groceries', confidence: 100 },
  { merchantPattern: 'PUBLIX', categoryName: 'Groceries', confidence: 100 },
  { merchantPattern: 'ALBERTSONS', categoryName: 'Groceries', confidence: 100 },

  // Transportation
  { merchantPattern: 'SHELL', categoryName: 'Transportation', confidence: 100 },
  { merchantPattern: 'CHEVRON', categoryName: 'Transportation', confidence: 100 },
  { merchantPattern: 'EXXON', categoryName: 'Transportation', confidence: 100 },
  { merchantPattern: 'BP', categoryName: 'Transportation', confidence: 100 },
  { merchantPattern: 'MOBIL', categoryName: 'Transportation', confidence: 100 },
  { merchantPattern: 'UBER', categoryName: 'Transportation', confidence: 100 },
  { merchantPattern: 'LYFT', categoryName: 'Transportation', confidence: 100 },
  { merchantPattern: 'PARKING', categoryName: 'Transportation', confidence: 100 },

  // Utilities & Bills
  { merchantPattern: 'AT&T', categoryName: 'Utilities', confidence: 100 },
  { merchantPattern: 'VERIZON', categoryName: 'Utilities', confidence: 100 },
  { merchantPattern: 'COMCAST', categoryName: 'Utilities', confidence: 100 },
  { merchantPattern: 'SPECTRUM', categoryName: 'Utilities', confidence: 100 },
  { merchantPattern: 'T-MOBILE', categoryName: 'Utilities', confidence: 100 },

  // Entertainment
  { merchantPattern: 'NETFLIX', categoryName: 'Entertainment', confidence: 100 },
  { merchantPattern: 'SPOTIFY', categoryName: 'Entertainment', confidence: 100 },
  { merchantPattern: 'HULU', categoryName: 'Entertainment', confidence: 100 },
  { merchantPattern: 'DISNEY+', categoryName: 'Entertainment', confidence: 100 },
  { merchantPattern: 'HBO', categoryName: 'Entertainment', confidence: 100 },
  { merchantPattern: 'AMC THEATRES', categoryName: 'Entertainment', confidence: 100 },
  { merchantPattern: 'REGAL CINEMAS', categoryName: 'Entertainment', confidence: 100 },

  // Healthcare
  { merchantPattern: 'CVS', categoryName: 'Healthcare', confidence: 100 },
  { merchantPattern: 'WALGREENS', categoryName: 'Healthcare', confidence: 100 },
  { merchantPattern: 'RITE AID', categoryName: 'Healthcare', confidence: 100 },
]

/**
 * Default keyword rules for partial matching
 * These match keywords in merchant names or descriptions
 */
export const DEFAULT_KEYWORD_RULES: CategorizationRule[] = [
  // Dining keywords
  { keywords: ['RESTAURANT', 'CAFE', 'COFFEE', 'DINER', 'BAKERY', 'BISTRO', 'GRILL'], categoryName: 'Dining', confidence: 85 },
  { keywords: ['PIZZA', 'BURGER', 'SUSHI', 'TACO', 'BBQ', 'STEAKHOUSE'], categoryName: 'Dining', confidence: 85 },

  // Transportation keywords
  { keywords: ['GAS', 'FUEL', 'GASOLINE', 'PETROL'], categoryName: 'Transportation', confidence: 85 },
  { keywords: ['PARKING', 'TOLL', 'AUTO', 'CAR WASH'], categoryName: 'Transportation', confidence: 85 },

  // Groceries keywords
  { keywords: ['GROCERY', 'MARKET', 'SUPERMARKET', 'FOOD MART'], categoryName: 'Groceries', confidence: 85 },

  // Shopping keywords
  { keywords: ['STORE', 'SHOP', 'RETAIL', 'MALL'], categoryName: 'Shopping', confidence: 75 },

  // Utilities keywords
  { keywords: ['ELECTRIC', 'POWER', 'UTILITY', 'WATER', 'INTERNET', 'CABLE', 'PHONE'], categoryName: 'Utilities', confidence: 85 },

  // Healthcare keywords
  { keywords: ['PHARMACY', 'MEDICAL', 'CLINIC', 'HOSPITAL', 'DOCTOR', 'DENTAL'], categoryName: 'Healthcare', confidence: 85 },

  // Entertainment keywords
  { keywords: ['MOVIE', 'CINEMA', 'THEATRE', 'THEATER', 'STREAMING'], categoryName: 'Entertainment', confidence: 80 },
]

/**
 * Normalize text for matching (uppercase, trim, remove extra spaces)
 */
function normalizeText(text: string): string {
  return text.toUpperCase().trim().replace(/\s+/g, ' ')
}

/**
 * Check if text contains any of the keywords
 */
function containsKeyword(text: string, keywords: string[]): boolean {
  const normalized = normalizeText(text)
  return keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
}

/**
 * Find category by name (case-insensitive)
 */
function findCategoryByName(categoryName: string, userCategories: Category[]): Category | null {
  const normalized = normalizeText(categoryName)
  return userCategories.find((cat) => normalizeText(cat.name) === normalized) || null
}

/**
 * Categorize a single transaction using rule-based matching
 *
 * Matching priority:
 * 1. Learned patterns (exact, partial, description matches) - confidence: 100
 * 2. Default exact merchant name match (confidence: 100)
 * 3. Default keyword match in merchant name (confidence: 85)
 * 4. Default keyword match in description (confidence: 75)
 * 5. No match (confidence: 0)
 *
 * @param transaction - Transaction with merchant and description
 * @param userCategories - User's available categories
 * @param userId - User ID for learned pattern lookup (optional)
 * @returns Categorization result with category_id, confidence, match reason, and match source
 */
export async function categorizeTransaction(
  transaction: {
    merchant: string
    description: string | null
  },
  userCategories: Category[],
  userId?: string
): Promise<CategorizationResult> {
  const merchant = transaction.merchant || ''
  const description = transaction.description || ''

  // If no merchant name, cannot categorize
  if (!merchant.trim()) {
    return {
      category_id: null,
      confidence: 0,
      matchReason: 'No merchant name provided',
      matchSource: 'default',
    }
  }

  // 1. Try learned patterns first (highest priority) - if userId is provided
  if (userId) {
    try {
      const learnedPatterns = await findLearnedPatterns(userId, merchant, description)
      const learnedMatch = matchLearnedPattern(transaction, learnedPatterns)

      if (learnedMatch) {
        // Verify the category exists in user's categories
        const category = userCategories.find((cat) => cat.id === learnedMatch.category_id)
        if (category) {
          return {
            category_id: learnedMatch.category_id,
            confidence: learnedMatch.confidence,
            matchReason: learnedMatch.matchReason,
            matchSource: 'learned',
          }
        }
      }
    } catch (error) {
      // Log error but continue with default rules
      console.error('Failed to check learned patterns:', error)
    }
  }

  const normalizedMerchant = normalizeText(merchant)

  // 2. Try default exact merchant match
  for (const rule of DEFAULT_MERCHANT_RULES) {
    if (rule.merchantPattern && normalizeText(rule.merchantPattern) === normalizedMerchant) {
      const category = findCategoryByName(rule.categoryName, userCategories)
      if (category) {
        return {
          category_id: category.id,
          confidence: rule.confidence,
          matchReason: `Exact merchant match: "${rule.merchantPattern}" → ${rule.categoryName}`,
          matchSource: 'default',
        }
      }
    }
  }

  // 3. Try default partial merchant keyword match
  for (const rule of DEFAULT_KEYWORD_RULES) {
    if (rule.keywords && containsKeyword(merchant, rule.keywords)) {
      const category = findCategoryByName(rule.categoryName, userCategories)
      if (category) {
        const matchedKeyword = rule.keywords.find((kw) => normalizedMerchant.includes(normalizeText(kw)))
        return {
          category_id: category.id,
          confidence: rule.confidence,
          matchReason: `Merchant keyword match: "${matchedKeyword}" → ${rule.categoryName}`,
          matchSource: 'default',
        }
      }
    }
  }

  // 4. Try default description keyword match (if description exists)
  if (description.trim()) {
    for (const rule of DEFAULT_KEYWORD_RULES) {
      if (rule.keywords && containsKeyword(description, rule.keywords)) {
        const category = findCategoryByName(rule.categoryName, userCategories)
        if (category) {
          const matchedKeyword = rule.keywords.find((kw) => normalizeText(description).includes(normalizeText(kw)))
          return {
            category_id: category.id,
            confidence: Math.max(rule.confidence - 10, 0), // Lower confidence for description match
            matchReason: `Description keyword match: "${matchedKeyword}" → ${rule.categoryName}`,
            matchSource: 'default',
          }
        }
      }
    }
  }

  // 5. No match found
  return {
    category_id: null,
    confidence: 0,
    matchReason: 'No matching rule found',
    matchSource: 'default',
  }
}

/**
 * Categorize multiple transactions in batch
 *
 * @param transactions - Array of transactions to categorize
 * @param userCategories - User's available categories
 * @param userId - User ID for learned pattern lookup (optional)
 * @returns Array of categorization results
 */
export async function categorizeTransactions(
  transactions: Array<{
    id?: string
    merchant: string
    description: string | null
  }>,
  userCategories: Category[],
  userId?: string
): Promise<Array<CategorizationResult & { transactionId?: string }>> {
  const results = await Promise.all(
    transactions.map(async (tx) => ({
      transactionId: tx.id,
      ...(await categorizeTransaction(tx, userCategories, userId)),
    }))
  )
  return results
}
