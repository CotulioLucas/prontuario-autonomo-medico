"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Users, UserPlus, Search, Eye, Pencil, SearchX } from "lucide-react"

import { Header } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Patient {
  id: string
  name: string
  cpf?: string
  phone: string
  email?: string
  lastAppointmentDate?: string
  professionalName?: string
}

interface PatientsResponse {
  data: Patient[]
  total: number
  page: number
  limit: number
}

function maskCpf(cpf?: string) {
  if (!cpf) return "-"
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11) return cpf
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function formatPhone(phone?: string) {
  if (!phone) return "-"
  const d = phone.replace(/\D/g, "")
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return phone
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-"
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR")
  } catch {
    return "-"
  }
}

const LIMIT = 10

export default function PacientesPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      })
      if (debouncedSearch) params.set("search", debouncedSearch)

      const res = await api.get<PatientsResponse>(`/patients?${params}`)
      setPatients(res.data)
      setTotal(res.total)
    } catch {
      setError(true)
      toast.error("Erro ao carregar pacientes")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <>
      <Header breadcrumbs={[{ label: "Pacientes" }]} />
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Pacientes</h1>
          </div>
          <Button asChild>
            <Link href="/pacientes/novo">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo paciente
            </Link>
          </Button>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              Erro ao carregar pacientes. Tente novamente.
              <Button variant="outline" size="sm" onClick={fetchPatients}>
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div className="rounded-md border">
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        )}

        {/* Tabela */}
        {!loading && !error && (
          <>
            {patients.length === 0 && !debouncedSearch && (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-sm font-medium">Nenhum paciente cadastrado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cadastre seu primeiro paciente para comecar a gerenciar prontuarios e agendamentos.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/pacientes/novo">Cadastrar primeiro paciente</Link>
                </Button>
              </div>
            )}

            {patients.length === 0 && debouncedSearch && (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <SearchX className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-sm font-medium">Nenhum paciente encontrado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tente buscar por outro nome, CPF ou telefone.
                </p>
              </div>
            )}

            {patients.length > 0 && (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Profissional</TableHead>
                        <TableHead>Ultima consulta</TableHead>
                        <TableHead className="text-right">Acoes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients.map((patient) => (
                        <TableRow
                          key={patient.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/pacientes/${patient.id}`)}
                        >
                          <TableCell className="font-medium">{patient.name}</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {maskCpf(patient.cpf)}
                          </TableCell>
                          <TableCell>{formatPhone(patient.phone)}</TableCell>
                          <TableCell>{patient.professionalName || "-"}</TableCell>
                          <TableCell>{formatDate(patient.lastAppointmentDate)}</TableCell>
                          <TableCell className="text-right">
                            <div
                              className="flex justify-end gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                title="Ver detalhes"
                              >
                                <Link href={`/pacientes/${patient.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                title="Editar"
                              >
                                <Link href={`/pacientes/${patient.id}/editar`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginacao */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {total} paciente{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Anterior
                      </Button>
                      <span>
                        {page} / {totalPages}
                      </span>
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
    </>
  )
}
