'use client'

import { useState } from 'react'
import { updateBudget, deleteBudget } from '@/lib/api/budgets'
import type { Budget, BudgetStatus } from '@/types/budget'
import { centsToDollars } from '@/types/budget'
import { BudgetInput } from './BudgetInput'

interface BudgetDisplayProps {
  budget: Budget | BudgetStatus
  onUpdate?: () => void
  showEdit?: boolean
  showDelete?: boolean
}

export function BudgetDisplay({
  budget,
  onUpdate,
  showEdit = true,
  showDelete = false,
}: BudgetDisplayProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasStatus = 'remainingCents' in budget && 'spentCents' in budget && 'percentageUsed' in budget
  const status = hasStatus ? (budget as BudgetStatus) : null

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setError(null)
  }

  const handleEditSuccess = () => {
    setIsEditing(false)
    onUpdate?.()
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this budget?')) {
      return
    }

    setError(null)
    setIsDeleting(true)

    try {
      await deleteBudget(budget.id)
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Edit Budget</h3>
        <BudgetInput
          categoryId={budget.category_id}
          month={budget.month.substring(0, 7)} // Convert YYYY-MM-DD to YYYY-MM
          initialAmountCents={budget.amount_cents}
          onSuccess={handleEditSuccess}
          onCancel={handleCancelEdit}
        />
      </div>
    )
  }

  const budgetAmount = centsToDollars(budget.amount_cents)
  const remainingAmount = status ? centsToDollars(status.remainingCents) : null
  const spentAmount = status ? centsToDollars(status.spentCents) : null
  const percentageUsed = status ? status.percentageUsed : null

  // Determine color based on percentage used
  const getProgressColor = () => {
    if (!percentageUsed) return 'bg-gray-200 dark:bg-gray-700'
    if (percentageUsed < 50) return 'bg-green-500'
    if (percentageUsed < 75) return 'bg-yellow-500'
    if (percentageUsed < 100) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getTextColor = () => {
    if (!percentageUsed) return 'text-gray-600 dark:text-gray-400'
    if (percentageUsed < 50) return 'text-green-700 dark:text-green-400'
    if (percentageUsed < 75) return 'text-yellow-700 dark:text-yellow-400'
    if (percentageUsed < 100) return 'text-orange-700 dark:text-orange-400'
    return 'text-red-700 dark:text-red-400'
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {error && (
        <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              Budget: ${budgetAmount.toFixed(2)}
            </h3>
            {showEdit && (
              <button
                onClick={handleEdit}
                className="ml-2 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Edit
              </button>
            )}
          </div>

          {status && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Spent:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${spentAmount!.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                <span
                  className={`font-medium ${
                    remainingAmount! >= 0
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}
                >
                  ${remainingAmount!.toFixed(2)}
                </span>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{percentageUsed!.toFixed(1)}% used</span>
                  <span>{percentageUsed! > 100 ? 'Over budget' : 'On track'}</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full ${getProgressColor()}`}
                    style={{
                      width: `${Math.min(percentageUsed!, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Month: {(() => {
              // Parse YYYY-MM-DD format and create local date to avoid timezone issues
              const [year, month] = budget.month.split('-').map(Number)
              return new Date(year, month - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
            })()}
          </p>
        </div>

        {showDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="ml-4 rounded-md border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  )
}
