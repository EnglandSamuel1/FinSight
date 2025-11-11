'use client'

import { useState, useEffect } from 'react'
import { getBudgetStatus } from '@/lib/api/budgets'
import type { BudgetStatus } from '@/types/budget'
import { getCurrentMonth } from '@/types/budget'
import { BudgetDisplay } from './BudgetDisplay'

interface BudgetListProps {
  onBudgetUpdate?: () => void
}

export function BudgetList({ onBudgetUpdate }: BudgetListProps) {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([])
  const [month, setMonth] = useState<string>(getCurrentMonth())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBudgets = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getBudgetStatus(month)
      setBudgets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets')
      setBudgets([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBudgets()
  }, [month])

  const handleBudgetUpdate = () => {
    loadBudgets()
    onBudgetUpdate?.()
  }

  if (isLoading) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading budgets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900/20 dark:bg-red-900/10">
        <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        <button
          onClick={loadBudgets}
          className="mt-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-500 dark:hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Budgets</h2>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {budgets.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No budgets set for {(() => {
              // Parse YYYY-MM format and create local date to avoid timezone issues
              const [year, monthNum] = month.split('-').map(Number)
              return new Date(year, monthNum - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
            })()}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => (
            <BudgetDisplay
              key={budget.id}
              budget={budget}
              onUpdate={handleBudgetUpdate}
              showEdit={true}
              showDelete={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
