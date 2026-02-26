"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ["admin", "autonomo", "medico", "secretaria"] },
  { icon: Calendar, label: "Agenda", href: "/agenda", roles: ["admin", "autonomo", "medico", "secretaria"] },
  { icon: Users, label: "Pacientes", href: "/pacientes", roles: ["admin", "autonomo", "medico", "secretaria"] },
  { icon: DollarSign, label: "Financeiro", href: "/financeiro", roles: ["admin", "autonomo", "medico", "secretaria"] },
  { icon: FileText, label: "Recibos", href: "/recibos", roles: ["admin", "autonomo", "medico", "secretaria"] },
  { icon: Settings, label: "Configuracoes", href: "/configuracoes", roles: ["admin", "autonomo"] },
  { icon: CreditCard, label: "Assinatura", href: "/assinatura", roles: ["admin", "autonomo"] },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-[68px]" : "w-[280px]"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-sidebar-border p-4">
          {!isCollapsed && (
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              Prontuario
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <Link
            href="/login"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Sair</span>}
          </Link>
        </div>
      </div>
    </aside>
  )
}
