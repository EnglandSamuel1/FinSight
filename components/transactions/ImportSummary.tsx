'use client'

interface ImportSummaryProps {
  totalImported: number
  dateRange?: {
    minDate: string | null
    maxDate: string | null
  }
  duplicatesFound?: number
  errorCount?: number
  errors?: Array<{
    row: number
    column?: string
    message: string
    originalRow?: Record<string, string>
  }>
  categorizationSummary?: {
    categorized: number
    uncategorized: number
    averageConfidence: number
  }
}

export function ImportSummary({
  totalImported,
  dateRange,
  duplicatesFound = 0,
  errorCount = 0,
  errors = [],
  categorizationSummary,
}: ImportSummaryProps) {
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const hasErrors = errorCount > 0
  const hasDuplicates = duplicatesFound > 0
  const hasDateRange = dateRange?.minDate && dateRange?.maxDate
  const hasCategorization = !!categorizationSummary && totalImported > 0

  return (
    <div className="space-y-4">
      {/* Success Summary */}
      <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
        <div className="flex items-start space-x-3">
          <svg
            className="h-6 w-6 text-green-500 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Import Successful
            </h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {totalImported} transaction{totalImported !== 1 ? 's' : ''} imported successfully
            </p>
            {hasDateRange && (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Date range: {formatDate(dateRange.minDate)} - {formatDate(dateRange.maxDate)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Duplicates Warning (if any) */}
      {hasDuplicates && (
        <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="h-5 w-5 text-yellow-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Duplicates Detected
              </h3>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {duplicatesFound} duplicate transaction{duplicatesFound !== 1 ? 's were' : ' was'}{' '}
                skipped
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Summary (if any) */}
      {hasErrors && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="h-5 w-5 text-red-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Parsing Errors
              </h3>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {errorCount} row{errorCount !== 1 ? 's' : ''} could not be imported
              </p>
              {errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {errors.slice(0, 3).map((error, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-600 dark:text-gray-400 border-l-2 border-red-400 pl-2"
                    >
                      <span className="font-medium">Row {error.row}:</span> {error.message}
                      {error.column && (
                        <span className="text-gray-500 dark:text-gray-500"> ({error.column})</span>
                      )}
                    </div>
                  ))}
                  {errors.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 pl-2">
                      ...and {errors.length - 3} more error{errors.length - 3 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Categorization Summary (if available) */}
      {hasCategorization && (
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="h-5 w-5 text-blue-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 4.25A2.25 2.25 0 014.25 2h2.5A2.25 2.25 0 019 4.25v2.5A2.25 2.25 0 016.75 9h-2.5A2.25 2.25 0 012 6.75v-2.5zM2 13.25A2.25 2.25 0 014.25 11h2.5A2.25 2.25 0 019 13.25v2.5A2.25 2.25 0 016.75 18h-2.5A2.25 2.25 0 012 15.75v-2.5zM11 4.25A2.25 2.25 0 0113.25 2h2.5A2.25 2.25 0 0118 4.25v2.5A2.25 2.25 0 0115.75 9h-2.5A2.25 2.25 0 0111 6.75v-2.5zM15.25 11.75a.75.75 0 00-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Automatic Categorization
              </h3>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {categorizationSummary.categorized} of {totalImported} transactions automatically categorized
              </p>
              {categorizationSummary.uncategorized > 0 && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {categorizationSummary.uncategorized} transaction{categorizationSummary.uncategorized !== 1 ? 's' : ''} need{categorizationSummary.uncategorized === 1 ? 's' : ''} manual categorization
                </p>
              )}
              {categorizationSummary.averageConfidence > 0 && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Average confidence: {Math.round(categorizationSummary.averageConfidence)}%
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional Statistics */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Import Statistics
        </h3>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Imported</dt>
            <dd className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">
              {totalImported}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Duplicates</dt>
            <dd className="mt-1 text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              {duplicatesFound}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Errors</dt>
            <dd className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">
              {errorCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Total Rows</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {totalImported + duplicatesFound + errorCount}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
