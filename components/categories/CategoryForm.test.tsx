import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryForm } from './CategoryForm'
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

const mockCreateCategory = vi.mocked(categoriesApi.createCategory)
const mockUpdateCategory = vi.mocked(categoriesApi.updateCategory)
const mockCheckCategoryNameUnique = vi.mocked(categoriesApi.checkCategoryNameUnique)

describe('CategoryForm', () => {
  const mockOnSuccess = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckCategoryNameUnique.mockResolvedValue(true)
  })

  describe('Create Mode', () => {
    it('should render create form with empty fields', () => {
      render(<CategoryForm onSuccess={mockOnSuccess} />)

      expect(screen.getByLabelText(/category name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create category/i })).toBeInTheDocument()
    })

    it('should validate required name field', async () => {
      const user = userEvent.setup()
      render(<CategoryForm onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/category name/i)
      const submitButton = screen.getByRole('button', { name: /create category/i })

      // Try to submit without name
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/category name is required/i)).toBeInTheDocument()
      })
      expect(mockCreateCategory).not.toHaveBeenCalled()
    })

    it('should validate name length', async () => {
      const user = userEvent.setup()
      render(<CategoryForm onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/category name/i)
      const longName = 'a'.repeat(101)

      await user.type(nameInput, longName)
      await user.tab() // Trigger blur

      await waitFor(() => {
        expect(
          screen.getByText(/category name must be 100 characters or less/i)
        ).toBeInTheDocument()
      })
    })

    it('should check name uniqueness on blur', async () => {
      const user = userEvent.setup()
      mockCheckCategoryNameUnique.mockResolvedValue(false)

      render(<CategoryForm onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/category name/i)
      await user.type(nameInput, 'Existing Category')
      await user.tab()

      await waitFor(() => {
        expect(
          screen.getByText(/category with this name already exists/i)
        ).toBeInTheDocument()
      })
    })

    it('should create category successfully', async () => {
      const user = userEvent.setup()
      mockCreateCategory.mockResolvedValue({
        id: '1',
        userId: 'user1',
        name: 'New Category',
        description: 'Description',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      })

      render(<CategoryForm onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/category name/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const submitButton = screen.getByRole('button', { name: /create category/i })

      await user.type(nameInput, 'New Category')
      await user.type(descriptionInput, 'Description')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateCategory).toHaveBeenCalledWith({
          name: 'New Category',
          description: 'Description',
        })
        expect(toast.success).toHaveBeenCalledWith('Category created successfully')
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('should handle creation error', async () => {
      const user = userEvent.setup()
      mockCreateCategory.mockRejectedValue(new Error('Creation failed'))

      render(<CategoryForm onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/category name/i)
      const submitButton = screen.getByRole('button', { name: /create category/i })

      await user.type(nameInput, 'New Category')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/creation failed/i)).toBeInTheDocument()
        expect(toast.error).toHaveBeenCalled()
        expect(mockOnSuccess).not.toHaveBeenCalled()
      })
    })

    it('should reset form after successful creation', async () => {
      const user = userEvent.setup()
      mockCreateCategory.mockResolvedValue({
        id: '1',
        userId: 'user1',
        name: 'New Category',
        description: 'Description',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      })

      render(<CategoryForm onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/category name/i) as HTMLInputElement
      const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement

      await user.type(nameInput, 'New Category')
      await user.type(descriptionInput, 'Description')
      await user.click(screen.getByRole('button', { name: /create category/i }))

      await waitFor(() => {
        expect(nameInput.value).toBe('')
        expect(descriptionInput.value).toBe('')
      })
    })
  })

  describe('Edit Mode', () => {
    const mockCategory = {
      id: '1',
      userId: 'user1',
      name: 'Existing Category',
      description: 'Existing description',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }

    it('should render edit form with pre-filled fields', () => {
      render(<CategoryForm category={mockCategory} onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/category name/i) as HTMLInputElement
      const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement

      expect(nameInput.value).toBe('Existing Category')
      expect(descriptionInput.value).toBe('Existing description')
      expect(screen.getByRole('button', { name: /update category/i })).toBeInTheDocument()
    })

    it('should update category successfully', async () => {
      const user = userEvent.setup()
      mockUpdateCategory.mockResolvedValue({
        ...mockCategory,
        name: 'Updated Category',
      })

      render(<CategoryForm category={mockCategory} onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/category name/i)
      const submitButton = screen.getByRole('button', { name: /update category/i })

      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Category')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateCategory).toHaveBeenCalledWith('1', {
          name: 'Updated Category',
        })
        expect(toast.success).toHaveBeenCalledWith('Category updated successfully')
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('should only send changed fields in update', async () => {
      const user = userEvent.setup()
      mockUpdateCategory.mockResolvedValue(mockCategory)

      render(<CategoryForm category={mockCategory} onSuccess={mockOnSuccess} />)

      const submitButton = screen.getByRole('button', { name: /update category/i })
      await user.click(submitButton)

      await waitFor(() => {
        // Should not call update if nothing changed
        expect(mockUpdateCategory).toHaveBeenCalledWith('1', {})
      })
    })

    it('should check name uniqueness when name changes in edit mode', async () => {
      const user = userEvent.setup()
      mockCheckCategoryNameUnique.mockResolvedValue(false)

      render(<CategoryForm category={mockCategory} onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/category name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Duplicate Name')
      await user.tab()

      await waitFor(() => {
        expect(mockCheckCategoryNameUnique).toHaveBeenCalledWith('Duplicate Name', '1')
        expect(
          screen.getByText(/category with this name already exists/i)
        ).toBeInTheDocument()
      })
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<CategoryForm category={mockCategory} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Description validation', () => {
    it('should validate description length', async () => {
      const user = userEvent.setup()
      render(<CategoryForm onSuccess={mockOnSuccess} />)

      const descriptionInput = screen.getByLabelText(/description/i)
      const longDescription = 'a'.repeat(501)

      await user.type(descriptionInput, longDescription)
      await user.click(screen.getByRole('button', { name: /create category/i }))

      await waitFor(() => {
        expect(screen.getByText(/description must be 500 characters or less/i)).toBeInTheDocument()
      })
    })

    it('should show character count for description', () => {
      render(<CategoryForm onSuccess={mockOnSuccess} />)

      expect(screen.getByText(/0\/500 characters/i)).toBeInTheDocument()
    })
  })
})
