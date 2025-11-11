'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/toast'
import { ImportStatus } from './ImportStatus'
import { ImportSummary } from './ImportSummary'
import { ConfidenceBadge } from './ConfidenceBadge'
import { UncategorizedBadge } from './UncategorizedBadge'
import type { ParseResult } from '@/types/parser'

type ImportStage = 'idle' | 'uploading' | 'parsing' | 'duplicates' | 'importing' | 'complete' | 'error'

interface UploadResponse {
  message: string
  fileName: string
  fileSize: number
  fileType: string
  transactions?: Array<{
    id?: string
    date: string
    amount_cents: number
    merchant: string
    description: string | null
    category_id?: string | null
    confidence?: number | null
    transaction_type?: 'debit' | 'credit'
  }>
  duplicates?: Array<{
    transaction: {
      date: string
      amount_cents: number
      merchant: string
      description: string | null
      category_id: string | null
      is_duplicate: boolean
    }
    existingTransactionId: string
  }>
  duplicateCount?: number
  errors?: Array<{
    row: number
    column?: string
    message: string
    originalRow?: Record<string, string>
  }>
  summary?: {
    totalRows: number
    successCount: number
    errorCount: number
    storedCount?: number
    duplicateCount?: number
  }
  categorizationSummary?: {
    categorized: number
    uncategorized: number
    averageConfidence: number
  }
  dateRange?: {
    minDate: string | null
    maxDate: string | null
  }
  detectedFormat?: string
}

