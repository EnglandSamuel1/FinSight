/**
 * Logging levels
 */
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Logger context interface
 */
export interface LogContext {
  [key: string]: unknown
}

/**
 * Structured logger utility
 * Format: console.log('[LEVEL]', message, { context })
 * 
 * @example
 * logger.info('API Request', { method: 'POST', path: '/api/transactions', userId: '123' })
 * logger.error('API Error', { error: 'Validation failed', requestId: 'abc123' })
 */
export const logger = {
  /**
   * Log info message
   */
  info: (message: string, context?: LogContext) => {
    console.log(`[${LogLevel.INFO}]`, message, context || {})
  },

  /**
   * Log warning message
   */
  warn: (message: string, context?: LogContext) => {
    console.warn(`[${LogLevel.WARN}]`, message, context || {})
  },

  /**
   * Log error message
   */
  error: (message: string, context?: LogContext) => {
    console.error(`[${LogLevel.ERROR}]`, message, context || {})
  },
}
