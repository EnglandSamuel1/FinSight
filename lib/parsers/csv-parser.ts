import Papa from 'papaparse'
import { normalizeDate } from './date-normalizer'
import { normalizeAmount } from './amount-normalizer'
import { extractMerchant } from './merchant-extractor'
import { detectBankFormat, getBankFormat, findColumnIndex } from './bank-formats'
import type { ParseResult, ParsedTransaction, ParseError } from '@/types/parser'
import { logger } from '@/lib/utils/logger'

/**
 * Parse CSV file and extract transactions
 * 
 * @param fileContent - CSV file content as string or Buffer
 * @param fileName - Optional filename for format detection
 * @returns ParseResult with transactions and errors
 */
export async function parseCSVFile(
  fileContent: string | Buffer,
  fileName?: string
): Promise<ParseResult> {
  const content = typeof fileContent === 'string' ? fileContent : fileContent.toString('utf-8')

  if (!content || content.trim().length === 0) {
    return {
      transactions: [],
      errors: [
        {
          row: 0,
          message: 'CSV file is empty',
        },
      ],
      totalRows: 0,
      successCount: 0,
      errorCount: 1,
      detectedFormat: 'generic',
    }
  }

  // Parse CSV using Papa Parse
  const parseResult = Papa.parse<string[]>(content, {
    header: false, // We'll handle headers manually for format detection
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
    // Critical parsing error
    return {
      transactions: [],
      errors: parseResult.errors.map((err, index) => ({
        row: err.row !== undefined ? err.row + 1 : index + 1,
        column: err.type,
        message: err.message || 'CSV parsing error',
      })),
      totalRows: 0,
      successCount: 0,
      errorCount: parseResult.errors.length,
      detectedFormat: 'generic',
    }
  }

  if (parseResult.data.length === 0) {
    return {
      transactions: [],
      errors: [
        {
          row: 0,
          message: 'CSV file contains no data rows',
        },
      ],
      totalRows: 0,
      successCount: 0,
      errorCount: 1,
      detectedFormat: 'generic',
    }
  }

  // First row is header
  const headers = parseResult.data[0] || []
  const dataRows = parseResult.data.slice(1)

  // Detect bank format
  const detectedFormat = detectBankFormat(headers)
  const format = getBankFormat(detectedFormat)

  logger.info('CSV format detected', {
    format: detectedFormat,
    displayName: format.displayName,
    headers,
    fileName,
  })

  // Find column indices
  const dateIndex = findColumnIndex(headers, format, 'date')
  const amountIndex = findColumnIndex(headers, format, 'amount')
  const descriptionIndex = findColumnIndex(headers, format, 'description')
  const typeIndex = findColumnIndex(headers, format, 'type')

  // Validate required columns
  const errors: ParseError[] = []
  if (dateIndex === -1) {
    errors.push({
      row: 1,
      column: 'date',
      message: `Date column not found. Expected one of: ${format.columnMappings.date.join(', ')}`,
    })
  }
  if (amountIndex === -1) {
    errors.push({
      row: 1,
      column: 'amount',
      message: `Amount column not found. Expected one of: ${format.columnMappings.amount.join(', ')}`,
    })
  }
  if (descriptionIndex === -1) {
    errors.push({
      row: 1,
      column: 'description',
      message: `Description column not found. Expected one of: ${format.columnMappings.description.join(', ')}`,
    })
  }

  // If required columns are missing, return early
  if (dateIndex === -1 || amountIndex === -1 || descriptionIndex === -1) {
    return {
      transactions: [],
      errors,
      totalRows: parseResult.data.length,
      successCount: 0,
      errorCount: errors.length,
      detectedFormat,
    }
  }

  // Parse each data row
  const transactions: ParsedTransaction[] = []
  const rowErrors: ParseError[] = []

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    const rowNumber = i + 2 // +2 because header is row 1, and we're 0-indexed

    try {
      // Extract values
      const dateValue = row[dateIndex]?.trim() || ''
      const amountValue = row[amountIndex]?.trim() || ''
      const descriptionValue = row[descriptionIndex]?.trim() || ''
      const typeValue = typeIndex !== -1 ? row[typeIndex]?.trim() : undefined

      // Validate required fields
      if (!dateValue) {
        rowErrors.push({
          row: rowNumber,
          column: headers[dateIndex],
          message: 'Date is required',
          originalRow: Object.fromEntries(headers.map((h, idx) => [h, row[idx] || ''])),
        })
        continue
      }

      if (!amountValue) {
        rowErrors.push({
          row: rowNumber,
          column: headers[amountIndex],
          message: 'Amount is required',
          originalRow: Object.fromEntries(headers.map((h, idx) => [h, row[idx] || ''])),
        })
        continue
      }

      // Normalize date
      let normalizedDate: string
      try {
        normalizedDate = normalizeDate(dateValue)
      } catch (err) {
        rowErrors.push({
          row: rowNumber,
          column: headers[dateIndex],
          message: err instanceof Error ? err.message : 'Invalid date format',
          originalRow: Object.fromEntries(headers.map((h, idx) => [h, row[idx] || ''])),
        })
        continue
      }

      // Normalize amount
      let normalizedAmount: ReturnType<typeof normalizeAmount>
      try {
        normalizedAmount = normalizeAmount(amountValue)
      } catch (err) {
        rowErrors.push({
          row: rowNumber,
          column: headers[amountIndex],
          message: err instanceof Error ? err.message : 'Invalid amount format',
          originalRow: Object.fromEntries(headers.map((h, idx) => [h, row[idx] || ''])),
        })
        continue
      }

      // Extract merchant
      const merchant = extractMerchant(descriptionValue)

      // Build transaction
      const transaction: ParsedTransaction = {
        date: normalizedDate,
        amount_cents: normalizedAmount.amount_cents,
        merchant,
        description: descriptionValue || null,
        transaction_type: typeValue
          ? (typeValue.toLowerCase().includes('debit') || typeValue.toLowerCase().includes('withdrawal')
              ? 'debit'
              : 'credit')
          : normalizedAmount.transaction_type,
      }

      transactions.push(transaction)
    } catch (err) {
      // Unexpected error parsing row
      rowErrors.push({
        row: rowNumber,
        message: err instanceof Error ? err.message : 'Unexpected error parsing row',
        originalRow: Object.fromEntries(headers.map((h, idx) => [h, row[idx] || ''])),
      })
    }
  }

  // Combine header errors with row errors
  const allErrors = [...errors, ...rowErrors]

  logger.info('CSV parsing completed', {
    format: detectedFormat,
    totalRows: parseResult.data.length,
    successCount: transactions.length,
    errorCount: allErrors.length,
  })

  return {
    transactions,
    errors: allErrors,
    totalRows: parseResult.data.length,
    successCount: transactions.length,
    errorCount: allErrors.length,
    detectedFormat,
  }
}
