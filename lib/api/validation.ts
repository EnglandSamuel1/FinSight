import { z } from 'zod'
import { NextRequest } from 'next/server'
import { ValidationError } from './errors'

/**
 * Common validation schemas
 */
export const emailSchema = z.string().email('Invalid email format')

export const uuidSchema = z.string().uuid('Invalid UUID format')

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')

export const positiveIntegerSchema = z.number().int().positive('Must be a positive integer')

/**
 * Validate request body with Zod schema
 * 
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated data
 * @throws ValidationError if validation fails
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const errors = result.error.issues
      const messages = errors.map((err) => {
        const path = err.path.join('.')
        return path ? `${path}: ${err.message}` : err.message
      })
      throw new ValidationError(
        `Validation failed: ${messages.join(', ')}`,
        'VALIDATION_ERROR'
      )
    }

    return result.data
  } catch (err) {
    if (err instanceof ValidationError) {
      throw err
    }
    // Handle JSON parse errors
    if (err instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON in request body', 'INVALID_JSON')
    }
    throw new ValidationError('Failed to parse request body', 'PARSE_ERROR')
  }
}

/**
 * Validate query parameters with Zod schema
 * 
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated query params
 * @throws ValidationError if validation fails
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): T {
  const searchParams = request.nextUrl.searchParams
  const params = Object.fromEntries(searchParams.entries())

  // Convert string values to appropriate types based on schema
  const result = schema.safeParse(params)

  if (!result.success) {
    const errors = result.error.issues
    const messages = errors.map((err) => {
      const path = err.path.join('.')
      return path ? `${path}: ${err.message}` : err.message
    })
    throw new ValidationError(
      `Query validation failed: ${messages.join(', ')}`,
      'QUERY_VALIDATION_ERROR'
    )
  }

  return result.data
}
