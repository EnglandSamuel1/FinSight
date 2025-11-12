'use client'

import { useState, useEffect, useMemo, memo, useCallback } from 'react'
import { getTransactionsClient, bulkUpdateTransactionCategoryClient } from '@/lib/api/transactions-client'
import { getCategories } from '@/lib/api/categories'
import { getLearnedPatterns, type LearnedPattern } from '@/lib/api/categorization'
import { TransactionCategoryEditor } from './TransactionCategoryEditor'
import { CategorySelector } from './CategorySelector'
import { TransactionTypeSelector } from './TransactionTypeSelector'
import { ConfidenceBadge } from './ConfidenceBadge'
import { TransactionTypeBadge } from './TransactionTypeBadge'
import { Pagination } from './Pagination'
import { toast } from '@/components/ui/toast'
import type { Transaction } from '@/types/transaction'
import type { Category } from '@/types/category'
import { dollarsToCents } from '@/types/transaction'

export interface TransactionListProps {
  transactions?: Transaction[]
  onCategoryChange?: (transactionId: string, categoryId: string | null) => void
  onBulkCategoryChange?: (transactionIds: string[], categoryId: string | null) => void
  filters?: {
    categoryId?: string
    dateRange?: { start: string; end: string }
    uncategorized?: boolean
    search?: string
    amountRange?: { min: number; max: number }
  }
  sortBy?: 'date' | 'amount' | 'merchant' | 'category'
  sortOrder?: 'asc' | 'desc'
  className?: string
}

type SortField = 'date' | 'amount' | 'merchant' | 'category'
type SortOrder = 'asc' | 'desc'

