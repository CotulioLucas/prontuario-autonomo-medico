"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Users, UserPlus, MoreHorizontal, RefreshCw, Trash2, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { api, ApiClientError } from "@/lib/api"
import { Header } from "@/components/layout"

interface Member {
  id: string
  nome: string
  email: string
  papel: string
  status: "ativo" | "pendente" | "expirado" | "inativo"
  dataConvite?: string
}

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "medico", label: "Medico" },
  { value: "psicologo", label: "Psicologo" },
  { value: "fisioterapeuta", label: "Fisioterapeuta" },
  { value: "secretaria", label: "Secretaria" },
]

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "ativo":
      return "success"
    case "pendente":
      return "warning"
    case "expirado":
      return "destructive"
    default:
      return "secondary"
  }
}

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

export default function EquipePage() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("")
  const [newRole, setNewRole] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const [membersRes, invitesRes] = await Promise.all([
        api.get<{ members: Member[] }>("/team/members"),
        api.get<{ invites: Member[] }>("/team/invites"),
      ])
      const allMembers = [
        ...(membersRes.members || []),
        ...(invitesRes.invites || []),
      ]
      setMembers(allMembers)
    } catch (err) {
      toast.error("Erro ao carregar equipe")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteRole) return

    setIsSubmitting(true)
    try {
      await api.post("/team/invites", { email: inviteEmail, role: inviteRole })
      toast.success(`Convite enviado para ${inviteEmail}`)
      setIsInviteDialogOpen(false)
      setInviteEmail("")
      setInviteRole("")
      fetchMembers()
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao enviar convite")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendInvite = async (id: string) => {
    try {
      await api.post(`/team/invites/${id}/resend`)
      toast.success("Convite reenviado")
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao reenviar convite")
      }
    }
  }

  const handleRevokeInvite = async (id: string) => {
    try {
      await api.delete(`/team/invites/${id}`)
      toast.success("Convite revogado")
      fetchMembers()
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao revogar convite")
      }
    }
  }

  const handleChangeRole = async () => {
    if (!selectedMember || !newRole) return

    setIsSubmitting(true)
    try {
      await api.put(`/team/members/${selectedMember.id}/role`, { role: newRole })
      toast.success("Papel alterado com sucesso")
      setIsRoleDialogOpen(false)
      setSelectedMember(null)
      setNewRole("")
      fetchMembers()
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao alterar papel")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeactivate = async () => {
    if (!selectedMember) return

    setIsSubmitting(true)
    try {
      await api.put(`/team/members/${selectedMember.id}/deactivate`)
      toast.success("Membro desativado")
      setIsDeactivateDialogOpen(false)
      setSelectedMember(null)
      fetchMembers()
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao desativar membro")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderActions = (member: Member) => {
    if (member.status === "pendente" || member.status === "expirado") {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleResendInvite(member.id)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reenviar convite
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedMember(member)
                handleRevokeInvite(member.id)
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Revogar convite
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    if (member.status === "ativo") {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedMember(member)
                setNewRole(member.papel)
                setIsRoleDialogOpen(true)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Alterar papel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedMember(member)
                setIsDeactivateDialogOpen(true)
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Desativar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return null
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Configuracoes", href: "/configuracoes" },
          { label: "Equipe" },
        ]}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Equipe</h1>
            <p className="text-muted-foreground">
              Gerencie membros e convites da sua clinica
            </p>
          </div>
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar membro
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhum membro na equipe</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Convide profissionais e secretarias para comecar
            </p>
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Convidar primeiro membro
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
              <div>Nome</div>
              <div>E-mail</div>
              <div>Papel</div>
              <div>Status</div>
              <div className="text-right">Acoes</div>
            </div>
            <div className="divide-y">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-5 gap-4 p-4 items-center text-sm"
                >
                  <div className="font-medium">{member.nome || "-"}</div>
                  <div className="text-muted-foreground">{member.email}</div>
                  <div>
                    <Badge variant={getRoleBadgeVariant(member.papel)}>
                      {ROLES.find((r) => r.value === member.papel)?.label ||
                        member.papel}
                    </Badge>
                  </div>
                  <div>
                    <Badge variant={getStatusBadgeVariant(member.status)}>
                      {member.status}
                    </Badge>
                  </div>
                  <div className="text-right">{renderActions(member)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar membro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">E-mail</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="email@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Papel</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={!inviteEmail || !inviteRole || isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Enviar convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar papel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Alterando papel de <strong>{selectedMember?.nome}</strong>
            </p>
            <div className="space-y-2">
              <Label>Novo papel</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangeRole} disabled={!newRole || isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeactivateDialogOpen}
        onOpenChange={setIsDeactivateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar{" "}
              <strong>{selectedMember?.nome}</strong>? Esta acao impedira o
              acesso do membro a clinica.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
