import { error } from './response'

/**
 * Base API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Validation Error (400)
 * Used when request validation fails
 */
export class ValidationError extends ApiError {
  constructor(message: string, code?: string) {
    super(message, 400, code || 'VALIDATION_ERROR')
  }
}

/**
 * Authentication Error (401)
 * Used when user is not authenticated
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(message, 401, code || 'AUTHENTICATION_ERROR')
  }
}

/**
 * Not Found Error (404)
 * Used when resource is not found
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(message, 404, code || 'NOT_FOUND')
  }
}

/**
 * Server Error (500)
 * Used for unexpected server errors
 */
export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error', code?: string) {
    super(message, 500, code || 'SERVER_ERROR')
  }
}

/**
 * Too Many Requests Error (429)
 * Used when rate limit is exceeded
 */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests', code?: string) {
    super(message, 429, code || 'RATE_LIMIT_EXCEEDED')
  }
}

/**
 * Error factory functions
 */
export const createValidationError = (message: string, code?: string) =>
  new ValidationError(message, code)

export const createAuthenticationError = (message?: string, code?: string) =>
  new AuthenticationError(message, code)

export const createNotFoundError = (message?: string, code?: string) =>
  new NotFoundError(message, code)

export const createServerError = (message?: string, code?: string) =>
  new ServerError(message, code)

export const createRateLimitError = (message?: string, code?: string) =>
  new RateLimitError(message, code)

/**
 * Check if error is an ApiError instance
 */
export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}
