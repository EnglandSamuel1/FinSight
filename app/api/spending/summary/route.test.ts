/**
 * @vitest-environment node
 */
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

vi.mock('@/lib/supabase/utils', () => ({
  handleDatabaseError: vi.fn((error) => ({
    message: 'Database error',
    code: 'DB_ERROR',
  })),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock getCurrentMonth to return consistent test date
vi.mock('@/types/budget', () => ({
  getCurrentMonth: vi.fn(() => '2025-11'),
}))

import { createServerClient } from '@/lib/supabase/server'

describe('GET /api/spending/summary', () => {
  const createRequest = (queryParams?: Record<string, string>) => {
    const url = new URL('http://localhost:3000/api/spending/summary')
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }
    return new NextRequest(url, {
      method: 'GET',
    })
  }

  const createContext = (userId?: string) => ({
    requestId: 'test-request-id',
    userId,
    startTime: Date.now(),
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    const request = createRequest()
    const context = createContext(undefined)

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
    expect(data.error.message).toBe('Unauthorized')
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('should return spending summary for current month by default', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    }

    // Mock transactions query
    mockSupabase.lte.mockResolvedValueOnce({
      data: [
        { amount_cents: -5000, category_id: 'cat-1' }, // $50 spending in cat-1
        { amount_cents: -3000, category_id: 'cat-1' }, // $30 spending in cat-1
        { amount_cents: -2000, category_id: 'cat-2' }, // $20 spending in cat-2
        { amount_cents: 1000, category_id: 'cat-1' },  // $10 income (should be ignored)
      ],
      error: null,
    })

    // Mock categories query
    mockSupabase.in.mockResolvedValueOnce({
      data: [
        { id: 'cat-1', name: 'Food' },
        { id: 'cat-2', name: 'Transport' },
      ],
      error: null,
    })

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = createRequest()
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.total).toBe(10000) // $100 total (5000 + 3000 + 2000)
    expect(data.month).toBe('2025-11')
    expect(data.categories).toHaveLength(2)

    // Should be sorted by spending amount (highest first)
    expect(data.categories[0].categoryId).toBe('cat-1')
    expect(data.categories[0].categoryName).toBe('Food')
    expect(data.categories[0].amount).toBe(8000) // $80

    expect(data.categories[1].categoryId).toBe('cat-2')
    expect(data.categories[1].categoryName).toBe('Transport')
    expect(data.categories[1].amount).toBe(2000) // $20
  })

  it('should handle specific month parameter', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    }

    mockSupabase.lte.mockResolvedValueOnce({
      data: [
        { amount_cents: -1500, category_id: 'cat-1' },
      ],
      error: null,
    })

    mockSupabase.in.mockResolvedValueOnce({
      data: [{ id: 'cat-1', name: 'Food' }],
      error: null,
    })

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = createRequest({ month: '2025-10' })
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.month).toBe('2025-10')
    expect(data.total).toBe(1500)
  })

  it('should handle uncategorized transactions', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    }

    mockSupabase.lte.mockResolvedValueOnce({
      data: [
        { amount_cents: -5000, category_id: 'cat-1' },
        { amount_cents: -3000, category_id: null }, // Uncategorized
        { amount_cents: -2000, category_id: null }, // Uncategorized
      ],
      error: null,
    })

    mockSupabase.in.mockResolvedValueOnce({
      data: [{ id: 'cat-1', name: 'Food' }],
      error: null,
    })

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = createRequest()
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.total).toBe(10000) // $100 total
    expect(data.categories).toHaveLength(2)

    // Uncategorized should be included
    const uncategorized = data.categories.find((cat: any) => cat.categoryId === null)
    expect(uncategorized).toBeDefined()
    expect(uncategorized.categoryName).toBe('Uncategorized')
    expect(uncategorized.amount).toBe(5000) // $50
  })

  it('should return empty summary when no transactions exist', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
    }

    mockSupabase.lte.mockResolvedValueOnce({
      data: [],
      error: null,
    })

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = createRequest()
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.total).toBe(0)
    expect(data.categories).toHaveLength(0)
    expect(data.month).toBe('2025-11')
  })

  it('should ignore positive amounts (income) in spending calculation', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    }

    mockSupabase.lte.mockResolvedValueOnce({
      data: [
        { amount_cents: -5000, category_id: 'cat-1' }, // $50 spending
        { amount_cents: 10000, category_id: 'cat-1' }, // $100 income (should be ignored)
        { amount_cents: 3000, category_id: 'cat-2' },  // $30 income (should be ignored)
      ],
      error: null,
    })

    mockSupabase.in.mockResolvedValueOnce({
      data: [{ id: 'cat-1', name: 'Food' }],
      error: null,
    })

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = createRequest()
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.total).toBe(5000) // Only $50 spending, income ignored
    expect(data.categories).toHaveLength(1)
    expect(data.categories[0].amount).toBe(5000)
  })

  it('should return 400 for invalid month format', async () => {
    const request = createRequest({ month: 'invalid' })
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('should handle database error when fetching transactions', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
    }

    mockSupabase.lte.mockResolvedValueOnce({
      data: null,
      error: new Error('Database connection failed'),
    })

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = createRequest()
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeDefined()
    expect(data.error.message).toBe('Database error')
  })

  it('should handle database error when fetching categories', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    }

    // Transactions query succeeds
    mockSupabase.lte.mockResolvedValueOnce({
      data: [
        { amount_cents: -5000, category_id: 'cat-1' },
      ],
      error: null,
    })

    // Categories query fails
    mockSupabase.in.mockResolvedValueOnce({
      data: null,
      error: new Error('Database connection failed'),
    })

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = createRequest()
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeDefined()
    expect(data.error.message).toBe('Database error')
  })

  it('should handle categories with missing names gracefully', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    }

    mockSupabase.lte.mockResolvedValueOnce({
      data: [
        { amount_cents: -5000, category_id: 'cat-1' },
        { amount_cents: -3000, category_id: 'cat-unknown' }, // Category not in database
      ],
      error: null,
    })

    // Only return cat-1, not cat-unknown
    mockSupabase.in.mockResolvedValueOnce({
      data: [{ id: 'cat-1', name: 'Food' }],
      error: null,
    })

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = createRequest()
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.categories).toHaveLength(2)

    const unknownCategory = data.categories.find((cat: any) => cat.categoryId === 'cat-unknown')
    expect(unknownCategory).toBeDefined()
    expect(unknownCategory.categoryName).toBe('Unknown')
  })
})
