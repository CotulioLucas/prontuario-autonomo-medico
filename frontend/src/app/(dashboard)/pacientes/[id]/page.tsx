"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Users, Pencil, CalendarPlus, Link2, Plus, Trash2,
  FileText, Receipt, Calendar, AlertCircle
} from "lucide-react"
import { toast } from "sonner"

import { Header } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api"

interface Patient {
  id: string
  name: string
  cpf?: string
  birthDate?: string
  gender?: string
  phone: string
  email?: string
  notes?: string
  address?: {
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    cep?: string
  }
}

interface PatientLink {
  id: string
  professionalId: string
  professionalName: string
  tariff: {
    amount: number
    currency: string
    type: string
  }
}

interface Evolution {
  id: string
  content: string
  createdAt: string
  professionalName: string
  attendanceType?: string
}

interface Receivable {
  id: string
  amount: number
  status: string
  dueDate?: string
  attendanceDate?: string
  patientName?: string
}

interface Appointment {
  id: string
  date: string
  startTime: string
  endTime?: string
  duration: number
  status: string
  type: string
  patientName?: string
}

function formatPhone(phone?: string) {
  if (!phone) return "-"
  const d = phone.replace(/\D/g, "")
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  return phone
}

function maskCpf(cpf?: string) {
  if (!cpf) return "-"
  const d = cpf.replace(/\D/g, "")
  if (d.length !== 11) return cpf
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-"
  try { return new Date(dateStr).toLocaleDateString("pt-BR") } catch { return "-" }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount / 100)
}

function genderLabel(g?: string) {
  const map: Record<string, string> = {
    male: "Masculino", female: "Feminino", other: "Outro", not_informed: "Nao informado"
  }
  return g ? (map[g] || g) : "-"
}

function statusAppointmentBadge(status: string) {
  const map: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    completed: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-100 text-red-600",
  }
  const labels: Record<string, string> = {
    scheduled: "Agendado", confirmed: "Confirmado",
    completed: "Realizado", cancelled: "Cancelado"
  }
  return { className: map[status] || "bg-gray-100 text-gray-600", label: labels[status] || status }
}

interface Props {
  params: { id: string }
}

