import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConfidenceBadge } from './ConfidenceBadge'

describe('ConfidenceBadge', () => {
  describe('confidence levels', () => {
    it('should render high confidence badge (90-100%)', () => {
      const { container } = render(<ConfidenceBadge confidence={95} />)
      expect(screen.getByText('95%')).toBeInTheDocument()
      expect(container.querySelector('.text-green-700')).toBeInTheDocument()
      expect(screen.getByTitle('Categorization confidence: 95%')).toBeInTheDocument()
    })

    it('should render medium confidence badge (70-89%)', () => {
      const { container } = render(<ConfidenceBadge confidence={75} />)
      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(container.querySelector('.text-yellow-700')).toBeInTheDocument()
    })

    it('should render low confidence badge (0-69%)', () => {
      const { container } = render(<ConfidenceBadge confidence={50} />)
      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(container.querySelector('.text-orange-700')).toBeInTheDocument()
    })

    it('should handle edge case: exactly 90%', () => {
      const { container } = render(<ConfidenceBadge confidence={90} />)
      expect(screen.getByText('90%')).toBeInTheDocument()
      expect(container.querySelector('.text-green-700')).toBeInTheDocument()
    })

    it('should handle edge case: exactly 70%', () => {
      const { container } = render(<ConfidenceBadge confidence={70} />)
      expect(screen.getByText('70%')).toBeInTheDocument()
      expect(container.querySelector('.text-yellow-700')).toBeInTheDocument()
    })

    it('should handle edge case: 0%', () => {
      const { container } = render(<ConfidenceBadge confidence={0} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(container.querySelector('.text-orange-700')).toBeInTheDocument()
    })

    it('should handle edge case: 100%', () => {
      const { container } = render(<ConfidenceBadge confidence={100} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
      expect(container.querySelector('.text-green-700')).toBeInTheDocument()
    })
  })

  describe('rendering behavior', () => {
    it('should not render when confidence is null', () => {
      const { container } = render(<ConfidenceBadge confidence={null} />)
      expect(container.firstChild).toBeNull()
    })

    it('should not render when confidence is undefined', () => {
      const { container } = render(<ConfidenceBadge confidence={undefined as any} />)
      expect(container.firstChild).toBeNull()
    })

    it('should render with percentage by default', () => {
      render(<ConfidenceBadge confidence={85} />)
      expect(screen.getByText('85%')).toBeInTheDocument()
    })

    it('should render label when showPercentage is false (high)', () => {
      render(<ConfidenceBadge confidence={95} showPercentage={false} />)
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.queryByText('95%')).not.toBeInTheDocument()
    })

    it('should render label when showPercentage is false (medium)', () => {
      render(<ConfidenceBadge confidence={75} showPercentage={false} />)
      expect(screen.getByText('Medium')).toBeInTheDocument()
    })

    it('should render label when showPercentage is false (low)', () => {
      render(<ConfidenceBadge confidence={50} showPercentage={false} />)
      expect(screen.getByText('Low')).toBeInTheDocument()
    })
  })

  describe('size variants', () => {
    it('should render small size by default', () => {
      const { container } = render(<ConfidenceBadge confidence={85} />)
      expect(container.querySelector('.text-xs')).toBeInTheDocument()
      expect(container.querySelector('.px-2')).toBeInTheDocument()
    })

    it('should render small size when specified', () => {
      const { container } = render(<ConfidenceBadge confidence={85} size="sm" />)
      expect(container.querySelector('.text-xs')).toBeInTheDocument()
    })

    it('should render medium size when specified', () => {
      const { container } = render(<ConfidenceBadge confidence={85} size="md" />)
      expect(container.querySelector('.text-sm')).toBeInTheDocument()
      expect(container.querySelector('.px-2\\.5')).toBeInTheDocument()
    })
  })

  describe('visual elements', () => {
    it('should render checkmark icon', () => {
      const { container } = render(<ConfidenceBadge confidence={85} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('h-3', 'w-3')
    })

    it('should have rounded-full styling', () => {
      const { container } = render(<ConfidenceBadge confidence={85} />)
      expect(container.querySelector('.rounded-full')).toBeInTheDocument()
    })

    it('should have border', () => {
      const { container } = render(<ConfidenceBadge confidence={85} />)
      expect(container.querySelector('.border')).toBeInTheDocument()
    })
  })

  describe('dark mode support', () => {
    it('should include dark mode classes for high confidence', () => {
      const { container } = render(<ConfidenceBadge confidence={95} />)
      expect(container.querySelector('.dark\\:text-green-300')).toBeInTheDocument()
      expect(container.querySelector('.dark\\:bg-green-900\\/30')).toBeInTheDocument()
    })

    it('should include dark mode classes for medium confidence', () => {
      const { container } = render(<ConfidenceBadge confidence={75} />)
      expect(container.querySelector('.dark\\:text-yellow-300')).toBeInTheDocument()
    })

    it('should include dark mode classes for low confidence', () => {
      const { container } = render(<ConfidenceBadge confidence={50} />)
      expect(container.querySelector('.dark\\:text-orange-300')).toBeInTheDocument()
    })
  })
})
