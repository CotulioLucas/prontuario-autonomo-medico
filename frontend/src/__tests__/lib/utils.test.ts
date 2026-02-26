import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className merge)', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar')
      expect(result).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'included', false && 'excluded')
      expect(result).toBe('base included')
    })

    it('should merge tailwind classes correctly', () => {
      const result = cn('px-4 py-2', 'px-6')
      expect(result).toContain('py-2')
      expect(result).toContain('px-6')
      expect(result).not.toContain('px-4')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'end')
      expect(result).toBe('base end')
    })

    it('should handle object notation', () => {
      const result = cn({
        active: true,
        disabled: false,
        primary: true,
      })
      expect(result).toContain('active')
      expect(result).toContain('primary')
      expect(result).not.toContain('disabled')
    })

    it('should handle arrays', () => {
      const result = cn(['foo', 'bar'], 'baz')
      expect(result).toContain('foo')
      expect(result).toContain('bar')
      expect(result).toContain('baz')
    })
  })
})
