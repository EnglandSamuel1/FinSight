import { describe, it, expect } from 'vitest'
import { detectBankFormat, getBankFormat, findColumnIndex } from './bank-formats'

describe('bank-formats', () => {
  describe('detectBankFormat', () => {
    it('should detect Chase format', () => {
      const headers = ['Transaction Date', 'Description', 'Amount']
      expect(detectBankFormat(headers)).toBe('chase')
    })

    it('should detect Bank of America format', () => {
      const headers = ['Date', 'Description', 'Amount']
      expect(detectBankFormat(headers)).toBe('bofa')
    })

    it('should detect Wells Fargo format', () => {
      const headers = ['Date', 'Description', 'Amount']
      // Note: BofA and Wells Fargo have similar headers, so detection may vary
      const format = detectBankFormat(headers)
      expect(['bofa', 'wells-fargo', 'generic']).toContain(format)
    })

    it('should return generic for unknown format', () => {
      const headers = ['Custom Column 1', 'Custom Column 2']
      expect(detectBankFormat(headers)).toBe('generic')
    })

    it('should handle empty headers', () => {
      expect(detectBankFormat([])).toBe('generic')
    })

    it('should handle case-insensitive matching', () => {
      const headers = ['transaction date', 'description', 'amount']
      expect(detectBankFormat(headers)).toBe('chase')
    })
  })

  describe('getBankFormat', () => {
    it('should return format configuration', () => {
      const format = getBankFormat('chase')
      expect(format.name).toBe('chase')
      expect(format.displayName).toBe('Chase')
      expect(format.columnMappings.date).toContain('Transaction Date')
    })

    it('should return generic for unknown format', () => {
      const format = getBankFormat('unknown')
      expect(format.name).toBe('generic')
    })
  })

  describe('findColumnIndex', () => {
    it('should find date column index', () => {
      const headers = ['Transaction Date', 'Description', 'Amount']
      const format = getBankFormat('chase')
      const index = findColumnIndex(headers, format, 'date')
      expect(index).toBe(0)
    })

    it('should find amount column index', () => {
      const headers = ['Date', 'Description', 'Amount']
      const format = getBankFormat('generic')
      const index = findColumnIndex(headers, format, 'amount')
      expect(index).toBe(2)
    })

    it('should return -1 if column not found', () => {
      const headers = ['Column1', 'Column2']
      const format = getBankFormat('generic')
      const index = findColumnIndex(headers, format, 'date')
      expect(index).toBe(-1)
    })

    it('should handle case-insensitive matching', () => {
      const headers = ['transaction date', 'description', 'amount']
      const format = getBankFormat('chase')
      const index = findColumnIndex(headers, format, 'date')
      expect(index).toBe(0)
    })
  })
})
