'use client'

export interface TransactionTypeSelectorProps {
  value: 'expense' | 'income' | 'transfer'
  onChange: (type: 'expense' | 'income' | 'transfer') => void
  disabled?: boolean
  className?: string
  showLabel?: boolean
  showHelpText?: boolean
}

/**
 * TransactionTypeSelector Component
 *
 * Allows users to classify transactions as expense, income, or transfer.
 * - Expense: Spending (default) - counts towards spending in budgets
 * - Income: Revenue - tracked separately and included in income calculations
 * - Transfer: Excluded from spending calculations (e.g., credit card payments)
 */
export function TransactionTypeSelector({
  value,
  onChange,
  disabled = false,
  className = '',
  showLabel = true,
  showHelpText = false,
}: TransactionTypeSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as 'expense' | 'income' | 'transfer'
    onChange(selectedValue)
  }

  return (
    <div className={className}>
      {showLabel && (
        <label
          htmlFor="transaction-type"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Transaction Type
        </label>
      )}
      <select
        id="transaction-type"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-label="Transaction type"
        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-700"
      >
        <option value="expense">Expense (Spending)</option>
        <option value="income">Income (Revenue)</option>
        <option value="transfer">Transfer (Excluded)</option>
      </select>
      {showHelpText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Transfers are excluded from spending calculations. Income is tracked separately.
        </p>
      )}
    </div>
  )
}
