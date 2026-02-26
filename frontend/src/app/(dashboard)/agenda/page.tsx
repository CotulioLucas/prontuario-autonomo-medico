"use client"

import { useCallback, useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  CalendarPlus, ChevronLeft, ChevronRight, CalendarX2, CheckCircle, XCircle, Pencil
} from "lucide-react"
import { toast } from "sonner"

import { Header } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"

// --- Tipos ---
interface Patient { id: string; name: string; phone?: string }
interface Appointment {
  id: string
  date: string
  startTime: string
  duration: number
  type: string
  status: "scheduled" | "confirmed" | "completed" | "cancelled"
  notes?: string
  patient?: Patient
  professional?: { id: string; name: string }
}

// --- Constantes ---
const START_HOUR = 7
const END_HOUR = 21
const SLOT_HEIGHT = 60
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]
const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]

const APPOINTMENT_TYPES = [
  { value: "consultation", label: "Consulta" },
  { value: "psychology", label: "Psicologia" },
  { value: "physiotherapy", label: "Fisioterapia" },
  { value: "return", label: "Retorno" },
  { value: "other", label: "Outro" },
]
const DURATIONS = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1h 30min" },
  { value: 120, label: "2 horas" },
]

const TIME_SLOTS: string[] = []
for (let h = START_HOUR; h < END_HOUR; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`)
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`)
}

const START_TIMES: string[] = []
for (let h = START_HOUR; h < END_HOUR; h++) {
  for (let m = 0; m < 60; m += 15) {
    START_TIMES.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
  }
}

// --- Utilitários ---
function minutesFromMidnight(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function addMinutes(time: string, mins: number) {
  const total = minutesFromMidnight(time) + mins
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

function formatDate(str: string) {
  try { return new Date(str + "T00:00:00").toLocaleDateString("pt-BR") } catch { return str }
}

function toISODateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function getMondayOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekDays(monday: Date) {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d
  })
}

function statusStyle(status: string) {
  switch (status) {
    case "scheduled": return "bg-blue-100 border-l-4 border-l-blue-500 text-blue-900"
    case "confirmed": return "bg-emerald-100 border-l-4 border-l-emerald-500 text-emerald-900"
    case "completed": return "bg-gray-100 border-l-4 border-l-gray-400 text-gray-600"
    case "cancelled": return "bg-red-50 border-l-4 border-l-red-300 text-red-400 line-through opacity-60"
    default: return "bg-blue-100 border-l-4 border-l-blue-500 text-blue-900"
  }
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    scheduled: "Agendado", confirmed: "Confirmado",
    completed: "Realizado", cancelled: "Cancelado"
  }
  return map[status] || status
}

function typeLabel(type: string) {
  return APPOINTMENT_TYPES.find((t) => t.value === type)?.label || type
}

function appointmentPosition(startTime: string, duration: number) {
  const startMinutes = minutesFromMidnight(startTime)
  const gridStart = START_HOUR * 60
  const top = ((startMinutes - gridStart) / 30) * SLOT_HEIGHT
  const height = (duration / 30) * SLOT_HEIGHT
  return { top, height }
}

// --- Appointment Card ---
function AppointmentCard({
  appointment,
  onClick,
}: {
  appointment: Appointment
  onClick: (e: React.MouseEvent) => void
}) {
  const { top, height } = appointmentPosition(appointment.startTime, appointment.duration)
  const end = addMinutes(appointment.startTime, appointment.duration)

  return (
    <button
      className={`absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-left text-xs overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${statusStyle(appointment.status)}`}
      style={{ top: `${top}px`, height: `${Math.max(height - 2, 20)}px` }}
      onClick={onClick}
    >
      <div className="font-semibold truncate">{appointment.patient?.name}</div>
      {height >= 40 && (
        <div className="opacity-75 truncate">{appointment.startTime}–{end}</div>
      )}
    </button>
  )
}

