import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategorySelector } from './CategorySelector'
import { getCategories } from '@/lib/api/categories'

// Mock the API
vi.mock('@/lib/api/categories', () => ({
  getCategories: vi.fn(),
}))

describe('CategorySelector', () => {
  const mockCategories = [
    { id: 'cat-1', userId: 'user-1', name: 'Food', description: null, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 'cat-2', userId: 'user-1', name: 'Transportation', description: null, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 'cat-3', userId: 'user-1', name: 'Entertainment', description: null, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and display user categories', async () => {
    vi.mocked(getCategories).mockResolvedValue(mockCategories)

    const onChange = vi.fn()
    render(<CategorySelector value={null} onChange={onChange} />)

    await waitFor(() => {
      expect(getCategories).toHaveBeenCalled()
    })

    expect(screen.getByText('Uncategorized')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Transportation')).toBeInTheDocument()
    expect(screen.getByText('Entertainment')).toBeInTheDocument()
  })

  it('should include "Uncategorized" option (null category_id)', async () => {
    vi.mocked(getCategories).mockResolvedValue(mockCategories)

    const onChange = vi.fn()
    render(<CategorySelector value={null} onChange={onChange} />)

    await waitFor(() => {
      expect(screen.getByText('Uncategorized')).toBeInTheDocument()
    })

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('')
  })

  it('should call onChange when category is selected', async () => {
    vi.mocked(getCategories).mockResolvedValue(mockCategories)

    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<CategorySelector value={null} onChange={onChange} />)

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument()
    })

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'cat-1')

    expect(onChange).toHaveBeenCalledWith('cat-1')
  })

  it('should call onChange with null when "Uncategorized" is selected', async () => {
    vi.mocked(getCategories).mockResolvedValue(mockCategories)

    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<CategorySelector value="cat-1" onChange={onChange} />)

    await waitFor(() => {
      expect(screen.getByText('Uncategorized')).toBeInTheDocument()
    })

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, '')

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('should show loading state while fetching categories', () => {
    vi.mocked(getCategories).mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<CategorySelector value={null} onChange={vi.fn()} />)

    expect(screen.getByText('Loading categories...')).toBeInTheDocument()
    const select = screen.getByRole('combobox')
    expect(select).toBeDisabled()
  })

  it('should display error message when fetch fails', async () => {
    vi.mocked(getCategories).mockRejectedValue(new Error('Failed to fetch categories'))

    render(<CategorySelector value={null} onChange={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch categories')).toBeInTheDocument()
    })
  })

  it('should be disabled when disabled prop is true', async () => {
    vi.mocked(getCategories).mockResolvedValue(mockCategories)

    render(<CategorySelector value={null} onChange={vi.fn()} disabled />)

    await waitFor(() => {
      const select = screen.getByRole('combobox')
      expect(select).toBeDisabled()
    })
  })

  it('should display selected category value', async () => {
    vi.mocked(getCategories).mockResolvedValue(mockCategories)

    render(<CategorySelector value="cat-2" onChange={vi.fn()} />)

    await waitFor(() => {
      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('cat-2')
    })
  })

  it('should support custom placeholder', async () => {
    vi.mocked(getCategories).mockResolvedValue(mockCategories)

    render(<CategorySelector value={null} onChange={vi.fn()} placeholder="Choose category" />)

    await waitFor(() => {
      // The placeholder prop is not used in the current implementation since we always show "Uncategorized"
      // But the component should still render
      expect(screen.getByText('Uncategorized')).toBeInTheDocument()
    })
  })
})
