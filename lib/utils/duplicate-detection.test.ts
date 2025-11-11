import { describe, it, expect, beforeEach, vi } from 'vitest'
import { normalizeMerchant, createDuplicateHash, findDuplicates, filterDuplicates } from './duplicate-detection'
import type { TransactionInsert } from '@/types/transaction'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  })),
}))

describe('normalizeMerchant', () => {
  it('should convert to lowercase', () => {
    expect(normalizeMerchant('STARBUCKS')).toBe('starbucks')
  })

  it('should trim whitespace', () => {
    expect(normalizeMerchant('  Target  ')).toBe('target')
  })

  it('should remove multiple spaces', () => {
    expect(normalizeMerchant('Whole  Foods   Market')).toBe('whole foods market')
  })

  it('should remove "the" prefix', () => {
    expect(normalizeMerchant('The Home Depot')).toBe('home depot')
    expect(normalizeMerchant('THE HOME DEPOT')).toBe('home depot')
  })

  it('should remove "inc" suffix', () => {
    expect(normalizeMerchant('Company Inc')).toBe('company')
    expect(normalizeMerchant('Company Inc.')).toBe('company')
  })

  it('should remove "llc" suffix', () => {
    expect(normalizeMerchant('Business LLC')).toBe('business')
    expect(normalizeMerchant('Business LLC.')).toBe('business')
  })

  it('should remove "corp" suffix', () => {
    expect(normalizeMerchant('Corporation Corp')).toBe('corporation')
    expect(normalizeMerchant('Corporation Corp.')).toBe('corporation')
  })

  it('should handle complex merchant names', () => {
    expect(normalizeMerchant('The Starbucks Corporation Inc.')).toBe('starbucks corporation')
  })
})

describe('createDuplicateHash', () => {
  it('should create consistent hash for same transaction', () => {
    const tx1 = {
      date: '2025-01-15',
      amount_cents: 1000,
      merchant: 'Starbucks',
    }
    const tx2 = {
      date: '2025-01-15',
      amount_cents: 1000,
      merchant: 'STARBUCKS',
    }

    expect(createDuplicateHash(tx1)).toBe(createDuplicateHash(tx2))
  })

  it('should create different hash for different dates', () => {
    const tx1 = {
      date: '2025-01-15',
      amount_cents: 1000,
      merchant: 'Starbucks',
    }
    const tx2 = {
      date: '2025-01-16',
      amount_cents: 1000,
      merchant: 'Starbucks',
    }

    expect(createDuplicateHash(tx1)).not.toBe(createDuplicateHash(tx2))
  })

  it('should create different hash for different amounts', () => {
    const tx1 = {
      date: '2025-01-15',
      amount_cents: 1000,
      merchant: 'Starbucks',
    }
    const tx2 = {
      date: '2025-01-15',
      amount_cents: 2000,
      merchant: 'Starbucks',
    }

    expect(createDuplicateHash(tx1)).not.toBe(createDuplicateHash(tx2))
  })

  it('should create different hash for different merchants', () => {
    const tx1 = {
      date: '2025-01-15',
      amount_cents: 1000,
      merchant: 'Starbucks',
    }
    const tx2 = {
      date: '2025-01-15',
      amount_cents: 1000,
      merchant: 'Target',
    }

    expect(createDuplicateHash(tx1)).not.toBe(createDuplicateHash(tx2))
  })

  it('should handle ISO datetime strings', () => {
    const tx1 = {
      date: '2025-01-15T10:30:00Z',
      amount_cents: 1000,
      merchant: 'Starbucks',
    }
    const tx2 = {
      date: '2025-01-15',
      amount_cents: 1000,
      merchant: 'Starbucks',
    }

    expect(createDuplicateHash(tx1)).toBe(createDuplicateHash(tx2))
  })
})

describe('filterDuplicates', () => {
  const transactions: Omit<TransactionInsert, 'user_id'>[] = [
    {
      date: '2025-01-15',
      amount_cents: 1000,
      merchant: 'Starbucks',
      description: 'Coffee',
      category_id: null,
      is_duplicate: false,
    },
    {
      date: '2025-01-16',
      amount_cents: 2000,
      merchant: 'Target',
      description: 'Groceries',
      category_id: null,
      is_duplicate: false,
    },
    {
      date: '2025-01-15',
      amount_cents: 1000,
      merchant: 'STARBUCKS', // Duplicate of first transaction
      description: 'Coffee',
      category_id: null,
      is_duplicate: false,
    },
  ]

  it('should filter out duplicates when skipDuplicates is true', () => {
    const duplicateHashes = new Set<string>()
    duplicateHashes.add(createDuplicateHash(transactions[2]))

    const filtered = filterDuplicates(transactions, duplicateHashes, true)

    expect(filtered).toHaveLength(2)
    expect(filtered[0].merchant).toBe('Starbucks')
    expect(filtered[1].merchant).toBe('Target')
    expect(filtered.every((tx) => !tx.is_duplicate)).toBe(true)
  })

  it('should mark duplicates but not filter when skipDuplicates is false', () => {
    const duplicateHashes = new Set<string>()
    duplicateHashes.add(createDuplicateHash(transactions[2]))

    const filtered = filterDuplicates(transactions, duplicateHashes, false)

    expect(filtered).toHaveLength(3)
    expect(filtered[0].is_duplicate).toBe(false)
    expect(filtered[1].is_duplicate).toBe(false)
    expect(filtered[2].is_duplicate).toBe(true) // Marked as duplicate
  })

  it('should handle empty duplicate set', () => {
    const duplicateHashes = new Set<string>()

    const filtered = filterDuplicates(transactions, duplicateHashes, true)

    expect(filtered).toHaveLength(3)
    expect(filtered.every((tx) => !tx.is_duplicate)).toBe(true)
  })
})

describe('findDuplicates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty arrays when no transactions provided', async () => {
    const { duplicates, duplicateHashes } = await findDuplicates([], 'user-123')

    expect(duplicates).toHaveLength(0)
    expect(duplicateHashes.size).toBe(0)
  })

  // Note: Integration tests for findDuplicates would require a test database
  // These are better suited for integration tests with actual Supabase setup
})
