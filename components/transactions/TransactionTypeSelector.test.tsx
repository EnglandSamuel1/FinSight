import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionTypeSelector } from './TransactionTypeSelector'

describe('TransactionTypeSelector', () => {
  it('should render all three transaction type options', () => {
    const onChange = vi.fn()
    render(<TransactionTypeSelector value="expense" onChange={onChange} />)

    expect(screen.getByText('Expense (Spending)')).toBeInTheDocument()
    expect(screen.getByText('Income (Revenue)')).toBeInTheDocument()
    expect(screen.getByText('Transfer (Excluded)')).toBeInTheDocument()
  })

  it('should display the selected value', () => {
    const onChange = vi.fn()
    render(<TransactionTypeSelector value="income" onChange={onChange} />)

    const select = screen.getByRole('combobox', { name: /transaction type/i })
    expect(select).toHaveValue('income')
  })

  it('should call onChange when selection changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TransactionTypeSelector value="expense" onChange={onChange} />)

    const select = screen.getByRole('combobox', { name: /transaction type/i })

    await user.selectOptions(select, 'transfer')

    expect(onChange).toHaveBeenCalledWith('transfer')
  })

  it('should display label when showLabel is true', () => {
    const onChange = vi.fn()
    render(<TransactionTypeSelector value="expense" onChange={onChange} showLabel={true} />)

    expect(screen.getByText('Transaction Type')).toBeInTheDocument()
  })

  it('should not display label when showLabel is false', () => {
    const onChange = vi.fn()
    render(<TransactionTypeSelector value="expense" onChange={onChange} showLabel={false} />)

    expect(screen.queryByText('Transaction Type')).not.toBeInTheDocument()
  })

  it('should display help text when showHelpText is true', () => {
    const onChange = vi.fn()
    render(<TransactionTypeSelector value="expense" onChange={onChange} showHelpText={true} />)

    expect(
      screen.getByText(/Transfers are excluded from spending calculations/)
    ).toBeInTheDocument()
  })

  it('should not display help text when showHelpText is false', () => {
    const onChange = vi.fn()
    render(<TransactionTypeSelector value="expense" onChange={onChange} showHelpText={false} />)

    expect(
      screen.queryByText(/Transfers are excluded from spending calculations/)
    ).not.toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    const onChange = vi.fn()
    render(<TransactionTypeSelector value="expense" onChange={onChange} disabled={true} />)

    const select = screen.getByRole('combobox', { name: /transaction type/i })
    expect(select).toBeDisabled()
  })

  it('should apply custom className', () => {
    const onChange = vi.fn()
    const { container } = render(
      <TransactionTypeSelector value="expense" onChange={onChange} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should have proper ARIA label for accessibility', () => {
    const onChange = vi.fn()
    render(<TransactionTypeSelector value="expense" onChange={onChange} />)

    const select = screen.getByRole('combobox', { name: /transaction type/i })
    expect(select).toHaveAttribute('aria-label', 'Transaction type')
  })
})
