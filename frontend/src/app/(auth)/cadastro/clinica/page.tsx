"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Stepper } from "@/components/ui/stepper"
import { MaskedInput } from "@/components/ui/masked-input"
import { PasswordInput } from "@/components/ui/password-input"
import { api, ApiClientError } from "@/lib/api"

const STEPS = [
  { label: "Dados admin" },
  { label: "Dados clinica" },
  { label: "Personalizacao" },
  { label: "Termos" },
]

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO"
]

const adminDataSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail invalido"),
  telefone: z.string().min(10, "Telefone invalido"),
  cpf: z.string().length(11, "CPF deve ter 11 digitos"),
  senha: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos 1 letra maiuscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos 1 numero"),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas nao conferem",
  path: ["confirmarSenha"],
})

const clinicDataSchema = z.object({
  razaoSocial: z.string().min(1, "Razao social obrigatoria"),
  cnpj: z.string().length(14, "CNPJ deve ter 14 digitos"),
  telefoneClinica: z.string().min(10, "Telefone invalido"),
  cep: z.string().min(8, "CEP invalido"),
  rua: z.string().min(1, "Rua obrigatoria"),
  numero: z.string().min(1, "Numero obrigatorio"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro obrigatorio"),
  cidade: z.string().min(1, "Cidade obrigatoria"),
  uf: z.string().min(1, "UF obrigatoria"),
})

const customizationSchema = z.object({
  logoUrl: z.string().optional(),
  corPrimaria: z.string().optional(),
  corSecundaria: z.string().optional(),
})

const termsSchema = z.object({
  aceitouTermo: z.boolean().refine((val) => val === true, {
    message: "O aceite do termo e obrigatorio",
  }),
})

type AdminData = z.infer<typeof adminDataSchema>
type ClinicData = z.infer<typeof clinicDataSchema>
type CustomizationData = z.infer<typeof customizationSchema>
type TermsData = z.infer<typeof termsSchema>

export default function CadastroClinicaPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  const adminForm = useForm<AdminData>({
    resolver: zodResolver(adminDataSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      senha: "",
      confirmarSenha: "",
    },
  })

  const clinicForm = useForm<ClinicData>({
    resolver: zodResolver(clinicDataSchema),
    defaultValues: {
      razaoSocial: "",
      cnpj: "",
      telefoneClinica: "",
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
    },
  })

  const customizationForm = useForm<CustomizationData>({
    resolver: zodResolver(customizationSchema),
    defaultValues: {
      logoUrl: "",
      corPrimaria: "#059669",
      corSecundaria: "#0d9488",
    },
  })

  const termsForm = useForm<TermsData>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      aceitouTermo: false,
    },
  })

  const handleCepBlur = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        if (!data.erro) {
          clinicForm.setValue("rua", data.logradouro || "")
          clinicForm.setValue("bairro", data.bairro || "")
          clinicForm.setValue("cidade", data.localidade || "")
          clinicForm.setValue("uf", data.uf || "")
        }
      } catch {
        toast.error("Erro ao buscar CEP")
      }
    }
  }

  const handleNextStep = async () => {
    let isValid = false
    if (currentStep === 0) {
      isValid = await adminForm.trigger()
    } else if (currentStep === 1) {
      isValid = await clinicForm.trigger()
    } else if (currentStep === 2) {
      isValid = true
    }
    if (isValid) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleSubmit = async () => {
    const isValid = await termsForm.trigger()
    if (!isValid) return

    setIsLoading(true)
    try {
      const adminData = adminForm.getValues()
      const clinicData = clinicForm.getValues()
      const customizationData = customizationForm.getValues()

      await api.post("/auth/register/clinica", {
        razaoSocial: clinicData.razaoSocial,
        cnpj: clinicData.cnpj,
        telefone: clinicData.telefoneClinica,
        endereco: {
          cep: clinicData.cep,
          rua: clinicData.rua,
          numero: clinicData.numero,
          complemento: clinicData.complemento,
          bairro: clinicData.bairro,
          cidade: clinicData.cidade,
          uf: clinicData.uf,
        },
        admin: {
          nome: adminData.nome,
          email: adminData.email,
          telefone: adminData.telefone,
          cpf: adminData.cpf,
          senha: adminData.senha,
        },
        personalizacao: customizationData,
        aceitouTermoLGPD: true,
      })

      setSubmittedEmail(adminData.email)
      setIsSuccess(true)
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "CNPJ_ALREADY_EXISTS") {
          toast.error("Este CNPJ ja esta cadastrado")
        } else if (err.code === "EMAIL_ALREADY_EXISTS") {
          toast.error("Este e-mail ja esta cadastrado")
        } else {
          toast.error(err.message)
        }
      } else {
        toast.error("Erro ao criar conta")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Mail className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Verifique seu e-mail</h2>
          <p className="text-muted-foreground mb-6">
            Enviamos um link de confirmacao para <strong>{submittedEmail}</strong>.
            Verifique sua caixa de entrada e clique no link para ativar sua conta.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Voltar para o login
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="text-center">Criar conta para clinica</CardTitle>
        <Stepper steps={STEPS} currentStep={currentStep} />
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo do administrador</Label>
              <Input
                id="nome"
                placeholder="Seu nome completo"
                {...adminForm.register("nome")}
              />
              {adminForm.formState.errors.nome && (
                <p className="text-sm text-destructive">
                  {adminForm.formState.errors.nome.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...adminForm.register("email")}
              />
              {adminForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {adminForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <MaskedInput
                  mask="phone"
                  value={adminForm.watch("telefone")}
                  onChange={(value) => adminForm.setValue("telefone", value)}
                  placeholder="(00) 00000-0000"
                />
                {adminForm.formState.errors.telefone && (
                  <p className="text-sm text-destructive">
                    {adminForm.formState.errors.telefone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <MaskedInput
                  mask="cpf"
                  value={adminForm.watch("cpf")}
                  onChange={(value) => adminForm.setValue("cpf", value)}
                  placeholder="000.000.000-00"
                />
                {adminForm.formState.errors.cpf && (
                  <p className="text-sm text-destructive">
                    {adminForm.formState.errors.cpf.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <PasswordInput
                id="senha"
                placeholder="Minimo 8 caracteres"
                {...adminForm.register("senha")}
              />
              {adminForm.formState.errors.senha && (
                <p className="text-sm text-destructive">
                  {adminForm.formState.errors.senha.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar senha</Label>
              <PasswordInput
                id="confirmarSenha"
                placeholder="Confirme sua senha"
                {...adminForm.register("confirmarSenha")}
              />
              {adminForm.formState.errors.confirmarSenha && (
                <p className="text-sm text-destructive">
                  {adminForm.formState.errors.confirmarSenha.message}
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="razaoSocial">Razao social</Label>
              <Input
                id="razaoSocial"
                placeholder="Nome da clinica"
                {...clinicForm.register("razaoSocial")}
              />
              {clinicForm.formState.errors.razaoSocial && (
                <p className="text-sm text-destructive">
                  {clinicForm.formState.errors.razaoSocial.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <MaskedInput
                  mask="cnpj"
                  value={clinicForm.watch("cnpj")}
                  onChange={(value) => clinicForm.setValue("cnpj", value)}
                  placeholder="00.000.000/0000-00"
                />
                {clinicForm.formState.errors.cnpj && (
                  <p className="text-sm text-destructive">
                    {clinicForm.formState.errors.cnpj.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefoneClinica">Telefone da clinica</Label>
                <MaskedInput
                  mask="phone"
                  value={clinicForm.watch("telefoneClinica")}
                  onChange={(value) => clinicForm.setValue("telefoneClinica", value)}
                  placeholder="(00) 00000-0000"
                />
                {clinicForm.formState.errors.telefoneClinica && (
                  <p className="text-sm text-destructive">
                    {clinicForm.formState.errors.telefoneClinica.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <MaskedInput
                mask="cep"
                value={clinicForm.watch("cep")}
                onChange={(value) => clinicForm.setValue("cep", value)}
                onBlur={() => handleCepBlur(clinicForm.watch("cep"))}
                placeholder="00000-000"
              />
              {clinicForm.formState.errors.cep && (
                <p className="text-sm text-destructive">
                  {clinicForm.formState.errors.cep.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  placeholder="Nome da rua"
                  {...clinicForm.register("rua")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Numero</Label>
                <Input
                  id="numero"
                  placeholder="000"
                  {...clinicForm.register("numero")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  placeholder="Sala, andar..."
                  {...clinicForm.register("complemento")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  placeholder="Bairro"
                  {...clinicForm.register("bairro")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="Cidade"
                  {...clinicForm.register("cidade")}
                />
              </div>

              <div className="space-y-2">
                <Label>UF</Label>
                <Select
                  value={clinicForm.watch("uf")}
                  onValueChange={(value) => clinicForm.setValue("uf", value)}
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
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo da clinica (URL)</Label>
              <Input
                id="logoUrl"
                placeholder="https://..."
                {...customizationForm.register("logoUrl")}
              />
              <p className="text-xs text-muted-foreground">
                Opcional. Voce pode personalizar depois em Configuracoes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="corPrimaria">Cor primaria</Label>
                <div className="flex gap-2">
                  <Input
                    id="corPrimaria"
                    type="color"
                    className="w-12 h-10 p-1"
                    {...customizationForm.register("corPrimaria")}
                  />
                  <Input
                    value={customizationForm.watch("corPrimaria")}
                    onChange={(e) => customizationForm.setValue("corPrimaria", e.target.value)}
                    placeholder="#059669"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="corSecundaria">Cor secundaria</Label>
                <div className="flex gap-2">
                  <Input
                    id="corSecundaria"
                    type="color"
                    className="w-12 h-10 p-1"
                    {...customizationForm.register("corSecundaria")}
                  />
                  <Input
                    value={customizationForm.watch("corSecundaria")}
                    onChange={(e) => customizationForm.setValue("corSecundaria", e.target.value)}
                    placeholder="#0d9488"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Voce pode personalizar depois em Configuracoes.
            </p>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 h-48 overflow-y-auto text-sm text-muted-foreground">
              <h4 className="font-medium text-foreground mb-2">
                Termo de Consentimento LGPD
              </h4>
              <p className="mb-2">
                Ao utilizar esta plataforma, voce concorda com a coleta e processamento
                de seus dados pessoais conforme a Lei Geral de Protecao de Dados (Lei 13.709/2018).
              </p>
              <p className="mb-2">
                <strong>Dados coletados:</strong> Nome completo, e-mail, telefone, CPF,
                CNPJ, endereco e dados da clinica.
              </p>
              <p className="mb-2">
                <strong>Finalidade:</strong> Gerenciamento de pacientes, agendamentos,
                prontuarios e funcionalidades da plataforma.
              </p>
              <p>
                <strong>Seus direitos:</strong> Voce pode solicitar acesso, correcao,
                exclusao ou portabilidade de seus dados a qualquer momento.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="aceitouTermo"
                checked={termsForm.watch("aceitouTermo")}
                onCheckedChange={(checked) =>
                  termsForm.setValue("aceitouTermo", checked === true)
                }
              />
              <Label htmlFor="aceitouTermo" className="text-sm">
                Li e aceito o Termo de Consentimento
              </Label>
            </div>
            {termsForm.formState.errors.aceitouTermo && (
              <p className="text-sm text-destructive">
                {termsForm.formState.errors.aceitouTermo.message}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between pt-4">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={isLoading}
            >
              Voltar
            </Button>
          ) : (
            <Link href="/login">
              <Button type="button" variant="outline" disabled={isLoading}>
                Voltar
              </Button>
            </Link>
          )}

          {currentStep === 2 ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleNextStep}
                disabled={isLoading}
              >
                Pular
              </Button>
              <Button type="button" onClick={handleNextStep} disabled={isLoading}>
                Proximo
              </Button>
            </div>
          ) : currentStep < 3 ? (
            <Button type="button" onClick={handleNextStep} disabled={isLoading}>
              Proximo
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar conta
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
