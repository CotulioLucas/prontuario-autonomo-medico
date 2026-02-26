"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface MaskedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  mask: "cpf" | "cnpj" | "phone" | "cep"
  value: string
  onChange: (value: string) => void
}

const masks = {
  cpf: {
    pattern: /^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/,
    format: (value: string) => {
      const numbers = value.replace(/\D/g, "").slice(0, 11)
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    },
  },
  cnpj: {
    pattern: /^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/,
    format: (value: string) => {
      const numbers = value.replace(/\D/g, "").slice(0, 14)
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})/, "$1-$2")
    },
  },
  phone: {
    pattern: /^(\d{0,2})(\d{0,5})(\d{0,4})$/,
    format: (value: string) => {
      const numbers = value.replace(/\D/g, "").slice(0, 11)
      if (numbers.length <= 10) {
        return numbers
          .replace(/(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{4})(\d)/, "$1-$2")
      }
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
    },
  },
  cep: {
    pattern: /^(\d{0,5})(\d{0,3})$/,
    format: (value: string) => {
      const numbers = value.replace(/\D/g, "").slice(0, 8)
      return numbers.replace(/(\d{5})(\d)/, "$1-$2")
    },
  },
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "")
      const formattedValue = masks[mask].format(rawValue)
      onChange(rawValue)
    }

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={masks[mask].format(value)}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
MaskedInput.displayName = "MaskedInput"

export { MaskedInput }
