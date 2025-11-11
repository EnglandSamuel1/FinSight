import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryItem } from './CategoryItem'
import * as categoriesApi from '@/lib/api/categories'
import { toast } from '@/components/ui/toast'

// Mock the API modules
vi.mock('@/lib/api/categories')
vi.mock('@/components/ui/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

const mockDeleteCategory = vi.mocked(categoriesApi.deleteCategory)
const mockUpdateCategory = vi.mocked(categoriesApi.updateCategory)

describe('CategoryItem', () => {
  const mockCategory = {
    id: '1',
    userId: 'user1',
    name: 'Test Category',
    description: 'Test description',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }

  const mockBudget = {
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
  }

  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display category information', () => {
    render(<CategoryItem category={mockCategory} onUpdate={mockOnUpdate} />)

    expect(screen.getByText('Test Category')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText(/created/i)).toBeInTheDocument()
  })

  it('should display budget badge when budget exists', () => {
    render(<CategoryItem category={mockCategory} budget={mockBudget} onUpdate={mockOnUpdate} />)

    expect(screen.getByText(/\$500\.00 budget/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Budget set')).toBeInTheDocument()
  })

  it('should display "No budget" badge when budget does not exist', () => {
    render(<CategoryItem category={mockCategory} onUpdate={mockOnUpdate} />)

    expect(screen.getByText(/no budget/i)).toBeInTheDocument()
    expect(screen.getByLabelText('No budget set')).toBeInTheDocument()
  })

  it('should show edit form when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<CategoryItem category={mockCategory} onUpdate={mockOnUpdate} />)

    const editButton = screen.getByLabelText(/edit category/i)
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByText(/edit category/i)).toBeInTheDocument()
    })
  })

  it('should show delete confirmation when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<CategoryItem category={mockCategory} onUpdate={mockOnUpdate} />)

    const deleteButton = screen.getByLabelText(/delete category/i)
    await user.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText(/delete category\?/i)).toBeInTheDocument()
      expect(
        screen.getByText(/are you sure you want to delete/i)
      ).toBeInTheDocument()
    })
  })

  it('should delete category successfully', async () => {
    const user = userEvent.setup()
    mockDeleteCategory.mockResolvedValue({ hadTransactions: false })

    render(<CategoryItem category={mockCategory} onUpdate={mockOnUpdate} />)

    const deleteButton = screen.getByLabelText(/delete category/i)
    await user.click(deleteButton)

    const confirmButton = screen.getByRole('button', { name: /delete/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteCategory).toHaveBeenCalledWith('1')
      expect(toast.success).toHaveBeenCalledWith('Category deleted successfully')
      expect(mockOnUpdate).toHaveBeenCalled()
    })
  })

  it('should show info message when category with transactions is deleted', async () => {
    const user = userEvent.setup()
    mockDeleteCategory.mockResolvedValue({ hadTransactions: true })

    render(<CategoryItem category={mockCategory} onUpdate={mockOnUpdate} />)

    const deleteButton = screen.getByLabelText(/delete category/i)
    await user.click(deleteButton)

    const confirmButton = screen.getByRole('button', { name: /delete/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith(
        'Category deleted. Associated transactions are now uncategorized.'
      )
    })
  })

  it('should handle delete error', async () => {
    const user = userEvent.setup()
    mockDeleteCategory.mockRejectedValue(new Error('Delete failed'))

    render(<CategoryItem category={mockCategory} onUpdate={mockOnUpdate} />)

    const deleteButton = screen.getByLabelText(/delete category/i)
    await user.click(deleteButton)

    const confirmButton = screen.getByRole('button', { name: /delete/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText(/delete failed/i)).toBeInTheDocument()
      expect(toast.error).toHaveBeenCalled()
      expect(mockOnUpdate).not.toHaveBeenCalled()
    })
  })

  it('should cancel delete confirmation', async () => {
    const user = userEvent.setup()
    render(<CategoryItem category={mockCategory} onUpdate={mockOnUpdate} />)

    const deleteButton = screen.getByLabelText(/delete category/i)
    await user.click(deleteButton)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText(/delete category\?/i)).not.toBeInTheDocument()
    })
  })

  it('should show budget input when set budget button is clicked', async () => {
    const user = userEvent.setup()
    render(<CategoryItem category={mockCategory} onUpdate={mockOnUpdate} />)

    const setBudgetButton = screen.getByRole('button', { name: /set budget/i })
    await user.click(setBudgetButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/budget amount/i)).toBeInTheDocument()
    })
  })

  it('should show update budget button when budget exists', async () => {
    const user = userEvent.setup()
    render(<CategoryItem category={mockCategory} budget={mockBudget} onUpdate={mockOnUpdate} />)

    const updateButton = screen.getByRole('button', { name: /update/i })
    await user.click(updateButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/budget amount/i)).toBeInTheDocument()
    })
  })

  it('should display budget information when budget exists', () => {
    render(<CategoryItem category={mockCategory} budget={mockBudget} onUpdate={mockOnUpdate} />)

    expect(screen.getByText(/budget:/i)).toBeInTheDocument()
    expect(screen.getByText(/\$500\.00/i)).toBeInTheDocument()
  })

  it('should have proper ARIA labels for accessibility', () => {
    render(<CategoryItem category={mockCategory} onUpdate={mockOnUpdate} />)

    expect(screen.getByLabelText(/edit category test category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/delete category test category/i)).toBeInTheDocument()
  })

  it('should update budget when budget prop changes', () => {
    const { rerender } = render(
      <CategoryItem category={mockCategory} onUpdate={mockOnUpdate} />
    )

    expect(screen.getByText(/no budget/i)).toBeInTheDocument()

    rerender(<CategoryItem category={mockCategory} budget={mockBudget} onUpdate={mockOnUpdate} />)

    expect(screen.getByText(/\$500\.00 budget/i)).toBeInTheDocument()
  })
})
