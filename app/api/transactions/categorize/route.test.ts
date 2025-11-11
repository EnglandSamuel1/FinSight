/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/api/route-handler', () => ({
  createRouteHandler: vi.fn((handler) => handler),
}))

vi.mock('@/lib/categorization/auto-categorize', () => ({
  categorizeTransactions: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('@/lib/supabase/utils', () => ({
  handleDatabaseError: vi.fn((err) => ({ message: err.message, code: err.code })),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { categorizeTransactions } from '@/lib/categorization/auto-categorize'
import { createServerClient } from '@/lib/supabase/server'

describe('POST /api/transactions/categorize', () => {
  const createRequest = (body: unknown) => {
    return new NextRequest('http://localhost:3000/api/transactions/categorize', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const createContext = (userId: string | null = 'user-1') => ({
    requestId: 'test-request-id',
    userId,
    startTime: Date.now(),
  })

  const mockCategories = [
    {
      id: 'cat-1',
      user_id: 'user-1',
      name: 'Dining',
      description: 'Food and restaurants',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'cat-2',
      user_id: 'user-1',
      name: 'Shopping',
      description: 'Retail purchases',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ]

  const mockSupabaseClient: any = {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
  }

  // Setup chaining for all methods
  mockSupabaseClient.from.mockReturnValue(mockSupabaseClient)
  mockSupabaseClient.select.mockReturnValue(mockSupabaseClient)
  mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient)
  mockSupabaseClient.in.mockReturnValue(mockSupabaseClient)

  beforeEach(() => {
    vi.clearAllMocks()

    // Re-setup chaining after clearAllMocks
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.in.mockReturnValue(mockSupabaseClient)

    vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as any)
  })

  describe('successful categorization', () => {
    it('should categorize transactions by IDs', async () => {
      const mockTransactions = [
        { id: 'tx-1', merchant: 'STARBUCKS', description: null },
        { id: 'tx-2', merchant: 'AMAZON', description: null },
      ]

      const mockResults = [
        {
          transactionId: 'tx-1',
          category_id: 'cat-1',
          confidence: 100,
          matchReason: 'Exact merchant match: "STARBUCKS" → Dining',
        },
        {
          transactionId: 'tx-2',
          category_id: 'cat-2',
          confidence: 100,
          matchReason: 'Exact merchant match: "AMAZON" → Shopping',
        },
      ]

      // Mock category fetch - eq() returns the promise
      mockSupabaseClient.eq.mockResolvedValueOnce({
        data: mockCategories,
        error: null,
      })

      // Mock transaction fetch - in() returns the promise
      mockSupabaseClient.in.mockResolvedValueOnce({
        data: mockTransactions,
        error: null,
      })

      vi.mocked(categorizeTransactions).mockReturnValue(mockResults)

      const request = createRequest({ transactionIds: ['tx-1', 'tx-2'] })
      const context = createContext()

      const response = await POST(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockResults)
      expect(categorizeTransactions).toHaveBeenCalledWith(mockTransactions, expect.any(Array))
    })

    it('should categorize transactions from provided objects', async () => {
      const providedTransactions = [
        { merchant: 'STARBUCKS', description: null },
        { merchant: 'AMAZON', description: 'Online purchase' },
      ]

      const mockResults = [
        {
          transactionId: undefined,
          category_id: 'cat-1',
          confidence: 100,
          matchReason: 'Exact merchant match: "STARBUCKS" → Dining',
        },
        {
          transactionId: undefined,
          category_id: 'cat-2',
          confidence: 100,
          matchReason: 'Exact merchant match: "AMAZON" → Shopping',
        },
      ]

      // Mock category fetch - eq() returns the promise
      mockSupabaseClient.eq.mockResolvedValueOnce({
        data: mockCategories,
        error: null,
      })

      vi.mocked(categorizeTransactions).mockReturnValue(mockResults)

      const request = createRequest({ transactions: providedTransactions })
      const context = createContext()

      const response = await POST(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockResults)
      expect(categorizeTransactions).toHaveBeenCalledWith(providedTransactions, expect.any(Array))
    })

    it('should handle mix of categorized and uncategorized transactions', async () => {
      const mockTransactions = [
        { id: 'tx-1', merchant: 'STARBUCKS', description: null },
        { id: 'tx-2', merchant: 'UNKNOWN MERCHANT', description: null },
      ]

      const mockResults = [
        {
          transactionId: 'tx-1',
          category_id: 'cat-1',
          confidence: 100,
          matchReason: 'Exact merchant match: "STARBUCKS" → Dining',
        },
        {
          transactionId: 'tx-2',
          category_id: null,
          confidence: 0,
          matchReason: 'No matching rule found',
        },
      ]

      // Mock category fetch - eq() returns the promise
      mockSupabaseClient.eq.mockResolvedValueOnce({
        data: mockCategories,
        error: null,
      })

      // Mock transaction fetch - in() returns the promise
      mockSupabaseClient.in.mockResolvedValueOnce({
        data: mockTransactions,
        error: null,
      })

      vi.mocked(categorizeTransactions).mockReturnValue(mockResults)

      const request = createRequest({ transactionIds: ['tx-1', 'tx-2'] })
      const context = createContext()

      const response = await POST(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(2)
      expect(data[0].category_id).toBe('cat-1')
      expect(data[1].category_id).toBeNull()
    })
  })

  describe('error handling', () => {
    it('should return 401 if user not authenticated', async () => {
      const request = createRequest({ transactionIds: ['tx-1'] })
      const context = createContext(null)

      const response = await POST(request, context)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('should return 400 if no transactions provided', async () => {
      const request = createRequest({})
      const context = createContext()

      const response = await POST(request, context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('MISSING_INPUT')
    })

    it('should return 400 if empty transaction arrays provided', async () => {
      const request = createRequest({ transactionIds: [], transactions: [] })
      const context = createContext()

      const response = await POST(request, context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('MISSING_INPUT')
    })

    it('should return 400 for invalid request body', async () => {
      const request = createRequest({ transactionIds: 'not-an-array' })
      const context = createContext()

      const response = await POST(request, context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('should return 404 if no transactions found for provided IDs', async () => {
      // Mock category fetch - eq() returns the promise
      mockSupabaseClient.eq.mockResolvedValueOnce({
        data: mockCategories,
        error: null,
      })

      // Mock transaction fetch with empty result - in() returns the promise
      mockSupabaseClient.in.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      const request = createRequest({ transactionIds: ['non-existent-id'] })
      const context = createContext()

      const response = await POST(request, context)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should handle category fetch error', async () => {
      // Mock category fetch with error - eq() returns error
      mockSupabaseClient.eq.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      })

      const request = createRequest({ transactions: [{ merchant: 'TEST', description: null }] })
      const context = createContext()

      await expect(POST(request, context)).rejects.toThrow('Database error')
    })

    it('should handle transaction fetch error', async () => {
      // Mock category fetch - eq() returns the promise
      mockSupabaseClient.eq.mockResolvedValueOnce({
        data: mockCategories,
        error: null,
      })

      // Mock transaction fetch with error - in() returns error
      mockSupabaseClient.in.mockResolvedValueOnce({
        data: null,
        error: { message: 'Transaction fetch error', code: 'TX_ERROR' },
      })

      const request = createRequest({ transactionIds: ['tx-1'] })
      const context = createContext()

      await expect(POST(request, context)).rejects.toThrow('Transaction fetch error')
    })
  })

  describe('edge cases', () => {
    it('should handle partial transaction ID matches', async () => {
      const mockTransactions = [
        { id: 'tx-1', merchant: 'STARBUCKS', description: null },
        // tx-2 not found in database
      ]

      // Mock category fetch - eq() returns the promise
      mockSupabaseClient.eq.mockResolvedValueOnce({
        data: mockCategories,
        error: null,
      })

      // Mock transaction fetch - only 1 of 2 found - in() returns the promise
      mockSupabaseClient.in.mockResolvedValueOnce({
        data: mockTransactions,
        error: null,
      })

      vi.mocked(categorizeTransactions).mockReturnValue([
        {
          transactionId: 'tx-1',
          category_id: 'cat-1',
          confidence: 100,
          matchReason: 'Exact merchant match',
        },
      ])

      const request = createRequest({ transactionIds: ['tx-1', 'tx-2'] })
      const context = createContext()

      const response = await POST(request, context)
      const data = await response.json()

      // Should still return results for found transactions
      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
    })

    it('should handle user with no categories', async () => {
      const mockTransactions = [{ id: 'tx-1', merchant: 'STARBUCKS', description: null }]

      // Mock category fetch - empty categories - eq() returns empty
      mockSupabaseClient.eq.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      // Mock transaction fetch - in() returns the promise
      mockSupabaseClient.in.mockResolvedValueOnce({
        data: mockTransactions,
        error: null,
      })

      vi.mocked(categorizeTransactions).mockReturnValue([
        {
          transactionId: 'tx-1',
          category_id: null,
          confidence: 0,
          matchReason: 'No matching rule found',
        },
      ])

      const request = createRequest({ transactionIds: ['tx-1'] })
      const context = createContext()

      const response = await POST(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data[0].category_id).toBeNull()
    })
  })
})
