import { describe, it, expect } from 'vitest'
import { normalizeDate, isValidDate } from './date-normalizer'

describe('date-normalizer', () => {
  describe('normalizeDate', () => {
    it('should normalize MM/DD/YYYY format', () => {
      expect(normalizeDate('01/15/2024')).toBe('2024-01-15')
      expect(normalizeDate('12/31/2023')).toBe('2023-12-31')
    })

    it('should normalize YYYY-MM-DD format (ISO)', () => {
      expect(normalizeDate('2024-01-15')).toBe('2024-01-15')
      expect(normalizeDate('2023-12-31')).toBe('2023-12-31')
    })

    it('should normalize MM-DD-YYYY format', () => {
      expect(normalizeDate('01-15-2024')).toBe('2024-01-15')
    })

    it('should normalize DD/MM/YYYY format (European)', () => {
      expect(normalizeDate('15/01/2024')).toBe('2024-01-15')
    })

    it('should normalize M/D/YYYY format (no leading zeros)', () => {
      expect(normalizeDate('1/15/2024')).toBe('2024-01-15')
      expect(normalizeDate('12/5/2024')).toBe('2024-12-05')
    })

    it('should normalize 2-digit year formats', () => {
      expect(normalizeDate('01/15/24')).toBe('2024-01-15')
      expect(normalizeDate('12/31/23')).toBe('2023-12-31')
    })

    it('should handle whitespace', () => {
      expect(normalizeDate('  01/15/2024  ')).toBe('2024-01-15')
    })

    it('should throw error for invalid date', () => {
      expect(() => normalizeDate('invalid')).toThrow()
      expect(() => normalizeDate('13/45/2024')).toThrow()
      expect(() => normalizeDate('')).toThrow()
    })

    it('should throw error for empty string', () => {
      expect(() => normalizeDate('')).toThrow()
    })
  })

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate('01/15/2024')).toBe(true)
      expect(isValidDate('2024-01-15')).toBe(true)
      expect(isValidDate('1/15/2024')).toBe(true)
    })

    it('should return false for invalid dates', () => {
      expect(isValidDate('invalid')).toBe(false)
      expect(isValidDate('13/45/2024')).toBe(false)
      expect(isValidDate('')).toBe(false)
    })
  })
})