export function TransactionUpload() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [duplicates, setDuplicates] = useState<UploadResponse['duplicates']>(null)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [importingDuplicates, setImportingDuplicates] = useState(false)
  const [importStage, setImportStage] = useState<ImportStage>('idle')
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    setError(null)
    setParseResult(null) // Clear previous results
    setSelectedFile(file)

    // Basic client-side validation
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Invalid file type. Only CSV files are allowed.')
      setSelectedFile(null)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(`File size exceeds maximum allowed size of 10MB. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      setSelectedFile(null)
      return
    }

    if (file.size === 0) {
      setError('File is empty. Please upload a valid CSV file.')
      setSelectedFile(null)
      return
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError(null)
    setImportStage('uploading')
    setUploadResponse(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(percentComplete)
          if (percentComplete === 100) {
            setImportStage('parsing')
          }
        }
      })

      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response: UploadResponse = JSON.parse(xhr.responseText)

            // Set duplicate detection stage if duplicates found
            if (response.duplicateCount && response.duplicateCount > 0) {
              setImportStage('duplicates')
            }

            // Simulate importing stage briefly
            setTimeout(() => {
              setImportStage('importing')
            }, 300)

            // Complete the import
            setTimeout(() => {
              setImportStage('complete')
              setUploadResponse(response)
              setUploading(false)

              // Check for duplicates
              if (response.duplicateCount && response.duplicateCount > 0 && response.duplicates) {
                // Show duplicate dialog
                setDuplicates(response.duplicates)
                setShowDuplicateDialog(true)

                // Display parsing results with duplicate info
                if (response.summary) {
                  const { storedCount, successCount, duplicateCount } = response.summary
                  const formatName = response.detectedFormat || 'unknown'

                  toast.info(
                    `File "${response.fileName}" parsed: ${storedCount || successCount} transactions imported, ${duplicateCount} duplicates found`,
                    { duration: 5000 }
                  )
                }
              } else {
                // No duplicates, proceed normally
                if (response.summary) {
                  const { successCount, errorCount, storedCount } = response.summary
                  const formatName = response.detectedFormat || 'unknown'

                  if (errorCount === 0) {
                    toast.success(`File "${response.fileName}" parsed successfully: ${storedCount || successCount} transactions imported (${formatName} format)`)
                  } else {
                    toast.info(`File "${response.fileName}" parsed with ${errorCount} error(s): ${storedCount || successCount} transactions imported (${formatName} format)`)
                  }

                  // Store parse result for display
                  setParseResult({
                    transactions: response.transactions || [],
                    errors: response.errors || [],
                    totalRows: response.summary.totalRows,
                    successCount: storedCount || successCount,
                    errorCount: errorCount,
                    detectedFormat: formatName,
                  })
                } else {
                  toast.success(`File "${response.fileName}" uploaded successfully`)
                }
              }
            }, 600)
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to parse response'
            setError(errorMessage)
            setImportStage('error')
            toast.error(errorMessage)
            setUploading(false)
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            const errorMessage = errorResponse.error?.message || `Upload failed with status ${xhr.status}`
            setError(errorMessage)
            setImportStage('error')
            toast.error(errorMessage)
          } catch (err) {
            const errorMessage = `Upload failed with status ${xhr.status}`
            setError(errorMessage)
            setImportStage('error')
            toast.error(errorMessage)
          }
          setUploading(false)
        }
      })

      // Handle errors
      xhr.addEventListener('error', () => {
        setError('Network error occurred during upload')
        setImportStage('error')
        toast.error('Network error occurred during upload')
        setUploading(false)
        setUploadProgress(0)
      })

      // Handle abort
      xhr.addEventListener('abort', () => {
        setUploading(false)
        setUploadProgress(0)
        setImportStage('idle')
      })

      // Open and send request
      xhr.open('POST', '/api/transactions/upload')
      xhr.send(formData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatAmount = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const handleImportDuplicates = async () => {
    if (!duplicates || duplicates.length === 0) {
      return
    }

    setImportingDuplicates(true)
    setError(null)

    try {
      // Prepare transactions for import (skipDuplicates=false means import them)
      const transactionsToImport = duplicates.map((dup) => ({
        date: dup.transaction.date,
        amount_cents: dup.transaction.amount_cents,
        merchant: dup.transaction.merchant,
        description: dup.transaction.description || null,
        category_id: dup.transaction.category_id || null,
        is_duplicate: true, // Mark as duplicate since they are
      }))

      const response = await fetch('/api/transactions?skipDuplicates=false', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionsToImport),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to import duplicates')
      }

      toast.success(`Successfully imported ${data.data.created} duplicate transaction(s)`)
      setShowDuplicateDialog(false)
      setDuplicates(null)
      setSelectedFile(null)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import duplicates'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setImportingDuplicates(false)
    }
  }

  const handleSkipDuplicates = () => {
    setShowDuplicateDialog(false)
    setDuplicates(null)
    setSelectedFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.info('Duplicates were skipped. Only new transactions were imported.')
  }

  const handleViewTransactions = () => {
    router.push('/transactions')
  }

  const handleStartNewUpload = () => {
    setSelectedFile(null)
    setUploadProgress(0)
    setImportStage('idle')
    setUploadResponse(null)
    setParseResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
            : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
        }`}
        role="region"
        aria-label="File upload area"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="File input"
        />

        <div className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg
              className="h-6 w-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isDragging ? 'Drop your CSV file here' : 'Drag and drop your CSV file here'}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              or{' '}
              <button
                type="button"
                onClick={handleBrowseClick}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                disabled={uploading}
              >
                browse files
              </button>
            </p>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            CSV files only, maximum size 10MB
          </p>
        </div>
      </div>

      {/* Selected File Display */}
      {selectedFile && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedFile.name}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            {!uploading && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null)
                  setError(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Remove file"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Import Status - Show during upload and after completion */}
      {(uploading || importStage !== 'idle') && importStage !== 'complete' && (
        <ImportStatus
          stage={importStage}
          progress={uploadProgress}
          duplicatesFound={uploadResponse?.duplicateCount}
          error={error || undefined}
        />
      )}

      {/* Import Summary - Show after successful completion */}
      {importStage === 'complete' && uploadResponse && uploadResponse.summary && (
        <ImportSummary
          totalImported={uploadResponse.summary.storedCount || uploadResponse.summary.successCount}
          dateRange={uploadResponse.dateRange}
          duplicatesFound={uploadResponse.summary.duplicateCount}
          errorCount={uploadResponse.summary.errorCount}
          errors={uploadResponse.errors}
          categorizationSummary={uploadResponse.categorizationSummary}
        />
      )}

      {/* Imported Transactions List */}
      {importStage === 'complete' &&
        uploadResponse &&
        uploadResponse.transactions &&
        uploadResponse.transactions.length > 0 && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Imported Transactions ({uploadResponse.transactions.length})
            </h3>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                      Merchant
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                      Category
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {uploadResponse.transactions.slice(0, 10).map((tx, index) => (
                    <tr key={tx.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
                        {tx.merchant}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-100">
                        {formatAmount(tx.amount_cents)}
                      </td>
                      <td className="px-3 py-2">
                        {tx.category_id && tx.confidence !== null && tx.confidence !== undefined ? (
                          <ConfidenceBadge confidence={tx.confidence} size="sm" />
                        ) : (
                          <UncategorizedBadge size="sm" />
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                        {tx.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {uploadResponse.transactions.length > 10 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  ...and {uploadResponse.transactions.length - 10} more transaction
                  {uploadResponse.transactions.length - 10 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

      {/* Action Buttons after successful import */}
      {importStage === 'complete' && uploadResponse && !showDuplicateDialog && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleViewTransactions}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            View All Transactions
          </button>
          <button
            type="button"
            onClick={handleStartNewUpload}
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Upload Another File
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && importStage === 'error' && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !uploading && !showDuplicateDialog && importStage === 'idle' && (
        <button
          type="button"
          onClick={handleUpload}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Upload File
        </button>
      )}

      {/* Duplicate Detection Dialog */}
      {showDuplicateDialog && duplicates && duplicates.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
              Duplicate Transactions Found
            </h3>
            <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
              {duplicates.length} duplicate transaction(s) were found and skipped. You can choose to import them anyway.
            </p>
          </div>

          {/* Duplicate Transactions List */}
          <div className="mb-4 max-h-64 overflow-y-auto rounded border border-yellow-200 bg-white dark:border-yellow-700 dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-yellow-100 dark:bg-yellow-900/30">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-yellow-900 dark:text-yellow-100">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-yellow-900 dark:text-yellow-100">
                    Merchant
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-yellow-900 dark:text-yellow-100">
                    Amount
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-yellow-900 dark:text-yellow-100">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-200 dark:divide-yellow-800">
                {duplicates.map((dup, index) => (
                  <tr key={index} className="bg-yellow-50/50 dark:bg-yellow-900/10">
                    <td className="px-3 py-2 text-yellow-900 dark:text-yellow-100">
                      {formatDate(dup.transaction.date)}
                    </td>
                    <td className="px-3 py-2 font-medium text-yellow-900 dark:text-yellow-100">
                      {dup.transaction.merchant}
                    </td>
                    <td className="px-3 py-2 text-right text-yellow-900 dark:text-yellow-100">
                      {formatAmount(dup.transaction.amount_cents)}
                    </td>
                    <td className="px-3 py-2 text-yellow-800 dark:text-yellow-200">
                      {dup.transaction.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkipDuplicates}
              className="flex-1 rounded-md border border-yellow-300 bg-white px-4 py-2 text-sm font-medium text-yellow-900 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:border-yellow-700 dark:bg-gray-800 dark:text-yellow-100 dark:hover:bg-gray-700"
            >
              Skip Duplicates
            </button>
            <button
              type="button"
              onClick={handleImportDuplicates}
              disabled={importingDuplicates}
              className="flex-1 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-yellow-500 dark:hover:bg-yellow-600"
            >
              {importingDuplicates ? 'Importing...' : `Import ${duplicates.length} Duplicate(s)`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
