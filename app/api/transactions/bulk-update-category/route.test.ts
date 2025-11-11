import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/api/route-handler', () => ({
  createRouteHandler: vi.fn((handler) => handler),
}))

vi.mock('@/lib/api/transactions', () => ({
  bulkUpdateTransactionCategory: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { bulkUpdateTransactionCategory } from '@/lib/api/transactions'

describe('POST /api/transactions/bulk-update-category', () => {
  const createRequest = (body: unknown) => {
    return new NextRequest('http://localhost:3000/api/transactions/bulk-update-category', {
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

  it('should bulk update transaction categories successfully', async () => {
    const transactionIds = ['tx-1', 'tx-2', 'tx-3']
    const categoryId = 'cat-1'

    const mockTransactions = [
      {
        id: 'tx-1',
        user_id: 'user-1',
        date: '2024-01-15',
        amount_cents: 1000,
        merchant: 'Starbucks',
        description: 'Coffee',
        category_id: categoryId,
        confidence: null,
        is_duplicate: false,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T11:00:00Z',
      },
      {
        id: 'tx-2',
        user_id: 'user-1',
        date: '2024-01-16',
        amount_cents: 2000,
        merchant: 'Target',
        description: 'Groceries',
        category_id: categoryId,
        confidence: null,
        is_duplicate: false,
        created_at: '2024-01-16T10:00:00Z',
        updated_at: '2024-01-16T11:00:00Z',
      },
      {
        id: 'tx-3',
        user_id: 'user-1',
        date: '2024-01-17',
        amount_cents: 3000,
        merchant: 'Amazon',
        description: 'Shopping',
        category_id: categoryId,
        confidence: null,
        is_duplicate: false,
        created_at: '2024-01-17T10:00:00Z',
        updated_at: '2024-01-17T11:00:00Z',
      },
    ]

    vi.mocked(bulkUpdateTransactionCategory).mockResolvedValue(mockTransactions)

    const request = createRequest({
      transactionIds,
      category_id: categoryId,
    })
    const context = createContext('user-1')

    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.updated).toBe(3)
    expect(data.transactions).toHaveLength(3)
    expect(data.transactions[0].category_id).toBe(categoryId)
    expect(data.transactions[1].category_id).toBe(categoryId)
    expect(data.transactions[2].category_id).toBe(categoryId)
    expect(bulkUpdateTransactionCategory).toHaveBeenCalledWith(
      transactionIds,
      categoryId,
      'user-1'
    )
  })

  it('should handle uncategorizing transactions (category_id = null)', async () => {
    const transactionIds = ['tx-1', 'tx-2']

    const mockTransactions = [
      {
        id: 'tx-1',
        user_id: 'user-1',
        date: '2024-01-15',
        amount_cents: 1000,
        merchant: 'Starbucks',
        description: 'Coffee',
        category_id: null,
        confidence: null,
        is_duplicate: false,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T11:00:00Z',
      },
      {
        id: 'tx-2',
        user_id: 'user-1',
        date: '2024-01-16',
        amount_cents: 2000,
        merchant: 'Target',
        description: 'Groceries',
        category_id: null,
        confidence: null,
        is_duplicate: false,
        created_at: '2024-01-16T10:00:00Z',
        updated_at: '2024-01-16T11:00:00Z',
      },
    ]

    vi.mocked(bulkUpdateTransactionCategory).mockResolvedValue(mockTransactions)

    const request = createRequest({
      transactionIds,
      category_id: null,
    })
    const context = createContext('user-1')

    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.updated).toBe(2)
    expect(data.transactions).toHaveLength(2)
    expect(data.transactions[0].category_id).toBeNull()
    expect(data.transactions[1].category_id).toBeNull()
    expect(bulkUpdateTransactionCategory).toHaveBeenCalledWith(transactionIds, null, 'user-1')
  })

  it('should return 400 if transaction IDs do not belong to user', async () => {
    const transactionIds = ['tx-1', 'tx-2']
    const categoryId = 'cat-1'

    vi.mocked(bulkUpdateTransactionCategory).mockRejectedValue(
      new Error('One or more transaction IDs do not belong to the authenticated user')
    )

    const request = createRequest({
      transactionIds,
      category_id: categoryId,
    })
    const context = createContext('user-1')

    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(data.error.message).toContain('do not belong to the authenticated user')
    expect(data.error.code).toBe('INVALID_TRANSACTION_IDS')
  })

  it('should return 400 if category does not belong to user', async () => {
    const transactionIds = ['tx-1']
    const categoryId = 'cat-999'

    vi.mocked(bulkUpdateTransactionCategory).mockRejectedValue(
      new Error('Category does not belong to the authenticated user')
    )

    const request = createRequest({
      transactionIds,
      category_id: categoryId,
    })
    const context = createContext('user-1')

    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(data.error.message).toContain('Category does not belong to the authenticated user')
    expect(data.error.code).toBe('INVALID_CATEGORY_ID')
  })

  it('should return 401 if user not authenticated', async () => {
    const request = createRequest({
      transactionIds: ['tx-1'],
      category_id: 'cat-1',
    })
    const context = createContext('')

    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
    expect(data.error.message).toBe('Unauthorized')
  })

  it('should return 400 if validation fails (empty transactionIds)', async () => {
    const request = createRequest({
      transactionIds: [],
      category_id: 'cat-1',
    })
    const context = createContext('user-1')

    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(data.error.message).toContain('validation')
  })

  it('should return 400 if validation fails (invalid UUID)', async () => {
    const request = createRequest({
      transactionIds: ['invalid-id'],
      category_id: 'cat-1',
    })
    const context = createContext('user-1')

    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(data.error.message).toContain('validation')
  })
})
