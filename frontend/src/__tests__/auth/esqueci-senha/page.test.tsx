import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EsqueciSenhaPage from '@/app/(auth)/esqueci-senha/page'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  api: {
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

describe('US-FE-F01-05a: Esqueci Senha Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render forgot password form', () => {
    render(<EsqueciSenhaPage />)
    
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar link/i })).toBeInTheDocument()
  })

  it('should validate required email field', async () => {
    const user = userEvent.setup()
    render(<EsqueciSenhaPage />)
    
    await user.click(screen.getByRole('button', { name: /enviar link/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/e-mail invalido/i)).toBeInTheDocument()
    })
  })

  it('should show success message after submit', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.post).mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<EsqueciSenhaPage />)
    
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /enviar link/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/e-mail enviado/i)).toBeInTheDocument()
    })
  })

  it('should show generic success message even if email does not exist', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Not found'))
    
    const user = userEvent.setup()
    render(<EsqueciSenhaPage />)
    
    await user.type(screen.getByLabelText(/e-mail/i), 'nonexistent@example.com')
    await user.click(screen.getByRole('button', { name: /enviar link/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/e-mail enviado/i)).toBeInTheDocument()
    })
  })

  it('should have link back to login', () => {
    render(<EsqueciSenhaPage />)
    
    expect(screen.getByRole('link', { name: /voltar para o login/i })).toHaveAttribute('href', '/login')
  })

  it('should disable button while loading', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.post).mockImplementationOnce(() => new Promise(() => {}))
    
    const user = userEvent.setup()
    render(<EsqueciSenhaPage />)
    
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /enviar link/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enviar link/i })).toBeDisabled()
    })
  })
})
