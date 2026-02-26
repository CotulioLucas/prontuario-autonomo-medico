"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { api, ApiClientError } from "@/lib/api"

const loginSchema = z.object({
  email: z.string().email("E-mail invalido"),
  password: z.string().min(1, "Senha obrigatoria"),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{
    code: string
    message: string
  } | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await api.post("/auth/login", {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      })
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "INVALID_CREDENTIALS") {
          toast.error("E-mail ou senha invalidos")
        } else if (err.code === "ACCOUNT_LOCKED") {
          setError({
            code: err.code,
            message:
              "Conta bloqueada temporariamente apos 5 tentativas. Tente novamente em 15 minutos ou redefina sua senha.",
          })
        } else if (err.code === "EMAIL_NOT_CONFIRMED") {
          setError({
            code: err.code,
            message: "Confirme seu e-mail antes de acessar.",
          })
        } else {
          toast.error(err.message)
        }
      } else {
        toast.error("Erro ao conectar com o servidor")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
        <p className="text-sm text-muted-foreground">
          Digite suas credenciais para acessar a plataforma
        </p>
      </div>

      {error && (
        <Alert variant={error.code === "ACCOUNT_LOCKED" ? "destructive" : "default"}>
          <AlertTitle>
            {error.code === "ACCOUNT_LOCKED" ? "Conta bloqueada" : "E-mail nao confirmado"}
          </AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{error.message}</span>
            {error.code === "EMAIL_NOT_CONFIRMED" && (
              <Link
                href="/confirmar-email?resend=true"
                className="text-primary underline-offset-4 hover:underline"
              >
                Reenviar e-mail de confirmacao
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            autoFocus
            disabled={isLoading}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Sua senha"
            autoComplete="current-password"
            disabled={isLoading}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              disabled={isLoading}
              checked={form.watch("rememberMe")}
              onCheckedChange={(checked) =>
                form.setValue("rememberMe", checked === true)
              }
            />
            <Label htmlFor="rememberMe" className="text-sm font-normal">
              Lembrar de mim
            </Label>
          </div>
          <Link
            href="/esqueci-senha"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Entrar
        </Button>
      </form>

      <Separator />

      <div className="space-y-3 text-center text-sm">
        <p className="text-muted-foreground">Ainda nao tem conta?</p>
        <div className="flex flex-col gap-2">
          <Link href="/cadastro/autonomo">
            <Button variant="outline" className="w-full">
              Cadastrar como profissional
            </Button>
          </Link>
          <Link href="/cadastro/clinica">
            <Button variant="outline" className="w-full">
              Cadastrar clinica
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
