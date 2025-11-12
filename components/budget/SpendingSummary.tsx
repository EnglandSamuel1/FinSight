'use client'

import { useState, useEffect } from 'react'
import { getSpendingSummary, type SpendingSummary as SpendingSummaryType } from '@/lib/api/spending'
import { centsToDollars } from '@/types/budget'

interface SpendingSummaryProps {
  month: string // YYYY-MM format
  onError?: (error: string) => void
}

export function SpendingSummary({ month, onError }: SpendingSummaryProps) {
  const [summary, setSummary] = useState<SpendingSummaryType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getSpendingSummary(month)
        setSummary(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load spending summary'
        setError(errorMessage)
        onError?.(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [month, onError])

  const formatAmount = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatPercentage = (amount: number, total: number): string => {
    if (total === 0) return '0%'
    return `${((amount / total) * 100).toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 dark:bg-gray-700"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-800 dark:bg-red-900/20">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
          Error Loading Spending Summary
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  if (summary.categories.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Spending Summary
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No spending data available for this month.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Monthly Financial Summary
      </h3>

      {/* Financial Metrics - Three Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Total Income */}
        <div className="p-4 rounded-md bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border border-teal-200 dark:border-teal-800">
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
            {formatAmount(summary.totalIncome)}
          </p>
        </div>

        {/* Total Spending */}
        <div className="p-4 rounded-md bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800">
          <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Total Spending</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">
            {formatAmount(summary.totalSpending)}
          </p>
        </div>

        {/* Leftover / Net Amount */}
        <div className={`p-4 rounded-md border ${
          summary.netAmount >= 0
            ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800'
            : 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800'
        }`}>
          <p className={`text-xs font-medium mb-1 ${
            summary.netAmount >= 0
              ? 'text-green-700 dark:text-green-400'
              : 'text-amber-700 dark:text-amber-400'
          }`}>
            {summary.netAmount >= 0 ? 'Leftover' : 'Deficit'}
          </p>
          <p className={`text-2xl font-bold ${
            summary.netAmount >= 0
              ? 'text-green-900 dark:text-green-100'
              : 'text-amber-900 dark:text-amber-100'
          }`}>
            {formatAmount(Math.abs(summary.netAmount))}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Spending by Category
        </h4>
        {summary.categories.map((category) => (
          <div
            key={category.categoryId || 'uncategorized'}
            className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-900"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {category.categoryName}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formatPercentage(category.amount, summary.totalSpending)} of total spending
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatAmount(category.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
