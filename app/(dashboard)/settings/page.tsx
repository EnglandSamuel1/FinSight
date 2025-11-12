'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Settings and preferences coming soon.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  )
}
