import { describe, it, expect } from 'vitest'
import { normalizeAmount, isValidAmount } from './amount-normalizer'

describe('amount-normalizer', () => {
  describe('normalizeAmount', () => {
    it('should parse simple dollar amounts', () => {
      const result = normalizeAmount('100.00')
      expect(result.amount_cents).toBe(10000)
      expect(result.transaction_type).toBe('credit')
    })

    it('should parse amounts with currency symbol', () => {
      const result1 = normalizeAmount('$100.50')
      expect(result1.amount_cents).toBe(10050)
      expect(result1.transaction_type).toBe('credit')

      const result2 = normalizeAmount('€50.25')
      expect(result2.amount_cents).toBe(5025)
    })

    it('should parse amounts with commas', () => {
      const result = normalizeAmount('$1,234.56')
      expect(result.amount_cents).toBe(123456)
      expect(result.transaction_type).toBe('credit')
    })

    it('should parse negative amounts as debits', () => {
      const result1 = normalizeAmount('-50.00')
      expect(result1.amount_cents).toBe(5000)
      expect(result1.transaction_type).toBe('debit')

      const result2 = normalizeAmount('-$100.00')
      expect(result2.amount_cents).toBe(10000)
      expect(result2.transaction_type).toBe('debit')
    })

    it('should parse parentheses as negative (debit)', () => {
      const result = normalizeAmount('(50.00)')
      expect(result.amount_cents).toBe(5000)
      expect(result.transaction_type).toBe('debit')
    })

    it('should parse amounts with whitespace', () => {
      const result = normalizeAmount('  $100.00  ')
      expect(result.amount_cents).toBe(10000)
    })

    it('should handle number input', () => {
      const result = normalizeAmount(100.50)
      expect(result.amount_cents).toBe(10050)
      expect(result.transaction_type).toBe('credit')
    })

    it('should round to cents correctly', () => {
      const result = normalizeAmount('100.999')
      expect(result.amount_cents).toBe(10100) // Rounded
    })

    it('should throw error for invalid amount', () => {
      expect(() => normalizeAmount('invalid')).toThrow()
      expect(() => normalizeAmount('')).toThrow()
    })
  })

  describe('isValidAmount', () => {
    it('should return true for valid amounts', () => {
      expect(isValidAmount('$100.00')).toBe(true)
      expect(isValidAmount('-50.00')).toBe(true)
      expect(isValidAmount('(25.50)')).toBe(true)
      expect(isValidAmount(100.50)).toBe(true)
    })

    it('should return false for invalid amounts', () => {
      expect(isValidAmount('invalid')).toBe(false)
      expect(isValidAmount('')).toBe(false)
    })
  })
})
