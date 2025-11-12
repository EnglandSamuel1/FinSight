'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { TransactionList } from '@/components/transactions/TransactionList'
import { CategorizationStatistics } from '@/components/transactions/CategorizationStatistics'
import { CategorySelector } from '@/components/transactions/CategorySelector'
import { getCategories } from '@/lib/api/categories'
import { getTransactionsClient } from '@/lib/api/transactions-client'
import type { Category } from '@/types/category'
import type { Transaction } from '@/types/transaction'

/**
 * Categorization Review Page
 * Provides an efficient interface for reviewing and correcting categorizations (AC: #1, #4)
 */
export default function CategorizePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('')
  const [showUncategorizedOnly, setShowUncategorizedOnly] = useState(true) // Default to true per AC #1
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>()

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        // Silently fail - categories are optional
      }
    }
    fetchCategories()
  }, [])

  // Fetch transactions with filters
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        setError(null)

        const filters: any = {}
        if (dateRange) {
          filters.startDate = dateRange.start
          filters.endDate = dateRange.end
        }
        if (selectedCategoryFilter) {
          filters.categoryId = selectedCategoryFilter
        }

        const data = await getTransactionsClient(filters)
        setTransactions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [selectedCategoryFilter, dateRange])

  // Apply uncategorized filter client-side (since API doesn't support it directly)
  const filteredTransactions = showUncategorizedOnly
    ? transactions.filter((tx) => !tx.category_id)
    : transactions

  const handleCategoryChange = async (transactionId: string, categoryId: string | null) => {
    // Optimistic update
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === transactionId ? { ...tx, category_id: categoryId } : tx))
    )

    // Trigger dashboard refresh if available
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('transaction-category-updated', {
          detail: { transactionIds: [transactionId], categoryId },
        })
      )
    }
  }

  const handleBulkCategoryChange = async (transactionIds: string[], categoryId: string | null) => {
    // Optimistic update
    setTransactions((prev) =>
      prev.map((tx) => (transactionIds.includes(tx.id) ? { ...tx, category_id: categoryId } : tx))
    )

    // Trigger dashboard refresh if available
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('transaction-category-updated', {
          detail: { transactionIds, categoryId },
        })
      )
    }
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Categorization Review
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Review and correct transaction categorizations
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-6">
          <CategorizationStatistics dateRange={dateRange} />
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category Filter
              </label>
              <CategorySelector
                value={selectedCategoryFilter || null}
                onChange={(categoryId) => setSelectedCategoryFilter(categoryId || '')}
                placeholder="All categories"
                className="w-full"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Range (Start)
              </label>
              <input
                type="date"
                value={dateRange?.start || ''}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    start: e.target.value,
                    end: prev?.end || '',
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Range (End)
              </label>
              <input
                type="date"
                value={dateRange?.end || ''}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    start: prev?.start || '',
                    end: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUncategorizedOnly}
                  onChange={(e) => setShowUncategorizedOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show uncategorized only
                </span>
              </label>
            </div>

            {(selectedCategoryFilter || dateRange || showUncategorizedOnly) && (
              <div>
                <button
                  onClick={() => {
                    setSelectedCategoryFilter('')
                    setDateRange(undefined)
                    setShowUncategorizedOnly(true)
                  }}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Transaction List */}
        <TransactionList
          transactions={filteredTransactions}
          onCategoryChange={handleCategoryChange}
          onBulkCategoryChange={handleBulkCategoryChange}
          filters={{
            categoryId: selectedCategoryFilter || undefined,
            dateRange,
            uncategorized: showUncategorizedOnly,
          }}
          sortBy="date"
          sortOrder="desc"
        />
      </div>
    </ProtectedRoute>
  )
}
