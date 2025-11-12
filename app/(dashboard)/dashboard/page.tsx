'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { SpendingSummary } from '@/components/budget/SpendingSummary'
import { CategorySpendingChart } from '@/components/budget/CategorySpendingChart'
import { MonthSelector } from '@/components/budget/MonthSelector'
import { getCurrentMonth } from '@/types/budget'
import { getSpendingSummary, type SpendingSummary as SpendingSummaryType } from '@/lib/api/spending'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [summary, setSummary] = useState<SpendingSummaryType | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch summary data for chart (separate from SpendingSummary component)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getSpendingSummary(selectedMonth)
        setSummary(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load spending data')
        setSummary(null)
      }
    }

    fetchSummary()
  }, [selectedMonth])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
  }

  const handleSummaryError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header with Month Selector */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                View your spending summary and budget status
              </p>
            </div>
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Dashboard Content - Full Width Spending Summary */}
          <div className="space-y-6">
            {/* Financial Summary - Full Width */}
            <SpendingSummary
              month={selectedMonth}
              onError={handleSummaryError}
            />

            {/* Category Spending Chart - Full Width */}
            {summary ? (
              <CategorySpendingChart summary={summary} />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 dark:bg-gray-700"></div>
                  <div className="h-64 bg-gray-200 rounded dark:bg-gray-700"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
