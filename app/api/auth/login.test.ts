import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: vi.fn(() => null),
  defaultRateLimitConfig: { max: 100, windowMs: 60000 },
}))

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = (body: object) => {
    return new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('should successfully login with valid credentials', async () => {
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'user-123', email: 'test@example.com' },
            session: {
              access_token: 'token-123',
              refresh_token: 'refresh-123',
              expires_at: 1234567890,
            },
          },
          error: null,
        }),
      },
    }

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const json = await response.json()
    expect(json).toEqual({
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
      session: {
        access_token: 'token-123',
        refresh_token: 'refresh-123',
        expires_at: 1234567890,
      },
    })
  })

  it('should return 400 for invalid email format', async () => {
    const request = createRequest({
      email: 'invalid-email',
      password: 'password123',
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const json = await response.json()
    expect(json.error).toBeDefined()
    expect(json.error.message).toContain('email')
  })

  it('should return 400 for missing password', async () => {
    const request = createRequest({
      email: 'test@example.com',
      password: '',
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const json = await response.json()
    expect(json.error).toBeDefined()
    expect(json.error.message).toContain('password')
  })

  it('should return 401 for invalid credentials', async () => {
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: null,
          error: {
            message: 'Invalid login credentials',
          },
        }),
      },
    }

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = createRequest({
      email: 'test@example.com',
      password: 'wrongpassword',
    })

    const response = await POST(request)
    expect(response.status).toBe(401)

    const json = await response.json()
    expect(json.error.message).toBe('Invalid email or password')
    expect(json.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('should return 500 for login failure', async () => {
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: null,
        }),
      },
    }

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
    })

    const response = await POST(request)
    expect(response.status).toBe(500)

    const json = await response.json()
    expect(json.error.message).toBe('Failed to create session')
  })

  it('should return 429 when rate limit exceeded', async () => {
    const { checkRateLimit } = await import('@/lib/api/rate-limit')
    vi.mocked(checkRateLimit).mockReturnValue(
      new Response(
        JSON.stringify({
          error: { message: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
        }),
        { status: 429 }
      ) as any
    )

    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
    })

    const response = await POST(request)
    expect(response.status).toBe(429)
  })
})
