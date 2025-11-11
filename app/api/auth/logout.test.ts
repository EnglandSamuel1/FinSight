import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}))

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = () => {
    return new NextRequest('http://localhost:3000/api/auth/logout', {
      method: 'POST',
    })
  }

  it('should successfully logout', async () => {
    const mockSupabase = {
      auth: {
        signOut: vi.fn().mockResolvedValue({
          error: null,
        }),
      },
    }

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = createRequest()
    const response = await POST(request)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ success: true })
  })

  it('should return 500 for logout failure', async () => {
    const mockSupabase = {
      auth: {
        signOut: vi.fn().mockResolvedValue({
          error: {
            message: 'Logout failed',
          },
        }),
      },
    }

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = createRequest()
    const response = await POST(request)

    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error.message).toBe('Failed to logout')
    expect(json.error.code).toBe('LOGOUT_FAILED')
  })
})
