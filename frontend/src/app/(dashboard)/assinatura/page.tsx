import { Header } from "@/components/layout"
import { CreditCard } from "lucide-react"

export default function AssinaturaPage() {
  return (
    <>
      <Header breadcrumbs={[{ label: "Assinatura" }]} />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Assinatura</h1>
        </div>
        <p className="text-muted-foreground">
          Gerenciamento do plano e assinatura.
        </p>
        <div className="rounded-lg border border-dashed p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            Modulo de assinatura em construcao.
          </p>
        </div>
      </div>
    </>
  )
}
