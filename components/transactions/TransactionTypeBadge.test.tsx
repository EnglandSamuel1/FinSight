import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TransactionTypeBadge } from './TransactionTypeBadge'

describe('TransactionTypeBadge', () => {
  it('should display "Expense" for expense type', () => {
    render(<TransactionTypeBadge type="expense" />)
    expect(screen.getByText('Expense')).toBeInTheDocument()
  })

  it('should display "Income" for income type', () => {
    render(<TransactionTypeBadge type="income" />)
    expect(screen.getByText('Income')).toBeInTheDocument()
  })

  it('should display "Transfer" for transfer type', () => {
    render(<TransactionTypeBadge type="transfer" />)
    expect(screen.getByText('Transfer')).toBeInTheDocument()
  })

  it('should apply gray styles for expense type', () => {
    const { container } = render(<TransactionTypeBadge type="expense" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  it('should apply teal styles for income type', () => {
    const { container } = render(<TransactionTypeBadge type="income" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-teal-100', 'text-teal-800')
  })

  it('should apply blue styles for transfer type', () => {
    const { container } = render(<TransactionTypeBadge type="transfer" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('should include tooltip title attribute', () => {
    const { container } = render(<TransactionTypeBadge type="income" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveAttribute('title', 'Transaction type: Income')
  })

  it('should apply custom className when provided', () => {
    const { container } = render(<TransactionTypeBadge type="expense" className="custom-class" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('custom-class')
  })
})
