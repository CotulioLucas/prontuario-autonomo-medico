"use client"

import { useCallback, useEffect, useState } from "react"
import { DollarSign, Clock, CheckCircle, Receipt, SearchX } from "lucide-react"
import { toast } from "sonner"

import { Header } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api"

interface Receivable {
  id: string
  amount: number
  status: "pending" | "paid" | "partial" | "cancelled"
  dueDate?: string
  paidAt?: string
  paymentMethod?: string
  patient?: { id: string; name: string }
  professional?: { name: string }
  attendanceDate?: string
}

interface ReceivablesResponse {
  data: Receivable[]
  total: number
  page: number
  limit: number
  summary?: {
    totalPending: number
    totalPaid: number
    totalPeriod: number
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount / 100)
}

function formatDate(str?: string) {
  if (!str) return "-"
  try { return new Date(str).toLocaleDateString("pt-BR") } catch { return "-" }
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "credit_card", label: "Cartao de credito" },
  { value: "debit_card", label: "Cartao de debito" },
  { value: "bank_transfer", label: "Transferencia bancaria" },
  { value: "check", label: "Cheque" },
]

const LIMIT = 20

export default function FinanceiroPage() {
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  // Filtros
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  })
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    return last.toISOString().slice(0, 10)
  })
  const [statusFilter, setStatusFilter] = useState("all")
  const [patientSearch, setPatientSearch] = useState("")

  // Totalizadores calculados localmente
  const totalPending = receivables
    .filter((r) => r.status === "pending")
    .reduce((acc, r) => acc + r.amount, 0)
  const totalPaid = receivables
    .filter((r) => r.status === "paid")
    .reduce((acc, r) => acc + r.amount, 0)
  const totalPeriod = receivables.reduce((acc, r) => acc + r.amount, 0)

  // Dialog de baixa
  const [baixaDialogOpen, setBaixaDialogOpen] = useState(false)
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null)
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [paymentMethod, setPaymentMethod] = useState("")
  const [savingBaixa, setSavingBaixa] = useState(false)

  const fetchReceivables = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      })
      if (startDate) params.set("startDate", startDate)
      if (endDate) params.set("endDate", endDate)
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter)

      const res = await api.get<ReceivablesResponse>(`/receivables?${params}`)
      let data = res.data

      // Filtro de paciente no frontend (busca simples)
      if (patientSearch.trim()) {
        const q = patientSearch.toLowerCase()
        data = data.filter((r) => r.patient?.name?.toLowerCase().includes(q))
      }

      setReceivables(data)
      setTotal(res.total)
    } catch {
      setError(true)
      toast.error("Erro ao carregar contas a receber")
    } finally {
      setLoading(false)
    }
  }, [page, startDate, endDate, statusFilter, patientSearch])

  useEffect(() => {
    fetchReceivables()
  }, [fetchReceivables])

  const openBaixa = (r: Receivable) => {
    setSelectedReceivable(r)
    setPaymentDate(new Date().toISOString().slice(0, 10))
    setPaymentMethod("")
    setBaixaDialogOpen(true)
  }

  const confirmBaixa = async () => {
    if (!selectedReceivable || !paymentDate || !paymentMethod) {
      toast.error("Preencha todos os campos")
      return
    }
    setSavingBaixa(true)
    try {
      await api.post(`/receivables/${selectedReceivable.id}/payment`, {
        paidAt: paymentDate,
        paymentMethod,
      })
      toast.success("Pagamento registrado com sucesso")
      setBaixaDialogOpen(false)
      fetchReceivables()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao registrar pagamento"
      toast.error(msg)
    } finally {
      setSavingBaixa(false)
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <>
      <Header breadcrumbs={[{ label: "Financeiro" }]} />
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <DollarSign className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Contas a receber</h1>
        </div>

        {/* Totalizadores */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {loading ? "..." : formatCurrency(totalPending)}
                  </p>
                  <p className="text-sm text-muted-foreground">Pendente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {loading ? "..." : formatCurrency(totalPaid)}
                  </p>
                  <p className="text-sm text-muted-foreground">Pago</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-600">
                    {loading ? "..." : formatCurrency(totalPeriod)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total do periodo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Data inicial</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
              className="h-9 w-40"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Data final</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
              className="h-9 w-40"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Paciente</Label>
            <Input
              placeholder="Buscar paciente..."
              value={patientSearch}
              onChange={(e) => { setPatientSearch(e.target.value); setPage(1) }}
              className="h-9 w-48"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              Erro ao carregar contas a receber.
              <Button variant="outline" size="sm" onClick={fetchReceivables}>
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {/* Tabela */}
        {!loading && !error && (
          <>
            {receivables.length === 0 ? (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-sm font-medium">Nenhuma conta encontrada</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tente ajustar os filtros ou aguarde novos agendamentos serem realizados.
                </p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setStatusFilter("all")
                    setPatientSearch("")
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Profissional</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Acoes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receivables.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            {formatDate(r.attendanceDate || r.dueDate)}
                          </TableCell>
                          <TableCell>{r.patient?.name || "-"}</TableCell>
                          <TableCell>{r.professional?.name || "-"}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(r.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                r.status === "paid"
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                              }
                            >
                              {r.status === "paid" ? "Pago" : "Pendente"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {r.status === "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openBaixa(r)}
                                >
                                  Dar baixa
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled
                                title="Disponivel em breve"
                              >
                                Recibo
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{total} conta{total !== 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Anterior
                      </Button>
                      <span>{page} / {totalPages}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Proximo
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Dialog de Baixa */}
      <Dialog open={baixaDialogOpen} onOpenChange={setBaixaDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
          </DialogHeader>
          {selectedReceivable && (
            <div className="space-y-4">
              {/* Informações read-only */}
              <div className="rounded-lg bg-muted p-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paciente:</span>
                  <span className="font-medium">{selectedReceivable.patient?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">
                    {formatDate(selectedReceivable.attendanceDate || selectedReceivable.dueDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(selectedReceivable.amount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data do pagamento</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Forma de pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBaixaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmBaixa}
              disabled={savingBaixa || !paymentDate || !paymentMethod}
            >
              {savingBaixa ? "Confirmando..." : "Confirmar baixa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
