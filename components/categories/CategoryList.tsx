'use client'

import { useEffect, useState } from 'react'
import { getCategories } from '@/lib/api/categories'
import { getBudgetStatus } from '@/lib/api/budgets'
import type { Category } from '@/types/category'
import type { BudgetStatus } from '@/types/budget'
import { getCurrentMonth } from '@/types/budget'
import { CategoryItem } from './CategoryItem'

interface CategoryListProps {
  onCategoryUpdate: () => void
  onOptimisticAddRef?: (addFn: (category: Category) => void) => void
  onRevertRef?: (revertFn: () => void) => void
}

export function CategoryList({ onCategoryUpdate, onOptimisticAddRef, onRevertRef }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<BudgetStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const [categoriesData, budgetsData] = await Promise.all([
        getCategories(),
        getBudgetStatus(getCurrentMonth()).catch(() => [] as BudgetStatus[]), // Silently fail if budgets can't be loaded
      ])
      setCategories(categoriesData)
      setBudgets(budgetsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Optimistic update helpers
  const optimisticallyAddCategory = (category: Category) => {
    setCategories((prev) => [...prev, category])
  }

  const optimisticallyUpdateCategory = (updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    )
  }

  const optimisticallyRemoveCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
  }

  // Expose optimistic add function and revert function to parent via ref callbacks
  useEffect(() => {
    if (onOptimisticAddRef) {
      onOptimisticAddRef(optimisticallyAddCategory)
    }
    if (onRevertRef) {
      onRevertRef(fetchCategories)
    }
  }, [onOptimisticAddRef, onRevertRef])

  // Refresh both categories and budgets when update is triggered
  const handleUpdate = () => {
    fetchCategories()
    onCategoryUpdate()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
        <p className="font-medium">Error loading categories</p>
        <p className="mt-1">{error}</p>
        <button
          onClick={fetchCategories}
          className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-gray-600 dark:text-gray-400">No categories yet.</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
          Create your first category to get started!
        </p>
      </div>
    )
  }

  // Create a map of category ID to budget for quick lookup
  const budgetMap = new Map(budgets.map((b) => [b.category_id, b]))

  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const budget = budgetMap.get(category.id)
        return (
          <CategoryItem
            key={category.id}
            category={category}
            budget={budget}
            onUpdate={handleUpdate}
            onOptimisticAdd={optimisticallyAddCategory}
            onOptimisticUpdate={optimisticallyUpdateCategory}
            onOptimisticRemove={optimisticallyRemoveCategory}
            onRevert={fetchCategories}
          />
        )
      })}
    </div>
  )
}
