'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { SpendingSummary } from '@/lib/api/spending'

interface CategorySpendingChartProps {
  summary: SpendingSummary
}

// Color palette for categories
const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
]

export function CategorySpendingChart({ summary }: CategorySpendingChartProps) {
  if (!summary || summary.categories.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Spending by Category
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No spending data available to display chart.
        </p>
      </div>
    )
  }

  // Format data for chart
  const chartData = summary.categories.map((category) => ({
    name: category.categoryName,
    amount: category.amount / 100, // Convert cents to dollars for display
  }))

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {payload[0].payload.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      )
    }
    return null
  }

  // Format Y-axis labels as currency
  const formatYAxis = (value: number) => {
    return `$${value.toFixed(0)}`
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Spending by Category
      </h3>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              className="text-xs text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              className="text-xs text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {summary.categories.map((category, index) => (
          <div key={category.categoryId || 'uncategorized'} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">
              {category.categoryName}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
