import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ImportStatus } from './ImportStatus'

describe('ImportStatus', () => {
  it('renders uploading stage with progress', () => {
    render(<ImportStatus stage="uploading" progress={50} />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Uploading file...')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()

    // Check progress bar
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '50')
    expect(progressBar).toHaveStyle({ width: '50%' })
  })

  it('renders parsing stage', () => {
    render(<ImportStatus stage="parsing" />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Parsing file...')).toBeInTheDocument()

    // Should show spinner
    const statusElement = screen.getByRole('status')
    expect(statusElement).toHaveAttribute('aria-busy', 'true')
  })

  it('renders duplicates stage with count', () => {
    render(<ImportStatus stage="duplicates" duplicatesFound={5} />)

    expect(screen.getByText('Detecting duplicates...')).toBeInTheDocument()
    expect(screen.getByText(/Found 5 potential duplicates/)).toBeInTheDocument()
  })

  it('renders importing stage', () => {
    render(<ImportStatus stage="importing" />)

    expect(screen.getByText('Importing transactions...')).toBeInTheDocument()
  })

  it('renders complete stage', () => {
    render(<ImportStatus stage="complete" />)

    expect(screen.getByText('Import complete!')).toBeInTheDocument()

    // Should not be busy
    const statusElement = screen.getByRole('status')
    expect(statusElement).toHaveAttribute('aria-busy', 'false')
  })

  it('renders error stage with error message', () => {
    render(<ImportStatus stage="error" error="Upload failed" />)

    expect(screen.getByText(/Upload failed/)).toBeInTheDocument()

    // Should not be busy
    const statusElement = screen.getByRole('status')
    expect(statusElement).toHaveAttribute('aria-busy', 'false')
  })

  it('renders custom status message', () => {
    render(<ImportStatus stage="uploading" statusMessage="Custom message" progress={25} />)

    expect(screen.getByText('Custom message')).toBeInTheDocument()
    expect(screen.queryByText('Uploading file...')).not.toBeInTheDocument()
  })

  it('shows progress bar only for uploading stage with progress > 0', () => {
    const { rerender } = render(<ImportStatus stage="uploading" progress={0} />)

    // No progress bar shown for 0% progress
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()

    // Progress bar shown when progress > 0
    rerender(<ImportStatus stage="uploading" progress={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    // No progress bar for other stages
    rerender(<ImportStatus stage="parsing" progress={50} />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('uses correct styling for different stages', () => {
    const { rerender } = render(<ImportStatus stage="uploading" />)

    let container = screen.getByRole('status')
    expect(container).toHaveClass('bg-blue-50')

    rerender(<ImportStatus stage="complete" />)
    container = screen.getByRole('status')
    expect(container).toHaveClass('bg-green-50')

    rerender(<ImportStatus stage="error" error="Error message" />)
    container = screen.getByRole('status')
    expect(container).toHaveClass('bg-red-50')
  })

  it('handles singular vs plural duplicates text', () => {
    const { rerender } = render(<ImportStatus stage="duplicates" duplicatesFound={1} />)

    expect(screen.getByText(/Found 1 potential duplicate$/)).toBeInTheDocument()

    rerender(<ImportStatus stage="duplicates" duplicatesFound={3} />)
    expect(screen.getByText(/Found 3 potential duplicates/)).toBeInTheDocument()
  })
})
