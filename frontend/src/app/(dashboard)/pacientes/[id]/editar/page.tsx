"use client"

import { useRouter } from "next/navigation"
import { Users } from "lucide-react"

import { Header } from "@/components/layout"
import { PatientForm } from "../../_components/patient-form"

interface Props {
  params: { id: string }
}

export default function EditarPacientePage({ params }: Props) {
  const router = useRouter()

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Pacientes", href: "/pacientes" },
          { label: "Editar paciente" },
        ]}
      />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Editar paciente</h1>
        </div>
        <PatientForm
          mode="edit"
          patientId={params.id}
          onSuccess={(id) => router.push(`/pacientes/${id}`)}
          onCancel={() => router.push(`/pacientes/${params.id}`)}
        />
      </div>
    </>
  )
}
