'use client'

import { useState, useEffect } from 'react'
import { createOrUpdateBudget } from '@/lib/api/budgets'
import { getCategories } from '@/lib/api/categories'
import type { Category } from '@/types/category'
import type { CreateBudgetInput } from '@/types/budget'
import { dollarsToCents, centsToDollars, getCurrentMonth } from '@/types/budget'
import { toast } from '@/components/ui/toast'

interface BudgetInputProps {
  categoryId?: string // Pre-select a category
  month?: string // Pre-select a month (YYYY-MM format)
  initialAmountCents?: number // Pre-fill amount
  onSuccess?: () => void
  onCancel?: () => void
}

export function BudgetInput({
  categoryId: initialCategoryId,
  month: initialMonth,
  initialAmountCents,
  onSuccess,
  onCancel,
}: BudgetInputProps) {
  const [categoryId, setCategoryId] = useState<string>(initialCategoryId || '')
  const [month, setMonth] = useState<string>(initialMonth || getCurrentMonth())
  const [amount, setAmount] = useState<string>(
    initialAmountCents ? centsToDollars(initialAmountCents).toFixed(2) : ''
  )
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoadingCategories(true)
        const cats = await getCategories()
        setCategories(cats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories')
      } finally {
        setIsLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!categoryId) {
      setError('Please select a category')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 0) {
      setError('Amount must be a positive number')
      return
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
      setError('Month must be in YYYY-MM format')
      return
    }

    setIsLoading(true)

    try {
      const input: CreateBudgetInput = {
        categoryId,
        month,
        amountCents: dollarsToCents(amountNum),
      }

      await createOrUpdateBudget(input)
      
      toast.success('Budget saved successfully')
      
      // Reset form
      if (!initialCategoryId) {
        setCategoryId('')
      }
      if (!initialAmountCents) {
        setAmount('')
      }

      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save budget'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={isLoadingCategories || !!initialCategoryId}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-700"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Month
        </label>
        <input
          type="month"
          id="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          disabled={isLoading}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-700"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Budget Amount ($)
        </label>
        <input
          type="number"
          id="amount"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading}
          required
          placeholder="0.00"
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-700"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading || isLoadingCategories}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {isLoading ? 'Saving...' : 'Save Budget'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