export default function PacienteDetailPage({ params }: Props) {
  const router = useRouter()
  const { id } = params

  const [patient, setPatient] = useState<Patient | null>(null)
  const [links, setLinks] = useState<PatientLink[]>([])
  const [evolutions, setEvolutions] = useState<Evolution[]>([])
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dados")

  // Dialog de vínculo
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<PatientLink | null>(null)
  const [linkAmount, setLinkAmount] = useState("")
  const [linkType, setLinkType] = useState("")
  const [savingLink, setSavingLink] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get<{ data: Patient }>(`/patients/${id}`)
      .then((res) => setPatient(res.data))
      .catch(() => toast.error("Erro ao carregar paciente"))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (activeTab === "vinculos") {
      api.get<{ data: PatientLink[] }>(`/patients/${id}/links`)
        .then((res) => setLinks(res.data))
        .catch(() => {})
    }
    if (activeTab === "prontuario") {
      api.get<{ data: Evolution[] }>(`/patients/${id}/records`)
        .then((res) => setEvolutions(res.data))
        .catch(() => {})
    }
    if (activeTab === "financeiro") {
      api.get<{ data: Receivable[] }>(`/patients/${id}/receivables`)
        .then((res) => setReceivables(res.data))
        .catch(() => {})
    }
    if (activeTab === "agendamentos") {
      api.get<{ data: Appointment[] }>(`/appointments?patientId=${id}`)
        .then((res) => setAppointments(res.data))
        .catch(() => {})
    }
  }, [activeTab, id])

  const openCreateLink = () => {
    setEditingLink(null)
    setLinkAmount("")
    setLinkType("")
    setLinkDialogOpen(true)
  }

  const openEditLink = (link: PatientLink) => {
    setEditingLink(link)
    setLinkAmount(String(link.tariff.amount / 100))
    setLinkType(link.tariff.type)
    setLinkDialogOpen(true)
  }

  const saveLink = async () => {
    if (!linkAmount || !linkType) {
      toast.error("Preencha o valor e o tipo de cobranca")
      return
    }
    setSavingLink(true)
    try {
      const amountCents = Math.round(parseFloat(linkAmount) * 100)
      const tariff = { amount: amountCents, currency: "BRL", type: linkType }

      if (editingLink) {
        await api.put(`/patients/${id}/links/${editingLink.id}`, { tariff })
        toast.success("Vinculo atualizado com sucesso")
      } else {
        await api.post(`/patients/${id}/links`, { tariff })
        toast.success("Vinculo criado com sucesso")
      }
      setLinkDialogOpen(false)
      const res = await api.get<{ data: PatientLink[] }>(`/patients/${id}/links`)
      setLinks(res.data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar vinculo"
      toast.error(msg)
    } finally {
      setSavingLink(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header breadcrumbs={[{ label: "Pacientes", href: "/pacientes" }, { label: "..." }]} />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-48 w-full" />
        </div>
      </>
    )
  }

  if (!patient) {
    return (
      <>
        <Header breadcrumbs={[{ label: "Pacientes", href: "/pacientes" }, { label: "Erro" }]} />
        <Alert variant="destructive">
          <AlertDescription>Paciente nao encontrado.</AlertDescription>
        </Alert>
      </>
    )
  }

  const address = patient.address
  const addressStr = [
    address?.street,
    address?.number,
    address?.complement,
    address?.neighborhood,
    address?.city && address?.state ? `${address.city}/${address.state}` : address?.city,
  ].filter(Boolean).join(", ")

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Pacientes", href: "/pacientes" },
          { label: patient.name },
        ]}
      />
      <div className="space-y-6">
        {/* Cabeçalho do paciente */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{patient.name}</h1>
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
              Ativo
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/pacientes/${id}/editar`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/agenda?pacienteId=${id}`}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Novo agendamento
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="vinculos">Vinculos e tarifa</TabsTrigger>
            <TabsTrigger value="prontuario">Prontuario</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
          </TabsList>

          {/* TAB: Dados */}
          <TabsContent value="dados">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dados cadastrais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium font-mono">{maskCpf(patient.cpf)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de nascimento</p>
                    <p className="font-medium">{formatDate(patient.birthDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sexo</p>
                    <p className="font-medium">{genderLabel(patient.gender)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{formatPhone(patient.phone)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{patient.email || "-"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Endereco</p>
                    <p className="font-medium">{addressStr || "-"}</p>
                  </div>
                  {patient.notes && (
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Observacoes</p>
                      <p className="font-medium">{patient.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Vínculos */}
          <TabsContent value="vinculos">
            <Card>
              <CardContent className="pt-6">
                {links.length === 0 ? (
                  <div className="text-center py-8">
                    <Link2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Nenhum vinculo profissional configurado
                    </p>
                    <Button variant="outline" className="mt-3" onClick={openCreateLink}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar vinculo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">{link.professionalName || "Profissional"}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(link.tariff.amount)} /{" "}
                            {link.tariff.type === "per_session" ? "sessao" : "hora"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditLink(link)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar tarifa
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={openCreateLink}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar vinculo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Prontuário */}
          <TabsContent value="prontuario">
            <Card>
              <CardContent className="pt-6">
                {evolutions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Nenhuma evolucao registrada para este paciente.
                    </p>
                    <Button className="mt-3" asChild>
                      <Link href={`/pacientes/${id}/prontuario`}>Ver prontuario</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {evolutions.slice(0, 3).map((evo) => (
                      <div key={evo.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{evo.professionalName}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(evo.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{evo.content}</p>
                      </div>
                    ))}
                    <Button variant="outline" asChild>
                      <Link href={`/pacientes/${id}/prontuario`}>Ver prontuario completo</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Financeiro */}
          <TabsContent value="financeiro">
            <Card>
              <CardContent className="pt-6">
                {receivables.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="mx-auto h-10 w-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Nenhuma conta a receber registrada.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receivables.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{formatDate(r.attendanceDate || r.dueDate)}</TableCell>
                          <TableCell>{formatCurrency(r.amount)}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                r.status === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }
                            >
                              {r.status === "paid" ? "Pago" : "Pendente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Agendamentos */}
          <TabsContent value="agendamentos">
            <Card>
              <CardContent className="pt-6">
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Nenhum agendamento registrado.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Horario</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((a) => {
                        const badge = statusAppointmentBadge(a.status)
                        return (
                          <TableRow key={a.id}>
                            <TableCell>{formatDate(a.date)}</TableCell>
                            <TableCell>{a.startTime}</TableCell>
                            <TableCell>{a.type === "consultation" ? "Consulta" : a.type}</TableCell>
                            <TableCell>
                              <Badge className={badge.className}>{badge.label}</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de vínculo */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLink ? "Editar tarifa" : "Adicionar vinculo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Valor da sessao (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 200,00"
                value={linkAmount}
                onChange={(e) => setLinkAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de cobranca</Label>
              <Select value={linkType} onValueChange={setLinkType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_session">Por sessao</SelectItem>
                  <SelectItem value="per_hour">Por hora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveLink} disabled={savingLink}>
              {savingLink ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
