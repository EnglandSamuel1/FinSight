import { describe, it, expect } from 'vitest'
import { success, error } from './response'

describe('API Response Helpers', () => {
  describe('success()', () => {
    it('should return success response with default status 200', async () => {
      const data = { message: 'Success' }
      const response = success(data)

      expect(response.status).toBe(200)
      const json = await response.json()
      expect(json).toEqual(data)
    })

    it('should return success response with custom status code', async () => {
      const data = { id: 123 }
      const response = success(data, 201)

      expect(response.status).toBe(201)
      const json = await response.json()
      expect(json).toEqual(data)
    })

    it('should return direct data without wrapper', async () => {
      const data = { user: { id: '123', email: 'test@example.com' } }
      const response = success(data)

      const json = await response.json()
      expect(json).toEqual(data)
      expect(json).not.toHaveProperty('data')
      expect(json).not.toHaveProperty('success')
    })

    it('should handle array data', async () => {
      const data = [{ id: 1 }, { id: 2 }]
      const response = success(data)

      const json = await response.json()
      expect(json).toEqual(data)
    })

    it('should handle null data', async () => {
      const response = success(null)

      const json = await response.json()
      expect(json).toBeNull()
    })
  })

  describe('error()', () => {
    it('should return error response with default status 500', async () => {
      const response = error('Something went wrong')

      expect(response.status).toBe(500)
      const json = await response.json()
      expect(json).toEqual({
        error: {
          message: 'Something went wrong',
        },
      })
    })

    it('should return error response with custom status code', async () => {
      const response = error('Not found', 404)

      expect(response.status).toBe(404)
      const json = await response.json()
      expect(json).toEqual({
        error: {
          message: 'Not found',
        },
      })
    })

    it('should include error code when provided', async () => {
      const response = error('Validation failed', 400, 'VALIDATION_ERROR')

      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json).toEqual({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
        },
      })
    })

    it('should not include code field when code is undefined', async () => {
      const response = error('Server error', 500)

      const json = await response.json()
      expect(json.error).not.toHaveProperty('code')
    })

    it('should follow consistent error format', async () => {
      const response = error('Test error', 401, 'AUTH_ERROR')

      const json = await response.json()
      expect(json).toHaveProperty('error')
      expect(json.error).toHaveProperty('message')
      expect(json.error).toHaveProperty('code')
      expect(typeof json.error.message).toBe('string')
      expect(typeof json.error.code).toBe('string')
    })
  })
})
