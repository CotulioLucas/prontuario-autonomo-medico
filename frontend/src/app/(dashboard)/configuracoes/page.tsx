import { Header } from "@/components/layout"
import { Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ConfiguracoesPage() {
  return (
    <>
      <Header breadcrumbs={[{ label: "Configuracoes" }]} />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Configuracoes</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/configuracoes/equipe">
            <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2">
              <Settings className="h-6 w-6" />
              <span>Equipe</span>
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
