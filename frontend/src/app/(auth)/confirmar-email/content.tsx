"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, CheckCircle2, XCircle, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api, ApiClientError } from "@/lib/api"

type Status = "loading" | "success" | "error" | "expired" | "already_confirmed"

export function ConfirmarEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const resend = searchParams.get("resend")
  const [status, setStatus] = useState<Status>("loading")
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (resend === "true") {
      setStatus("expired")
      return
    }

    if (!token) {
      setStatus("error")
      return
    }

    const confirmEmail = async () => {
      try {
        const response = await api.get<{ status: string; email?: string }>(
          `/auth/confirm-email?token=${token}`
        )
        if (response.status === "already_confirmed") {
          setStatus("already_confirmed")
        } else {
          setStatus("success")
        }
      } catch (err) {
        if (err instanceof ApiClientError) {
          if (err.code === "TOKEN_EXPIRED") {
            setStatus("expired")
          } else if (err.code === "ALREADY_CONFIRMED") {
            setStatus("already_confirmed")
          } else {
            setStatus("error")
          }
        } else {
          setStatus("error")
        }
      }
    }

    confirmEmail()
  }, [token, resend])

  const handleResend = async () => {
    if (!email) return
    try {
      await api.post("/auth/resend-confirmation", { email })
      setStatus("success")
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "ALREADY_CONFIRMED") {
          setStatus("already_confirmed")
        }
      }
    }
  }

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
            <h2 className="text-xl font-semibold">Verificando seu e-mail...</h2>
          </>
        )

      case "success":
        return (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <h2 className="text-xl font-semibold">E-mail confirmado com sucesso!</h2>
            <p className="text-muted-foreground">
              Sua conta foi ativada. Voce ja pode acessar a plataforma.
            </p>
            <Link href="/login">
              <Button className="w-full">Ir para o sistema</Button>
            </Link>
          </>
        )

      case "expired":
        return (
          <>
            <XCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold">Link invalido ou expirado</h2>
            <p className="text-muted-foreground">
              O link de confirmacao pode ter expirado ou e invalido.
              Solicite um novo e-mail de confirmacao.
            </p>
            <div className="w-full space-y-2">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleResend} className="w-full">
                Reenviar e-mail
              </Button>
            </div>
          </>
        )

      case "already_confirmed":
        return (
          <>
            <Info className="h-12 w-12 text-blue-500" />
            <h2 className="text-xl font-semibold">E-mail ja confirmado</h2>
            <p className="text-muted-foreground">
              Sua conta ja esta ativa. Faca login para acessar.
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Ir para o login
              </Button>
            </Link>
          </>
        )

      case "error":
      default:
        return (
          <>
            <XCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold">Erro ao confirmar e-mail</h2>
            <p className="text-muted-foreground">
              Ocorreu um erro ao confirmar seu e-mail. Tente novamente.
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Voltar para o login
              </Button>
            </Link>
          </>
        )
    }
  }

  return (
    <Card className="text-center">
      <CardContent className="pt-6 space-y-4">
        {renderContent()}
      </CardContent>
    </Card>
  )
}
