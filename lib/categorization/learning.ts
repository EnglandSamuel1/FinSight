/**
 * Categorization learning service
 *
 * This module provides functionality for learning from user corrections
 * and applying learned patterns to future categorizations.
 */

import { createServerClient } from '@/lib/supabase/server'
import { handleDatabaseError } from '@/lib/supabase/utils'
import { logger } from '@/lib/utils/logger'
import { normalizeMerchant } from '@/lib/utils/duplicate-detection'

/**
 * Categorization rule from database
 */
export interface CategorizationRule {
  id: string
  user_id: string
  merchant_pattern: string
  category_id: string
  confidence: number
  created_at: string
  updated_at: string
}

/**
 * Pattern match result
 */
export interface PatternMatch {
  category_id: string
  confidence: number
  matchReason: string
  matchSource: 'learned' | 'default'
}

/**
 * Normalize merchant name for pattern matching
 * Uses the same normalization as duplicate detection for consistency
 *
 * @param merchant - Merchant name to normalize
 * @returns Normalized merchant pattern
 */
export function extractMerchantPattern(merchant: string): string {
  return normalizeMerchant(merchant)
}

/**
 * Store a learned pattern when user corrects a category
 * Uses upsert to handle conflicts (if pattern exists for different category, updates it)
 *
 * @param userId - User ID
 * @param merchantPattern - Normalized merchant pattern
 * @param categoryId - Category ID to associate with this pattern
 * @param confidence - Confidence score (default: 100 for learned patterns)
 * @returns Created or updated categorization rule
 */
