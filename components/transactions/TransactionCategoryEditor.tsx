'use client'

import { useState, useEffect } from 'react'
import { CategorySelector } from './CategorySelector'
import { updateTransactionClient } from '@/lib/api/transactions-client'
import { toast } from '@/components/ui/toast'

export interface TransactionCategoryEditorProps {
  transactionId: string
  currentCategoryId: string | null
  onUpdate?: (categoryId: string | null) => Promise<void>
  onSuccess?: () => void
  onError?: (error: Error) => void
  className?: string
  showUndo?: boolean
  undoHistoryLimit?: number
}

interface UndoEntry {
  transactionId: string
  previousCategoryId: string | null
  timestamp: number
}

// Global undo history (shared across all instances, limited to last 5 changes)
let undoHistory: UndoEntry[] = []
const MAX_UNDO_HISTORY = 5

export function TransactionCategoryEditor({
  transactionId,
  currentCategoryId,
  onUpdate,
  onSuccess,
  onError,
  className = '',
  showUndo = false,
  undoHistoryLimit = MAX_UNDO_HISTORY,
}: TransactionCategoryEditorProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(currentCategoryId)
  const [isSaving, setIsSaving] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  
  // Check for undo availability only on client side to avoid hydration mismatch
  useEffect(() => {
    if (showUndo && typeof window !== 'undefined') {
      const undoEntry = undoHistory.find((entry) => entry.transactionId === transactionId)
      setCanUndo(undoEntry !== undefined)
    }
  }, [showUndo, transactionId, selectedCategoryId]) // Re-check when category changes

  const handleCategoryChange = async (categoryId: string | null) => {
    // Optimistic UI update - update immediately
    setSelectedCategoryId(categoryId)

    // If category hasn't actually changed, don't make API call
    if (categoryId === currentCategoryId) {
      return
    }

    // Store previous category for undo
    const previousCategoryId = currentCategoryId
    setIsSaving(true)

    try {
      // If custom onUpdate handler is provided, use it
      if (onUpdate) {
        await onUpdate(categoryId)
      } else {
        // Otherwise, use default API call
        await updateTransactionClient(transactionId, { category_id: categoryId })
      }

      // Add to undo history
      if (showUndo) {
        // Remove existing entry for this transaction if any
        undoHistory = undoHistory.filter((entry) => entry.transactionId !== transactionId)
        // Add new entry
        undoHistory.unshift({
          transactionId,
          previousCategoryId,
          timestamp: Date.now(),
        })
        // Limit history size
        undoHistory = undoHistory.slice(0, undoHistoryLimit)
        // Update undo availability
        setCanUndo(true)
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      } else {
        // Default success feedback with learning message
        // Note: Learning happens automatically on the backend when category is changed
        toast.success('Category updated successfully. System learned from your correction.', 4000)
      }

      // Trigger dashboard refresh if available
      // When dashboard is implemented, it should listen to this event or use a context/state management solution
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('transaction-category-updated', {
          detail: { transactionId, categoryId }
        }))
      }
    } catch (err) {
      // Revert optimistic update on error
      setSelectedCategoryId(currentCategoryId)

      const error = err instanceof Error ? err : new Error('Failed to update category')
      
      // Call error callback if provided
      if (onError) {
        onError(error)
      } else {
        // Default error feedback
        toast.error(error.message || 'Failed to update category')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleUndo = async () => {
    const undoEntry = undoHistory.find((entry) => entry.transactionId === transactionId)
    if (!undoEntry) return

    const previousCategoryId = undoEntry.previousCategoryId
    setIsSaving(true)

    try {
      if (onUpdate) {
        await onUpdate(previousCategoryId)
      } else {
        await updateTransactionClient(transactionId, { category_id: previousCategoryId })
      }

      // Remove from undo history
      undoHistory = undoHistory.filter((entry) => entry.transactionId !== transactionId)
      setSelectedCategoryId(previousCategoryId)

      toast.success('Category change undone')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to undo category change')
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <CategorySelector
          value={selectedCategoryId}
          onChange={handleCategoryChange}
          disabled={isSaving}
          className="flex-1"
        />
        {canUndo && (
          <button
            onClick={handleUndo}
            disabled={isSaving}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Undo last category change"
          >
            Undo
          </button>
        )}
      </div>
      {isSaving && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Saving...
        </div>
      )}
    </div>
  )
}
