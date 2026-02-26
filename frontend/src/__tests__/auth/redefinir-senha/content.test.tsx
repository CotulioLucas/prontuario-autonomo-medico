import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RedefinirSenhaContent } from '@/app/(auth)/redefinir-senha/content'

const mockPush = vi.fn()
let mockToken: string | null = 'valid-token'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  api: {
    put: vi.fn(),
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
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => key === 'token' ? mockToken : null,
  }),
}))

describe('US-FE-F01-05b: Redefinir Senha Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToken = 'valid-token'
  })

  it('should render reset password form with valid token', async () => {
    render(<RedefinirSenhaContent />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/nova senha/i)).toBeInTheDocument()
    })
  })

  it('should validate password requirements', async () => {
    const user = userEvent.setup()
    render(<RedefinirSenhaContent />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/nova senha/i)).toBeInTheDocument()
    })
    
    await user.type(screen.getByLabelText(/nova senha/i), 'weak')
    await user.click(screen.getByRole('button', { name: /redefinir/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/senha deve ter pelo menos 8 caracteres/i)).toBeInTheDocument()
    })
  })

  it('should validate password confirmation match', async () => {
    const user = userEvent.setup()
    render(<RedefinirSenhaContent />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/nova senha/i)).toBeInTheDocument()
    })
    
    await user.type(screen.getByLabelText(/nova senha/i), 'Password123')
    await user.type(screen.getByLabelText(/confirmar nova senha/i), 'Different123')
    await user.click(screen.getByRole('button', { name: /redefinir/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/as senhas nao conferem/i)).toBeInTheDocument()
    })
  })

  it('should call API on form submit', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.put).mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<RedefinirSenhaContent />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/nova senha/i)).toBeInTheDocument()
    })
    
    await user.type(screen.getByLabelText(/nova senha/i), 'Password123')
    await user.type(screen.getByLabelText(/confirmar nova senha/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /redefinir/i }))
    
    await waitFor(() => {
      expect(api.put).toHaveBeenCalled()
    })
  })

  it('should show error state when token is missing', () => {
    mockToken = null
    render(<RedefinirSenhaContent />)
    
    expect(screen.getByText(/link invalido ou expirado/i)).toBeInTheDocument()
  })
})
