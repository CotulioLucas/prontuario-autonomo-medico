import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 flex-col justify-between p-12">
        <div>
          <div className="text-white text-2xl font-bold">Prontuario Autonomo</div>
        </div>
        <div className="text-white">
          <h1 className="text-4xl font-bold mb-4">
            Gestao inteligente para profissionais de saude
          </h1>
          <p className="text-emerald-100 text-lg">
            Gerencie pacientes, agendamentos e prontuarios em um so lugar.
          </p>
        </div>
        <div className="text-emerald-200 text-sm">
          © 2024 Prontuario Autonomo. Todos os direitos reservados.
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
