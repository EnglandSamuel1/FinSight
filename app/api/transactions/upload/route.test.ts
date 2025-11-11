import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/api/route-handler', () => ({
  createRouteHandler: vi.fn((handler) => handler),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/parsers/csv-parser', () => ({
  parseCSVFile: vi.fn(),
}))

vi.mock('@/lib/api/transactions', () => ({
  createTransactions: vi.fn(),
}))

vi.mock('@/lib/utils/duplicate-detection', () => ({
  findDuplicates: vi.fn(),
  filterDuplicates: vi.fn((transactions) => transactions),
}))

describe('POST /api/transactions/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createFile = (name: string, size: number, type: string = 'text/csv'): File => {
    const blob = new Blob(['test content'], { type })
    const file = new File([blob], name, { type })
    // Override size property
    Object.defineProperty(file, 'size', { value: size, writable: false })
    return file
  }

  const createRequest = async (file: File | null) => {
    const formData = new FormData()
    if (file) {
      formData.append('file', file)
    }

    return new NextRequest('http://localhost:3000/api/transactions/upload', {
      method: 'POST',
      body: formData,
    })
  }

  const createContext = (userId: string = 'user-123') => ({
    requestId: 'req-123',
    userId,
    startTime: Date.now(),
  })

  it('should successfully upload a valid CSV file', async () => {
    const file = createFile('transactions.csv', 1024, 'text/csv')
    const request = await createRequest(file)
    const context = createContext()

    const response = await POST(request, context)
    expect(response.status).toBe(200)

    const json = await response.json()
    expect(json).toMatchObject({
      message: 'File uploaded successfully',
      fileName: 'transactions.csv',
      fileSize: 1024,
      fileType: 'text/csv',
    })
  })

  it('should return 400 when no file is provided', async () => {
    const request = await createRequest(null)
    const context = createContext()

    const response = await POST(request, context)
    expect(response.status).toBe(400)

    const json = await response.json()
    expect(json.error.message).toBe('No file provided')
    expect(json.error.code).toBe('MISSING_FILE')
  })

  it('should return 400 for non-CSV file', async () => {
    const file = createFile('document.pdf', 1024, 'application/pdf')
    const request = await createRequest(file)
    const context = createContext()

    const response = await POST(request, context)
    expect(response.status).toBe(400)

    const json = await response.json()
    expect(json.error.message).toContain('Invalid file type')
    expect(json.error.code).toBe('INVALID_FILE')
  })

  it('should return 400 for file without .csv extension', async () => {
    const file = createFile('transactions.txt', 1024, 'text/plain')
    const request = await createRequest(file)
    const context = createContext()

    const response = await POST(request, context)
    expect(response.status).toBe(400)

    const json = await response.json()
    expect(json.error.message).toContain('Invalid file type')
  })

  it('should accept CSV file with .csv extension even if MIME type is different', async () => {
    const file = createFile('transactions.csv', 1024, 'application/octet-stream')
    const request = await createRequest(file)
    const context = createContext()

    const response = await POST(request, context)
    expect(response.status).toBe(200)
  })

  it('should return 400 for file exceeding 10MB', async () => {
    const file = createFile('large.csv', 11 * 1024 * 1024, 'text/csv')
    const request = await createRequest(file)
    const context = createContext()

    const response = await POST(request, context)
    expect(response.status).toBe(400)

    const json = await response.json()
    expect(json.error.message).toContain('File size exceeds maximum')
    expect(json.error.message).toContain('10MB')
  })

  it('should return 400 for empty file', async () => {
    const file = createFile('empty.csv', 0, 'text/csv')
    const request = await createRequest(file)
    const context = createContext()

    const response = await POST(request, context)
    expect(response.status).toBe(400)

    const json = await response.json()
    expect(json.error.message).toContain('File is empty')
  })

  it('should return 401 when user is not authenticated', async () => {
    const file = createFile('transactions.csv', 1024, 'text/csv')
    const request = await createRequest(file)
    const context = createContext('')

    const response = await POST(request, context)
    expect(response.status).toBe(401)

    const json = await response.json()
    expect(json.error.message).toBe('Unauthorized')
  })

  it('should accept file at exactly 10MB limit', async () => {
    const file = createFile('max-size.csv', 10 * 1024 * 1024, 'text/csv')
    const request = await createRequest(file)
    const context = createContext()

    const response = await POST(request, context)
    expect(response.status).toBe(200)
  })

  it('should handle file with different CSV MIME types', async () => {
    const mimeTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv']

    for (const mimeType of mimeTypes) {
      const file = createFile('transactions.csv', 1024, mimeType)
      const request = await createRequest(file)
      const context = createContext()

      const response = await POST(request, context)
      expect(response.status).toBe(200)
    }
  })

  describe('Enhanced response format with dateRange', () => {
    it('should return comprehensive import summary with dateRange', async () => {
      const { parseCSVFile } = await import('@/lib/parsers/csv-parser')
      const { createTransactions } = await import('@/lib/api/transactions')
      const { findDuplicates } = await import('@/lib/utils/duplicate-detection')

      // Mock successful parse with multiple transactions
      vi.mocked(parseCSVFile).mockResolvedValue({
        transactions: [
          { date: '2024-01-15', amount_cents: 5000, merchant: 'Store A', description: 'Purchase' },
          { date: '2024-02-20', amount_cents: 3000, merchant: 'Store B', description: 'Purchase' },
          { date: '2024-01-10', amount_cents: 2000, merchant: 'Store C', description: 'Purchase' },
        ],
        errors: [],
        totalRows: 3,
        successCount: 3,
        errorCount: 0,
        detectedFormat: 'chase',
      })

      // Mock no duplicates found
      vi.mocked(findDuplicates).mockResolvedValue({
        duplicates: [],
        duplicateHashes: new Set(),
      })

      // Mock stored transactions with IDs
      vi.mocked(createTransactions).mockResolvedValue([
        { id: 'tx-1', date: '2024-01-15', amount_cents: 5000, merchant: 'Store A', description: 'Purchase', category_id: null, is_duplicate: false, user_id: 'user-123', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'tx-2', date: '2024-02-20', amount_cents: 3000, merchant: 'Store B', description: 'Purchase', category_id: null, is_duplicate: false, user_id: 'user-123', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'tx-3', date: '2024-01-10', amount_cents: 2000, merchant: 'Store C', description: 'Purchase', category_id: null, is_duplicate: false, user_id: 'user-123', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ])

      const file = createFile('transactions.csv', 1024, 'text/csv')
      const request = await createRequest(file)
      const context = createContext()

      const response = await POST(request, context)
      expect(response.status).toBe(200)

      const json = await response.json()

      // Verify comprehensive response structure
      expect(json).toMatchObject({
        message: 'File uploaded, parsed, and stored successfully',
        fileName: 'transactions.csv',
        fileSize: 1024,
        fileType: 'text/csv',
      })

      // Verify transactions array with IDs
      expect(json.transactions).toHaveLength(3)
      expect(json.transactions[0]).toHaveProperty('id')
      expect(json.transactions[1]).toHaveProperty('id')
      expect(json.transactions[2]).toHaveProperty('id')

      // Verify dateRange with minDate and maxDate
      expect(json.dateRange).toBeDefined()
      expect(json.dateRange.minDate).toBeTruthy()
      expect(json.dateRange.maxDate).toBeTruthy()

      // Verify date range is correct (min should be 2024-01-10, max should be 2024-02-20)
      const minDate = new Date(json.dateRange.minDate)
      const maxDate = new Date(json.dateRange.maxDate)
      expect(minDate.toISOString().split('T')[0]).toBe('2024-01-10')
      expect(maxDate.toISOString().split('T')[0]).toBe('2024-02-20')

      // Verify summary includes all counts
      expect(json.summary).toMatchObject({
        totalRows: 3,
        successCount: 3,
        errorCount: 0,
        storedCount: 3,
        duplicateCount: 0,
      })

      // Verify duplicates info
      expect(json.duplicates).toEqual([])
      expect(json.duplicateCount).toBe(0)

      // Verify errors
      expect(json.errors).toEqual([])

      // Verify detected format
      expect(json.detectedFormat).toBe('chase')
    })

    it('should return null dateRange when no transactions are stored', async () => {
      const { parseCSVFile } = await import('@/lib/parsers/csv-parser')
      const { createTransactions } = await import('@/lib/api/transactions')
      const { findDuplicates } = await import('@/lib/utils/duplicate-detection')

      // Mock parse with all errors
      vi.mocked(parseCSVFile).mockResolvedValue({
        transactions: [],
        errors: [
          { row: 1, column: 'date', message: 'Invalid date format', originalRow: {} },
          { row: 2, column: 'amount', message: 'Invalid amount', originalRow: {} },
        ],
        totalRows: 2,
        successCount: 0,
        errorCount: 2,
        detectedFormat: 'unknown',
      })

      // Mock no duplicates (since no valid transactions)
      vi.mocked(findDuplicates).mockResolvedValue({
        duplicates: [],
        duplicateHashes: new Set(),
      })

      // No transactions to store
      vi.mocked(createTransactions).mockResolvedValue([])

      const file = createFile('invalid.csv', 1024, 'text/csv')
      const request = await createRequest(file)
      const context = createContext()

      const response = await POST(request, context)
      expect(response.status).toBe(200)

      const json = await response.json()

      // Verify dateRange is null when no transactions stored
      expect(json.dateRange).toEqual({
        minDate: null,
        maxDate: null,
      })

      // Verify no transactions stored
      expect(json.transactions).toEqual([])
      expect(json.summary.storedCount).toBe(0)
      expect(json.summary.errorCount).toBe(2)

      // Verify errors are included
      expect(json.errors).toHaveLength(2)
      expect(json.errors[0]).toMatchObject({
        row: 1,
        column: 'date',
        message: 'Invalid date format',
      })
    })

    it('should include transaction IDs in response', async () => {
      const { parseCSVFile } = await import('@/lib/parsers/csv-parser')
      const { createTransactions } = await import('@/lib/api/transactions')
      const { findDuplicates } = await import('@/lib/utils/duplicate-detection')

      vi.mocked(parseCSVFile).mockResolvedValue({
        transactions: [
          { date: '2024-01-15', amount_cents: 5000, merchant: 'Store A', description: 'Purchase' },
        ],
        errors: [],
        totalRows: 1,
        successCount: 1,
        errorCount: 0,
        detectedFormat: 'chase',
      })

      vi.mocked(findDuplicates).mockResolvedValue({
        duplicates: [],
        duplicateHashes: new Set(),
      })

      vi.mocked(createTransactions).mockResolvedValue([
        {
          id: 'tx-abc-123',
          date: '2024-01-15',
          amount_cents: 5000,
          merchant: 'Store A',
          description: 'Purchase',
          category_id: null,
          is_duplicate: false,
          user_id: 'user-123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      const file = createFile('transactions.csv', 1024, 'text/csv')
      const request = await createRequest(file)
      const context = createContext()

      const response = await POST(request, context)
      const json = await response.json()

      // Verify transaction IDs are present
      expect(json.transactions).toHaveLength(1)
      expect(json.transactions[0].id).toBe('tx-abc-123')
    })

    it('should include detailed error information with row numbers', async () => {
      const { parseCSVFile } = await import('@/lib/parsers/csv-parser')
      const { findDuplicates } = await import('@/lib/utils/duplicate-detection')

      vi.mocked(parseCSVFile).mockResolvedValue({
        transactions: [
          { date: '2024-01-15', amount_cents: 5000, merchant: 'Store A', description: 'Purchase' },
        ],
        errors: [
          {
            row: 2,
            column: 'date',
            message: 'Invalid date format',
            originalRow: { date: 'invalid-date', amount: '50.00', merchant: 'Store B' }
          },
          {
            row: 3,
            column: 'amount',
            message: 'Amount is required',
            originalRow: { date: '2024-01-16', amount: '', merchant: 'Store C' }
          },
        ],
        totalRows: 3,
        successCount: 1,
        errorCount: 2,
        detectedFormat: 'chase',
      })

      vi.mocked(findDuplicates).mockResolvedValue({
        duplicates: [],
        duplicateHashes: new Set(),
      })

      const file = createFile('transactions.csv', 1024, 'text/csv')
      const request = await createRequest(file)
      const context = createContext()

      const response = await POST(request, context)
      const json = await response.json()

      // Verify detailed error information
      expect(json.errors).toHaveLength(2)
      expect(json.errors[0]).toMatchObject({
        row: 2,
        column: 'date',
        message: 'Invalid date format',
        originalRow: { date: 'invalid-date', amount: '50.00', merchant: 'Store B' }
      })
      expect(json.errors[1]).toMatchObject({
        row: 3,
        column: 'amount',
        message: 'Amount is required',
      })
    })
  })
})
