/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  categorizeTransaction,
  categorizeTransactions,
  DEFAULT_MERCHANT_RULES,
  DEFAULT_KEYWORD_RULES,
} from './auto-categorize'
import type { Category } from '@/types/category'

// Mock learning module
vi.mock('./learning', () => ({
  findLearnedPatterns: vi.fn().mockResolvedValue([]),
  matchLearnedPattern: vi.fn().mockReturnValue(null),
}))

// Mock user categories
const mockCategories: Category[] = [
  {
    id: 'cat-dining',
    userId: 'user-1',
    name: 'Dining',
    description: 'Restaurants and food',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-shopping',
    userId: 'user-1',
    name: 'Shopping',
    description: 'Retail and online shopping',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-transportation',
    userId: 'user-1',
    name: 'Transportation',
    description: 'Gas, parking, and transport',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-groceries',
    userId: 'user-1',
    name: 'Groceries',
    description: 'Grocery shopping',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-utilities',
    userId: 'user-1',
    name: 'Utilities',
    description: 'Bills and utilities',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-entertainment',
    userId: 'user-1',
    name: 'Entertainment',
    description: 'Movies, streaming, etc',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-healthcare',
    userId: 'user-1',
    name: 'Healthcare',
    description: 'Medical and pharmacy',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]

describe('auto-categorize', () => {
  describe('categorizeTransaction', () => {
    describe('exact merchant match', () => {
      it('should match exact merchant name (case-insensitive) with 100% confidence', async () => {
        const result = await categorizeTransaction(
          { merchant: 'STARBUCKS', description: null },
          mockCategories
        )

        expect(result.category_id).toBe('cat-dining')
        expect(result.confidence).toBe(100)
        expect(result.matchReason).toContain('Exact merchant match')
        expect(result.matchReason).toContain('STARBUCKS')
      })

      it('should match exact merchant name regardless of case', async () => {
        const result = await categorizeTransaction(
          { merchant: 'starbucks', description: null },
          mockCategories
        )

        expect(result.category_id).toBe('cat-dining')
        expect(result.confidence).toBe(100)
      })

      it('should match exact merchant name with extra spaces', async () => {
        const result = await categorizeTransaction(
          { merchant: '  STARBUCKS  ', description: null },
          mockCategories
        )

        expect(result.category_id).toBe('cat-dining')
        expect(result.confidence).toBe(100)
      })

      it('should match AMAZON to Shopping category', async () => {
        const result = await categorizeTransaction(
          { merchant: 'AMAZON', description: null },
          mockCategories
        )

        expect(result.category_id).toBe('cat-shopping')
        expect(result.confidence).toBe(100)
      })

      it('should match UBER to Transportation category', async () => {
        const result = await categorizeTransaction(
          { merchant: 'UBER', description: null },
          mockCategories
        )

        expect(result.category_id).toBe('cat-transportation')
        expect(result.confidence).toBe(100)
      })

      it('should match NETFLIX to Entertainment category', async () => {
        const result = await categorizeTransaction(
          { merchant: 'NETFLIX', description: null },
          mockCategories
        )

        expect(result.category_id).toBe('cat-entertainment')
        expect(result.confidence).toBe(100)
      })
    })

    describe('keyword merchant match', () => {
      it('should match merchant keyword with 85% confidence', async () => {
        const result = await categorizeTransaction(
          { merchant: 'LOCAL RESTAURANT', description: null },
          mockCategories
        )

        expect(result.category_id).toBe('cat-dining')
        expect(result.confidence).toBe(85)
        expect(result.matchReason).toContain('Merchant keyword match')
        expect(result.matchReason).toContain('RESTAURANT')
      })

      it('should match GAS keyword to Transportation', async () => {
        const result = await categorizeTransaction(
          { merchant: 'CHEVRON GAS STATION', description: null },
          mockCategories
        )

        expect(result.category_id).toBe('cat-transportation')
        expect(result.confidence).toBe(85)
        expect(result.matchReason).toContain('GAS')
      })

      it('should match GROCERY keyword', async () => {
        const result = await categorizeTransaction(
          { merchant: 'LOCAL GROCERY STORE', description: null },
          mockCategories
        )

        expect(result.category_id).toBe('cat-groceries')
        expect(result.confidence).toBe(85)
      })

      it('should match PHARMACY keyword', async () => {
        const result = await categorizeTransaction(
          { merchant: 'MAIN STREET PHARMACY', description: null },
          mockCategories
        )

        expect(result.category_id).toBe('cat-healthcare')
        expect(result.confidence).toBe(85)
      })
    })

    describe('description keyword match', () => {
      it('should match description keyword with reduced confidence (75%)', () => {
        const result = await categorizeTransaction(
          { merchant: 'ABC CORP', description: 'FUEL PURCHASE' },
          mockCategories
        )

        expect(result.category_id).toBe('cat-transportation')
        expect(result.confidence).toBe(75) // 85 - 10 for description match
        expect(result.matchReason).toContain('Description keyword match')
        expect(result.matchReason).toContain('FUEL')
      })

      it('should prefer merchant match over description match', async () => {
        const result = await categorizeTransaction(
          { merchant: 'STARBUCKS', description: 'GAS STATION' },
          mockCategories
        )

        // Should match on exact merchant (STARBUCKS) not description keyword (GAS)
        expect(result.category_id).toBe('cat-dining')
        expect(result.confidence).toBe(100)
        expect(result.matchReason).toContain('Exact merchant match')
      })

      it('should match description keyword when merchant has no match', () => {
        const result = await categorizeTransaction(
          { merchant: 'UNKNOWN MERCHANT', description: 'PHARMACY PURCHASE' },
          mockCategories
        )

        expect(result.category_id).toBe('cat-healthcare')
        expect(result.confidence).toBe(75)
      })
    })

    describe('no match scenarios', () => {
      it('should return null category_id when no match found', async () => {
        const result = await categorizeTransaction(
          { merchant: 'RANDOM UNKNOWN MERCHANT', description: null },
          mockCategories
        )

        expect(result.category_id).toBeNull()
        expect(result.confidence).toBe(0)
        expect(result.matchReason).toContain('No matching rule found')
      })

      it('should return null when merchant is empty', () => {
        const result = await categorizeTransaction(
          { merchant: '', description: 'SOME DESCRIPTION' },
          mockCategories
        )

        expect(result.category_id).toBeNull()
        expect(result.confidence).toBe(0)
        expect(result.matchReason).toContain('No merchant name provided')
      })

      it('should return null when merchant is only whitespace', () => {
        const result = await categorizeTransaction(
          { merchant: '   ', description: null },
          mockCategories
        )

        expect(result.category_id).toBeNull()
        expect(result.confidence).toBe(0)
      })

      it('should return null when category does not exist in user categories', async () => {
        // User has no "Insurance" category
        const limitedCategories: Category[] = [
          {
            id: 'cat-other',
            userId: 'user-1',
            name: 'Other',
            description: 'Other expenses',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
        ]

        const result = await categorizeTransaction(
          { merchant: 'STARBUCKS', description: null },
          limitedCategories
        )

        expect(result.category_id).toBeNull()
        expect(result.confidence).toBe(0)
      })
    })

    describe('edge cases', () => {
      it('should handle null description gracefully', () => {
        const result = await categorizeTransaction(
          { merchant: 'STARBUCKS', description: null },
          mockCategories
        )

        expect(result.category_id).toBe('cat-dining')
        expect(result.confidence).toBe(100)
      })

      it('should handle special characters in merchant name', () => {
        const result = await categorizeTransaction(
          { merchant: "MCDONALD'S #123", description: null },
          mockCategories
        )

        // Won't match exact "MCDONALDS" rule due to apostrophe and #123
        // This is expected - exact matching requires exact match
        // In production, merchant names would be normalized from CSV
        expect(result.category_id).toBeNull()
        expect(result.confidence).toBe(0)
      })

      it('should handle multiple spaces in merchant name', () => {
        const result = await categorizeTransaction(
          { merchant: 'WHOLE    FOODS', description: null },
          mockCategories
        )

        expect(result.category_id).toBe('cat-groceries')
        expect(result.confidence).toBe(100)
      })

      it('should handle case-insensitive category name matching', async () => {
        const mixedCaseCategories: Category[] = [
          {
            id: 'cat-dining',
            userId: 'user-1',
            name: 'dining', // lowercase
            description: 'Food',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
        ]

        const result = await categorizeTransaction(
          { merchant: 'STARBUCKS', description: null },
          mixedCaseCategories
        )

        expect(result.category_id).toBe('cat-dining')
      })
    })

    describe('confidence score validation', () => {
      it('should return confidence between 0 and 100', async () => {
        const allResults = await Promise.all([
          categorizeTransaction({ merchant: 'STARBUCKS', description: null }, mockCategories),
          categorizeTransaction({ merchant: 'LOCAL CAFE', description: null }, mockCategories),
          categorizeTransaction({ merchant: 'ABC', description: 'RESTAURANT' }, mockCategories),
          categorizeTransaction({ merchant: 'UNKNOWN', description: null }, mockCategories),
        ])

        allResults.forEach((result) => {
          expect(result.confidence).toBeGreaterThanOrEqual(0)
          expect(result.confidence).toBeLessThanOrEqual(100)
        })
      })
    })
  })

  describe('categorizeTransactions', () => {
    it('should categorize multiple transactions', () => {
      const transactions = [
        { id: 'tx-1', merchant: 'STARBUCKS', description: null },
        { id: 'tx-2', merchant: 'AMAZON', description: null },
        { id: 'tx-3', merchant: 'UBER', description: null },
      ]

      const results = categorizeTransactions(transactions, mockCategories)

      expect(results).toHaveLength(3)
      expect(results[0].transactionId).toBe('tx-1')
      expect(results[0].category_id).toBe('cat-dining')
      expect(results[1].transactionId).toBe('tx-2')
      expect(results[1].category_id).toBe('cat-shopping')
      expect(results[2].transactionId).toBe('tx-3')
      expect(results[2].category_id).toBe('cat-transportation')
    })

    it('should handle empty transaction array', async () => {
      const results = await categorizeTransactions([], mockCategories)
      expect(results).toHaveLength(0)
    })

    it('should handle mix of matched and unmatched transactions', async () => {
      const transactions = [
        { id: 'tx-1', merchant: 'STARBUCKS', description: null },
        { id: 'tx-2', merchant: 'UNKNOWN MERCHANT', description: null },
        { id: 'tx-3', merchant: 'AMAZON', description: null },
      ]

      const results = await categorizeTransactions(transactions, mockCategories)

      expect(results).toHaveLength(3)
      expect(results[0].category_id).toBe('cat-dining')
      expect(results[1].category_id).toBeNull()
      expect(results[2].category_id).toBe('cat-shopping')
    })
  })

  describe('default rules coverage', () => {
    it('should have merchant rules defined', () => {
      expect(DEFAULT_MERCHANT_RULES.length).toBeGreaterThan(0)
    })

    it('should have keyword rules defined', () => {
      expect(DEFAULT_KEYWORD_RULES.length).toBeGreaterThan(0)
    })

    it('should have valid confidence scores in rules', () => {
      const allRules = [...DEFAULT_MERCHANT_RULES, ...DEFAULT_KEYWORD_RULES]
      allRules.forEach((rule) => {
        expect(rule.confidence).toBeGreaterThanOrEqual(0)
        expect(rule.confidence).toBeLessThanOrEqual(100)
        expect(rule.categoryName).toBeTruthy()
      })
    })
  })
})
