import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionUpload } from './TransactionUpload'
import { toast } from '@/components/ui/toast'

// Mock toast
vi.mock('@/components/ui/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('TransactionUpload', () => {
  let mockXHR: {
    open: ReturnType<typeof vi.fn>
    send: ReturnType<typeof vi.fn>
    upload: {
      addEventListener: ReturnType<typeof vi.fn>
    }
    addEventListener: ReturnType<typeof vi.fn>
    status: number
    responseText: string
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock XMLHttpRequest
    mockXHR = {
      open: vi.fn(),
      send: vi.fn(),
      upload: {
        addEventListener: vi.fn(),
      },
      addEventListener: vi.fn(),
      status: 200,
      responseText: JSON.stringify({
        message: 'File uploaded successfully',
        fileName: 'test.csv',
        fileSize: 1024,
        fileType: 'text/csv',
      }),
    }

    global.XMLHttpRequest = vi.fn(() => mockXHR as any) as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createFile = (name: string, size: number, type: string = 'text/csv'): File => {
    const blob = new Blob(['test content'], { type })
    const file = new File([blob], name, { type })
    Object.defineProperty(file, 'size', { value: size, writable: false })
    return file
  }

  it('should render upload area', () => {
    render(<TransactionUpload />)

    expect(screen.getByText(/drag and drop your csv file here/i)).toBeInTheDocument()
    expect(screen.getByText(/browse files/i)).toBeInTheDocument()
    expect(screen.getByText(/csv files only, maximum size 10mb/i)).toBeInTheDocument()
  })

  it('should allow file selection via file picker', async () => {
    const user = userEvent.setup()
    render(<TransactionUpload />)

    const fileInput = screen.getByLabelText(/file input/i) as HTMLInputElement
    const file = createFile('transactions.csv', 1024)

    await user.upload(fileInput, file)

    expect(screen.getByText('transactions.csv')).toBeInTheDocument()
    expect(screen.getByText(/1 KB/i)).toBeInTheDocument()
  })

  it('should show error for non-CSV file', async () => {
    const user = userEvent.setup()
    render(<TransactionUpload />)

    const fileInput = screen.getByLabelText(/file input/i) as HTMLInputElement
    const file = createFile('document.pdf', 1024, 'application/pdf')

    await user.upload(fileInput, file)

    expect(screen.getByText(/invalid file type/i)).toBeInTheDocument()
  })

  it('should show error for file exceeding 10MB', async () => {
    const user = userEvent.setup()
    render(<TransactionUpload />)

    const fileInput = screen.getByLabelText(/file input/i) as HTMLInputElement
    const file = createFile('large.csv', 11 * 1024 * 1024)

    await user.upload(fileInput, file)

    expect(screen.getByText(/file size exceeds maximum/i)).toBeInTheDocument()
  })

  it('should show error for empty file', async () => {
    const user = userEvent.setup()
    render(<TransactionUpload />)

    const fileInput = screen.getByLabelText(/file input/i) as HTMLInputElement
    const file = createFile('empty.csv', 0)

    await user.upload(fileInput, file)

    expect(screen.getByText(/file is empty/i)).toBeInTheDocument()
  })

  it('should handle drag and drop', async () => {
    render(<TransactionUpload />)

    const uploadArea = screen.getByLabelText(/file upload area/i)
    const file = createFile('transactions.csv', 1024)

    const dataTransfer = {
      files: [file],
    } as any

    const dropEvent = new Event('drop', { bubbles: true })
    Object.assign(dropEvent, { dataTransfer, preventDefault: vi.fn(), stopPropagation: vi.fn() })

    uploadArea.dispatchEvent(dropEvent)

    await waitFor(() => {
      expect(screen.getByText('transactions.csv')).toBeInTheDocument()
    })
  })

  it('should show upload progress during upload', async () => {
    const user = userEvent.setup()
    render(<TransactionUpload />)

    const fileInput = screen.getByLabelText(/file input/i) as HTMLInputElement
    const file = createFile('transactions.csv', 1024)

    await user.upload(fileInput, file)

    const uploadButton = screen.getByText(/upload file/i)
    await user.click(uploadButton)

    // Simulate progress event
    const progressHandler = mockXHR.upload.addEventListener.mock.calls.find(
      (call) => call[0] === 'progress'
    )?.[1]

    if (progressHandler) {
      progressHandler({
        lengthComputable: true,
        loaded: 512,
        total: 1024,
      } as ProgressEvent)
    }

    await waitFor(() => {
      expect(screen.getByText(/uploading/i)).toBeInTheDocument()
      expect(screen.getByText(/50%/i)).toBeInTheDocument()
    })
  })

  it('should show success message on successful upload', async () => {
    const user = userEvent.setup()
    render(<TransactionUpload />)

    const fileInput = screen.getByLabelText(/file input/i) as HTMLInputElement
    const file = createFile('transactions.csv', 1024)

    await user.upload(fileInput, file)

    const uploadButton = screen.getByText(/upload file/i)
    await user.click(uploadButton)

    // Simulate successful response
    const loadHandler = mockXHR.addEventListener.mock.calls.find((call) => call[0] === 'load')?.[1]
    if (loadHandler) {
      loadHandler()
    }

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('File "test.csv" uploaded successfully')
    })
  })

  it('should show error message on upload failure', async () => {
    const user = userEvent.setup()
    mockXHR.status = 400
    mockXHR.responseText = JSON.stringify({
      error: { message: 'Invalid file format', code: 'INVALID_FILE' },
    })

    render(<TransactionUpload />)

    const fileInput = screen.getByLabelText(/file input/i) as HTMLInputElement
    const file = createFile('transactions.csv', 1024)

    await user.upload(fileInput, file)

    const uploadButton = screen.getByText(/upload file/i)
    await user.click(uploadButton)

    // Simulate error response
    const loadHandler = mockXHR.addEventListener.mock.calls.find((call) => call[0] === 'load')?.[1]
    if (loadHandler) {
      loadHandler()
    }

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid file format')
      expect(screen.getByText(/invalid file format/i)).toBeInTheDocument()
    })
  })

  it('should allow removing selected file', async () => {
    const user = userEvent.setup()
    render(<TransactionUpload />)

    const fileInput = screen.getByLabelText(/file input/i) as HTMLInputElement
    const file = createFile('transactions.csv', 1024)

    await user.upload(fileInput, file)

    expect(screen.getByText('transactions.csv')).toBeInTheDocument()

    const removeButton = screen.getByLabelText(/remove file/i)
    await user.click(removeButton)

    await waitFor(() => {
      expect(screen.queryByText('transactions.csv')).not.toBeInTheDocument()
    })
  })

  it('should reset file input after successful upload', async () => {
    const user = userEvent.setup()
    render(<TransactionUpload />)

    const fileInput = screen.getByLabelText(/file input/i) as HTMLInputElement
    const file = createFile('transactions.csv', 1024)

    await user.upload(fileInput, file)

    const uploadButton = screen.getByText(/upload file/i)
    await user.click(uploadButton)

    // Simulate successful response
    const loadHandler = mockXHR.addEventListener.mock.calls.find((call) => call[0] === 'load')?.[1]
    if (loadHandler) {
      loadHandler()
    }

    await waitFor(() => {
      expect(fileInput.value).toBe('')
    })
  })

  it('should format file sizes correctly', async () => {
    const user = userEvent.setup()
    render(<TransactionUpload />)

    const fileInput = screen.getByLabelText(/file input/i) as HTMLInputElement

    // Test different file sizes
    const sizes = [
      { bytes: 500, expected: '500 Bytes' },
      { bytes: 1024, expected: '1 KB' },
      { bytes: 1024 * 1024, expected: '1 MB' },
    ]

    for (const { bytes, expected } of sizes) {
      const file = createFile('test.csv', bytes)
      await user.upload(fileInput, file)

      expect(screen.getByText(new RegExp(expected, 'i'))).toBeInTheDocument()

      // Clear for next test
      const removeButton = screen.getByLabelText(/remove file/i)
      await user.click(removeButton)
    }
  })
})
