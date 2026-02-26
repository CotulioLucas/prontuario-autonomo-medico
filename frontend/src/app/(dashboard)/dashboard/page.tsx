import { Header } from "@/components/layout"

export default function DashboardPage() {
  return (
    <>
      <Header breadcrumbs={[{ label: "Dashboard" }]} />
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao Prontuario Autonomo. Selecione uma opcao no menu lateral.
        </p>
      </div>
    </>
  )
}
