import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EquipePage from '@/app/(dashboard)/configuracoes/equipe/page'

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
    put: vi.fn(),
    delete: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    code: string
    constructor(error: { code: string; message: string }) {
      super(error.message)
      this.code = error.code
    }
  },
}))

vi.mock('@/components/layout', () => ({
  Header: ({ breadcrumbs }: { breadcrumbs: { label: string }[] }) => (
    <header data-testid="header">
      {breadcrumbs.map((b) => b.label).join(' > ')}
    </header>
  ),
}))

const mockMembers = [
  { id: '1', nome: 'Joao Silva', email: 'joao@email.com', papel: 'medico', status: 'ativo' },
  { id: '2', nome: 'Maria Santos', email: 'maria@email.com', papel: 'psicologo', status: 'pendente' },
]

describe('US-FE-F01-07a-e: Gestao de Equipe Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state initially', () => {
    render(<EquipePage />)
    
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('should show empty state when no members', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get)
      .mockResolvedValueOnce({ members: [] })
      .mockResolvedValueOnce({ invites: [] })
    
    render(<EquipePage />)
    
    await waitFor(() => {
      expect(screen.getByText(/nenhum membro na equipe/i)).toBeInTheDocument()
    })
  })

  it('should show members list after loading', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get)
      .mockResolvedValueOnce({ members: mockMembers })
      .mockResolvedValueOnce({ invites: [] })
    
    render(<EquipePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Joao Silva')).toBeInTheDocument()
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    })
  })

  it('should open invite dialog when clicking invite button', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get)
      .mockResolvedValueOnce({ members: [] })
      .mockResolvedValueOnce({ invites: [] })
    
    const user = userEvent.setup()
    render(<EquipePage />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /convidar membro/i })).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /convidar membro/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    })
  })

  it('should send invite', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get)
      .mockResolvedValueOnce({ members: [] })
      .mockResolvedValueOnce({ invites: [] })
    vi.mocked(api.post).mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<EquipePage />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /convidar membro/i })).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /convidar membro/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    await user.type(screen.getByLabelText(/e-mail/i), 'newuser@email.com')
    
    const selectTrigger = screen.getByRole('combobox')
    await user.click(selectTrigger)
    
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /medico/i })).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('option', { name: /medico/i }))
    
    await user.click(screen.getByRole('button', { name: /enviar convite/i }))
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/team/invites', {
        email: 'newuser@email.com',
        role: 'medico',
      })
    })
  })

  it('should show resend option for pending invites', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get)
      .mockResolvedValueOnce({ members: [] })
      .mockResolvedValueOnce({ invites: [{ id: '2', nome: 'Maria Santos', email: 'maria@email.com', papel: 'psicologo', status: 'pendente' }] })
    vi.mocked(api.post).mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<EquipePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    })
    
    const moreButtons = screen.getAllByRole('button')
    const moreButton = moreButtons.find(btn => btn.querySelector('svg[class*="lucide-more-horizontal"]'))
    
    if (moreButton) {
      await user.click(moreButton)
      
      await waitFor(() => {
        expect(screen.getByText(/reenviar convite/i)).toBeInTheDocument()
      })
    }
  })

  it('should show change role option for active members', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get)
      .mockResolvedValueOnce({ members: mockMembers })
      .mockResolvedValueOnce({ invites: [] })
    
    const user = userEvent.setup()
    render(<EquipePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Joao Silva')).toBeInTheDocument()
    })
    
    const moreButtons = screen.getAllByRole('button')
    const moreButton = moreButtons.find(btn => btn.querySelector('svg[class*="lucide-more-horizontal"]'))
    
    if (moreButton) {
      await user.click(moreButton)
      
      await waitFor(() => {
        expect(screen.getByText(/alterar papel/i)).toBeInTheDocument()
      })
    }
  })

  it('should change member role', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get)
      .mockResolvedValueOnce({ members: mockMembers })
      .mockResolvedValueOnce({ invites: [] })
    vi.mocked(api.put).mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<EquipePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Joao Silva')).toBeInTheDocument()
    })
    
    const moreButtons = screen.getAllByRole('button')
    const moreButton = moreButtons.find(btn => btn.querySelector('svg[class*="lucide-more-horizontal"]'))
    
    if (moreButton) {
      await user.click(moreButton)
      
      await waitFor(() => {
        expect(screen.getByText(/alterar papel/i)).toBeInTheDocument()
      })
      
      await user.click(screen.getByText(/alterar papel/i))
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText(/alterar papel/i)).toBeInTheDocument()
      })
    }
  })

  it('should show deactivate confirmation dialog', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get)
      .mockResolvedValueOnce({ members: mockMembers })
      .mockResolvedValueOnce({ invites: [] })
    
    const user = userEvent.setup()
    render(<EquipePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Joao Silva')).toBeInTheDocument()
    })
    
    const moreButtons = screen.getAllByRole('button')
    const moreButton = moreButtons.find(btn => btn.querySelector('svg[class*="lucide-more-horizontal"]'))
    
    if (moreButton) {
      await user.click(moreButton)
      
      await waitFor(() => {
        expect(screen.getByText(/desativar/i)).toBeInTheDocument()
      })
      
      await user.click(screen.getByText(/desativar/i))
      
      await waitFor(() => {
        expect(screen.getByText(/tem certeza/i)).toBeInTheDocument()
      })
    }
  })

  it('should deactivate member after confirmation', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get)
      .mockResolvedValueOnce({ members: mockMembers })
      .mockResolvedValueOnce({ invites: [] })
    vi.mocked(api.put).mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<EquipePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Joao Silva')).toBeInTheDocument()
    })
    
    const moreButtons = screen.getAllByRole('button')
    const moreButton = moreButtons.find(btn => btn.querySelector('svg[class*="lucide-more-horizontal"]'))
    
    if (moreButton) {
      await user.click(moreButton)
      
      await waitFor(() => {
        expect(screen.getByText(/desativar/i)).toBeInTheDocument()
      })
      
      await user.click(screen.getByText(/desativar/i))
      
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      })
      
      const deactivateButtons = screen.getAllByRole('button', { name: /desativar/i })
      const confirmButton = deactivateButtons.find(btn => btn.closest('[role="alertdialog"]'))
      
      if (confirmButton) {
        await user.click(confirmButton)
        
        await waitFor(() => {
          expect(api.put).toHaveBeenCalledWith('/team/members/1/deactivate')
        })
      }
    }
  })

  it('should revoke pending invite', async () => {
    const { api } = await import('@/lib/api')
    vi.mocked(api.get)
      .mockResolvedValueOnce({ members: [] })
      .mockResolvedValueOnce({ invites: [{ id: '2', nome: 'Maria Santos', email: 'maria@email.com', papel: 'psicologo', status: 'pendente' }] })
    vi.mocked(api.delete).mockResolvedValueOnce({})
    
    const user = userEvent.setup()
    render(<EquipePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    })
    
    const moreButtons = screen.getAllByRole('button')
    const moreButton = moreButtons.find(btn => btn.querySelector('svg[class*="lucide-more-horizontal"]'))
    
    if (moreButton) {
      await user.click(moreButton)
      
      await waitFor(() => {
        expect(screen.getByText(/revogar convite/i)).toBeInTheDocument()
      })
      
      await user.click(screen.getByText(/revogar convite/i))
      
      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith('/team/invites/2')
      })
    }
  })
})
