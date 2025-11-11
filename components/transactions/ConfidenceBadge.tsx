'use client'

interface ConfidenceBadgeProps {
  confidence: number | null
  size?: 'sm' | 'md'
  showPercentage?: boolean
}

/**
 * ConfidenceBadge displays a visual indicator of categorization confidence
 *
 * Confidence levels:
 * - High (90-100%): Green badge
 * - Medium (70-89%): Yellow badge
 * - Low (0-69%): Orange badge
 * - null: Not displayed
 */
export function ConfidenceBadge({
  confidence,
  size = 'sm',
  showPercentage = true
}: ConfidenceBadgeProps) {
  // Don't render if no confidence value
  if (confidence === null || confidence === undefined) {
    return null
  }

  // Determine confidence level and styling
  const getConfidenceLevel = (conf: number): {
    label: string
    color: string
    bgColor: string
    borderColor: string
  } => {
    if (conf >= 90) {
      return {
        label: 'High',
        color: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        borderColor: 'border-green-300 dark:border-green-700'
      }
    } else if (conf >= 70) {
      return {
        label: 'Medium',
        color: 'text-yellow-700 dark:text-yellow-300',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        borderColor: 'border-yellow-300 dark:border-yellow-700'
      }
    } else {
      return {
        label: 'Low',
        color: 'text-orange-700 dark:text-orange-300',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        borderColor: 'border-orange-300 dark:border-orange-700'
      }
    }
  }

  const level = getConfidenceLevel(confidence)
  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${level.bgColor} ${level.borderColor} ${level.color} ${sizeClasses}`}
      title={`Categorization confidence: ${confidence}%`}
    >
      <svg
        className="h-3 w-3"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clipRule="evenodd"
        />
      </svg>
      {showPercentage ? `${confidence}%` : level.label}
    </span>
  )
}
