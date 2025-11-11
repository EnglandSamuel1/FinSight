import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/api/route-handler', () => ({
  createRouteHandler: vi.fn((handler) => handler),
}))

vi.mock('@/lib/api/transactions', () => ({
  createTransactions: vi.fn(),
  queryTransactions: vi.fn(),
}))

vi.mock('@/lib/utils/duplicate-detection', () => ({
  findDuplicates: vi.fn(),
  filterDuplicates: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { createTransactions, queryTransactions } from '@/lib/api/transactions'
import { findDuplicates, filterDuplicates } from '@/lib/utils/duplicate-detection'

describe('POST /api/transactions', () => {
  const createRequest = (body: unknown) => {
    return new NextRequest('http://localhost:3000/api/transactions', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
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

  it('should create transactions successfully', async () => {
    const mockTransactions = [
      {
        id: 'tx-1',
        user_id: 'user-1',
        date: '2024-01-15',
        amount_cents: 550,
        merchant: 'STARBUCKS',
        description: 'Coffee',
        category_id: null,
        is_duplicate: false,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      },
    ]

    vi.mocked(findDuplicates).mockResolvedValue({
      duplicates: [],
      duplicateHashes: new Set(),
    })
    vi.mocked(filterDuplicates).mockImplementation((transactions) => transactions)
    vi.mocked(createTransactions).mockResolvedValue(mockTransactions)

    const request = createRequest([
      {
        date: '2024-01-15',
        amount_cents: 550,
        merchant: 'STARBUCKS',
        description: 'Coffee',
      },
    ])
    const context = createContext('user-1')

    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.created).toBe(1)
    expect(data.data.duplicates).toBe(0)
    expect(data.data.transactions).toHaveLength(1)
    expect(findDuplicates).toHaveBeenCalled()
    expect(filterDuplicates).toHaveBeenCalled()
    expect(createTransactions).toHaveBeenCalled()
  })

  it('should handle duplicates and skip them by default', async () => {
    const mockTransactions = [
      {
        id: 'tx-1',
        user_id: 'user-1',
        date: '2024-01-15',
        amount_cents: 550,
        merchant: 'STARBUCKS',
        description: 'Coffee',
        category_id: null,
        is_duplicate: false,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      },
    ]

    const duplicateHash = '2024-01-15|550|starbucks'
    vi.mocked(findDuplicates).mockResolvedValue({
      duplicates: [
        {
          transaction: {
            date: '2024-01-15',
            amount_cents: 550,
            merchant: 'STARBUCKS',
            description: 'Coffee',
            category_id: null,
            is_duplicate: false,
          },
          existingTransactionId: 'existing-tx-1',
          duplicateHash,
        },
      ],
      duplicateHashes: new Set([duplicateHash]),
    })
    vi.mocked(filterDuplicates).mockImplementation((transactions, hashes) => {
      return transactions.filter((tx) => {
        const hash = `${tx.date}|${tx.amount_cents}|${tx.merchant.toLowerCase()}`
        return !hashes.has(hash)
      })
    })
    vi.mocked(createTransactions).mockResolvedValue(mockTransactions)

    const request = createRequest([
      {
        date: '2024-01-15',
        amount_cents: 550,
        merchant: 'STARBUCKS',
        description: 'Coffee',
      },
      {
        date: '2024-01-16',
        amount_cents: 2000,
        merchant: 'Target',
        description: 'Groceries',
      },
    ])
    const context = createContext('user-1')

    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.duplicates).toBe(1)
    expect(findDuplicates).toHaveBeenCalled()
    expect(filterDuplicates).toHaveBeenCalled()
  })

  it('should include duplicates when skipDuplicates is false', async () => {
    const mockTransactions = [
      {
        id: 'tx-1',
        user_id: 'user-1',
        date: '2024-01-15',
        amount_cents: 550,
        merchant: 'STARBUCKS',
        description: 'Coffee',
        category_id: null,
        is_duplicate: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      },
    ]

    const duplicateHash = '2024-01-15|550|starbucks'
    vi.mocked(findDuplicates).mockResolvedValue({
      duplicates: [
        {
          transaction: {
            date: '2024-01-15',
            amount_cents: 550,
            merchant: 'STARBUCKS',
            description: 'Coffee',
            category_id: null,
            is_duplicate: false,
          },
          existingTransactionId: 'existing-tx-1',
          duplicateHash,
        },
      ],
      duplicateHashes: new Set([duplicateHash]),
    })
    vi.mocked(filterDuplicates).mockImplementation((transactions, hashes, skipDuplicates) => {
      if (!skipDuplicates) {
        return transactions.map((tx) => ({
          ...tx,
          is_duplicate: hashes.has(`${tx.date}|${tx.amount_cents}|${tx.merchant.toLowerCase()}`),
        }))
      }
      return transactions.filter((tx) => {
        const hash = `${tx.date}|${tx.amount_cents}|${tx.merchant.toLowerCase()}`
        return !hashes.has(hash)
      })
    })
    vi.mocked(createTransactions).mockResolvedValue(mockTransactions)

    const request = new NextRequest('http://localhost:3000/api/transactions?skipDuplicates=false', {
      method: 'POST',
      body: JSON.stringify([
        {
          date: '2024-01-15',
          amount_cents: 550,
          merchant: 'STARBUCKS',
          description: 'Coffee',
        },
      ]),
      headers: { 'Content-Type': 'application/json' },
    })
    const context = createContext('user-1')

    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.duplicates).toBe(1)
    expect(filterDuplicates).toHaveBeenCalledWith(expect.any(Array), expect.any(Set), false)
  })

  it('should return 400 for invalid transaction data', async () => {
    const request = createRequest([
      {
        date: 'invalid-date',
        amount_cents: 'not-a-number',
      },
    ])
    const context = createContext('user-1')

    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
  })

  it('should return 401 if user not authenticated', async () => {
    const request = createRequest([
      {
        date: '2024-01-15',
        amount_cents: 550,
        merchant: 'STARBUCKS',
      },
    ])
    const context = createContext('')

    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })
})

describe('GET /api/transactions', () => {
  const createRequest = (searchParams?: Record<string, string>) => {
    const url = new URL('http://localhost:3000/api/transactions')
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }
    return new NextRequest(url.toString(), { method: 'GET' })
  }

  const createContext = (userId: string) => ({
    requestId: 'test-request-id',
    userId,
    startTime: Date.now(),
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should query transactions successfully', async () => {
    const mockTransactions = [
      {
        id: 'tx-1',
        user_id: 'user-1',
        date: '2024-01-15',
        amount_cents: 550,
        merchant: 'STARBUCKS',
        description: 'Coffee',
        category_id: null,
        is_duplicate: false,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      },
    ]

    vi.mocked(queryTransactions).mockResolvedValue(mockTransactions)

    const request = createRequest()
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
    expect(queryTransactions).toHaveBeenCalledWith('user-1', {})
  })

  it('should apply date range filter', async () => {
    vi.mocked(queryTransactions).mockResolvedValue([])

    const request = createRequest({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    })
    const context = createContext('user-1')

    await GET(request, context)

    expect(queryTransactions).toHaveBeenCalledWith('user-1', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    })
  })

  it('should apply category filter', async () => {
    vi.mocked(queryTransactions).mockResolvedValue([])

    const request = createRequest({
      categoryId: 'cat-123',
    })
    const context = createContext('user-1')

    await GET(request, context)

    expect(queryTransactions).toHaveBeenCalledWith('user-1', {
      categoryId: 'cat-123',
    })
  })

  it('should return 401 if user not authenticated', async () => {
    const request = createRequest()
    const context = createContext('')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })
})
