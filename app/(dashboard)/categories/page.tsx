'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { CategoryList } from '@/components/categories/CategoryList'
import { CategoryForm } from '@/components/categories/CategoryForm'

export default function CategoriesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [optimisticAddFn, setOptimisticAddFn] = useState<((category: any) => void) | null>(null)
  const [categoryListRevertFn, setCategoryListRevertFn] = useState<(() => void) | null>(null)

  const handleCategoryUpdate = () => {
    // Trigger refresh of category list
    setRefreshKey((prev) => prev + 1)
    setShowCreateForm(false)
  }

  const handleCategoryCreateSuccess = (category?: any) => {
    handleCategoryUpdate()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N to create new category
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        if (!showCreateForm) {
          setShowCreateForm(true)
        }
      }
      // Escape to cancel form
      if (e.key === 'Escape' && showCreateForm) {
        setShowCreateForm(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCreateForm])

  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-4xl px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Category Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Create, edit, and delete your budget categories
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Press <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-mono dark:border-gray-600 dark:bg-gray-800">Ctrl/Cmd + N</kbd> to create a new category
            </p>
          </div>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              aria-label="Create new category"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Create Category
            </button>
          )}
        </div>

        {showCreateForm && (
          <div className="mb-6 rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
            <h2 className="mb-4 text-base font-medium text-gray-900 dark:text-white sm:text-lg">
              Create New Category
            </h2>
            <CategoryForm
              onSuccess={handleCategoryUpdate}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        <div>
          <h2 className="mb-4 text-base font-medium text-gray-900 dark:text-white sm:text-lg">
            Your Categories
          </h2>
          <CategoryList
            key={refreshKey}
            onCategoryUpdate={handleCategoryUpdate}
            onOptimisticAddRef={setOptimisticAddFn}
            onRevertRef={setCategoryListRevertFn}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}
