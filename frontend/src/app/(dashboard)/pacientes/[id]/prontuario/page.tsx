"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText, FilePlus, ChevronDown, ChevronUp, Info } from "lucide-react"
import { toast } from "sonner"

import { Header } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api"

interface Evolution {
  id: string
  content: string
  createdAt: string
  professionalName?: string
  attendanceType?: string
}

interface PendingRecord {
  attendanceId: string
  appointmentId: string
  date: string
  startTime: string
  patientName?: string
}

interface Props {
  params: { id: string }
}

function formatDate(str?: string) {
  if (!str) return ""
  try {
    return new Date(str).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  } catch { return str }
}

export default function ProntuarioPage({ params }: Props) {
  const router = useRouter()
  const { id } = params

  const [patientName, setPatientName] = useState("")
  const [evolutions, setEvolutions] = useState<Evolution[]>([])
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [selectDialogOpen, setSelectDialogOpen] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState("")

  useEffect(() => {
    Promise.all([
      api.get<{ data: { name: string } }>(`/patients/${id}`),
      api.get<{ data: Evolution[] }>(`/patients/${id}/records`),
      api.get<{ data: PendingRecord[] }>(`/patients/${id}/pending-records`),
    ])
      .then(([patRes, evoRes, pendRes]) => {
        setPatientName(patRes.data.name)
        setEvolutions(evoRes.data)
        setPendingRecords(pendRes.data)
      })
      .catch(() => toast.error("Erro ao carregar prontuario"))
      .finally(() => setLoading(false))
  }, [id])

  const handleRegisterEvolution = () => {
    if (pendingRecords.length === 0) return
    if (pendingRecords.length === 1) {
      router.push(`/atendimentos/${pendingRecords[0].appointmentId}/evolucao`)
      return
    }
    setSelectDialogOpen(true)
  }

  const handleSelectAttendance = () => {
    if (!selectedAttendance) return
    setSelectDialogOpen(false)
    router.push(`/atendimentos/${selectedAttendance}/evolucao`)
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Pacientes", href: "/pacientes" },
          { label: patientName || "...", href: `/pacientes/${id}` },
          { label: "Prontuario" },
        ]}
      />
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">
              Prontuario{patientName ? ` de ${patientName}` : ""}
            </h1>
            {pendingRecords.length > 0 && (
              <Button onClick={handleRegisterEvolution}>
                <FilePlus className="mr-2 h-4 w-4" />
                Registrar evolucao
              </Button>
            )}
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Dados retidos por no minimo 20 anos conforme legislacao (CFP/CFM).
            </AlertDescription>
          </Alert>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        )}

        {/* Vazio */}
        {!loading && evolutions.length === 0 && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm font-medium">Nenhuma evolucao registrada</p>
            <p className="mt-1 text-sm text-muted-foreground">
              As evolucoes clinicas aparecerao aqui apos serem registradas pelos profissionais responsaveis.
            </p>
          </div>
        )}

        {/* Timeline */}
        {!loading && evolutions.length > 0 && (
          <div className="relative space-y-4 before:absolute before:left-2 before:top-2 before:h-full before:w-px before:bg-border">
            {evolutions.map((evo) => {
              const isExpanded = expandedIds.has(evo.id)
              const isLong = evo.content.length > 200
              return (
                <div key={evo.id} className="relative pl-8">
                  {/* Bullet */}
                  <div className="absolute left-0 top-4 h-4 w-4 rounded-full border-2 border-primary bg-background" />

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">
                            {evo.professionalName || "Profissional"}
                          </span>
                          {evo.attendanceType && (
                            <Badge variant="outline" className="text-xs">
                              {evo.attendanceType === "in_person" ? "Presencial" : "Online"}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(evo.createdAt)}
                        </span>
                      </div>

                      <p
                        className={
                          isLong && !isExpanded
                            ? "text-sm line-clamp-3 text-muted-foreground"
                            : "text-sm text-muted-foreground"
                        }
                      >
                        {evo.content}
                      </p>

                      {isLong && (
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 h-auto p-0 text-xs"
                          onClick={() => toggleExpand(evo.id)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="mr-1 h-3 w-3" />
                              Ver menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="mr-1 h-3 w-3" />
                              Ver mais
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Dialog para selecionar atendimento pendente */}
      <Dialog open={selectDialogOpen} onOpenChange={setSelectDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Selecionar atendimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ha mais de um atendimento sem evolucao. Selecione qual deseja registrar:
            </p>
            <Select value={selectedAttendance} onValueChange={setSelectedAttendance}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o atendimento" />
              </SelectTrigger>
              <SelectContent>
                {pendingRecords.map((p) => (
                  <SelectItem key={p.appointmentId} value={p.appointmentId}>
                    {formatDate(p.date)} - {p.startTime}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSelectAttendance} disabled={!selectedAttendance}>
                Continuar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
