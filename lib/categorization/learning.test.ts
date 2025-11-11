/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  extractMerchantPattern,
  storeLearnedPattern,
  findLearnedPatterns,
  matchLearnedPattern,
  learnFromCorrection,
  type CategorizationRule,
} from './learning'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}))

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

// Mock duplicate detection
vi.mock('@/lib/utils/duplicate-detection', () => ({
  normalizeMerchant: vi.fn((merchant: string) =>
    merchant.toLowerCase().trim().replace(/\s+/g, ' ')
  ),
}))

import { createServerClient } from '@/lib/supabase/server'

describe('Learning Service', () => {
  const mockSupabase = {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)
  })

  describe('extractMerchantPattern', () => {
    it('should normalize merchant name (case-insensitive, trimmed)', () => {
      expect(extractMerchantPattern('  STARBUCKS  ')).toBe('starbucks')
      expect(extractMerchantPattern('Amazon.com')).toBe('amazon.com')
      expect(extractMerchantPattern('  WAL-MART  ')).toBe('wal-mart')
    })

    it('should handle empty strings', () => {
      expect(extractMerchantPattern('')).toBe('')
      expect(extractMerchantPattern('   ')).toBe('')
    })

    it('should normalize multiple spaces to single space', () => {
      expect(extractMerchantPattern('Whole  Foods   Market')).toBe('whole foods market')
    })
  })

  describe('storeLearnedPattern', () => {
    it('should create new categorization rule in database', async () => {
      const mockRule: CategorizationRule = {
        id: 'rule-1',
        user_id: 'user-1',
        merchant_pattern: 'starbucks',
        category_id: 'cat-dining',
        confidence: 100,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      const mockQuery = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockRule, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await storeLearnedPattern('user-1', 'starbucks', 'cat-dining', 100)

      expect(mockSupabase.from).toHaveBeenCalledWith('categorization_rules')
      expect(mockQuery.upsert).toHaveBeenCalledWith(
        {
          user_id: 'user-1',
          merchant_pattern: 'starbucks',
          category_id: 'cat-dining',
          confidence: 100,
          updated_at: expect.any(String),
        },
        {
          onConflict: 'user_id,merchant_pattern,category_id',
          ignoreDuplicates: false,
        }
      )
      expect(result).toEqual(mockRule)
    })

    it('should handle conflicts by updating existing pattern', async () => {
      const mockExistingRule = {
        id: 'rule-1',
      }

      const mockUpdatedRule: CategorizationRule = {
        id: 'rule-1',
        user_id: 'user-1',
        merchant_pattern: 'starbucks',
        category_id: 'cat-coffee', // Updated category
        confidence: 100,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      }

      const mockUpsertQuery = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: '23505' }, // Unique constraint violation
        }),
      }

      const mockFetchQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockExistingRule, error: null }),
      }

      const mockUpdateQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedRule, error: null }),
      }

      mockSupabase.from
        .mockReturnValueOnce(mockUpsertQuery) // First call for upsert
        .mockReturnValueOnce(mockFetchQuery) // Second call for fetch
        .mockReturnValueOnce(mockUpdateQuery) // Third call for update

      const result = await storeLearnedPattern('user-1', 'starbucks', 'cat-coffee', 100)

      expect(result).toEqual(mockUpdatedRule)
      expect(mockUpdateQuery.update).toHaveBeenCalledWith({
        category_id: 'cat-coffee',
        confidence: 100,
        updated_at: expect.any(String),
      })
    })

    it('should use default confidence of 100 if not provided', async () => {
      const mockRule: CategorizationRule = {
        id: 'rule-1',
        user_id: 'user-1',
        merchant_pattern: 'amazon',
        category_id: 'cat-shopping',
        confidence: 100,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      const mockQuery = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockRule, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      await storeLearnedPattern('user-1', 'amazon', 'cat-shopping')

      expect(mockQuery.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          confidence: 100,
        }),
        expect.any(Object)
      )
    })
  })

  describe('findLearnedPatterns', () => {
    it('should query categorization_rules table for user patterns', async () => {
      const mockPatterns: CategorizationRule[] = [
        {
          id: 'rule-1',
          user_id: 'user-1',
          merchant_pattern: 'starbucks',
          category_id: 'cat-dining',
          confidence: 100,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'rule-2',
          user_id: 'user-1',
          merchant_pattern: 'amazon',
          category_id: 'cat-shopping',
          confidence: 100,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      }

      mockQuery.order.mockResolvedValue({ data: mockPatterns, error: null })
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await findLearnedPatterns('user-1', 'starbucks', null)

      expect(mockSupabase.from).toHaveBeenCalledWith('categorization_rules')
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-1')
      expect(mockQuery.order).toHaveBeenCalledWith('confidence', { ascending: false })
    })

    it('should return empty array if no patterns found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      }

      mockQuery.order.mockResolvedValue({ data: [], error: null })
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await findLearnedPatterns('user-1', 'unknown-merchant', null)

      expect(result).toEqual([])
    })
  })

  describe('matchLearnedPattern', () => {
    const mockPatterns: CategorizationRule[] = [
      {
        id: 'rule-1',
        user_id: 'user-1',
        merchant_pattern: 'starbucks',
        category_id: 'cat-dining',
        confidence: 100,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 'rule-2',
        user_id: 'user-1',
        merchant_pattern: 'amazon',
        category_id: 'cat-shopping',
        confidence: 100,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    ]

    it('should match exact merchant name to learned pattern', () => {
      const result = matchLearnedPattern(
        { merchant: 'STARBUCKS', description: null },
        mockPatterns
      )

      expect(result).not.toBeNull()
      expect(result?.category_id).toBe('cat-dining')
      expect(result?.confidence).toBe(100)
      expect(result?.matchSource).toBe('learned')
      expect(result?.matchReason).toContain('exact merchant match')
    })

    it('should match partial merchant name to learned pattern', () => {
      const result = matchLearnedPattern(
        { merchant: 'STARBUCKS COFFEE', description: null },
        mockPatterns
      )

      expect(result).not.toBeNull()
      expect(result?.category_id).toBe('cat-dining')
      expect(result?.matchSource).toBe('learned')
      expect(result?.matchReason).toContain('partial merchant match')
    })

    it('should match description keywords to learned pattern', () => {
      const result = matchLearnedPattern(
        { merchant: 'UNKNOWN MERCHANT', description: 'Payment to Starbucks' },
        mockPatterns
      )

      expect(result).not.toBeNull()
      expect(result?.category_id).toBe('cat-dining')
      expect(result?.matchSource).toBe('learned')
      expect(result?.matchReason).toContain('description keyword match')
    })

    it('should return null if no patterns match', () => {
      const result = matchLearnedPattern(
        { merchant: 'UNKNOWN MERCHANT', description: null },
        mockPatterns
      )

      expect(result).toBeNull()
    })

    it('should return null if patterns array is empty', () => {
      const result = matchLearnedPattern({ merchant: 'STARBUCKS', description: null }, [])

      expect(result).toBeNull()
    })

    it('should prioritize exact matches over partial matches', () => {
      const patterns: CategorizationRule[] = [
        {
          id: 'rule-1',
          user_id: 'user-1',
          merchant_pattern: 'starbucks coffee',
          category_id: 'cat-coffee',
          confidence: 100,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'rule-2',
          user_id: 'user-1',
          merchant_pattern: 'starbucks',
          category_id: 'cat-dining',
          confidence: 100,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ]

      const result = matchLearnedPattern({ merchant: 'STARBUCKS', description: null }, patterns)

      expect(result).not.toBeNull()
      expect(result?.category_id).toBe('cat-dining') // Exact match should win
      expect(result?.matchReason).toContain('exact merchant match')
    })

    it('should return higher confidence pattern when multiple match', () => {
      const patterns: CategorizationRule[] = [
        {
          id: 'rule-1',
          user_id: 'user-1',
          merchant_pattern: 'starbucks',
          category_id: 'cat-dining',
          confidence: 90,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'rule-2',
          user_id: 'user-1',
          merchant_pattern: 'starbucks',
          category_id: 'cat-coffee',
          confidence: 100,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ]

      const result = matchLearnedPattern({ merchant: 'STARBUCKS', description: null }, patterns)

      expect(result).not.toBeNull()
      expect(result?.category_id).toBe('cat-coffee') // Higher confidence should win
      expect(result?.confidence).toBe(100)
    })
  })

  describe('learnFromCorrection', () => {
    it('should extract merchant pattern and store learned pattern', async () => {
      const mockRule: CategorizationRule = {
        id: 'rule-1',
        user_id: 'user-1',
        merchant_pattern: 'starbucks',
        category_id: 'cat-dining',
        confidence: 100,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      const mockQuery = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockRule, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await learnFromCorrection(
        'user-1',
        { merchant: '  STARBUCKS  ', description: 'Coffee purchase' },
        'cat-dining'
      )

      expect(result).toEqual(mockRule)
      expect(mockQuery.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          merchant_pattern: 'starbucks', // Normalized
          category_id: 'cat-dining',
          confidence: 100,
        }),
        expect.any(Object)
      )
    })
  })
})
