import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/api/route-handler', () => ({
  createRouteHandler: vi.fn((handler) => handler),
}))

vi.mock('@/lib/utils/duplicate-detection', () => ({
  findDuplicates: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { findDuplicates } from '@/lib/utils/duplicate-detection'

describe('POST /api/transactions/check-duplicates', () => {
  const createRequest = (body: unknown) => {
    return new NextRequest('http://localhost:3000/api/transactions/check-duplicates', {
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

  it('should check for duplicates successfully', async () => {
    const mockDuplicates = [
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
        duplicateHash: '2024-01-15|550|starbucks',
      },
    ]

    vi.mocked(findDuplicates).mockResolvedValue({
      duplicates: mockDuplicates,
      duplicateHashes: new Set(['2024-01-15|550|starbucks']),
    })

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
    expect(data.data.duplicateCount).toBe(1)
    expect(data.data.totalChecked).toBe(2)
    expect(data.data.duplicates).toHaveLength(1)
    expect(data.data.duplicates[0].existingTransactionId).toBe('existing-tx-1')
    expect(findDuplicates).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          date: '2024-01-15',
          amount_cents: 550,
          merchant: 'STARBUCKS',
        }),
      ]),
      'user-1'
    )
  })

  it('should return empty duplicates when none found', async () => {
    vi.mocked(findDuplicates).mockResolvedValue({
      duplicates: [],
      duplicateHashes: new Set(),
    })

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
    expect(data.data.duplicateCount).toBe(0)
    expect(data.data.totalChecked).toBe(1)
    expect(data.data.duplicates).toHaveLength(0)
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

  it('should return 400 for empty transaction array', async () => {
    const request = createRequest([])
    const context = createContext('user-1')

    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
  })
})