// --- Página principal ---
function AgendaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const view = (searchParams.get("view") as "week" | "day") || "week"

  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Form de criar/editar
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    patientId: "", date: "", startTime: "08:00",
    duration: 60, type: "consultation", notes: "",
  })
  const [savingForm, setSavingForm] = useState(false)

  // Dialog de detalhe
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Confirm cancelamento
  const [cancelOpen, setCancelOpen] = useState(false)

  const monday = getMondayOfWeek(currentDate)
  const weekDays = getWeekDays(monday)

  const navigatePrev = () => {
    setCurrentDate((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() + (view === "week" ? -7 : -1))
      return next
    })
  }
  const navigateNext = () => {
    setCurrentDate((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() + (view === "week" ? 7 : 1))
      return next
    })
  }
  const goToday = () => {
    const d = new Date(); d.setHours(0, 0, 0, 0); setCurrentDate(d)
  }

  const fetchAppointments = useCallback(async () => {
    setLoading(true); setError(false)
    try {
      let qs: string
      if (view === "week") {
        const end = new Date(monday); end.setDate(end.getDate() + 4)
        qs = `startDate=${toISODateStr(monday)}&endDate=${toISODateStr(end)}`
      } else {
        qs = `date=${toISODateStr(currentDate)}`
      }
      const res = await api.get<{ data: Appointment[] }>(`/appointments?${qs}`)
      setAppointments(res.data)
    } catch { setError(true) }
    finally { setLoading(false) }
  }, [view, currentDate, monday])

  const fetchPatients = useCallback(async () => {
    try {
      const res = await api.get<{ data: Patient[] }>("/patients?limit=200")
      setPatients(res.data)
    } catch {}
  }, [])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])
  useEffect(() => { fetchPatients() }, [fetchPatients])

  function appointmentsForDay(date: Date) {
    const ds = toISODateStr(date)
    return appointments.filter((a) => a.date?.slice(0, 10) === ds)
  }

  const openCreate = (date?: Date, startTime?: string) => {
    setEditingId(null)
    setFormData({
      patientId: "",
      date: toISODateStr(date ?? currentDate),
      startTime: startTime ?? "08:00",
      duration: 60, type: "consultation", notes: "",
    })
    setFormOpen(true)
  }

  const openEdit = (appt: Appointment) => {
    setDetailOpen(false)
    setEditingId(appt.id)
    setFormData({
      patientId: appt.patient?.id ?? "",
      date: appt.date?.slice(0, 10) ?? "",
      startTime: appt.startTime,
      duration: appt.duration,
      type: appt.type,
      notes: appt.notes ?? "",
    })
    setFormOpen(true)
  }

  const saveAppointment = async () => {
    if (!formData.patientId || !formData.date || !formData.startTime) {
      toast.error("Preencha todos os campos obrigatorios")
      return
    }
    setSavingForm(true)
    try {
      const payload = {
        patientId: formData.patientId, date: formData.date,
        startTime: formData.startTime, duration: formData.duration,
        type: formData.type, notes: formData.notes || undefined,
      }
      if (editingId) {
        await api.put(`/appointments/${editingId}`, payload)
        toast.success("Agendamento atualizado")
      } else {
        await api.post("/appointments", payload)
        toast.success("Agendamento criado")
      }
      setFormOpen(false); fetchAppointments()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar agendamento")
    } finally { setSavingForm(false) }
  }

  const markComplete = async () => {
    if (!selectedAppt) return
    setActionLoading(true)
    try {
      await api.put(`/appointments/${selectedAppt.id}/complete`, {})
      toast.success("Atendimento registrado e conta a receber criada")
      setDetailOpen(false); fetchAppointments()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro")
    } finally { setActionLoading(false) }
  }

  const cancelAppointment = async () => {
    if (!selectedAppt) return
    setActionLoading(true)
    try {
      await api.put(`/appointments/${selectedAppt.id}/cancel`, {})
      toast.success("Agendamento cancelado")
      setCancelOpen(false); setDetailOpen(false); fetchAppointments()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro")
    } finally { setActionLoading(false) }
  }

  const periodLabel = view === "week"
    ? `${monday.getDate()}–${weekDays[4].getDate()} ${MONTHS[monday.getMonth()]} ${monday.getFullYear()}`
    : currentDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })

  const renderGrid = (dayDates: Date[]) => (
    <div className="flex overflow-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
      {/* Coluna de horas */}
      <div className="flex-none w-14 select-none">
        <div className="sticky top-0 z-10 h-10 bg-background border-b" />
        {TIME_SLOTS.map((slot) => (
          <div key={slot} className="h-[60px] flex items-start pt-1 text-xs text-muted-foreground pr-2 text-right border-b">
            {slot.endsWith(":00") ? slot : ""}
          </div>
        ))}
      </div>

      {/* Colunas dos dias */}
      {dayDates.map((day) => {
        const dayAppts = appointmentsForDay(day)
        const isToday = toISODateStr(day) === toISODateStr(new Date())
        return (
          <div key={toISODateStr(day)} className="flex-1 min-w-[90px] border-l">
            <div className="sticky top-0 z-10 h-10 bg-background border-b flex items-center justify-center">
              <span className={`text-xs font-medium ${isToday ? "text-primary font-bold" : ""}`}>
                {DAYS[day.getDay()]} {day.getDate()}
              </span>
            </div>
            <div
              className="relative cursor-pointer"
              style={{ height: `${TIME_SLOTS.length * SLOT_HEIGHT}px` }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const y = e.clientY - rect.top
                const slot = Math.floor(y / SLOT_HEIGHT)
                const totalMins = START_HOUR * 60 + slot * 30
                const h = Math.floor(totalMins / 60)
                const m = totalMins % 60
                openCreate(day, `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
              }}
            >
              {TIME_SLOTS.map((slot, i) => (
                <div
                  key={slot}
                  className={`absolute left-0 right-0 border-b ${slot.endsWith(":00") ? "border-border" : "border-border/30"}`}
                  style={{ top: `${i * SLOT_HEIGHT}px`, height: `${SLOT_HEIGHT}px` }}
                />
              ))}
              {dayAppts.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedAppt(appt)
                    setDetailOpen(true)
                  }}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <>
      <Header breadcrumbs={[{ label: "Agenda" }]} />
      <div className="space-y-4">
        {/* Controles */}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight mr-2">Agenda</h1>
          <Button variant="ghost" size="icon" onClick={navigatePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>Hoje</Button>
          <Button variant="ghost" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground flex-1 capitalize">{periodLabel}</span>

          <div className="flex rounded-md border overflow-hidden text-sm">
            <button
              className={`px-3 py-1.5 ${view === "week" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              onClick={() => router.push("/agenda")}
            >
              Semana
            </button>
            <button
              className={`px-3 py-1.5 border-l ${view === "day" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              onClick={() => router.push("/agenda?view=day")}
            >
              Dia
            </button>
          </div>

          <Button onClick={() => openCreate()}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Novo agendamento
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              Erro ao carregar agenda.
              <Button variant="outline" size="sm" onClick={fetchAppointments}>Tentar novamente</Button>
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        )}

        {!loading && !error && (
          <div className="rounded-md border overflow-hidden">
            {view === "week" ? renderGrid(weekDays) : renderGrid([currentDate])}
          </div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <div className="text-center py-8">
            <CalendarX2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhum agendamento {view === "week" ? "nesta semana" : "neste dia"}
            </p>
            <Button className="mt-3" onClick={() => openCreate()}>Criar agendamento</Button>
          </div>
        )}
      </div>

      {/* Dialog criar/editar */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar agendamento" : "Novo agendamento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente <span className="text-destructive">*</span></Label>
              <Select value={formData.patientId} onValueChange={(v) => setFormData((p) => ({ ...p, patientId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                <SelectContent>
                  {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data <span className="text-destructive">*</span></Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Hora de inicio <span className="text-destructive">*</span></Label>
                <Select value={formData.startTime} onValueChange={(v) => setFormData((p) => ({ ...p, startTime: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-48">
                    {START_TIMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duracao</Label>
                <Select value={String(formData.duration)} onValueChange={(v) => setFormData((p) => ({ ...p, duration: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observacao</Label>
              <Textarea
                placeholder="Observacoes sobre o agendamento..."
                className="h-20"
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {editingId && (
              <Button
                variant="outline"
                className="text-destructive border-destructive sm:mr-auto"
                onClick={() => {
                  const appt = appointments.find((a) => a.id === editingId)
                  if (appt) { setSelectedAppt(appt); setCancelOpen(true) }
                }}
              >
                Cancelar agendamento
              </Button>
            )}
            <Button variant="outline" onClick={() => setFormOpen(false)}>Fechar</Button>
            <Button onClick={saveAppointment} disabled={savingForm}>
              {savingForm ? "Salvando..." : "Salvar agendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog detalhe */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do agendamento</DialogTitle>
          </DialogHeader>
          {selectedAppt && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                {[
                  ["Paciente", selectedAppt.patient?.name],
                  ["Data", formatDate(selectedAppt.date)],
                  ["Horario", `${selectedAppt.startTime}–${addMinutes(selectedAppt.startTime, selectedAppt.duration)}`],
                  ["Tipo", typeLabel(selectedAppt.type)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={
                    selectedAppt.status === "completed" ? "bg-gray-100 text-gray-600" :
                    selectedAppt.status === "cancelled" ? "bg-red-100 text-red-600" :
                    selectedAppt.status === "confirmed" ? "bg-emerald-100 text-emerald-800" :
                    "bg-blue-100 text-blue-800"
                  }>
                    {statusLabel(selectedAppt.status)}
                  </Badge>
                </div>
                {selectedAppt.notes && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Observacao:</span>
                    <span className="text-right max-w-[60%]">{selectedAppt.notes}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(selectedAppt.status === "scheduled" || selectedAppt.status === "confirmed") && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => openEdit(selectedAppt)}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />Editar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={markComplete}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />Marcar realizado
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive"
                      onClick={() => setCancelOpen(true)}
                      disabled={actionLoading}
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />Cancelar
                    </Button>
                  </>
                )}
                {selectedAppt.status === "completed" && (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/pacientes/${selectedAppt.patient?.id}/prontuario`}>Ver prontuario</a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/financeiro">Ver conta a receber</a>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog cancelamento */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O horario sera liberado na agenda. Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nao, manter</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={cancelAppointment}
              disabled={actionLoading}
            >
              {actionLoading ? "Cancelando..." : "Sim, cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function AgendaPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando agenda...</div>}>
      <AgendaContent />
    </Suspense>
  )
}
