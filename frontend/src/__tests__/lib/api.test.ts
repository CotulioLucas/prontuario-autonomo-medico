import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

class ApiClientError extends Error {
  code: string
  details?: unknown

  constructor(error: { code: string; message: string; details?: unknown }) {
    super(error.message)
    this.code = error.code
    this.details = error.details
    this.name = 'ApiClientError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiClientError(data as { code: string; message: string; details?: unknown })
  }

  return data as T
}

const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should make GET request with correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    })
    
    const result = await api.get('/test')
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/test'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
      })
    )
    expect(result).toEqual({ data: 'test' })
  })

  it('should make POST request with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    })
    
    const result = await api.post('/test', { name: 'test' })
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/test'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      })
    )
    expect(result).toEqual({ id: 1 })
  })

  it('should make PUT request with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ updated: true }),
    })
    
    const result = await api.put('/test/1', { name: 'updated' })
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/test/1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'updated' }),
      })
    )
    expect(result).toEqual({ updated: true })
  })

  it('should make DELETE request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deleted: true }),
    })
    
    const result = await api.delete('/test/1')
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/test/1'),
      expect.objectContaining({
        method: 'DELETE',
      })
    )
    expect(result).toEqual({ deleted: true })
  })

  it('should throw ApiClientError on error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        code: 'VALIDATION_ERROR',
        message: 'Invalid data',
        details: { field: 'email' },
      }),
    })
    
    await expect(api.post('/test', {})).rejects.toThrow('Invalid data')
    
    try {
      await api.post('/test', {})
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError)
      expect((error as ApiClientError).code).toBe('VALIDATION_ERROR')
      expect((error as ApiClientError).details).toEqual({ field: 'email' })
    }
  })

  it('should handle common error codes', async () => {
    const errorCodes = [
      'INVALID_CREDENTIALS',
      'ACCOUNT_LOCKED',
      'EMAIL_NOT_CONFIRMED',
      'TOKEN_EXPIRED',
    ]
    
    for (const code of errorCodes) {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          code,
          message: `Error: ${code}`,
        }),
      })
      
      try {
        await api.get('/test')
        expect.fail(`Should have thrown for ${code}`)
      } catch (error) {
        expect((error as ApiClientError).code).toBe(code)
      }
    }
  })
})

describe('ApiClientError', () => {
  it('should create error with code and message', () => {
    const error = new ApiClientError({
      code: 'TEST_ERROR',
      message: 'Test error message',
    })
    
    expect(error).toBeInstanceOf(Error)
    expect(error.code).toBe('TEST_ERROR')
    expect(error.message).toBe('Test error message')
    expect(error.name).toBe('ApiClientError')
  })

  it('should create error with details', () => {
    const error = new ApiClientError({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: { fields: ['email', 'password'] },
    })
    
    expect(error.details).toEqual({ fields: ['email', 'password'] })
  })
})
