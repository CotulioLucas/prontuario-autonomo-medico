import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />)
    
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should accept value and onChange', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'hello')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />)
    
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('should accept custom className', () => {
    render(<Input className="custom-input" />)
    
    expect(screen.getByRole('textbox')).toHaveClass('custom-input')
  })

  it('should support different input types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    
    rerender(<Input type="password" />)
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password')
    
    rerender(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
  })
})
