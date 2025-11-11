'use client'

interface ImportStatusProps {
  stage: 'uploading' | 'parsing' | 'duplicates' | 'importing' | 'complete' | 'error'
  progress?: number
  statusMessage?: string
  duplicatesFound?: number
  error?: string
}

export function ImportStatus({
  stage,
  progress = 0,
  statusMessage,
  duplicatesFound,
  error,
}: ImportStatusProps) {
  const getStageIcon = () => {
    switch (stage) {
      case 'uploading':
        return (
          <svg
            className="animate-spin h-5 w-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )
      case 'parsing':
      case 'duplicates':
      case 'importing':
        return (
          <svg
            className="animate-spin h-5 w-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )
      case 'complete':
        return (
          <svg
            className="h-5 w-5 text-green-500"
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
        )
      case 'error':
        return (
          <svg
            className="h-5 w-5 text-red-500"
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
        )
      default:
        return null
    }
  }

  const getStageLabel = () => {
    if (statusMessage) return statusMessage

    switch (stage) {
      case 'uploading':
        return 'Uploading file...'
      case 'parsing':
        return 'Parsing file...'
      case 'duplicates':
        return 'Detecting duplicates...'
      case 'importing':
        return 'Importing transactions...'
      case 'complete':
        return 'Import complete!'
      case 'error':
        return error || 'Import failed'
      default:
        return ''
    }
  }

  const getBackgroundColor = () => {
    switch (stage) {
      case 'complete':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div
      className={`rounded-lg border p-4 ${getBackgroundColor()}`}
      role="status"
      aria-live="polite"
      aria-busy={stage !== 'complete' && stage !== 'error'}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">{getStageIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {getStageLabel()}
          </p>
          {stage === 'uploading' && progress !== undefined && progress > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Upload progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}
          {stage === 'duplicates' && duplicatesFound !== undefined && duplicatesFound > 0 && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Found {duplicatesFound} potential duplicate{duplicatesFound !== 1 ? 's' : ''}
            </p>
          )}
          {stage === 'error' && error && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
