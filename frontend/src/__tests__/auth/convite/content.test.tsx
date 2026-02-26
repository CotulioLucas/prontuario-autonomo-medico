import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConviteContent } from '@/app/(auth)/convite/content'

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

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: vi.fn((key) => {
      if (key === 'token') return 'valid-token'
      return null
    }),
  }),
}))

const mockInviteInfo = {
  clinica: 'Clinica Exemplo',
  logoUrl: null,
  papel: 'medico',
  email: 'invited@example.com',
  usuarioExistente: false,
}

describe('US-FE-F01-06: Aceitar Convite Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state initially', () => {
    render(<ConviteContent />)
    
    expect(screen.getByText(/carregando convite/i)).toBeInTheDocument()
  })

  it('should show invite info after loading', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get).mockResolvedValueOnce(mockInviteInfo)
    
    render(<ConviteContent />)
    
    await waitFor(() => {
      expect(screen.getByText('Clinica Exemplo')).toBeInTheDocument()
      expect(screen.getByText('medico')).toBeInTheDocument()
    })
  })

  it('should show form for new user', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get).mockResolvedValueOnce(mockInviteInfo)
    
    render(<ConviteContent />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
      expect(screen.getAllByLabelText(/senha/i).length).toBeGreaterThanOrEqual(2)
    })
  })

  it('should show accept button for existing user', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get).mockResolvedValueOnce({
      ...mockInviteInfo,
      usuarioExistente: true,
    })
    
    render(<ConviteContent />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /aceitar convite/i })).toBeInTheDocument()
      expect(screen.getByText(/voce ja possui conta/i)).toBeInTheDocument()
    })
  })

  it('should show error for expired invite', async () => {
    const { api, ApiClientError } = await import('@/lib/api')
    vi.mocked(api.get).mockRejectedValueOnce(
      new ApiClientError({ code: 'INVITE_EXPIRED', message: 'Convite expirado' })
    )
    
    render(<ConviteContent />)
    
    await waitFor(() => {
      expect(screen.getByText(/convite expirado/i)).toBeInTheDocument()
    })
  })

  it('should validate required fields for new user', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get).mockResolvedValueOnce(mockInviteInfo)
    
    const user = userEvent.setup()
    render(<ConviteContent />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /criar conta e aceitar convite/i })).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /criar conta e aceitar convite/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/nome obrigatorio/i)).toBeInTheDocument()
    })
  })

  it('should accept invite for existing user', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get).mockResolvedValueOnce({
      ...mockInviteInfo,
      usuarioExistente: true,
    })
    vi.mocked(api.post).mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<ConviteContent />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /aceitar convite/i })).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /aceitar convite/i }))
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/accept-invite', {
        token: 'valid-token',
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should accept invite for new user with form data', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get).mockResolvedValueOnce(mockInviteInfo)
    vi.mocked(api.post).mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<ConviteContent />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    })
    
    await user.type(screen.getByLabelText(/nome completo/i), 'Joao Silva')
    
    const passwordInputs = screen.getAllByLabelText(/senha/i)
    await user.type(passwordInputs[0], 'Password123')
    await user.type(passwordInputs[1], 'Password123')
    
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /criar conta e aceitar convite/i }))
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
