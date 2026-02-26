import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmarEmailContent } from '@/app/(auth)/confirmar-email/content'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    code: string
    constructor(error: { code: string; message: string }) {
      super(error.message)
      this.code = error.code
    }
  },
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn((key) => {
      if (key === 'token') return 'valid-token'
      if (key === 'resend') return null
      return null
    }),
  }),
}))

describe('US-FE-F01-04a/04b: Confirmar Email Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state initially', () => {
    render(<ConfirmarEmailContent />)
    
    expect(screen.getByText(/verificando seu e-mail/i)).toBeInTheDocument()
  })

  it('should show success state after valid token', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get).mockResolvedValueOnce({ status: 'confirmed' })
    
    render(<ConfirmarEmailContent />)
    
    await waitFor(() => {
      expect(screen.getByText(/e-mail confirmado com sucesso/i)).toBeInTheDocument()
    })
  })

  it('should show already confirmed state', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get).mockResolvedValueOnce({ status: 'already_confirmed' })
    
    render(<ConfirmarEmailContent />)
    
    await waitFor(() => {
      expect(screen.getByText(/e-mail ja confirmado/i)).toBeInTheDocument()
    })
  })

  it('should show expired state for expired token', async () => {
    const { api, ApiClientError } = await import('@/lib/api')
    vi.mocked(api.get).mockRejectedValueOnce(
      new ApiClientError({ code: 'TOKEN_EXPIRED', message: 'Token expirado' })
    )
    
    render(<ConfirmarEmailContent />)
    
    await waitFor(() => {
      expect(screen.getByText(/link invalido ou expirado/i)).toBeInTheDocument()
    })
  })

  it('should show resend form when token is expired', async () => {
    const { api, ApiClientError } = await import('@/lib/api')
    vi.mocked(api.get).mockRejectedValueOnce(
      new ApiClientError({ code: 'TOKEN_EXPIRED', message: 'Token expirado' })
    )
    
    render(<ConfirmarEmailContent />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/seu e-mail/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reenviar e-mail/i })).toBeInTheDocument()
    })
  })

  it('should resend confirmation email', async () => {
    const { api, ApiClientError } = await import('@/lib/api')
    vi.mocked(api.get).mockRejectedValueOnce(
      new ApiClientError({ code: 'TOKEN_EXPIRED', message: 'Token expirado' })
    )
    vi.mocked(api.post).mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<ConfirmarEmailContent />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/seu e-mail/i)).toBeInTheDocument()
    })
    
    await user.type(screen.getByPlaceholderText(/seu e-mail/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /reenviar e-mail/i }))
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/resend-confirmation', {
        email: 'test@example.com',
      })
    })
  })

  it('should have link to login on success', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get).mockResolvedValueOnce({ status: 'confirmed' })
    
    render(<ConfirmarEmailContent />)
    
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /ir para o sistema/i })).toHaveAttribute('href', '/login')
    })
  })

  it('should show error state for invalid token', async () => {
    const { api, ApiClientError } = await import('@/lib/api')
    vi.mocked(api.get).mockRejectedValueOnce(
      new ApiClientError({ code: 'INVALID_TOKEN', message: 'Token invalido' })
    )
    
    render(<ConfirmarEmailContent />)
    
    await waitFor(() => {
      expect(screen.getByText(/erro ao confirmar e-mail/i)).toBeInTheDocument()
    })
  })
})
