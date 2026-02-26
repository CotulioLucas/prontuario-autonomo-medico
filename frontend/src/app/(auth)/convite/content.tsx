"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, XCircle, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PasswordInput } from "@/components/ui/password-input"
import { api, ApiClientError } from "@/lib/api"

const PROFESSIONAL_TYPES = [
  { value: "medico", label: "Medico" },
  { value: "psicologo", label: "Psicologo" },
  { value: "fisioterapeuta", label: "Fisioterapeuta" },
  { value: "secretaria", label: "Secretaria" },
  { value: "admin", label: "Administrador" },
]

const CONSELHOS = [
  { value: "CRP", label: "CRP" },
  { value: "CREFITO", label: "CREFITO" },
  { value: "CRM", label: "CRM" },
  { value: "CREFONO", label: "CREFONO" },
  { value: "outro", label: "Outro" },
]

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO"
]

const inviteSchemaNewUser = z.object({
  nome: z.string().min(3, "Nome obrigatorio"),
  senha: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos 1 letra maiuscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos 1 numero"),
  confirmarSenha: z.string(),
  tipoProfissional: z.string().min(1, "Selecione o tipo"),
  conselho: z.string().optional(),
  numeroRegistro: z.string().optional(),
  ufRegistro: z.string().optional(),
  aceitouTermo: z.boolean().refine((val) => val === true, {
    message: "O aceite do termo e obrigatorio",
  }),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas nao conferem",
  path: ["confirmarSenha"],
})

type InviteDataNewUser = z.infer<typeof inviteSchemaNewUser>

interface InviteInfo {
  clinica: string
  logoUrl?: string
  papel: string
  email: string
  usuarioExistente: boolean
}

export function ConviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<InviteDataNewUser>({
    resolver: zodResolver(inviteSchemaNewUser),
    defaultValues: {
      nome: "",
      senha: "",
      confirmarSenha: "",
      tipoProfissional: "",
      conselho: "",
      numeroRegistro: "",
      ufRegistro: "",
      aceitouTermo: false,
    },
  })

  useEffect(() => {
    if (!token) {
      setError("Token invalido")
      setIsLoading(false)
      return
    }

    const fetchInviteInfo = async () => {
      try {
        const response = await api.get<InviteInfo>(`/auth/invite-info?token=${token}`)
        setInviteInfo(response)
      } catch (err) {
        if (err instanceof ApiClientError) {
          if (err.code === "INVITE_EXPIRED") {
            setError("Convite expirado")
          } else {
            setError("Convite invalido")
          }
        } else {
          setError("Erro ao carregar convite")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchInviteInfo()
  }, [token])

  const onSubmit = async (data: InviteDataNewUser) => {
    if (!token) return

    setIsSubmitting(true)
    try {
      await api.post("/auth/accept-invite", {
        token,
        nome: data.nome,
        senha: data.senha,
        tipoProfissional: data.tipoProfissional,
        conselho: data.conselho,
        numeroRegistro: data.numeroRegistro,
        ufRegistro: data.ufRegistro,
        aceitouTermoLGPD: data.aceitouTermo,
      })
      toast.success("Convite aceito com sucesso!")
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "INVITE_EXPIRED") {
          setError("Convite expirado")
        } else {
          toast.error(err.message)
        }
      } else {
        toast.error("Erro ao aceitar convite")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptExistingUser = async () => {
    if (!token) return

    setIsSubmitting(true)
    try {
      await api.post("/auth/accept-invite", { token })
      toast.success("Convite aceito com sucesso!")
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao aceitar convite")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="text-center">
        <CardContent className="pt-6">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Carregando convite...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="text-center">
        <CardContent className="pt-6">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {error === "Convite expirado" ? "Convite expirado" : "Convite invalido"}
          </h2>
          <p className="text-muted-foreground">
            Solicite um novo convite ao administrador da clinica.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!inviteInfo) return null

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "medico":
        return "success"
      case "psicologo":
        return "info"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          {inviteInfo.logoUrl ? (
            <img
              src={inviteInfo.logoUrl}
              alt={inviteInfo.clinica}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <Users className="h-8 w-8 text-emerald-600" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">Voce foi convidado para</p>
        <CardTitle className="text-xl">{inviteInfo.clinica}</CardTitle>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-sm text-muted-foreground">Papel:</span>
          <Badge variant={getRoleBadgeVariant(inviteInfo.papel)}>
            {inviteInfo.papel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {inviteInfo.usuarioExistente ? (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Voce ja possui conta na plataforma
            </p>
            <p className="text-center font-medium">{inviteInfo.email}</p>
            <Button
              onClick={handleAcceptExistingUser}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aceitar convite
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" {...form.register("nome")} />
              {form.formState.errors.nome && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.nome.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <PasswordInput id="senha" {...form.register("senha")} />
                {form.formState.errors.senha && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.senha.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                <PasswordInput id="confirmarSenha" {...form.register("confirmarSenha")} />
                {form.formState.errors.confirmarSenha && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.confirmarSenha.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de profissional</Label>
              <Select
                value={form.watch("tipoProfissional")}
                onValueChange={(value) => form.setValue("tipoProfissional", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.tipoProfissional && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.tipoProfissional.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Conselho</Label>
                <Select
                  value={form.watch("conselho")}
                  onValueChange={(value) => form.setValue("conselho", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSELHOS.map((conselho) => (
                      <SelectItem key={conselho.value} value={conselho.value}>
                        {conselho.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroRegistro">Registro</Label>
                <Input id="numeroRegistro" {...form.register("numeroRegistro")} />
              </div>

              <div className="space-y-2">
                <Label>UF</Label>
                <Select
                  value={form.watch("ufRegistro")}
                  onValueChange={(value) => form.setValue("ufRegistro", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {UFS.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="aceitouTermo"
                checked={form.watch("aceitouTermo")}
                onCheckedChange={(checked) =>
                  form.setValue("aceitouTermo", checked === true)
                }
              />
              <Label htmlFor="aceitouTermo" className="text-sm">
                Li e aceito o Termo de Consentimento LGPD
              </Label>
            </div>
            {form.formState.errors.aceitouTermo && (
              <p className="text-sm text-destructive">
                {form.formState.errors.aceitouTermo.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar conta e aceitar convite
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
