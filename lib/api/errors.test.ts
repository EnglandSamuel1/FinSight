import { describe, it, expect } from 'vitest'
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ServerError,
  RateLimitError,
  ApiError,
  createValidationError,
  createAuthenticationError,
  createNotFoundError,
  createServerError,
  createRateLimitError,
  isApiError,
} from './errors'

describe('API Error Classes', () => {
  describe('ApiError', () => {
    it('should create ApiError with message and status code', () => {
      const error = new ApiError('Test error', 400)

      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('ApiError')
      expect(error).toBeInstanceOf(Error)
    })

    it('should include optional error code', () => {
      const error = new ApiError('Test error', 400, 'TEST_CODE')

      expect(error.code).toBe('TEST_CODE')
    })
  })

  describe('ValidationError', () => {
    it('should create ValidationError with status 400', () => {
      const error = new ValidationError('Invalid input')

      expect(error.message).toBe('Invalid input')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error).toBeInstanceOf(ApiError)
    })

    it('should allow custom error code', () => {
      const error = new ValidationError('Invalid input', 'CUSTOM_CODE')

      expect(error.code).toBe('CUSTOM_CODE')
    })
  })

  describe('AuthenticationError', () => {
    it('should create AuthenticationError with status 401', () => {
      const error = new AuthenticationError()

      expect(error.message).toBe('Unauthorized')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('AUTHENTICATION_ERROR')
      expect(error).toBeInstanceOf(ApiError)
    })

    it('should allow custom message and code', () => {
      const error = new AuthenticationError('Custom auth error', 'CUSTOM_AUTH')

      expect(error.message).toBe('Custom auth error')
      expect(error.code).toBe('CUSTOM_AUTH')
    })
  })

  describe('NotFoundError', () => {
    it('should create NotFoundError with status 404', () => {
      const error = new NotFoundError()

      expect(error.message).toBe('Resource not found')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
      expect(error).toBeInstanceOf(ApiError)
    })

    it('should allow custom message and code', () => {
      const error = new NotFoundError('Custom not found', 'CUSTOM_NOT_FOUND')

      expect(error.message).toBe('Custom not found')
      expect(error.code).toBe('CUSTOM_NOT_FOUND')
    })
  })

  describe('ServerError', () => {
    it('should create ServerError with status 500', () => {
      const error = new ServerError()

      expect(error.message).toBe('Internal server error')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('SERVER_ERROR')
      expect(error).toBeInstanceOf(ApiError)
    })

    it('should allow custom message and code', () => {
      const error = new ServerError('Custom server error', 'CUSTOM_SERVER')

      expect(error.message).toBe('Custom server error')
      expect(error.code).toBe('CUSTOM_SERVER')
    })
  })

  describe('RateLimitError', () => {
    it('should create RateLimitError with status 429', () => {
      const error = new RateLimitError()

      expect(error.message).toBe('Too many requests')
      expect(error.statusCode).toBe(429)
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(error).toBeInstanceOf(ApiError)
    })

    it('should allow custom message and code', () => {
      const error = new RateLimitError('Custom rate limit', 'CUSTOM_RATE_LIMIT')

      expect(error.message).toBe('Custom rate limit')
      expect(error.code).toBe('CUSTOM_RATE_LIMIT')
    })
  })

  describe('Error Factory Functions', () => {
    it('createValidationError should create ValidationError', () => {
      const error = createValidationError('Invalid', 'CUSTOM')

      expect(error).toBeInstanceOf(ValidationError)
      expect(error.message).toBe('Invalid')
      expect(error.code).toBe('CUSTOM')
    })

    it('createAuthenticationError should create AuthenticationError', () => {
      const error = createAuthenticationError('Auth failed')

      expect(error).toBeInstanceOf(AuthenticationError)
      expect(error.message).toBe('Auth failed')
    })

    it('createNotFoundError should create NotFoundError', () => {
      const error = createNotFoundError('Not found')

      expect(error).toBeInstanceOf(NotFoundError)
      expect(error.message).toBe('Not found')
    })

    it('createServerError should create ServerError', () => {
      const error = createServerError('Server error')

      expect(error).toBeInstanceOf(ServerError)
      expect(error.message).toBe('Server error')
    })

    it('createRateLimitError should create RateLimitError', () => {
      const error = createRateLimitError('Rate limit')

      expect(error).toBeInstanceOf(RateLimitError)
      expect(error.message).toBe('Rate limit')
    })
  })

  describe('isApiError', () => {
    it('should return true for ApiError instances', () => {
      expect(isApiError(new ApiError('Test', 400))).toBe(true)
      expect(isApiError(new ValidationError('Test'))).toBe(true)
      expect(isApiError(new AuthenticationError())).toBe(true)
      expect(isApiError(new NotFoundError())).toBe(true)
      expect(isApiError(new ServerError())).toBe(true)
      expect(isApiError(new RateLimitError())).toBe(true)
    })

    it('should return false for non-ApiError instances', () => {
      expect(isApiError(new Error('Regular error'))).toBe(false)
      expect(isApiError('string')).toBe(false)
      expect(isApiError(null)).toBe(false)
      expect(isApiError(undefined)).toBe(false)
      expect(isApiError({})).toBe(false)
    })
  })
})
