"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import { Header } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
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
import { api } from "@/lib/api"

interface Appointment {
  id: string
  date: string
  startTime: string
  duration: number
  type: string
  patient?: { id: string; name: string }
  professional?: { name: string }
}

interface Props {
  params: { id: string }
}

function formatDate(str?: string) {
  if (!str) return ""
  try {
    return new Date(str).toLocaleDateString("pt-BR")
  } catch { return str }
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    consultation: "Consulta",
    psychology: "Psicologia",
    physiotherapy: "Fisioterapia",
    return: "Retorno",
    other: "Outro",
  }
  return map[type] || type
}

function endTime(startTime: string, duration: number) {
  const [h, m] = startTime.split(":").map(Number)
  const total = h * 60 + m + duration
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

export default function EvolucaoPage({ params }: Props) {
  const router = useRouter()
  const { id } = params

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [alreadyExists, setAlreadyExists] = useState(false)

  useEffect(() => {
    api.get<{ data: Appointment }>(`/appointments/${id}`)
      .then((res) => setAppointment(res.data))
      .catch((err) => {
        if (err?.code === "EVOLUTION_ALREADY_EXISTS") {
          setAlreadyExists(true)
        } else {
          toast.error("Erro ao carregar atendimento")
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    if (content.trim().length < 10) {
      toast.error("A evolucao deve ter no minimo 10 caracteres")
      return
    }
    setSaving(true)
    try {
      await api.post(`/appointments/${id}/record`, { content })
      toast.success("Evolucao registrada com sucesso")
      if (appointment?.patient?.id) {
        router.push(`/pacientes/${appointment.patient.id}/prontuario`)
      } else {
        router.push("/pacientes")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar evolucao"
      toast.error(msg)
    } finally {
      setSaving(false)
      setConfirmOpen(false)
    }
  }

  const patientId = appointment?.patient?.id

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Atendimentos" },
          { label: "Evolucao" },
        ]}
      />
      <div className="max-w-3xl space-y-6">
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {!loading && alreadyExists && (
          <Alert variant="destructive">
            <AlertDescription>
              Ja existe uma evolucao registrada para este atendimento.
              <Button
                variant="link"
                className="ml-2 p-0 h-auto text-destructive"
                onClick={() => patientId && router.push(`/pacientes/${patientId}/prontuario`)}
              >
                Ver evolucao existente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!loading && !alreadyExists && appointment && (
          <Card>
            <CardHeader>
              <CardTitle>Registrar evolucao clinica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contexto do atendimento */}
              <div className="rounded-lg bg-muted p-4 space-y-1 text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-muted-foreground">Data do atendimento:</span>
                  <span className="font-medium">
                    {formatDate(appointment.date)} — {appointment.startTime}–{endTime(appointment.startTime, appointment.duration)}
                  </span>
                  <span className="text-muted-foreground">Paciente:</span>
                  <span className="font-medium">{appointment.patient?.name || "-"}</span>
                  <span className="text-muted-foreground">Profissional:</span>
                  <span className="font-medium">{appointment.professional?.name || "-"}</span>
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{typeLabel(appointment.type)}</span>
                </div>
              </div>

              {/* Aviso */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Apos salvar, a evolucao nao podera ser editada ou excluida. Revise o texto antes de salvar.
                </AlertDescription>
              </Alert>

              {/* Campo de evolução */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Evolucao clinica <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="Descreva a evolucao clinica do paciente nesta sessao..."
                  className="min-h-[200px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={saving}
                />
                {content.trim().length > 0 && content.trim().length < 10 && (
                  <p className="text-sm text-destructive">
                    A evolucao clinica e obrigatoria (minimo 10 caracteres)
                  </p>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    patientId
                      ? router.push(`/pacientes/${patientId}/prontuario`)
                      : router.back()
                  }
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => setConfirmOpen(true)}
                  disabled={content.trim().length < 10 || saving}
                >
                  {saving ? "Salvando..." : "Salvar evolucao"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AlertDialog de confirmação */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Salvar evolucao?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja salvar esta evolucao? Esta acao e irreversivel. A evolucao nao
              podera ser editada ou excluida apos salva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Sim, salvar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
