'use client'

import { useState, useEffect, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

// Simple toast provider using React state
let toastListeners: Array<(toasts: Toast[]) => void> = []
let toastState: Toast[] = []

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...toastState]))
}

export const toast = {
  show: (message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { id, message, type, duration }
    toastState.push(newToast)
    notifyListeners()

    if (duration > 0) {
      setTimeout(() => {
        toastState = toastState.filter((t) => t.id !== id)
        notifyListeners()
      }, duration)
    }
  },
  success: (message: string, duration?: number) => {
    toast.show(message, 'success', duration)
  },
  error: (message: string, duration?: number) => {
    toast.show(message, 'error', duration || 5000)
  },
  info: (message: string, duration?: number) => {
    toast.show(message, 'info', duration)
  },
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts)
    }
    toastListeners.push(listener)
    setToasts([...toastState])

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    toast.show(message, type, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    toastState = toastState.filter((t) => t.id !== id)
    notifyListeners()
  }, [])

  return { toasts, showToast, removeToast }
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed right-4 top-4 z-50 flex flex-col gap-2"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-md border px-4 py-3 shadow-lg min-w-[300px] max-w-md ${
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400'
              : toast.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400'
                : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
          }`}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Dismiss notification"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
