import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/api/route-handler', () => ({
  createRouteHandler: vi.fn((handler) => handler),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { createServerClient } from '@/lib/supabase/server'

describe('GET /api/categorization/statistics', () => {
  const createRequest = (queryParams?: Record<string, string>) => {
    const url = new URL('http://localhost:3000/api/categorization/statistics')
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }
    return new NextRequest(url.toString(), {
      method: 'GET',
    })
  }

  const createContext = (userId: string) => ({
    requestId: 'test-request-id',
    userId,
    startTime: Date.now(),
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return categorization statistics successfully', async () => {
    const mockTransactions = [
      { category_id: 'cat-1', confidence: 85 },
      { category_id: 'cat-1', confidence: 90 },
      { category_id: 'cat-2', confidence: 75 },
      { category_id: null, confidence: null },
      { category_id: null, confidence: null },
    ]

    const mockCategories = [
      { id: 'cat-1', name: 'Food & Dining' },
      { id: 'cat-2', name: 'Shopping' },
    ]

    // Create mock query chain for transactions
    const mockTransactionsQuery = {
      eq: vi.fn(() => Promise.resolve({ data: mockTransactions, error: null, count: 5 })),
    }

    const mockTransactionsSelect = {
      eq: vi.fn(() => mockTransactionsQuery),
    }

    // Create mock query chain for categories
    const mockCategoriesQuery = {
      in: vi.fn(() => Promise.resolve({ data: mockCategories, error: null })),
    }

    const mockCategoriesSelect = {
      eq: vi.fn(() => mockCategoriesQuery),
    }

    const mockSupabaseClient = {
      from: vi.fn((table: string) => {
        if (table === 'transactions') {
          return {
            select: vi.fn(() => mockTransactionsSelect),
          }
        }
        if (table === 'categories') {
          return {
            select: vi.fn(() => mockCategoriesSelect),
          }
        }
        return mockSupabaseClient
      }),
    }

    vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as any)

    const request = createRequest()
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.total).toBe(5)
    expect(data.categorized).toBe(3)
    expect(data.uncategorized).toBe(2)
    expect(data.averageConfidence).toBeCloseTo(83.33, 1) // (85 + 90 + 75) / 3 = 83.33
    expect(data.categoryDistribution).toHaveLength(2)
    expect(data.categoryDistribution[0]).toMatchObject({
      categoryId: 'cat-1',
      categoryName: 'Food & Dining',
      count: 2,
    })
    expect(data.categoryDistribution[1]).toMatchObject({
      categoryId: 'cat-2',
      categoryName: 'Shopping',
      count: 1,
    })
  })

  it('should return statistics with date range filters', async () => {
    const mockTransactions = [
      { category_id: 'cat-1', confidence: 85 },
      { category_id: null, confidence: null },
    ]

    const mockSupabaseClient = {
      from: vi.fn(() => mockSupabaseClient),
      select: vi.fn(() => mockSupabaseClient),
      eq: vi.fn(() => mockSupabaseClient),
      gte: vi.fn(() => mockSupabaseClient),
      lte: vi.fn(() => mockSupabaseClient),
      in: vi.fn(() => mockSupabaseClient),
    }

    // Mock transactions query with date filters
    mockSupabaseClient.gte.mockReturnValueOnce({
      lte: vi.fn(() => Promise.resolve({ data: mockTransactions, error: null, count: 2 })),
    })

    mockSupabaseClient.in.mockReturnValueOnce(
      Promise.resolve({ data: [{ id: 'cat-1', name: 'Food & Dining' }], error: null })
    )

    vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as any)

    const request = createRequest({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    })
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.total).toBe(2)
    expect(mockSupabaseClient.gte).toHaveBeenCalledWith('date', '2024-01-01')
  })

  it('should handle empty transactions list', async () => {
    const mockTransactionsQuery = {
      eq: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
    }

    const mockTransactionsSelect = {
      eq: vi.fn(() => mockTransactionsQuery),
    }

    const mockSupabaseClient = {
      from: vi.fn((table: string) => {
        if (table === 'transactions') {
          return {
            select: vi.fn(() => mockTransactionsSelect),
          }
        }
        return mockSupabaseClient
      }),
    }

    vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as any)

    const request = createRequest()
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.total).toBe(0)
    expect(data.categorized).toBe(0)
    expect(data.uncategorized).toBe(0)
    expect(data.averageConfidence).toBe(0)
    expect(data.categoryDistribution).toHaveLength(0)
  })

  it('should calculate average confidence only for categorized transactions with confidence', async () => {
    const mockTransactions = [
      { category_id: 'cat-1', confidence: 80 },
      { category_id: 'cat-1', confidence: null }, // Categorized but no confidence
      { category_id: null, confidence: null }, // Uncategorized
    ]

    const mockCategories = [{ id: 'cat-1', name: 'Food & Dining' }]

    const mockTransactionsQuery = {
      eq: vi.fn(() => Promise.resolve({ data: mockTransactions, error: null, count: 3 })),
    }

    const mockTransactionsSelect = {
      eq: vi.fn(() => mockTransactionsQuery),
    }

    const mockCategoriesQuery = {
      in: vi.fn(() => Promise.resolve({ data: mockCategories, error: null })),
    }

    const mockCategoriesSelect = {
      eq: vi.fn(() => mockCategoriesQuery),
    }

    const mockSupabaseClient = {
      from: vi.fn((table: string) => {
        if (table === 'transactions') {
          return {
            select: vi.fn(() => mockTransactionsSelect),
          }
        }
        if (table === 'categories') {
          return {
            select: vi.fn(() => mockCategoriesSelect),
          }
        }
        return mockSupabaseClient
      }),
    }

    vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as any)

    const request = createRequest()
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.averageConfidence).toBe(80) // Only one transaction with confidence
  })

  it('should return 401 if user not authenticated', async () => {
    const request = createRequest()
    const context = createContext('')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
    expect(data.error.message).toBe('Unauthorized')
  })

  it('should return 400 if invalid date format', async () => {
    const request = createRequest({
      startDate: 'invalid-date',
    })
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(data.error.message).toContain('validation')
  })

  it('should sort category distribution by count descending', async () => {
    const mockTransactions = [
      { category_id: 'cat-1', confidence: 85 },
      { category_id: 'cat-2', confidence: 90 },
      { category_id: 'cat-2', confidence: 90 },
      { category_id: 'cat-2', confidence: 90 },
      { category_id: 'cat-3', confidence: 75 },
      { category_id: 'cat-3', confidence: 75 },
    ]

    const mockCategories = [
      { id: 'cat-1', name: 'Food' },
      { id: 'cat-2', name: 'Shopping' },
      { id: 'cat-3', name: 'Transport' },
    ]

    const mockTransactionsQuery = {
      eq: vi.fn(() => Promise.resolve({ data: mockTransactions, error: null, count: 6 })),
    }

    const mockTransactionsSelect = {
      eq: vi.fn(() => mockTransactionsQuery),
    }

    const mockCategoriesQuery = {
      in: vi.fn(() => Promise.resolve({ data: mockCategories, error: null })),
    }

    const mockCategoriesSelect = {
      eq: vi.fn(() => mockCategoriesQuery),
    }

    const mockSupabaseClient = {
      from: vi.fn((table: string) => {
        if (table === 'transactions') {
          return {
            select: vi.fn(() => mockTransactionsSelect),
          }
        }
        if (table === 'categories') {
          return {
            select: vi.fn(() => mockCategoriesSelect),
          }
        }
        return mockSupabaseClient
      }),
    }

    vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as any)

    const request = createRequest()
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.categoryDistribution[0].count).toBe(3) // cat-2
    expect(data.categoryDistribution[1].count).toBe(2) // cat-3
    expect(data.categoryDistribution[2].count).toBe(1) // cat-1
  })
})
