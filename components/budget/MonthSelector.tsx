'use client'

import { format } from 'date-fns'

interface MonthSelectorProps {
  selectedMonth: string // YYYY-MM format
  onMonthChange: (month: string) => void
  maxMonthsBack?: number // How many months back to allow (default: 12)
}

export function MonthSelector({
  selectedMonth,
  onMonthChange,
  maxMonthsBack = 12,
}: MonthSelectorProps) {
  // Generate list of months (current month + previous months)
  const generateMonthOptions = (): Array<{ value: string; label: string }> => {
    const options: Array<{ value: string; label: string }> = []
    const now = new Date()

    for (let i = 0; i < maxMonthsBack; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const value = `${year}-${month}`

      // Format as "November 2025"
      const label = format(date, 'MMMM yyyy')

      options.push({ value, label })
    }

    return options
  }

  const monthOptions = generateMonthOptions()

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onMonthChange(event.target.value)
  }

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="month-selector"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Month:
      </label>
      <select
        id="month-selector"
        value={selectedMonth}
        onChange={handleChange}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
      >
        {monthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