export async function storeLearnedPattern(
  userId: string,
  merchantPattern: string,
  categoryId: string,
  confidence: number = 100
): Promise<CategorizationRule> {
  const supabase = await createServerClient()

  // Check if a pattern already exists for this merchant (any category)
  // If it exists, update it to the new category (user's latest correction takes precedence)
  // Get the most recently updated pattern for this merchant
  const { data: existingPatterns, error: fetchError } = await supabase
    .from('categorization_rules')
    .select('id, category_id')
    .eq('user_id', userId)
    .eq('merchant_pattern', merchantPattern)
    .order('updated_at', { ascending: false })
    .limit(1)

  if (fetchError) {
    const { message, code } = handleDatabaseError(fetchError, 'fetch existing pattern')
    logger.error('Failed to check for existing pattern', {
      userId,
      merchantPattern,
      error: message,
      code,
    })
    throw new Error(message)
  }

  if (existingPatterns && existingPatterns.length > 0) {
    const existing = existingPatterns[0]
    
    // If the pattern already has the same category, just update confidence and timestamp
    if (existing.category_id === categoryId) {
      const { data: updated, error: updateError } = await supabase
        .from('categorization_rules')
        .update({
          confidence,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        const { message, code } = handleDatabaseError(updateError, 'update pattern')
        logger.error('Failed to update existing pattern', {
          userId,
          merchantPattern,
          error: message,
          code,
        })
        throw new Error(message)
      }

      return updated as CategorizationRule
    }

    // Pattern exists with different category - update it to the new category
    // Note: This will fail if a pattern with the new category already exists due to unique constraint
    // In that case, we delete the old pattern and keep the new one
    const { data: updated, error: updateError } = await supabase
      .from('categorization_rules')
      .update({
        category_id: categoryId,
        confidence,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (updateError) {
      // If update fails due to unique constraint (pattern with new category already exists),
      // delete the old pattern since the new one already exists
      if (updateError.code === '23505') {
        await supabase
          .from('categorization_rules')
          .delete()
          .eq('id', existing.id)

        // Fetch the existing pattern with the new category
        const { data: existingNew, error: fetchNewError } = await supabase
          .from('categorization_rules')
          .select('*')
          .eq('user_id', userId)
          .eq('merchant_pattern', merchantPattern)
          .eq('category_id', categoryId)
          .single()

        if (fetchNewError || !existingNew) {
          const { message, code } = handleDatabaseError(updateError, 'update pattern')
          logger.error('Failed to handle pattern conflict', {
            userId,
            merchantPattern,
            error: message,
            code,
          })
          throw new Error(message)
        }

        return existingNew as CategorizationRule
      }

      const { message, code } = handleDatabaseError(updateError, 'update pattern')
      logger.error('Failed to update existing pattern', {
        userId,
        merchantPattern,
        error: message,
        code,
      })
      throw new Error(message)
    }

    logger.info('Learned pattern updated successfully', {
      userId,
      merchantPattern,
      oldCategoryId: existing.category_id,
      newCategoryId: categoryId,
      confidence,
    })

    return updated as CategorizationRule
  }

  // Pattern doesn't exist - create a new one
  const { data, error } = await supabase
    .from('categorization_rules')
    .insert({
      user_id: userId,
      merchant_pattern: merchantPattern,
      category_id: categoryId,
      confidence,
    })
    .select()
    .single()

  if (error) {
    const { message, code } = handleDatabaseError(error, 'store learned pattern')
    logger.error('Failed to store learned pattern', {
      userId,
      merchantPattern,
      categoryId,
      error: message,
      code,
    })
    throw new Error(message)
  }

  if (!data) {
    throw new Error('Failed to store learned pattern')
  }

  logger.info('Learned pattern stored successfully', {
    userId,
    merchantPattern,
    categoryId,
    confidence,
  })

  return data as CategorizationRule
}

/**
 * Find learned patterns matching a merchant/description
 * Queries categorization_rules table for user's patterns
 *
 * @param userId - User ID
 * @param merchant - Merchant name
 * @param description - Transaction description (optional)
 * @returns Array of matching learned patterns
 */
export async function findLearnedPatterns(
  userId: string,
  merchant: string,
  description: string | null
): Promise<CategorizationRule[]> {
  const supabase = await createServerClient()
  const normalizedMerchant = extractMerchantPattern(merchant)

  // Query for patterns matching the normalized merchant
  // We'll do pattern matching in memory for partial matches
  const { data, error } = await supabase
    .from('categorization_rules')
    .select('*')
    .eq('user_id', userId)
    .order('confidence', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) {
    const { message, code } = handleDatabaseError(error, 'find learned patterns')
    logger.error('Failed to find learned patterns', {
      userId,
      merchant,
      error: message,
      code,
    })
    throw new Error(message)
  }

  if (!data || data.length === 0) {
    return []
  }

  // Filter patterns that match the merchant or description
  const matchingPatterns: CategorizationRule[] = []

  for (const pattern of data) {
    const patternNormalized = extractMerchantPattern(pattern.merchant_pattern)

    // Exact merchant match
    if (patternNormalized === normalizedMerchant) {
      matchingPatterns.push(pattern as CategorizationRule)
      continue
    }

    // Partial merchant match (merchant contains pattern or pattern contains merchant)
    if (
      normalizedMerchant.includes(patternNormalized) ||
      patternNormalized.includes(normalizedMerchant)
    ) {
      matchingPatterns.push(pattern as CategorizationRule)
      continue
    }

    // Description keyword match (if description exists)
    if (description) {
      const normalizedDescription = description.toLowerCase().trim()
      const patternLower = pattern.merchant_pattern.toLowerCase()

      // Check if description contains pattern keywords
      if (normalizedDescription.includes(patternLower)) {
        matchingPatterns.push(pattern as CategorizationRule)
        continue
      }
    }
  }

  return matchingPatterns
}

/**
 * Match learned patterns to a transaction
 * Returns the best matching pattern with highest confidence
 *
 * @param transaction - Transaction with merchant and description
 * @param learnedPatterns - Array of learned patterns to match against
 * @returns Best match result or null if no match
 */
export function matchLearnedPattern(
  transaction: { merchant: string; description: string | null },
  learnedPatterns: CategorizationRule[]
): PatternMatch | null {
  if (learnedPatterns.length === 0) {
    return null
  }

  const normalizedMerchant = extractMerchantPattern(transaction.merchant)
  let bestMatch: CategorizationRule | null = null
  let bestMatchType: 'exact' | 'partial' | 'description' = 'description'
  let bestConfidence = 0

  for (const pattern of learnedPatterns) {
    const patternNormalized = extractMerchantPattern(pattern.merchant_pattern)

    // Exact merchant match (highest priority)
    if (patternNormalized === normalizedMerchant) {
      if (pattern.confidence > bestConfidence) {
        bestMatch = pattern
        bestMatchType = 'exact'
        bestConfidence = pattern.confidence
      }
      continue
    }

    // Partial merchant match (medium priority)
    if (
      normalizedMerchant.includes(patternNormalized) ||
      patternNormalized.includes(normalizedMerchant)
    ) {
      // Slightly lower confidence for partial matches
      const adjustedConfidence = Math.max(pattern.confidence - 5, 0)
      if (adjustedConfidence > bestConfidence || (adjustedConfidence === bestConfidence && bestMatchType !== 'exact')) {
        bestMatch = pattern
        bestMatchType = 'partial'
        bestConfidence = adjustedConfidence
      }
      continue
    }

    // Description keyword match (lowest priority)
    if (transaction.description) {
      const normalizedDescription = transaction.description.toLowerCase().trim()
      const patternLower = pattern.merchant_pattern.toLowerCase()

      if (normalizedDescription.includes(patternLower)) {
        // Lower confidence for description matches
        const adjustedConfidence = Math.max(pattern.confidence - 10, 0)
        if (adjustedConfidence > bestConfidence || (bestMatchType === 'description' && adjustedConfidence > bestConfidence)) {
          bestMatch = pattern
          bestMatchType = 'description'
          bestConfidence = adjustedConfidence
        }
      }
    }
  }

  if (!bestMatch) {
    return null
  }

  const matchReasonMap = {
    exact: `Learned pattern: exact merchant match "${bestMatch.merchant_pattern}"`,
    partial: `Learned pattern: partial merchant match "${bestMatch.merchant_pattern}"`,
    description: `Learned pattern: description keyword match "${bestMatch.merchant_pattern}"`,
  }

  return {
    category_id: bestMatch.category_id,
    confidence: bestConfidence,
    matchReason: matchReasonMap[bestMatchType],
    matchSource: 'learned',
  }
}

/**
 * Learn from a category correction
 * Extracts merchant pattern and stores it as a learned pattern
 *
 * @param userId - User ID
 * @param transaction - Transaction with merchant and description
 * @param categoryId - Category ID that user assigned
 * @returns Created or updated categorization rule
 */
export async function learnFromCorrection(
  userId: string,
  transaction: { merchant: string; description: string | null },
  categoryId: string
): Promise<CategorizationRule> {
  const merchantPattern = extractMerchantPattern(transaction.merchant)
  return storeLearnedPattern(userId, merchantPattern, categoryId, 100)
}
