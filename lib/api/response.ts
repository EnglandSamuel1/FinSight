import { NextResponse } from 'next/server'

/**
 * API Response Types
 */
export interface ApiError {
  error: {
    message: string
    code?: string
  }
}

export type ApiSuccessResponse<T = unknown> = T

/**
 * Create a success response
 * Returns data directly (no wrapper) per architecture pattern
 * 
 * @param data - Data to return
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with data
 */
export function success<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status })
}

/**
 * Create an error response
 * Returns consistent error format: { error: { message: string, code?: string } }
 * 
 * @param message - Error message
 * @param status - HTTP status code (default: 500)
 * @param code - Optional error code
 * @returns NextResponse with error format
 */
export function error(
  message: string,
  status: number = 500,
  code?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: {
        message,
        ...(code && { code }),
      },
    },
    { status }
  )
}
