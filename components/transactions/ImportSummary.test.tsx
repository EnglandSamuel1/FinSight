import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ImportSummary } from './ImportSummary'

describe('ImportSummary', () => {
  const mockDateRange = {
    minDate: '2024-01-10T00:00:00.000Z',
    maxDate: '2024-02-20T00:00:00.000Z',
  }

  it('renders successful import summary', () => {
    render(<ImportSummary totalImported={10} dateRange={mockDateRange} />)

    expect(screen.getByText('Import Successful')).toBeInTheDocument()
    expect(screen.getByText('10 transactions imported successfully')).toBeInTheDocument()
    expect(screen.getByText(/Jan 10, 2024 - Feb 20, 2024/)).toBeInTheDocument()
  })

  it('renders singular transaction text for 1 transaction', () => {
    render(<ImportSummary totalImported={1} />)

    expect(screen.getByText('1 transaction imported successfully')).toBeInTheDocument()
  })

  it('displays date range when provided', () => {
    render(<ImportSummary totalImported={5} dateRange={mockDateRange} />)

    expect(screen.getByText(/Jan 10, 2024 - Feb 20, 2024/)).toBeInTheDocument()
  })

  it('handles null date range gracefully', () => {
    render(
      <ImportSummary
        totalImported={5}
        dateRange={{ minDate: null, maxDate: null }}
      />
    )

    // Should not crash and should show N/A for dates
    const dateText = screen.queryByText(/N\/A - N\/A/)
    expect(dateText).toBeInTheDocument()
  })

  it('displays duplicates warning when duplicates found', () => {
    render(<ImportSummary totalImported={10} duplicatesFound={3} />)

    expect(screen.getByText('Duplicates Detected')).toBeInTheDocument()
    expect(screen.getByText('3 duplicate transactions were skipped')).toBeInTheDocument()
  })

  it('handles singular duplicate text', () => {
    render(<ImportSummary totalImported={10} duplicatesFound={1} />)

    expect(screen.getByText('1 duplicate transaction was skipped')).toBeInTheDocument()
  })

  it('does not show duplicates section when no duplicates', () => {
    render(<ImportSummary totalImported={10} duplicatesFound={0} />)

    expect(screen.queryByText('Duplicates Detected')).not.toBeInTheDocument()
  })

  it('displays errors section when errors present', () => {
    const errors = [
      { row: 1, column: 'date', message: 'Invalid date format' },
      { row: 2, column: 'amount', message: 'Amount is required' },
    ]

    render(<ImportSummary totalImported={8} errorCount={2} errors={errors} />)

    expect(screen.getByText('Parsing Errors')).toBeInTheDocument()
    expect(screen.getByText('2 rows could not be imported')).toBeInTheDocument()

    // Check error details
    expect(screen.getByText(/Row 1:/)).toBeInTheDocument()
    expect(screen.getByText(/Invalid date format/)).toBeInTheDocument()
    expect(screen.getByText(/Row 2:/)).toBeInTheDocument()
    expect(screen.getByText(/Amount is required/)).toBeInTheDocument()
  })

  it('limits error display to first 3 errors', () => {
    const errors = [
      { row: 1, message: 'Error 1' },
      { row: 2, message: 'Error 2' },
      { row: 3, message: 'Error 3' },
      { row: 4, message: 'Error 4' },
      { row: 5, message: 'Error 5' },
    ]

    render(<ImportSummary totalImported={5} errorCount={5} errors={errors} />)

    expect(screen.getByText(/Row 1:/)).toBeInTheDocument()
    expect(screen.getByText(/Row 2:/)).toBeInTheDocument()
    expect(screen.getByText(/Row 3:/)).toBeInTheDocument()
    expect(screen.queryByText(/Row 4:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Row 5:/)).not.toBeInTheDocument()

    // Should show "and X more" message
    expect(screen.getByText(/and 2 more errors/)).toBeInTheDocument()
  })

  it('displays statistics grid correctly', () => {
    render(
      <ImportSummary
        totalImported={10}
        duplicatesFound={3}
        errorCount={2}
      />
    )

    expect(screen.getByText('Import Statistics')).toBeInTheDocument()

    // Check all stat values
    expect(screen.getByText('Imported')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()

    expect(screen.getByText('Duplicates')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    expect(screen.getByText('Errors')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()

    expect(screen.getByText('Total Rows')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument() // 10 + 3 + 2
  })

  it('calculates total rows correctly', () => {
    render(
      <ImportSummary
        totalImported={20}
        duplicatesFound={5}
        errorCount={3}
      />
    )

    // Total should be 20 + 5 + 3 = 28
    const totalRowsValue = screen.getAllByText('28')
    expect(totalRowsValue.length).toBeGreaterThan(0)
  })

  it('shows error column when provided', () => {
    const errors = [
      { row: 1, column: 'date', message: 'Invalid date' },
    ]

    render(<ImportSummary totalImported={5} errorCount={1} errors={errors} />)

    expect(screen.getByText(/\(date\)/)).toBeInTheDocument()
  })

  it('does not crash with empty errors array and non-zero errorCount', () => {
    render(<ImportSummary totalImported={5} errorCount={3} errors={[]} />)

    expect(screen.getByText('Parsing Errors')).toBeInTheDocument()
    expect(screen.getByText('3 rows could not be imported')).toBeInTheDocument()
  })

  it('handles zero values for all counts', () => {
    render(
      <ImportSummary
        totalImported={0}
        duplicatesFound={0}
        errorCount={0}
      />
    )

    // Should show 0 for all stats
    expect(screen.getByText('Import Statistics')).toBeInTheDocument()
    const zeroValues = screen.getAllByText('0')
    expect(zeroValues.length).toBeGreaterThanOrEqual(4) // Should have at least 4 zeros
  })
})
