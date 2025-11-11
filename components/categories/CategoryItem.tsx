'use client'

import { useState, useEffect } from 'react'
import { updateCategory, deleteCategory } from '@/lib/api/categories'
import type { Category, UpdateCategoryInput } from '@/types/category'
import type { BudgetStatus } from '@/types/budget'
import { CategoryForm } from './CategoryForm'
import { BudgetInput } from '@/components/budget/BudgetInput'
import { BudgetDisplay } from '@/components/budget/BudgetDisplay'
import { getCurrentMonth, centsToDollars } from '@/types/budget'
import { toast } from '@/components/ui/toast'

interface CategoryItemProps {
  category: Category
  budget?: BudgetStatus | null
  onUpdate: () => void
  onOptimisticAdd?: (category: Category) => void
  onOptimisticUpdate?: (category: Category) => void
  onOptimisticRemove?: (categoryId: string) => void
  onRevert?: () => void
}

export function CategoryItem({
  category,
  budget: initialBudget,
  onUpdate,
  onOptimisticUpdate,
  onOptimisticRemove,
  onRevert,
}: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [budget, setBudget] = useState<BudgetStatus | null>(initialBudget || null)
  const [isLoadingBudget, setIsLoadingBudget] = useState(false)
  const [showBudgetInput, setShowBudgetInput] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleEditSuccess = (updatedCategory?: Category) => {
    setIsEditing(false)
    if (updatedCategory && onOptimisticUpdate) {
      // Optimistic update already applied, just refresh to sync
      onUpdate()
    } else {
      onUpdate()
    }
  }

  const handleDeleteClick = async () => {
    setDeleteError(null)
    
    // Check if category has transactions
    try {
      // We'll check this when we actually delete (the API returns this info)
      // For now, just show confirmation
      setShowDeleteConfirm(true)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to check category status')
    }
  }

  const handleDeleteConfirm = async () => {
    setDeleteError(null)
    setIsDeleting(true)

    // Optimistically remove category from UI
    const categoryId = category.id
    if (onOptimisticRemove) {
      onOptimisticRemove(categoryId)
    }

    try {
      const result = await deleteCategory(category.id)
      
      if (result.hadTransactions) {
        // Category had transactions, they've been set to null
        toast.info('Category deleted. Associated transactions are now uncategorized.')
      } else {
        toast.success('Category deleted successfully')
      }
      
      setShowDeleteConfirm(false)
      // Refresh to sync with server
      onUpdate()
    } catch (err) {
      // Revert optimistic update on error
      if (onRevert) {
        onRevert()
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category'
      setDeleteError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setDeleteError(null)
  }

  // Update budget when prop changes
  useEffect(() => {
    setBudget(initialBudget || null)
  }, [initialBudget])

  const handleBudgetSuccess = async () => {
    setShowBudgetInput(false)
    toast.success('Budget updated successfully')
    // Trigger parent update to reload budgets
    onUpdate()
  }

  if (isEditing) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Edit Category</h3>
        <CategoryForm
          category={category}
          onSuccess={handleEditSuccess}
          onCancel={handleCancelEdit}
          onOptimisticUpdate={onOptimisticUpdate}
          onRevert={onRevert}
        />
      </div>
    )
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {showDeleteConfirm ? (
        <div className="space-y-3">
          <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <p className="font-medium">Delete Category?</p>
            <p className="mt-1">
              Are you sure you want to delete &quot;{category.name}&quot;?
            </p>
            <p className="mt-1 text-xs">
              If this category has transactions, they will be uncategorized.
            </p>
          </div>
          {deleteError && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {deleteError}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                {budget && (
                  <span
                    className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    title="Budget set"
                    aria-label="Budget set"
                  >
                    ${centsToDollars(budget.amount_cents).toFixed(2)} budget
                  </span>
                )}
                {!budget && (
                  <span
                    className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    title="No budget set"
                    aria-label="No budget set"
                  >
                    No budget
                  </span>
                )}
              </div>
              {category.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                Created {new Date(category.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="ml-4 flex gap-2">
              <button
                onClick={handleEdit}
                aria-label={`Edit category ${category.name}`}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                aria-label={`Delete category ${category.name}`}
                className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Budget Section */}
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Budget ({(() => {
                  // Parse YYYY-MM format and create local date to avoid timezone issues
                  const [year, month] = getCurrentMonth().split('-').map(Number)
                  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                })()})
              </h4>
              {!showBudgetInput && (
                <button
                  onClick={() => setShowBudgetInput(true)}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {budget ? 'Update' : 'Set Budget'}
                </button>
              )}
            </div>

            {showBudgetInput ? (
              <BudgetInput
                categoryId={category.id}
                month={getCurrentMonth()}
                initialAmountCents={budget?.amount_cents}
                onSuccess={handleBudgetSuccess}
                onCancel={() => setShowBudgetInput(false)}
              />
            ) : isLoadingBudget ? (
              <p className="text-xs text-gray-500 dark:text-gray-500">Loading budget...</p>
            ) : budget ? (
              <BudgetDisplay budget={budget} onUpdate={handleBudgetSuccess} showEdit={false} showDelete={false} />
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-500">No budget set for this month</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
