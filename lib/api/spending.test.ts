/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getSpendingSummary } from './spending'

describe('getSpendingSummary', () => {
  // Store original fetch
  const originalFetch = global.fetch

  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn()
  })

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch
  })

  it('should fetch spending summary successfully', async () => {
    const mockResponse = {
      total: 10000,
      categories: [
        { categoryId: 'cat-1', categoryName: 'Food', amount: 8000 },
        { categoryId: 'cat-2', categoryName: 'Transport', amount: 2000 },
      ],
      month: '2025-11',
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await getSpendingSummary()

    expect(global.fetch).toHaveBeenCalledWith('/api/spending/summary', {
      method: 'GET',
      credentials: 'include',
    })
    expect(result).toEqual(mockResponse)
  })

  it('should fetch spending summary with month parameter', async () => {
    const mockResponse = {
      total: 5000,
      categories: [
        { categoryId: 'cat-1', categoryName: 'Food', amount: 5000 },
      ],
      month: '2025-10',
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await getSpendingSummary('2025-10')

    expect(global.fetch).toHaveBeenCalledWith('/api/spending/summary?month=2025-10', {
      method: 'GET',
      credentials: 'include',
    })
    expect(result).toEqual(mockResponse)
  })

  it('should throw error on 401 unauthorized', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Unauthorized' } }),
    } as Response)

    await expect(getSpendingSummary()).rejects.toThrow('Unauthorized')
  })

  it('should throw error on 400 bad request', async () => {
    const errorMessage = 'Month must be in YYYY-MM format'
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: errorMessage } }),
    } as Response)

    await expect(getSpendingSummary('invalid')).rejects.toThrow(errorMessage)
  })

  it('should throw error on 500 server error', async () => {
    const errorMessage = 'Database error'
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: errorMessage } }),
    } as Response)

    await expect(getSpendingSummary()).rejects.toThrow(errorMessage)
  })

  it('should handle empty spending summary', async () => {
    const mockResponse = {
      total: 0,
      categories: [],
      month: '2025-11',
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await getSpendingSummary()

    expect(result.total).toBe(0)
    expect(result.categories).toHaveLength(0)
  })

  it('should handle uncategorized transactions', async () => {
    const mockResponse = {
      total: 10000,
      categories: [
        { categoryId: 'cat-1', categoryName: 'Food', amount: 5000 },
        { categoryId: null, categoryName: 'Uncategorized', amount: 5000 },
      ],
      month: '2025-11',
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await getSpendingSummary()

    expect(result.categories).toHaveLength(2)
    const uncategorized = result.categories.find((cat) => cat.categoryId === null)
    expect(uncategorized).toBeDefined()
    expect(uncategorized?.categoryName).toBe('Uncategorized')
  })
})
