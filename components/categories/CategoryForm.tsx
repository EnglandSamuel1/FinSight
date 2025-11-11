'use client'

import { useState, FormEvent, useEffect } from 'react'
import { createCategory, updateCategory, checkCategoryNameUnique } from '@/lib/api/categories'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types/category'
import { toast } from '@/components/ui/toast'

interface CategoryFormProps {
  category?: Category
  onSuccess: (category?: Category) => void
  onCancel?: () => void
  onOptimisticUpdate?: (category: Category) => void
  onRevert?: () => void
}

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
  onOptimisticUpdate,
  onRevert,
}: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '')
  const [description, setDescription] = useState(category?.description || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  const isEditMode = !!category

  // Keyboard shortcut: Ctrl/Cmd + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        // Only submit if form is valid and not already loading
        if (!loading && !nameError && name.trim()) {
          const form = document.querySelector('form')
          if (form) {
            form.requestSubmit()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loading, nameError, name])

  // Validate name on blur
  const handleNameBlur = async () => {
    if (!name.trim()) {
      setNameError('Category name is required')
      return
    }

    if (name.trim().length > 100) {
      setNameError('Category name must be 100 characters or less')
      return
    }

    // Check uniqueness (only if name changed in edit mode)
    if (isEditMode && name.trim() !== category.name) {
      const isUnique = await checkCategoryNameUnique(name.trim(), category.id)
      if (!isUnique) {
        setNameError('Category with this name already exists')
        return
      }
    } else if (!isEditMode) {
      const isUnique = await checkCategoryNameUnique(name.trim())
      if (!isUnique) {
        setNameError('Category with this name already exists')
        return
      }
    }

    setNameError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setNameError(null)

    // Validate name
    if (!name.trim()) {
      setNameError('Category name is required')
      return
    }

    if (name.trim().length > 100) {
      setNameError('Category name must be 100 characters or less')
      return
    }

    if (description && description.length > 500) {
      setError('Description must be 500 characters or less')
      return
    }

    setLoading(true)

    // Optimistic update for edit mode
    if (isEditMode && onOptimisticUpdate) {
      const optimisticCategory: Category = {
        ...category,
        name: name.trim(),
        description: description.trim() || undefined,
        updatedAt: new Date().toISOString(),
      }
      onOptimisticUpdate(optimisticCategory)
    }

    try {
      if (isEditMode) {
        const input: UpdateCategoryInput = {}
        if (name.trim() !== category.name) {
          input.name = name.trim()
        }
        if (description !== category.description) {
          input.description = description.trim() || undefined
        }

        const updatedCategory = await updateCategory(category.id, input)
        toast.success('Category updated successfully')
        onSuccess(updatedCategory)
      } else {
        const input: CreateCategoryInput = {
          name: name.trim(),
          description: description.trim() || undefined,
        }

        // Optimistic update for create mode
        if (onOptimisticUpdate) {
          const optimisticCategory: Category = {
            id: `temp-${Date.now()}`, // Temporary ID
            name: input.name,
            description: input.description,
            userId: '', // Will be set by server
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          onOptimisticUpdate(optimisticCategory)
        }

        const newCategory = await createCategory(input)
        toast.success('Category created successfully')
        // Reset form after successful creation
        setName('')
        setDescription('')
        // Note: onSuccess will trigger refresh which replaces optimistic temp category with real one
        onSuccess(newCategory)
      }
    } catch (err) {
      // Revert optimistic update on error
      if (onRevert) {
        onRevert()
      }
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          required
          maxLength={100}
          disabled={loading}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
            nameError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {nameError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{nameError}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          disabled={loading}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description.length}/500 characters
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !!nameError}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {loading ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
