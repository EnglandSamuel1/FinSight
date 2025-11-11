import { describe, it, expect } from 'vitest'
import { parseCSVFile } from './csv-parser'

describe('csv-parser', () => {
  describe('parseCSVFile', () => {
    it('should parse Chase format CSV', async () => {
      const csv = `Transaction Date,Description,Amount
01/15/2024,STARBUCKS STORE #1234,-5.50
01/16/2024,AMAZON.COM,100.00`

      const result = await parseCSVFile(csv, 'chase.csv')

      expect(result.detectedFormat).toBe('chase')
      expect(result.successCount).toBe(2)
      expect(result.errorCount).toBe(0)
      expect(result.transactions).toHaveLength(2)
      expect(result.transactions[0].date).toBe('2024-01-15')
      expect(result.transactions[0].amount_cents).toBe(550)
      expect(result.transactions[0].merchant).toBe('STARBUCKS STORE')
      expect(result.transactions[0].transaction_type).toBe('debit')
    })

    it('should parse generic format CSV', async () => {
      const csv = `Date,Description,Amount
2024-01-15,Grocery Store,50.00
2024-01-16,Gas Station,-30.00`

      const result = await parseCSVFile(csv, 'transactions.csv')

      expect(result.successCount).toBe(2)
      expect(result.transactions).toHaveLength(2)
      expect(result.transactions[0].date).toBe('2024-01-15')
      expect(result.transactions[1].date).toBe('2024-01-16')
    })

    it('should handle missing required columns', async () => {
      const csv = `Column1,Column2
Value1,Value2`

      const result = await parseCSVFile(csv)

      expect(result.successCount).toBe(0)
      expect(result.errorCount).toBeGreaterThan(0)
      expect(result.errors.some((e) => e.message.includes('Date column not found'))).toBe(true)
    })

    it('should handle invalid date formats', async () => {
      const csv = `Date,Description,Amount
Invalid Date,Test,50.00
01/15/2024,Valid,30.00`

      const result = await parseCSVFile(csv)

      expect(result.successCount).toBe(1)
      expect(result.errorCount).toBe(1)
      expect(result.errors.some((e) => e.message.includes('date'))).toBe(true)
    })

    it('should handle invalid amount formats', async () => {
      const csv = `Date,Description,Amount
01/15/2024,Test,Invalid Amount
01/16/2024,Valid,50.00`

      const result = await parseCSVFile(csv)

      expect(result.successCount).toBe(1)
      expect(result.errorCount).toBe(1)
      expect(result.errors.some((e) => e.message.includes('amount'))).toBe(true)
    })

    it('should handle empty CSV', async () => {
      const result = await parseCSVFile('')

      expect(result.successCount).toBe(0)
      expect(result.errorCount).toBeGreaterThan(0)
      expect(result.errors.some((e) => e.message.includes('empty'))).toBe(true)
    })

    it('should handle CSV with only header', async () => {
      const csv = `Date,Description,Amount`

      const result = await parseCSVFile(csv)

      expect(result.successCount).toBe(0)
      expect(result.errorCount).toBeGreaterThan(0)
    })

    it('should parse amounts with parentheses as debits', async () => {
      const csv = `Date,Description,Amount
01/15/2024,Test,(50.00)
01/16/2024,Test,100.00`

      const result = await parseCSVFile(csv)

      expect(result.successCount).toBe(2)
      expect(result.transactions[0].transaction_type).toBe('debit')
      expect(result.transactions[1].transaction_type).toBe('credit')
    })

    it('should extract merchant names correctly', async () => {
      const csv = `Date,Description,Amount
01/15/2024,STARBUCKS STORE #1234,5.50
01/16/2024,Purchase at AMAZON.COM,100.00`

      const result = await parseCSVFile(csv)

      expect(result.transactions[0].merchant).toBe('STARBUCKS STORE')
      expect(result.transactions[1].merchant).toBe('AMAZON.COM')
    })

    it('should handle Buffer input', async () => {
      const csv = `Date,Description,Amount
01/15/2024,Test,50.00`
      const buffer = Buffer.from(csv, 'utf-8')

      const result = await parseCSVFile(buffer)

      expect(result.successCount).toBe(1)
    })
  })
})
