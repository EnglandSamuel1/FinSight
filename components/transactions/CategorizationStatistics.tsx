'use client'

import { useEffect, useState } from 'react'
import {
  getCategorizationStatistics,
  type CategorizationStatistics as CategorizationStatisticsType,
} from '@/lib/api/categorization'

interface CategorizationStatisticsProps {
  dateRange?: { start: string; end: string }
  className?: string
}

/**
 * CategorizationStatistics component displays categorization statistics
 * including total transactions, categorized/uncategorized counts, average confidence,
 * and category distribution (AC: #4)
 */
export function CategorizationStatistics({
  dateRange,
  className = '',
}: CategorizationStatisticsProps) {
  const [statistics, setStatistics] = useState<CategorizationStatisticsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCategorizationStatistics({
          startDate: dateRange?.start,
          endDate: dateRange?.end,
        })
        setStatistics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [dateRange])

  if (loading) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-700"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div className="h-20 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30 ${className}`}>
        <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (!statistics) {
    return null
  }

  const categorizedPercentage =
    statistics.total > 0 ? Math.round((statistics.categorized / statistics.total) * 100) : 0

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Categorization Statistics
      </h2>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {statistics.total}
          </p>
        </div>

        <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/30">
          <p className="text-sm text-green-700 dark:text-green-400">Categorized</p>
          <p className="mt-1 text-2xl font-bold text-green-900 dark:text-green-300">
            {statistics.categorized}
          </p>
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            {categorizedPercentage}% of total
          </p>
        </div>

        <div className="rounded-md border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/30">
          <p className="text-sm text-orange-700 dark:text-orange-400">Uncategorized</p>
          <p className="mt-1 text-2xl font-bold text-orange-900 dark:text-orange-300">
            {statistics.uncategorized}
          </p>
          <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
            {100 - categorizedPercentage}% of total
          </p>
        </div>

        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30">
          <p className="text-sm text-blue-700 dark:text-blue-400">Avg Confidence</p>
          <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-300">
            {statistics.averageConfidence.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Categorization Progress Bar */}
      {statistics.total > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Categorization Progress
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {categorizedPercentage}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-green-500 transition-all duration-300 dark:bg-green-600"
              style={{ width: `${categorizedPercentage}%` }}
              role="progressbar"
              aria-valuenow={categorizedPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Category Distribution */}
      {statistics.categoryDistribution.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Category Distribution
          </h3>
          <div className="space-y-2">
            {statistics.categoryDistribution.map((item) => {
              const percentage =
                statistics.total > 0 ? Math.round((item.count / statistics.total) * 100) : 0
              return (
                <div key={item.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.categoryName}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-teal-500 transition-all duration-300 dark:bg-teal-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {statistics.categoryDistribution.length === 0 && statistics.total > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No categorized transactions to display distribution.
        </p>
      )}
    </div>
  )
}