export function TransactionList({
  transactions: providedTransactions,
  onCategoryChange,
  onBulkCategoryChange,
  filters: providedFilters,
  sortBy: providedSortBy = 'date',
  sortOrder: providedSortOrder = 'desc',
  className = '',
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(providedTransactions || [])
  const [categories, setCategories] = useState<Category[]>([])
  const [learnedPatterns, setLearnedPatterns] = useState<LearnedPattern[]>([])
  const [loading, setLoading] = useState(!providedTransactions)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortField>(providedSortBy)
  const [sortOrder, setSortOrder] = useState<SortOrder>(providedSortOrder)
  const [filters, setFilters] = useState(providedFilters || {})
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  const [bulkCategoryId, setBulkCategoryId] = useState<string | null>(null)
  const [bulkTransactionType, setBulkTransactionType] = useState<'expense' | 'income' | 'transfer' | undefined>(undefined)
  
  // Pagination state (AC: #1, #2 - server-side pagination for large lists)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalItems, setTotalItems] = useState(0)

  // Fetch transactions with server-side filtering and pagination
  const fetchTransactions = useCallback(async () => {
    if (providedTransactions) {
      setTransactions(providedTransactions)
      setLoading(false)
      setTotalItems(providedTransactions.length)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Build API filters for server-side filtering
      const apiFilters: any = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      }
      
      if (providedFilters?.dateRange) {
        apiFilters.startDate = providedFilters.dateRange.start
        apiFilters.endDate = providedFilters.dateRange.end
      }
      
      if (providedFilters?.categoryId) {
        apiFilters.categoryId = providedFilters.categoryId
      }
      
      if (providedFilters?.search) {
        apiFilters.search = providedFilters.search
      }
      
      if (providedFilters?.amountRange) {
        if (providedFilters.amountRange.min !== undefined) {
          apiFilters.minAmount = dollarsToCents(providedFilters.amountRange.min)
        }
        if (providedFilters.amountRange.max !== undefined) {
          apiFilters.maxAmount = dollarsToCents(providedFilters.amountRange.max)
        }
      }
      
      const data = await getTransactionsClient(apiFilters)
      setTransactions(data)
      
      // For now, we'll estimate total items based on returned data
      // In a real implementation, the API should return total count
      // If we got a full page, there might be more; if less, we're at the end
      if (data.length === itemsPerPage) {
        // Estimate: assume there are more (we'll need API to return total count for accuracy)
        setTotalItems((currentPage * itemsPerPage) + 1) // Conservative estimate
      } else {
        setTotalItems((currentPage - 1) * itemsPerPage + data.length)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions')
      setTransactions([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [providedTransactions, providedFilters, currentPage, itemsPerPage])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [providedFilters?.categoryId, providedFilters?.dateRange, providedFilters?.search, providedFilters?.amountRange])

  // Fetch categories for display and filtering
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        // Silently fail - categories are optional for display
      }
    }
    fetchCategories()
  }, [])

  // Fetch learned patterns for indicators
  useEffect(() => {
    const fetchLearnedPatterns = async () => {
      try {
        const data = await getLearnedPatterns()
        setLearnedPatterns(data)
      } catch (err) {
        // Silently fail - learned patterns are optional for display
      }
    }
    fetchLearnedPatterns()
  }, [])

  // Helper to check if transaction matches a learned pattern
  const matchesLearnedPattern = (transaction: Transaction): boolean => {
    if (!transaction.category_id || learnedPatterns.length === 0) {
      return false
    }

    const normalizedMerchant = transaction.merchant.toLowerCase().trim().replace(/\s+/g, ' ')

    return learnedPatterns.some((pattern) => {
      // Check if category matches
      if (pattern.category_id !== transaction.category_id) {
        return false
      }

      const patternNormalized = pattern.merchant_pattern.toLowerCase().trim()

      // Exact match
      if (patternNormalized === normalizedMerchant) {
        return true
      }

      // Partial match (merchant contains pattern or pattern contains merchant)
      if (
        normalizedMerchant.includes(patternNormalized) ||
        patternNormalized.includes(normalizedMerchant)
      ) {
        return true
      }

      // Description keyword match
      if (transaction.description) {
        const normalizedDescription = transaction.description.toLowerCase().trim()
        if (normalizedDescription.includes(patternNormalized)) {
          return true
        }
      }

      return false
    })
  }

  // Format helpers
  const formatAmount = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const getCategoryName = (categoryId: string | null): string => {
    if (!categoryId) return 'Uncategorized'
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || 'Unknown'
  }

  // Filter transactions (client-side filtering only for uncategorized filter)
  // All other filtering is done server-side via API
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Apply uncategorized filter (client-side since API doesn't support it directly)
    if (providedFilters?.uncategorized) {
      filtered = filtered.filter((tx) => !tx.category_id)
    }

    return filtered
  }, [transactions, providedFilters?.uncategorized])

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions]
    sorted.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'amount':
          aValue = a.amount_cents
          bValue = b.amount_cents
          break
        case 'merchant':
          aValue = a.merchant.toLowerCase()
          bValue = b.merchant.toLowerCase()
          break
        case 'category':
          aValue = getCategoryName(a.category_id).toLowerCase()
          bValue = getCategoryName(b.category_id).toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [filteredTransactions, sortBy, sortOrder, categories])

  // Pagination (server-side, so we use transactions directly)
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedTransactions = sortedTransactions // Already paginated by server

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedTransactions.map((tx) => tx.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectTransaction = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Category change handler
  const handleCategoryChange = async (transactionId: string, categoryId: string | null) => {
    // Optimistic update
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === transactionId ? { ...tx, category_id: categoryId } : tx))
    )

    if (onCategoryChange) {
      try {
        await onCategoryChange(transactionId, categoryId)
      } catch (err) {
        // Revert on error
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === transactionId ? { ...tx, category_id: transactions.find((t) => t.id === transactionId)?.category_id || null } : tx))
        )
        throw err
      }
    }
  }

  // Bulk category update handler
  const handleBulkCategoryUpdate = async () => {
    if (selectedIds.size === 0 || (bulkCategoryId === undefined && bulkTransactionType === undefined)) return

    setIsBulkUpdating(true)
    const transactionIds = Array.from(selectedIds)

    try {
      if (onBulkCategoryChange) {
        await onBulkCategoryChange(transactionIds, bulkCategoryId || null)
      } else {
        await bulkUpdateTransactionCategoryClient(transactionIds, bulkCategoryId || null, bulkTransactionType)
        toast.success(`Updated ${transactionIds.length} transaction(s)`)
      }

      // Update local state
      setTransactions((prev) =>
        prev.map((tx) => {
          if (selectedIds.has(tx.id)) {
            const updates: Partial<Transaction> = {}
            if (bulkCategoryId !== undefined) {
              updates.category_id = bulkCategoryId
            }
            if (bulkTransactionType !== undefined) {
              updates.transaction_type = bulkTransactionType
            }
            return { ...tx, ...updates }
          }
          return tx
        })
      )

      // Clear selection
      setSelectedIds(new Set())
      setBulkCategoryId(null)
      setBulkTransactionType(undefined)

      // Trigger dashboard refresh if available
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('transaction-category-updated', {
          detail: { transactionIds, categoryId: bulkCategoryId, transactionType: bulkTransactionType }
        }))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update transactions'
      toast.error(errorMessage)
    } finally {
      setIsBulkUpdating(false)
    }
  }

  // Loading state with skeleton UI (AC: #2 - loading states)
  if (loading) {
    return (
      <div className={className}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="w-12 px-3 py-3 text-left"></th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Merchant</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-3 py-4">
                    <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 ml-auto"></div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`rounded-md bg-red-50 border border-red-200 p-4 ${className}`}>
        <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
      </div>
    )
  }

  // Empty state
  if (sortedTransactions.length === 0) {
    const hasFilters = providedFilters?.categoryId || providedFilters?.uncategorized || providedFilters?.dateRange || providedFilters?.search || providedFilters?.amountRange
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-600 dark:text-gray-400">
          {hasFilters
            ? 'No transactions found matching your filters. Try adjusting your filters or clearing them to see all transactions.'
            : 'No transactions found. Upload transactions to get started.'}
        </p>
      </div>
    )
  }

  const allSelected = sortedTransactions.length > 0 && selectedIds.size === sortedTransactions.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < sortedTransactions.length

  return (
    <div className={className}>
      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/30">
          <div className="mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-400">
              {selectedIds.size} transaction{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CategorySelector
              value={bulkCategoryId}
              onChange={setBulkCategoryId}
              disabled={isBulkUpdating}
              placeholder="Select category (optional)"
              className="w-56"
            />
            <TransactionTypeSelector
              value={bulkTransactionType || 'expense'}
              onChange={setBulkTransactionType}
              disabled={isBulkUpdating}
              showLabel={false}
              className="w-56"
            />
            <button
              onClick={handleBulkCategoryUpdate}
              disabled={isBulkUpdating || (bulkCategoryId === undefined && bulkTransactionType === undefined)}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isBulkUpdating ? 'Updating...' : 'Update'}
            </button>
            <button
              onClick={() => {
                setSelectedIds(new Set())
                setBulkCategoryId(null)
                setBulkTransactionType(undefined)
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="w-12 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('date')}
              >
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('amount')}
              >
                Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Type
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('merchant')}
              >
                Merchant {sortBy === 'merchant' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('category')}
              >
                Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {paginatedTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                isSelected={selectedIds.has(transaction.id)}
                onSelect={(checked: boolean) => handleSelectTransaction(transaction.id, checked)}
                onCategoryChange={(categoryId: string | null) => handleCategoryChange(transaction.id, categoryId)}
                matchesLearnedPattern={matchesLearnedPattern(transaction)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Component (AC: #1, #2 - server-side pagination) */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setItemsPerPage}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      )}
    </div>
  )
}

// Memoized Transaction Row Component (AC: #2 - prevent unnecessary re-renders)
interface TransactionRowProps {
  transaction: Transaction
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onCategoryChange: (categoryId: string | null) => Promise<void>
  matchesLearnedPattern: boolean
}

const TransactionRow = memo(function TransactionRow({
  transaction,
  isSelected,
  onSelect,
  onCategoryChange,
  matchesLearnedPattern,
}: TransactionRowProps) {
  const formatAmount = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <tr
      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <td className="px-3 py-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
        {formatDate(transaction.date)}
      </td>
      <td className="px-3 py-2 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
        {formatAmount(transaction.amount_cents)}
      </td>
      <td className="px-3 py-2">
        <TransactionTypeBadge type={transaction.transaction_type} />
      </td>
      <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        {transaction.merchant}
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <TransactionCategoryEditor
            transactionId={transaction.id}
            currentCategoryId={transaction.category_id}
            currentTransactionType={transaction.transaction_type}
            onUpdate={onCategoryChange}
            showUndo={true}
            className="min-w-[150px]"
          />
          <ConfidenceBadge confidence={transaction.confidence} size="sm" />
          {matchesLearnedPattern && (
            <span
              className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
              title="This transaction was categorized using a learned pattern"
            >
              Learned
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
        {transaction.description || '-'}
      </td>
    </tr>
  )
})
