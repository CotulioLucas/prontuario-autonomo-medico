import { Header } from "@/components/layout"
import { FileText } from "lucide-react"

export default function RecibosPage() {
  return (
    <>
      <Header breadcrumbs={[{ label: "Recibos" }]} />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Recibos</h1>
        </div>
        <p className="text-muted-foreground">
          Emissao e historico de recibos.
        </p>
        <div className="rounded-lg border border-dashed p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            Modulo de recibos em construcao.
          </p>
        </div>
      </div>
    </>
  )
}
