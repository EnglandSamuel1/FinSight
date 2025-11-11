'use client'

interface UncategorizedBadgeProps {
  size?: 'sm' | 'md'
  variant?: 'default' | 'warning'
}

/**
 * UncategorizedBadge displays a visual indicator for transactions that need manual categorization
 *
 * Variants:
 * - default: Subtle gray badge
 * - warning: More prominent amber badge to draw attention
 */
export function UncategorizedBadge({
  size = 'sm',
  variant = 'default'
}: UncategorizedBadgeProps) {
  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-sm'

  const variantClasses = variant === 'warning'
    ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
    : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${variantClasses} ${sizeClasses}`}
      title="This transaction needs manual categorization"
    >
      <svg
        className="h-3 w-3"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      Uncategorized
    </span>
  )
}
