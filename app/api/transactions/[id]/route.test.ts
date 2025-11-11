import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT, DELETE } from './route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/api/route-handler', () => ({
  createRouteHandler: vi.fn((handler) => handler),
}))

vi.mock('@/lib/api/transactions', () => ({
  getTransactionById: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { getTransactionById, updateTransaction, deleteTransaction } from '@/lib/api/transactions'

describe('GET /api/transactions/[id]', () => {
  const createRequest = (transactionId: string) => {
    return new NextRequest(`http://localhost:3000/api/transactions/${transactionId}`, {
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

  it('should get transaction successfully', async () => {
    const mockTransaction = {
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
    }

    vi.mocked(getTransactionById).mockResolvedValue(mockTransaction)

    const request = createRequest('tx-1')
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('tx-1')
    expect(getTransactionById).toHaveBeenCalledWith('tx-1', 'user-1')
  })

  it('should return 404 if transaction not found', async () => {
    vi.mocked(getTransactionById).mockResolvedValue(null)

    const request = createRequest('tx-999')
    const context = createContext('user-1')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })

  it('should return 401 if user not authenticated', async () => {
    const request = createRequest('tx-1')
    const context = createContext('')

    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })
})

describe('PUT /api/transactions/[id]', () => {
  const createRequest = (transactionId: string, body: unknown) => {
    return new NextRequest(`http://localhost:3000/api/transactions/${transactionId}`, {
      method: 'PUT',
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

  it('should update transaction successfully', async () => {
    const mockUpdatedTransaction = {
      id: 'tx-1',
      user_id: 'user-1',
      date: '2024-01-15',
      amount_cents: 550,
      merchant: 'STARBUCKS UPDATED',
      description: 'Coffee',
      category_id: 'cat-1',
      is_duplicate: false,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T11:00:00Z',
    }

    vi.mocked(updateTransaction).mockResolvedValue(mockUpdatedTransaction)

    const request = createRequest('tx-1', {
      merchant: 'STARBUCKS UPDATED',
      category_id: 'cat-1',
    })
    const context = createContext('user-1')

    const response = await PUT(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.merchant).toBe('STARBUCKS UPDATED')
    expect(updateTransaction).toHaveBeenCalledWith(
      'tx-1',
      'user-1',
      expect.objectContaining({
        merchant: 'STARBUCKS UPDATED',
        category_id: 'cat-1',
      })
    )
  })

  it('should return 404 if transaction not found', async () => {
    vi.mocked(updateTransaction).mockRejectedValue(new Error('Transaction not found'))

    const request = createRequest('tx-999', { merchant: 'Updated' })
    const context = createContext('user-1')

    const response = await PUT(request, context)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })

  it('should allow setting category_id to null to uncategorize', async () => {
    const mockUpdatedTransaction = {
      id: 'tx-1',
      user_id: 'user-1',
      date: '2024-01-15',
      amount_cents: 550,
      merchant: 'STARBUCKS',
      description: 'Coffee',
      category_id: null,
      is_duplicate: false,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T11:00:00Z',
    }

    vi.mocked(updateTransaction).mockResolvedValue(mockUpdatedTransaction)

    const request = createRequest('tx-1', {
      category_id: null,
    })
    const context = createContext('user-1')

    const response = await PUT(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.category_id).toBeNull()
    expect(updateTransaction).toHaveBeenCalledWith(
      'tx-1',
      'user-1',
      expect.objectContaining({
        category_id: null,
      })
    )
  })

  it('should return 400 if category does not belong to user', async () => {
    vi.mocked(updateTransaction).mockRejectedValue(
      new Error('Category does not belong to the authenticated user')
    )

    const request = createRequest('tx-1', {
      category_id: 'cat-999',
    })
    const context = createContext('user-1')

    const response = await PUT(request, context)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
    expect(data.error.message).toContain('Category does not belong')
    expect(data.error.code).toBe('INVALID_CATEGORY_ID')
  })
})

describe('DELETE /api/transactions/[id]', () => {
  const createRequest = (transactionId: string) => {
    return new NextRequest(`http://localhost:3000/api/transactions/${transactionId}`, {
      method: 'DELETE',
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

  it('should delete transaction successfully', async () => {
    vi.mocked(deleteTransaction).mockResolvedValue(undefined)

    const request = createRequest('tx-1')
    const context = createContext('user-1')

    const response = await DELETE(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.success).toBe(true)
    expect(deleteTransaction).toHaveBeenCalledWith('tx-1', 'user-1')
  })

  it('should return 404 if transaction not found', async () => {
    vi.mocked(deleteTransaction).mockRejectedValue(new Error('Transaction not found'))

    const request = createRequest('tx-999')
    const context = createContext('user-1')

    const response = await DELETE(request, context)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })
})
