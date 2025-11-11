import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { handleApiError } from './error-handler'
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ServerError,
  RateLimitError,
} from './errors'
import { logger } from '@/lib/utils/logger'

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

describe('handleApiError', () => {
  const mockRequest = {
    nextUrl: { pathname: '/api/test' },
    method: 'POST',
  } as unknown as NextRequest

  const requestId = 'test-request-id'
  const userId = 'test-user-id'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ApiError handling', () => {
    it('should handle ValidationError correctly', async () => {
      const error = new ValidationError('Invalid input', 'VALIDATION_ERROR')
      const response = handleApiError(error, mockRequest, requestId, userId)

      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json).toEqual({
        error: {
          message: 'Invalid input',
          code: 'VALIDATION_ERROR',
        },
      })
      expect(logger.error).toHaveBeenCalledWith('API Error', {
        error: {
          message: 'Invalid input',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        },
        requestId,
        userId,
        path: '/api/test',
        method: 'POST',
      })
    })

    it('should handle AuthenticationError correctly', async () => {
      const error = new AuthenticationError('Unauthorized', 'AUTH_ERROR')
      const response = handleApiError(error, mockRequest, requestId, userId)

      expect(response.status).toBe(401)
      const json = await response.json()
      expect(json.error.message).toBe('Unauthorized')
      expect(json.error.code).toBe('AUTH_ERROR')
    })

    it('should handle NotFoundError correctly', async () => {
      const error = new NotFoundError('Not found', 'NOT_FOUND')
      const response = handleApiError(error, mockRequest, requestId)

      expect(response.status).toBe(404)
      const json = await response.json()
      expect(json.error.message).toBe('Not found')
    })

    it('should handle ServerError correctly', async () => {
      const error = new ServerError('Server error', 'SERVER_ERROR')
      const response = handleApiError(error, mockRequest, requestId, userId)

      expect(response.status).toBe(500)
      const json = await response.json()
      expect(json.error.message).toBe('Server error')
    })

    it('should handle RateLimitError correctly', async () => {
      const error = new RateLimitError('Too many requests', 'RATE_LIMIT')
      const response = handleApiError(error, mockRequest, requestId, userId)

      expect(response.status).toBe(429)
      const json = await response.json()
      expect(json.error.message).toBe('Too many requests')
    })
  })

  describe('Unexpected error handling', () => {
    it('should handle regular Error instances', async () => {
      const error = new Error('Unexpected error')
      const response = handleApiError(error, mockRequest, requestId, userId)

      expect(response.status).toBe(500)
      const json = await response.json()
      expect(json).toEqual({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
      expect(logger.error).toHaveBeenCalledWith('Unexpected API Error', {
        error: {
          message: 'Unexpected error',
          details: expect.stringContaining('Error: Unexpected error'),
        },
        requestId,
        userId,
        path: '/api/test',
        method: 'POST',
      })
    })

    it('should handle non-Error values', async () => {
      const error = 'String error'
      const response = handleApiError(error, mockRequest, requestId, userId)

      expect(response.status).toBe(500)
      const json = await response.json()
      expect(json.error.message).toBe('Internal server error')
      expect(logger.error).toHaveBeenCalledWith('Unexpected API Error', {
        error: {
          message: 'Internal server error',
          details: 'String error',
        },
        requestId,
        userId,
        path: '/api/test',
        method: 'POST',
      })
    })

    it('should handle null/undefined errors', async () => {
      const response = handleApiError(null, mockRequest, requestId, userId)

      expect(response.status).toBe(500)
      const json = await response.json()
      expect(json.error.message).toBe('Internal server error')
    })

    it('should not expose internal error details to client', async () => {
      const error = new Error('Sensitive internal error')
      const response = handleApiError(error, mockRequest, requestId, userId)

      const json = await response.json()
      expect(json.error.message).toBe('Internal server error')
      expect(json.error.message).not.toContain('Sensitive')
    })
  })

  describe('Logging context', () => {
    it('should include request context in logs', async () => {
      const error = new ValidationError('Test')
      handleApiError(error, mockRequest, requestId, userId)

      expect(logger.error).toHaveBeenCalledWith(
        'API Error',
        expect.objectContaining({
          requestId,
          userId,
          path: '/api/test',
          method: 'POST',
        })
      )
    })

    it('should handle missing userId', async () => {
      const error = new ValidationError('Test')
      handleApiError(error, mockRequest, requestId)

      expect(logger.error).toHaveBeenCalledWith(
        'API Error',
        expect.objectContaining({
          requestId,
          userId: undefined,
        })
      )
    })
  })
})
