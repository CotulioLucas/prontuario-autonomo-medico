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

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

import CadastroAutonomoPage from '@/app/(auth)/cadastro/autonomo/page'
import { toast } from 'sonner'

const mockToast = vi.mocked(toast)

describe('US-FE-F01-02: Cadastro Autonomo Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiPost.mockReset()
  })

  it('should render stepper with 3 steps', () => {
    render(<CadastroAutonomoPage />)
    
    expect(screen.getByText('Dados pessoais')).toBeInTheDocument()
    expect(screen.getByText('Dados profissionais')).toBeInTheDocument()
    expect(screen.getByText('Termos')).toBeInTheDocument()
  })

  it('should show step 1 fields initially', () => {
    render(<CadastroAutonomoPage />)
    
    expect(screen.getByRole('textbox', { name: /nome completo/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /e-mail/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /proximo/i })).toBeInTheDocument()
  })

  it('should validate required fields on step 1', async () => {
    const user = userEvent.setup()
    render(<CadastroAutonomoPage />)
    
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/nome deve ter pelo menos 3 caracteres/i)).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    const user = userEvent.setup()
    render(<CadastroAutonomoPage />)
    
    await user.type(screen.getByRole('textbox', { name: /nome completo/i }), 'Joao Silva')
    await user.type(screen.getByRole('textbox', { name: /e-mail/i }), 'invalid-email')
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/e-mail invalido/i)).toBeInTheDocument()
    })
  })

  it('should validate password requirements', async () => {
    const user = userEvent.setup()
    render(<CadastroAutonomoPage />)
    
    const passwordInputs = screen.getAllByLabelText(/senha/i)
    await user.type(passwordInputs[0], 'weak')
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/senha deve ter pelo menos 8 caracteres/i)).toBeInTheDocument()
    })
  })

  it('should validate password confirmation match', async () => {
    const user = userEvent.setup()
    render(<CadastroAutonomoPage />)
    
    const passwordInputs = screen.getAllByLabelText(/senha/i)
    await user.type(passwordInputs[0], 'Password123')
    await user.type(passwordInputs[1], 'Different123')
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/as senhas nao conferem/i)).toBeInTheDocument()
    })
  })

  it('should navigate to step 2 after valid step 1', async () => {
    const user = userEvent.setup()
    render(<CadastroAutonomoPage />)
    
    await user.type(screen.getByRole('textbox', { name: /nome completo/i }), 'Joao Silva')
    await user.type(screen.getByRole('textbox', { name: /e-mail/i }), 'joao@example.com')
    
    const phoneInput = screen.getByPlaceholderText(/\(00\) 00000-0000/i)
    await user.type(phoneInput, '11999999999')
    
    const cpfInput = screen.getByPlaceholderText(/000\.000\.000-00/i)
    await user.type(cpfInput, '12345678901')
    
    const passwordInputs = screen.getAllByLabelText(/senha/i)
    await user.type(passwordInputs[0], 'Password123')
    await user.type(passwordInputs[1], 'Password123')
    
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /tipo de profissional/i })).toBeInTheDocument()
    })
  })

  it('should show success screen after successful registration', async () => {
    mockApiPost.mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<CadastroAutonomoPage />)
    
    await user.type(screen.getByRole('textbox', { name: /nome completo/i }), 'Joao Silva')
    await user.type(screen.getByRole('textbox', { name: /e-mail/i }), 'joao@example.com')
    
    const phoneInput = screen.getByPlaceholderText(/\(00\) 00000-0000/i)
    await user.type(phoneInput, '11999999999')
    
    const cpfInput = screen.getByPlaceholderText(/000\.000\.000-00/i)
    await user.type(cpfInput, '12345678901')
    
    const passwordInputs = screen.getAllByLabelText(/senha/i)
    await user.type(passwordInputs[0], 'Password123')
    await user.type(passwordInputs[1], 'Password123')
    
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /tipo de profissional/i })).toBeInTheDocument()
    })
    
    const nextButtons = screen.getAllByRole('button', { name: /proximo/i })
    await user.click(nextButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText(/termo de consentimento/i)).toBeInTheDocument()
    })
    
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    
    const createButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(createButton)
    
    await waitFor(() => {
      expect(screen.getByText(/verifique seu e-mail/i)).toBeInTheDocument()
    })
  })

  it('should show error for existing email', async () => {
    mockApiPost.mockRejectedValueOnce(
      new MockApiClientError({ code: 'EMAIL_ALREADY_EXISTS', message: 'Email ja cadastrado' })
    )
    
    const user = userEvent.setup()
    render(<CadastroAutonomoPage />)
    
    await user.type(screen.getByRole('textbox', { name: /nome completo/i }), 'Joao Silva')
    await user.type(screen.getByRole('textbox', { name: /e-mail/i }), 'existing@example.com')
    
    const phoneInput = screen.getByPlaceholderText(/\(00\) 00000-0000/i)
    await user.type(phoneInput, '11999999999')
    
    const cpfInput = screen.getByPlaceholderText(/000\.000\.000-00/i)
    await user.type(cpfInput, '12345678901')
    
    const passwordInputs = screen.getAllByLabelText(/senha/i)
    await user.type(passwordInputs[0], 'Password123')
    await user.type(passwordInputs[1], 'Password123')
    
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /tipo de profissional/i })).toBeInTheDocument()
    })
    
    const nextButtons = screen.getAllByRole('button', { name: /proximo/i })
    await user.click(nextButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText(/termo de consentimento/i)).toBeInTheDocument()
    })
    
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    
    const createButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(createButton)
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Este e-mail ja esta cadastrado')
    })
  })

  it('should show error for existing CPF', async () => {
    mockApiPost.mockRejectedValueOnce(
      new MockApiClientError({ code: 'CPF_ALREADY_EXISTS', message: 'CPF ja cadastrado' })
    )
    
    const user = userEvent.setup()
    render(<CadastroAutonomoPage />)
    
    await user.type(screen.getByRole('textbox', { name: /nome completo/i }), 'Joao Silva')
    await user.type(screen.getByRole('textbox', { name: /e-mail/i }), 'joao@example.com')
    
    const phoneInput = screen.getByPlaceholderText(/\(00\) 00000-0000/i)
    await user.type(phoneInput, '11999999999')
    
    const cpfInput = screen.getByPlaceholderText(/000\.000\.000-00/i)
    await user.type(cpfInput, '12345678901')
    
    const passwordInputs = screen.getAllByLabelText(/senha/i)
    await user.type(passwordInputs[0], 'Password123')
    await user.type(passwordInputs[1], 'Password123')
    
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /tipo de profissional/i })).toBeInTheDocument()
    })
    
    const nextButtons = screen.getAllByRole('button', { name: /proximo/i })
    await user.click(nextButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText(/termo de consentimento/i)).toBeInTheDocument()
    })
    
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    
    const createButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(createButton)
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Este CPF ja esta cadastrado')
    })
  })
})
