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
  { label: "Dados pessoais" },
  { label: "Dados profissionais" },
  { label: "Termos" },
]

const PROFESSIONAL_TYPES = [
  { value: "psicologo", label: "Psicologo" },
  { value: "fisioterapeuta", label: "Fisioterapeuta" },
  { value: "massoterapeuta", label: "Massoterapeuta" },
  { value: "medico", label: "Medico" },
]

const CONSELHOS = [
  { value: "CRP", label: "CRP - Conselho Regional de Psicologia" },
  { value: "CREFITO", label: "CREFITO - Conselho Regional de Fisioterapia e Terapia Ocupacional" },
  { value: "CRM", label: "CRM - Conselho Regional de Medicina" },
  { value: "CREFONO", label: "CREFONO - Conselho Regional de Fonoaudiologia" },
  { value: "outro", label: "Outro" },
]

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO"
]

const personalDataSchema = z.object({
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

const professionalDataSchema = z.object({
  tipoProfissional: z.string().min(1, "Selecione o tipo de profissional"),
  conselho: z.string().min(1, "Selecione o conselho"),
  numeroRegistro: z.string().min(1, "Numero do registro obrigatorio"),
  ufRegistro: z.string().min(1, "UF do registro obrigatoria"),
  cep: z.string().min(8, "CEP invalido"),
  rua: z.string().min(1, "Rua obrigatoria"),
  numero: z.string().min(1, "Numero obrigatorio"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro obrigatorio"),
  cidade: z.string().min(1, "Cidade obrigatoria"),
  uf: z.string().min(1, "UF obrigatoria"),
})

const termsSchema = z.object({
  aceitouTermo: z.boolean().refine((val) => val === true, {
    message: "O aceite do termo e obrigatorio",
  }),
})

type PersonalData = z.infer<typeof personalDataSchema>
type ProfessionalData = z.infer<typeof professionalDataSchema>
type TermsData = z.infer<typeof termsSchema>

export default function CadastroAutonomoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  const personalForm = useForm<PersonalData>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      senha: "",
      confirmarSenha: "",
    },
  })

  const professionalForm = useForm<ProfessionalData>({
    resolver: zodResolver(professionalDataSchema),
    defaultValues: {
      tipoProfissional: "",
      conselho: "",
      numeroRegistro: "",
      ufRegistro: "",
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
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
          professionalForm.setValue("rua", data.logradouro || "")
          professionalForm.setValue("bairro", data.bairro || "")
          professionalForm.setValue("cidade", data.localidade || "")
          professionalForm.setValue("uf", data.uf || "")
        }
      } catch {
        toast.error("Erro ao buscar CEP")
      }
    }
  }

  const handleNextStep = async () => {
    let isValid = false
    if (currentStep === 0) {
      isValid = await personalForm.trigger()
    } else if (currentStep === 1) {
      isValid = await professionalForm.trigger()
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
      const personalData = personalForm.getValues()
      const professionalData = professionalForm.getValues()

      await api.post("/auth/register/autonomo", {
        nome: personalData.nome,
        email: personalData.email,
        telefone: personalData.telefone,
        cpf: personalData.cpf,
        senha: personalData.senha,
        tipoProfissional: professionalData.tipoProfissional,
        conselho: professionalData.conselho,
        numeroRegistro: professionalData.numeroRegistro,
        ufRegistro: professionalData.ufRegistro,
        endereco: {
          cep: professionalData.cep,
          rua: professionalData.rua,
          numero: professionalData.numero,
          complemento: professionalData.complemento,
          bairro: professionalData.bairro,
          cidade: professionalData.cidade,
          uf: professionalData.uf,
        },
        aceitouTermoLGPD: true,
      })

      setSubmittedEmail(personalData.email)
      setIsSuccess(true)
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "EMAIL_ALREADY_EXISTS") {
          toast.error("Este e-mail ja esta cadastrado")
        } else if (err.code === "CPF_ALREADY_EXISTS") {
          toast.error("Este CPF ja esta cadastrado")
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
        <CardTitle className="text-center">Criar conta como profissional</CardTitle>
        <Stepper steps={STEPS} currentStep={currentStep} />
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                placeholder="Seu nome completo"
                {...personalForm.register("nome")}
              />
              {personalForm.formState.errors.nome && (
                <p className="text-sm text-destructive">
                  {personalForm.formState.errors.nome.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...personalForm.register("email")}
              />
              {personalForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {personalForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <MaskedInput
                  mask="phone"
                  value={personalForm.watch("telefone")}
                  onChange={(value) => personalForm.setValue("telefone", value)}
                  placeholder="(00) 00000-0000"
                />
                {personalForm.formState.errors.telefone && (
                  <p className="text-sm text-destructive">
                    {personalForm.formState.errors.telefone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <MaskedInput
                  mask="cpf"
                  value={personalForm.watch("cpf")}
                  onChange={(value) => personalForm.setValue("cpf", value)}
                  placeholder="000.000.000-00"
                />
                {personalForm.formState.errors.cpf && (
                  <p className="text-sm text-destructive">
                    {personalForm.formState.errors.cpf.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <PasswordInput
                id="senha"
                placeholder="Minimo 8 caracteres"
                {...personalForm.register("senha")}
              />
              {personalForm.formState.errors.senha && (
                <p className="text-sm text-destructive">
                  {personalForm.formState.errors.senha.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar senha</Label>
              <PasswordInput
                id="confirmarSenha"
                placeholder="Confirme sua senha"
                {...personalForm.register("confirmarSenha")}
              />
              {personalForm.formState.errors.confirmarSenha && (
                <p className="text-sm text-destructive">
                  {personalForm.formState.errors.confirmarSenha.message}
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de profissional</Label>
                <Select
                  value={professionalForm.watch("tipoProfissional")}
                  onValueChange={(value) =>
                    professionalForm.setValue("tipoProfissional", value)
                  }
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
                {professionalForm.formState.errors.tipoProfissional && (
                  <p className="text-sm text-destructive">
                    {professionalForm.formState.errors.tipoProfissional.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Conselho profissional</Label>
                <Select
                  value={professionalForm.watch("conselho")}
                  onValueChange={(value) =>
                    professionalForm.setValue("conselho", value)
                  }
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
                {professionalForm.formState.errors.conselho && (
                  <p className="text-sm text-destructive">
                    {professionalForm.formState.errors.conselho.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numeroRegistro">Numero do registro</Label>
                <Input
                  id="numeroRegistro"
                  placeholder="00000"
                  {...professionalForm.register("numeroRegistro")}
                />
                {professionalForm.formState.errors.numeroRegistro && (
                  <p className="text-sm text-destructive">
                    {professionalForm.formState.errors.numeroRegistro.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>UF do registro</Label>
                <Select
                  value={professionalForm.watch("ufRegistro")}
                  onValueChange={(value) =>
                    professionalForm.setValue("ufRegistro", value)
                  }
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
                {professionalForm.formState.errors.ufRegistro && (
                  <p className="text-sm text-destructive">
                    {professionalForm.formState.errors.ufRegistro.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <MaskedInput
                mask="cep"
                value={professionalForm.watch("cep")}
                onChange={(value) => professionalForm.setValue("cep", value)}
                onBlur={() => handleCepBlur(professionalForm.watch("cep"))}
                placeholder="00000-000"
              />
              {professionalForm.formState.errors.cep && (
                <p className="text-sm text-destructive">
                  {professionalForm.formState.errors.cep.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  placeholder="Nome da rua"
                  {...professionalForm.register("rua")}
                />
                {professionalForm.formState.errors.rua && (
                  <p className="text-sm text-destructive">
                    {professionalForm.formState.errors.rua.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Numero</Label>
                <Input
                  id="numero"
                  placeholder="000"
                  {...professionalForm.register("numero")}
                />
                {professionalForm.formState.errors.numero && (
                  <p className="text-sm text-destructive">
                    {professionalForm.formState.errors.numero.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  placeholder="Apto, sala..."
                  {...professionalForm.register("complemento")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  placeholder="Bairro"
                  {...professionalForm.register("bairro")}
                />
                {professionalForm.formState.errors.bairro && (
                  <p className="text-sm text-destructive">
                    {professionalForm.formState.errors.bairro.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="Cidade"
                  {...professionalForm.register("cidade")}
                />
                {professionalForm.formState.errors.cidade && (
                  <p className="text-sm text-destructive">
                    {professionalForm.formState.errors.cidade.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>UF</Label>
                <Select
                  value={professionalForm.watch("uf")}
                  onValueChange={(value) => professionalForm.setValue("uf", value)}
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
                {professionalForm.formState.errors.uf && (
                  <p className="text-sm text-destructive">
                    {professionalForm.formState.errors.uf.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
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
                dados profissionais e endereco.
              </p>
              <p className="mb-2">
                <strong>Finalidade:</strong> Gerenciamento de pacientes, agendamentos,
                prontuarios e funcionalidades da plataforma.
              </p>
              <p className="mb-2">
                <strong>Compartilhamento:</strong> Seus dados nao serao compartilhados
                com terceiros sem seu consentimento, exceto quando exigido por lei.
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

          {currentStep < 2 ? (
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
