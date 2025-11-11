'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { TransactionUpload } from '@/components/transactions/TransactionUpload'
import Link from 'next/link'

export default function TransactionUploadPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-4xl px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Dashboard
            </Link>
            <span className="text-gray-400 dark:text-gray-600">/</span>
            <Link
              href="/transactions"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Transactions
            </Link>
            <span className="text-gray-400 dark:text-gray-600">/</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Upload</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Upload Transactions
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Upload CSV transaction files from your bank to import transactions automatically
          </p>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <TransactionUpload />
        </div>
      </div>
    </ProtectedRoute>
  )
}
