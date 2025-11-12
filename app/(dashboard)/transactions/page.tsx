'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { TransactionList } from '@/components/transactions/TransactionList'
import { getCategories } from '@/lib/api/categories'
import type { Category } from '@/types/category'

export default function TransactionsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('')
  const [showUncategorizedOnly, setShowUncategorizedOnly] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('')
  const [minAmount, setMinAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState<string>('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        // Silently fail
      }
    }
    fetchCategories()
  }, [])

  // Debounce search input (AC: #3 - wait 300ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Don't set default date range - show all transactions by default
  // User can optionally filter by date range if needed

  // Parse amount range (convert from dollars to cents for API, but display in dollars)
  const amountRange = useCallback(() => {
    const min = minAmount.trim() ? parseFloat(minAmount) : undefined
    const max = maxAmount.trim() ? parseFloat(maxAmount) : undefined
    
    // Validate: min <= max if both are provided
    if (min !== undefined && max !== undefined && min > max) {
      return undefined // Invalid range, don't apply filter
    }
    
    if (min !== undefined && max !== undefined) {
      return { min, max }
    }
    return undefined
  }, [minAmount, maxAmount])

  const filters = {
    categoryId: selectedCategoryFilter || undefined,
    dateRange,
    uncategorized: showUncategorizedOnly || undefined,
    search: debouncedSearchQuery.trim() || undefined,
    amountRange: amountRange(),
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage your transactions. Edit categories inline or use bulk actions.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          {/* Search Input (AC: #1, #3 - searchable by merchant/description with debouncing) */}
          <div className="flex items-center gap-2">
            <label htmlFor="search-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Search:
            </label>
            <div className="relative">
              <input
                id="search-filter"
                type="text"
                placeholder="Merchant or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Clear search"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="category-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category:
            </label>
            <select
              id="category-filter"
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="uncategorized-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                id="uncategorized-filter"
                type="checkbox"
                checked={showUncategorizedOnly}
                onChange={(e) => setShowUncategorizedOnly(e.target.checked)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Uncategorized only
            </label>
          </div>

          {/* Amount Range Filter (AC: #1 - filterable by amount range) */}
          <div className="flex items-center gap-2">
            <label htmlFor="min-amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Min Amount ($):
            </label>
            <input
              id="min-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={minAmount}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                  setMinAmount(value)
                }
              }}
              className="w-24 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="max-amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Max Amount ($):
            </label>
            <input
              id="max-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={maxAmount}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                  setMaxAmount(value)
                }
              }}
              className="w-24 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              From:
            </label>
            <input
              id="start-date"
              type="date"
              value={dateRange?.start || ''}
              onChange={(e) =>
                setDateRange((prev) => ({
                  start: e.target.value,
                  end: prev?.end || '',
                }))
              }
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              To:
            </label>
            <input
              id="end-date"
              type="date"
              value={dateRange?.end || ''}
              onChange={(e) =>
                setDateRange((prev) => ({
                  start: prev?.start || '',
                  end: e.target.value,
                }))
              }
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {(selectedCategoryFilter || showUncategorizedOnly || dateRange || searchQuery || minAmount || maxAmount) && (
            <button
              onClick={() => {
                setSelectedCategoryFilter('')
                setShowUncategorizedOnly(false)
                setDateRange(undefined)
                setSearchQuery('')
                setMinAmount('')
                setMaxAmount('')
              }}
              className="ml-auto rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Transaction List */}
        <div className="rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <TransactionList filters={filters} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
