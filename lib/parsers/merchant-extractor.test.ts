import { describe, it, expect } from 'vitest'
import { extractMerchant } from './merchant-extractor'

describe('merchant-extractor', () => {
  it('should extract merchant name from start', () => {
    expect(extractMerchant('STARBUCKS STORE #1234')).toBe('STARBUCKS STORE')
    expect(extractMerchant('AMAZON.COM 123456')).toBe('AMAZON.COM')
  })

  it('should extract merchant name from "Purchase at" pattern', () => {
    expect(extractMerchant('Purchase at AMAZON.COM')).toBe('AMAZON.COM')
    expect(extractMerchant('Transaction at STARBUCKS')).toBe('STARBUCKS')
  })

  it('should extract merchant name from "POS DEBIT" pattern', () => {
    expect(extractMerchant('POS DEBIT AMAZON.COM')).toBe('AMAZON.COM')
    expect(extractMerchant('POS CREDIT TARGET STORE')).toBe('TARGET STORE')
  })

  it('should extract merchant from domain pattern', () => {
    expect(extractMerchant('NETFLIX.COM 123456')).toBe('NETFLIX.COM')
    expect(extractMerchant('PAYPAL.COM PAYMENT')).toBe('PAYPAL.COM')
  })

  it('should clean up merchant name', () => {
    expect(extractMerchant('  STARBUCKS   STORE  ')).toBe('STARBUCKS STORE')
  })

  it('should handle null/undefined', () => {
    expect(extractMerchant(null)).toBe('Unknown')
    expect(extractMerchant(undefined)).toBe('Unknown')
    expect(extractMerchant('')).toBe('Unknown')
  })

  it('should fallback to full description if no pattern matches', () => {
    const description = 'Some random transaction description'
    expect(extractMerchant(description)).toBe('Some random transaction description')
  })

  it('should remove common prefixes', () => {
    expect(extractMerchant('POS DEBIT STARBUCKS')).toBe('STARBUCKS')
    expect(extractMerchant('PURCHASE AMAZON.COM')).toBe('AMAZON.COM')
  })

  it('should limit length to 255 characters', () => {
    const longDescription = 'A'.repeat(300)
    const result = extractMerchant(longDescription)
    expect(result.length).toBeLessThanOrEqual(255)
  })
})
