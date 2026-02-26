import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

class MockApiClientError extends Error {
  code: string
  constructor(error: { code: string; message: string }) {
    super(error.message)
    this.code = error.code
    this.name = 'ApiClientError'
  }
}

const mockApiPost = vi.fn()

vi.mock('@/lib/api', () => ({
  api: {
    post: (...args: unknown[]) => mockApiPost(...args),
  },
  ApiClientError: MockApiClientError,
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

import LoginPage from '@/app/(auth)/login/page'
import { toast } from 'sonner'

const mockToast = vi.mocked(toast)

describe('US-FE-F01-01: Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiPost.mockReset()
  })

  it('should render login form with all fields', () => {
    render(<LoginPage />)
    
    expect(screen.getByRole('textbox', { name: /e-mail/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByRole('textbox', { name: /e-mail/i })
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/e-mail invalido/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for empty password', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByRole('textbox', { name: /e-mail/i })
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/senha obrigatoria/i)).toBeInTheDocument()
    })
  })

  it('should navigate to forgot password page', () => {
    render(<LoginPage />)
    
    const forgotPasswordLink = screen.getByRole('link', { name: /esqueci minha senha/i })
    expect(forgotPasswordLink).toHaveAttribute('href', '/esqueci-senha')
  })

  it('should navigate to autonomous signup page', () => {
    render(<LoginPage />)
    
    const signupLink = screen.getByRole('link', { name: /cadastrar como profissional/i })
    expect(signupLink).toHaveAttribute('href', '/cadastro/autonomo')
  })

  it('should navigate to clinic signup page', () => {
    render(<LoginPage />)
    
    const signupLink = screen.getByRole('link', { name: /cadastrar clinica/i })
    expect(signupLink).toHaveAttribute('href', '/cadastro/clinica')
  })

  it('should call API on form submit with correct data', async () => {
    mockApiPost.mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<LoginPage />)
    
    await user.type(screen.getByRole('textbox', { name: /e-mail/i }), 'test@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      })
    })
  })

  it('should redirect to dashboard on successful login', async () => {
    mockApiPost.mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<LoginPage />)
    
    await user.type(screen.getByRole('textbox', { name: /e-mail/i }), 'test@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should show toast error for invalid credentials', async () => {
    mockApiPost.mockRejectedValueOnce(
      new MockApiClientError({ code: 'INVALID_CREDENTIALS', message: 'Credenciais invalidas' })
    )
    
    const user = userEvent.setup()
    render(<LoginPage />)
    
    await user.type(screen.getByRole('textbox', { name: /e-mail/i }), 'test@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('E-mail ou senha invalidos')
    })
  })

  it('should show alert for locked account', async () => {
    mockApiPost.mockRejectedValueOnce(
      new MockApiClientError({ code: 'ACCOUNT_LOCKED', message: 'Conta bloqueada' })
    )
    
    const user = userEvent.setup()
    render(<LoginPage />)
    
    await user.type(screen.getByRole('textbox', { name: /e-mail/i }), 'test@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('should show alert with resend link for unconfirmed email', async () => {
    mockApiPost.mockRejectedValueOnce(
      new MockApiClientError({ code: 'EMAIL_NOT_CONFIRMED', message: 'Email nao confirmado' })
    )
    
    const user = userEvent.setup()
    render(<LoginPage />)
    
    await user.type(screen.getByRole('textbox', { name: /e-mail/i }), 'test@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /reenviar/i })).toBeInTheDocument()
    })
  })

  it('should disable submit button while loading', async () => {
    mockApiPost.mockImplementationOnce(() => new Promise(() => {}))
    
    const user = userEvent.setup()
    render(<LoginPage />)
    
    await user.type(screen.getByRole('textbox', { name: /e-mail/i }), 'test@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /entrar/i })).toBeDisabled()
    })
  })
})
