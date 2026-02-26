import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CadastroClinicaPage from '@/app/(auth)/cadastro/clinica/page'

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

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('US-FE-F01-03: Cadastro Clinica Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render stepper with 4 steps', () => {
    render(<CadastroClinicaPage />)
    
    expect(screen.getByText('Dados admin')).toBeInTheDocument()
    expect(screen.getByText('Dados clinica')).toBeInTheDocument()
    expect(screen.getByText('Personalizacao')).toBeInTheDocument()
    expect(screen.getByText('Termos')).toBeInTheDocument()
  })

  it('should show admin data fields on step 1', () => {
    render(<CadastroClinicaPage />)
    
    expect(screen.getByLabelText(/nome completo do administrador/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/000\.000\.000-00/i)).toBeInTheDocument()
  })

  it('should validate admin fields', async () => {
    const user = userEvent.setup()
    render(<CadastroClinicaPage />)
    
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/nome deve ter pelo menos 3 caracteres/i)).toBeInTheDocument()
    })
  })

  it('should navigate to step 2 after valid step 1', async () => {
    const user = userEvent.setup()
    render(<CadastroClinicaPage />)
    
    await user.type(screen.getByLabelText(/nome completo do administrador/i), 'Admin Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'admin@clinica.com')
    await user.type(screen.getByPlaceholderText(/\(00\) 00000-0000/i), '11999999999')
    await user.type(screen.getByPlaceholderText(/000\.000\.000-00/i), '12345678901')
    await user.type(screen.getByLabelText(/senha/i), 'Password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByLabelText(/razao social/i)).toBeInTheDocument()
    })
  })

  it('should validate CNPJ field on step 2', async () => {
    const user = userEvent.setup()
    render(<CadastroClinicaPage />)
    
    await user.type(screen.getByLabelText(/nome completo do administrador/i), 'Admin Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'admin@clinica.com')
    await user.type(screen.getByPlaceholderText(/\(00\) 00000-0000/i), '11999999999')
    await user.type(screen.getByPlaceholderText(/000\.000\.000-00/i), '12345678901')
    await user.type(screen.getByLabelText(/senha/i), 'Password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByLabelText(/razao social/i)).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/razao social obrigatoria/i)).toBeInTheDocument()
    })
  })

  it('should allow skipping customization step', async () => {
    const user = userEvent.setup()
    render(<CadastroClinicaPage />)
    
    await user.type(screen.getByLabelText(/nome completo do administrador/i), 'Admin Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'admin@clinica.com')
    await user.type(screen.getByPlaceholderText(/\(00\) 00000-0000/i), '11999999999')
    await user.type(screen.getByPlaceholderText(/000\.000\.000-00/i), '12345678901')
    await user.type(screen.getByLabelText(/senha/i), 'Password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByLabelText(/razao social/i)).toBeInTheDocument()
    })
    
    await user.type(screen.getByLabelText(/razao social/i), 'Clinica Exemplo LTDA')
    await user.type(screen.getByPlaceholderText(/00\.000\.000\/0000-00/i), '12345678000190')
    
    const phoneInputs = screen.getAllByPlaceholderText(/\(00\) 00000-0000/i)
    await user.type(phoneInputs[phoneInputs.length - 1], '1133333333')
    
    await user.type(screen.getByPlaceholderText(/00000-000/i), '01234567')
    await user.type(screen.getByLabelText(/rua/i), 'Rua Exemplo')
    await user.type(screen.getByLabelText(/numero/i), '100')
    await user.type(screen.getByLabelText(/bairro/i), 'Centro')
    await user.type(screen.getByLabelText(/cidade/i), 'Sao Paulo')
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pular/i })).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /pular/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/termo de consentimento/i)).toBeInTheDocument()
    })
  })

  it('should show success screen after successful registration', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.post).mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<CadastroClinicaPage />)
    
    await user.type(screen.getByLabelText(/nome completo do administrador/i), 'Admin Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'admin@clinica.com')
    await user.type(screen.getByPlaceholderText(/\(00\) 00000-0000/i), '11999999999')
    await user.type(screen.getByPlaceholderText(/000\.000\.000-00/i), '12345678901')
    await user.type(screen.getByLabelText(/senha/i), 'Password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByLabelText(/razao social/i)).toBeInTheDocument()
    })
    
    await user.type(screen.getByLabelText(/razao social/i), 'Clinica Exemplo LTDA')
    await user.type(screen.getByPlaceholderText(/00\.000\.000\/0000-00/i), '12345678000190')
    
    const phoneInputs = screen.getAllByPlaceholderText(/\(00\) 00000-0000/i)
    await user.type(phoneInputs[phoneInputs.length - 1], '1133333333')
    
    await user.type(screen.getByPlaceholderText(/00000-000/i), '01234567')
    await user.type(screen.getByLabelText(/rua/i), 'Rua Exemplo')
    await user.type(screen.getByLabelText(/numero/i), '100')
    await user.type(screen.getByLabelText(/bairro/i), 'Centro')
    await user.type(screen.getByLabelText(/cidade/i), 'Sao Paulo')
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pular/i })).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /pular/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/termo de consentimento/i)).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /criar conta/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/verifique seu e-mail/i)).toBeInTheDocument()
    })
  })

  it('should show error for existing CNPJ', async () => {
    const { api, ApiClientError } = await import('@/lib/api')
    const { toast } = await import('sonner')
    
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiClientError({ code: 'CNPJ_ALREADY_EXISTS', message: 'CNPJ ja cadastrado' })
    )
    
    const user = userEvent.setup()
    render(<CadastroClinicaPage />)
    
    await user.type(screen.getByLabelText(/nome completo do administrador/i), 'Admin Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'admin@clinica.com')
    await user.type(screen.getByPlaceholderText(/\(00\) 00000-0000/i), '11999999999')
    await user.type(screen.getByPlaceholderText(/000\.000\.000-00/i), '12345678901')
    await user.type(screen.getByLabelText(/senha/i), 'Password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByLabelText(/razao social/i)).toBeInTheDocument()
    })
    
    await user.type(screen.getByLabelText(/razao social/i), 'Clinica Exemplo LTDA')
    await user.type(screen.getByPlaceholderText(/00\.000\.000\/0000-00/i), '12345678000190')
    
    const phoneInputs = screen.getAllByPlaceholderText(/\(00\) 00000-0000/i)
    await user.type(phoneInputs[phoneInputs.length - 1], '1133333333')
    
    await user.type(screen.getByPlaceholderText(/00000-000/i), '01234567')
    await user.type(screen.getByLabelText(/rua/i), 'Rua Exemplo')
    await user.type(screen.getByLabelText(/numero/i), '100')
    await user.type(screen.getByLabelText(/bairro/i), 'Centro')
    await user.type(screen.getByLabelText(/cidade/i), 'Sao Paulo')
    await user.click(screen.getByRole('button', { name: /proximo/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pular/i })).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /pular/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/termo de consentimento/i)).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /criar conta/i }))
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Este CNPJ ja esta cadastrado')
    })
  })
})
