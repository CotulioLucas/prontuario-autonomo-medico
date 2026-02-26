"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MaskedInput } from "@/components/ui/masked-input"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"

interface PatientFormData {
  name: string
  cpf: string
  birthDate: string
  gender: string
  phone: string
  email: string
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  notes: string
}

interface PatientFormProps {
  mode: "create" | "edit"
  patientId?: string
  onSuccess: (id: string) => void
  onCancel: () => void
}

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
]

export function PatientForm({ mode, patientId, onSuccess, onCancel }: PatientFormProps) {
  const [loading, setLoading] = useState(false)
  const [loadingPatient, setLoadingPatient] = useState(mode === "edit")
  const [loadingCep, setLoadingCep] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PatientFormData>({
    defaultValues: {
      name: "", cpf: "", birthDate: "", gender: "",
      phone: "", email: "", cep: "", street: "",
      number: "", complement: "", neighborhood: "", city: "", state: "", notes: "",
    },
  })

  // Carregar dados do paciente no modo edição
  useEffect(() => {
    if (mode === "edit" && patientId) {
      setLoadingPatient(true)
      api.get<{ data: PatientFormData & { id: string } }>(`/patients/${patientId}`)
        .then((res) => {
          const p = res.data
          setValue("name", p.name || "")
          setValue("cpf", p.cpf || "")
          setValue("birthDate", p.birthDate ? p.birthDate.slice(0, 10) : "")
          setValue("gender", p.gender || "")
          setValue("phone", p.phone || "")
          setValue("email", p.email || "")
          setValue("cep", p.cep || "")
          setValue("street", p.street || "")
          setValue("number", p.number || "")
          setValue("complement", p.complement || "")
          setValue("neighborhood", p.neighborhood || "")
          setValue("city", p.city || "")
          setValue("state", p.state || "")
          setValue("notes", p.notes || "")
        })
        .catch(() => toast.error("Erro ao carregar dados do paciente"))
        .finally(() => setLoadingPatient(false))
    }
  }, [mode, patientId, setValue])

  // Auto-preenchimento por CEP
  const cepValue = watch("cep")
  useEffect(() => {
    const digits = cepValue.replace(/\D/g, "")
    if (digits.length === 8) {
      setLoadingCep(true)
      fetch(`https://viacep.com.br/ws/${digits}/json/`)
        .then((r) => r.json())
        .then((data) => {
          if (!data.erro) {
            setValue("street", data.logradouro || "")
            setValue("neighborhood", data.bairro || "")
            setValue("city", data.localidade || "")
            setValue("state", data.uf || "")
          } else {
            toast.error("CEP nao encontrado")
          }
        })
        .catch(() => {})
        .finally(() => setLoadingCep(false))
    }
  }, [cepValue, setValue])

  const onSubmit = async (data: PatientFormData) => {
    setLoading(true)
    try {
      const payload = {
        name: data.name,
        cpf: data.cpf.replace(/\D/g, "") || undefined,
        birthDate: data.birthDate || undefined,
        gender: data.gender || undefined,
        phone: data.phone.replace(/\D/g, ""),
        email: data.email || undefined,
        address: (data.street || data.city) ? {
          cep: data.cep.replace(/\D/g, "") || undefined,
          street: data.street || undefined,
          number: data.number || undefined,
          complement: data.complement || undefined,
          neighborhood: data.neighborhood || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
        } : undefined,
        notes: data.notes || undefined,
      }

      if (mode === "create") {
        const res = await api.post<{ data: { id: string } }>("/patients", payload)
        toast.success("Paciente cadastrado com sucesso")
        onSuccess(res.data.id)
      } else {
        await api.put<{ data: { id: string } }>(`/patients/${patientId}`, payload)
        toast.success("Paciente atualizado com sucesso")
        onSuccess(patientId!)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar paciente"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (loadingPatient) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      {/* Dados pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="name">
              Nome completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Nome completo do paciente"
              {...register("name", { required: "Nome e obrigatorio" })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <MaskedInput
              id="cpf"
              mask="cpf"
              placeholder="000.000.000-00"
              value={watch("cpf")}
              onChange={(v) => setValue("cpf", v)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              {...register("birthDate")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Sexo</Label>
            <Select onValueChange={(v) => setValue("gender", v)} value={watch("gender")}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
                <SelectItem value="not_informed">Nao informado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contato</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">
              Telefone <span className="text-destructive">*</span>
            </Label>
            <MaskedInput
              id="phone"
              mask="phone"
              placeholder="(00) 00000-0000"
              value={watch("phone")}
              onChange={(v) => setValue("phone", v)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              {...register("email")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cep">CEP {loadingCep && <span className="text-muted-foreground text-xs">(buscando...)</span>}</Label>
            <MaskedInput
              id="cep"
              mask="cep"
              placeholder="00000-000"
              value={watch("cep")}
              onChange={(v) => setValue("cep", v)}
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              placeholder="Nome da rua"
              {...register("street")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Numero</Label>
            <Input id="number" placeholder="Ex: 123" {...register("number")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input id="complement" placeholder="Apto, sala..." {...register("complement")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input id="neighborhood" placeholder="Bairro" {...register("neighborhood")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" placeholder="Cidade" {...register("city")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">UF</Label>
            <Select onValueChange={(v) => setValue("state", v)} value={watch("state")}>
              <SelectTrigger id="state">
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {UF_LIST.map((uf) => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Observacoes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observacoes gerais sobre o paciente..."
            className="h-24"
            {...register("notes")}
          />
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
