'use client'

import { useEffect, useState } from 'react'
import { getCategories } from '@/lib/api/categories'
import type { Category } from '@/types/category'

export interface CategorySelectorProps {
  value: string | null
  onChange: (categoryId: string | null) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function CategorySelector({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a category',
  className = '',
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value
    onChange(selectedValue === '' ? null : selectedValue)
  }

  if (loading) {
    return (
      <select
        disabled
        className={`mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:disabled:bg-gray-700 ${className}`}
      >
        <option>Loading categories...</option>
      </select>
    )
  }

  if (error) {
    return (
      <div className={`text-sm text-red-600 dark:text-red-400 ${className}`}>
        {error}
      </div>
    )
  }

  return (
    <select
      value={value || ''}
      onChange={handleChange}
      disabled={disabled}
      className={`mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-700 ${className}`}
    >
      <option value="">Uncategorized</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  )
}
