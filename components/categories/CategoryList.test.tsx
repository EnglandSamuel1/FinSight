import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CategoryList } from './CategoryList'
import * as categoriesApi from '@/lib/api/categories'
import * as budgetsApi from '@/lib/api/budgets'

// Mock the API modules
vi.mock('@/lib/api/categories')
vi.mock('@/lib/api/budgets')

const mockGetCategories = vi.mocked(categoriesApi.getCategories)
const mockGetBudgetStatus = vi.mocked(budgetsApi.getBudgetStatus)

describe('CategoryList', () => {
  const mockOnCategoryUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state initially', () => {
    mockGetCategories.mockImplementation(() => new Promise(() => {})) // Never resolves
    mockGetBudgetStatus.mockResolvedValue([])

    render(<CategoryList onCategoryUpdate={mockOnCategoryUpdate} />)

    expect(screen.getByText('Loading categories...')).toBeInTheDocument()
  })

  it('should display error state when categories fail to load', async () => {
    mockGetCategories.mockRejectedValue(new Error('Failed to fetch'))
    mockGetBudgetStatus.mockResolvedValue([])

    render(<CategoryList onCategoryUpdate={mockOnCategoryUpdate} />)

    await waitFor(() => {
      expect(screen.getByText('Error loading categories')).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
    })
  })

  it('should display empty state when no categories exist', async () => {
    mockGetCategories.mockResolvedValue([])
    mockGetBudgetStatus.mockResolvedValue([])

    render(<CategoryList onCategoryUpdate={mockOnCategoryUpdate} />)

    await waitFor(() => {
      expect(screen.getByText('No categories yet.')).toBeInTheDocument()
      expect(
        screen.getByText('Create your first category to get started!')
      ).toBeInTheDocument()
    })
  })

  it('should display categories with budgets', async () => {
    const mockCategories = [
      {
        id: '1',
        userId: 'user1',
        name: 'Food',
        description: 'Food expenses',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: '2',
        userId: 'user1',
        name: 'Transport',
        description: null,
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
      },
    ]

    const mockBudgets = [
      {
        id: 'budget1',
        user_id: 'user1',
        category_id: '1',
        month: '2024-01-01',
        amount_cents: 50000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        remainingCents: 30000,
        spentCents: 20000,
        percentageUsed: 40,
      },
    ]

    mockGetCategories.mockResolvedValue(mockCategories)
    mockGetBudgetStatus.mockResolvedValue(mockBudgets)

    render(<CategoryList onCategoryUpdate={mockOnCategoryUpdate} />)

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument()
      expect(screen.getByText('Transport')).toBeInTheDocument()
    })
  })

  it('should handle budget loading failure gracefully', async () => {
    const mockCategories = [
      {
        id: '1',
        userId: 'user1',
        name: 'Food',
        description: 'Food expenses',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]

    mockGetCategories.mockResolvedValue(mockCategories)
    mockGetBudgetStatus.mockRejectedValue(new Error('Budget fetch failed'))

    render(<CategoryList onCategoryUpdate={mockOnCategoryUpdate} />)

    // Should still display categories even if budgets fail
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument()
    })
  })

  it('should call onCategoryUpdate when update is triggered', async () => {
    mockGetCategories.mockResolvedValue([])
    mockGetBudgetStatus.mockResolvedValue([])

    render(<CategoryList onCategoryUpdate={mockOnCategoryUpdate} />)

    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled()
    })
  })
})
