export interface TransactionTypeBadgeProps {
  type: 'expense' | 'income' | 'transfer'
  className?: string
}

/**
 * TransactionTypeBadge Component
 *
 * Displays a visual badge indicating the transaction type with color coding:
 * - Expense: Gray (default spending)
 * - Income: Teal/Green (revenue)
 * - Transfer: Blue/Neutral (excluded from calculations)
 */
export function TransactionTypeBadge({ type, className = '' }: TransactionTypeBadgeProps) {
  const getBadgeStyle = (type: 'expense' | 'income' | 'transfer') => {
    switch (type) {
      case 'income':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
      case 'transfer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'expense':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getLabel = (type: 'expense' | 'income' | 'transfer') => {
    switch (type) {
      case 'income':
        return 'Income'
      case 'transfer':
        return 'Transfer'
      case 'expense':
      default:
        return 'Expense'
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getBadgeStyle(type)} ${className}`}
      title={`Transaction type: ${getLabel(type)}`}
    >
      {getLabel(type)}
    </span>
  )
}
