import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { validateBody, validateQuery, emailSchema, uuidSchema, dateSchema, positiveIntegerSchema } from './validation'
import { ValidationError } from './errors'

describe('Validation Utilities', () => {
  describe('validateBody', () => {
    it('should validate valid request body', async () => {
      const schema = {
        parse: async (data: unknown) => ({ email: 'test@example.com', age: 25 }),
        safeParse: async (data: unknown) => ({
          success: true,
          data: { email: 'test@example.com', age: 25 },
        }),
      } as any

      const request = {
        json: async () => ({ email: 'test@example.com', age: 25 }),
      } as unknown as NextRequest

      const result = await validateBody(request, schema)
      expect(result).toEqual({ email: 'test@example.com', age: 25 })
    })

    it('should throw ValidationError for invalid body', async () => {
      const schema = {
        safeParse: async (data: unknown) => ({
          success: false,
          error: {
            issues: [
              { path: ['email'], message: 'Invalid email' },
              { path: ['age'], message: 'Must be positive' },
            ],
          },
        }),
      } as any

      const request = {
        json: async () => ({ email: 'invalid', age: -5 }),
      } as unknown as NextRequest

      await expect(validateBody(request, schema)).rejects.toThrow(ValidationError)
      await expect(validateBody(request, schema)).rejects.toThrow(/Validation failed/)
    })

    it('should include field paths in error messages', async () => {
      const schema = {
        safeParse: async (data: unknown) => ({
          success: false,
          error: {
            issues: [
              { path: ['user', 'email'], message: 'Invalid email' },
            ],
          },
        }),
      } as any

      const request = {
        json: async () => ({ user: { email: 'invalid' } }),
      } as unknown as NextRequest

      try {
        await validateBody(request, schema)
        expect.fail('Should have thrown ValidationError')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        if (error instanceof ValidationError) {
          expect(error.message).toContain('user.email')
        }
      }
    })

    it('should handle JSON parse errors', async () => {
      const schema = {} as any
      const request = {
        json: async () => {
          throw new SyntaxError('Unexpected token')
        },
      } as unknown as NextRequest

      await expect(validateBody(request, schema)).rejects.toThrow(ValidationError)
      await expect(validateBody(request, schema)).rejects.toThrow(/Invalid JSON/)
    })

    it('should handle other parse errors', async () => {
      const schema = {} as any
      const request = {
        json: async () => {
          throw new Error('Parse error')
        },
      } as unknown as NextRequest

      await expect(validateBody(request, schema)).rejects.toThrow(ValidationError)
      await expect(validateBody(request, schema)).rejects.toThrow(/Failed to parse/)
    })
  })

  describe('validateQuery', () => {
    it('should validate valid query parameters', () => {
      const schema = {
        safeParse: (data: unknown) => ({
          success: true,
          data: { page: 1, limit: 10 },
        }),
      } as any

      const request = {
        nextUrl: {
          searchParams: new URLSearchParams('page=1&limit=10'),
        },
      } as unknown as NextRequest

      const result = validateQuery(request, schema)
      expect(result).toEqual({ page: 1, limit: 10 })
    })

    it('should throw ValidationError for invalid query params', () => {
      const schema = {
        safeParse: (data: unknown) => ({
          success: false,
          error: {
            issues: [
              { path: ['page'], message: 'Must be positive' },
            ],
          },
        }),
      } as any

      const request = {
        nextUrl: {
          searchParams: new URLSearchParams('page=-1'),
        },
      } as unknown as NextRequest

      expect(() => validateQuery(request, schema)).toThrow(ValidationError)
      expect(() => validateQuery(request, schema)).toThrow(/Query validation failed/)
    })

    it('should handle empty query params', () => {
      const schema = {
        safeParse: (data: unknown) => ({
          success: true,
          data: {},
        }),
      } as any

      const request = {
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as unknown as NextRequest

      const result = validateQuery(request, schema)
      expect(result).toEqual({})
    })
  })

  describe('Common Validation Schemas', () => {
    describe('emailSchema', () => {
      it('should validate valid email', () => {
        expect(() => emailSchema.parse('test@example.com')).not.toThrow()
      })

      it('should reject invalid email', () => {
        expect(() => emailSchema.parse('invalid')).toThrow()
        expect(() => emailSchema.parse('@example.com')).toThrow()
        expect(() => emailSchema.parse('test@')).toThrow()
      })
    })

    describe('uuidSchema', () => {
      it('should validate valid UUID', () => {
        const validUUID = '550e8400-e29b-41d4-a716-446655440000'
        expect(() => uuidSchema.parse(validUUID)).not.toThrow()
      })

      it('should reject invalid UUID', () => {
        expect(() => uuidSchema.parse('not-a-uuid')).toThrow()
        expect(() => uuidSchema.parse('123')).toThrow()
      })
    })

    describe('dateSchema', () => {
      it('should validate valid date format', () => {
        expect(() => dateSchema.parse('2025-01-27')).not.toThrow()
      })

      it('should reject invalid date format', () => {
        expect(() => dateSchema.parse('01/27/2025')).toThrow()
        expect(() => dateSchema.parse('2025-1-27')).toThrow()
        expect(() => dateSchema.parse('invalid')).toThrow()
      })
    })

    describe('positiveIntegerSchema', () => {
      it('should validate positive integers', () => {
        expect(() => positiveIntegerSchema.parse(1)).not.toThrow()
        expect(() => positiveIntegerSchema.parse(100)).not.toThrow()
      })

      it('should reject negative numbers', () => {
        expect(() => positiveIntegerSchema.parse(-1)).toThrow()
        expect(() => positiveIntegerSchema.parse(0)).toThrow()
      })

      it('should reject non-integers', () => {
        expect(() => positiveIntegerSchema.parse(1.5)).toThrow()
        expect(() => positiveIntegerSchema.parse('1')).toThrow()
      })
    })
  })
})
