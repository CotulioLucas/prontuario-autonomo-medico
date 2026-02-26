"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordInput } from "@/components/ui/password-input"
import { api, ApiClientError } from "@/lib/api"

const resetPasswordSchema = z
  .object({
    senha: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos 1 letra maiuscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos 1 numero"),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas nao conferem",
    path: ["confirmarSenha"],
  })

type ResetPasswordData = z.infer<typeof resetPasswordSchema>

export function RedefinirSenhaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const [isLoading, setIsLoading] = useState(false)
  const [tokenError, setTokenError] = useState(false)

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      senha: "",
      confirmarSenha: "",
    },
  })

  useEffect(() => {
    if (!token) {
      setTokenError(true)
    }
  }, [token])

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) return

    setIsLoading(true)
    try {
      await api.put("/auth/reset-password", {
        token,
        newPassword: data.senha,
        confirmPassword: data.confirmarSenha,
      })
      toast.success("Senha redefinida com sucesso!")
      router.push("/login")
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "TOKEN_EXPIRED" || err.code === "INVALID_TOKEN") {
          setTokenError(true)
        } else {
          toast.error(err.message)
        }
      } else {
        toast.error("Erro ao redefinir senha")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenError) {
    return (
      <Card className="text-center">
        <CardContent className="pt-6">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Link invalido ou expirado</h2>
          <p className="text-muted-foreground mb-6">
            Solicite um novo link de redefinicao de senha.
          </p>
          <Link href="/esqueci-senha">
            <Button className="w-full">Solicitar novo link</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Redefinir senha</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senha">Nova senha</Label>
            <PasswordInput
              id="senha"
              placeholder="Minimo 8 caracteres"
              {...form.register("senha")}
            />
            {form.formState.errors.senha && (
              <p className="text-sm text-destructive">
                {form.formState.errors.senha.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
            <PasswordInput
              id="confirmarSenha"
              placeholder="Confirme sua nova senha"
              {...form.register("confirmarSenha")}
            />
            {form.formState.errors.confirmarSenha && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmarSenha.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Redefinir
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
