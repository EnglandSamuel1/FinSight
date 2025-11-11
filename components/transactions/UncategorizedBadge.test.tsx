import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UncategorizedBadge } from './UncategorizedBadge'

describe('UncategorizedBadge', () => {
  describe('rendering', () => {
    it('should render uncategorized text', () => {
      render(<UncategorizedBadge />)
      expect(screen.getByText('Uncategorized')).toBeInTheDocument()
    })

    it('should render with title attribute', () => {
      render(<UncategorizedBadge />)
      expect(screen.getByTitle('This transaction needs manual categorization')).toBeInTheDocument()
    })

    it('should always render (no conditional rendering)', () => {
      const { container } = render(<UncategorizedBadge />)
      expect(container.firstChild).not.toBeNull()
    })
  })

  describe('size variants', () => {
    it('should render small size by default', () => {
      const { container } = render(<UncategorizedBadge />)
      expect(container.querySelector('.text-xs')).toBeInTheDocument()
      expect(container.querySelector('.px-2')).toBeInTheDocument()
    })

    it('should render small size when specified', () => {
      const { container } = render(<UncategorizedBadge size="sm" />)
      expect(container.querySelector('.text-xs')).toBeInTheDocument()
    })

    it('should render medium size when specified', () => {
      const { container } = render(<UncategorizedBadge size="md" />)
      expect(container.querySelector('.text-sm')).toBeInTheDocument()
      expect(container.querySelector('.px-2\\.5')).toBeInTheDocument()
    })
  })

  describe('variant styles', () => {
    it('should render default variant with gray styling', () => {
      const { container } = render(<UncategorizedBadge variant="default" />)
      expect(container.querySelector('.text-gray-700')).toBeInTheDocument()
      expect(container.querySelector('.bg-gray-100')).toBeInTheDocument()
      expect(container.querySelector('.border-gray-300')).toBeInTheDocument()
    })

    it('should render warning variant with amber styling', () => {
      const { container } = render(<UncategorizedBadge variant="warning" />)
      expect(container.querySelector('.text-amber-700')).toBeInTheDocument()
      expect(container.querySelector('.bg-amber-100')).toBeInTheDocument()
      expect(container.querySelector('.border-amber-300')).toBeInTheDocument()
    })

    it('should use default variant when not specified', () => {
      const { container } = render(<UncategorizedBadge />)
      expect(container.querySelector('.text-gray-700')).toBeInTheDocument()
    })
  })

  describe('visual elements', () => {
    it('should render warning icon', () => {
      const { container } = render(<UncategorizedBadge />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('h-3', 'w-3')
    })

    it('should have rounded-full styling', () => {
      const { container } = render(<UncategorizedBadge />)
      expect(container.querySelector('.rounded-full')).toBeInTheDocument()
    })

    it('should have border', () => {
      const { container } = render(<UncategorizedBadge />)
      expect(container.querySelector('.border')).toBeInTheDocument()
    })

    it('should have inline-flex layout', () => {
      const { container } = render(<UncategorizedBadge />)
      expect(container.querySelector('.inline-flex')).toBeInTheDocument()
    })

    it('should have gap between icon and text', () => {
      const { container } = render(<UncategorizedBadge />)
      expect(container.querySelector('.gap-1')).toBeInTheDocument()
    })
  })

  describe('dark mode support', () => {
    it('should include dark mode classes for default variant', () => {
      const { container } = render(<UncategorizedBadge variant="default" />)
      expect(container.querySelector('.dark\\:text-gray-300')).toBeInTheDocument()
      expect(container.querySelector('.dark\\:bg-gray-800')).toBeInTheDocument()
      expect(container.querySelector('.dark\\:border-gray-600')).toBeInTheDocument()
    })

    it('should include dark mode classes for warning variant', () => {
      const { container } = render(<UncategorizedBadge variant="warning" />)
      expect(container.querySelector('.dark\\:text-amber-300')).toBeInTheDocument()
      expect(container.querySelector('.dark\\:bg-amber-900\\/30')).toBeInTheDocument()
      expect(container.querySelector('.dark\\:border-amber-700')).toBeInTheDocument()
    })
  })
})
