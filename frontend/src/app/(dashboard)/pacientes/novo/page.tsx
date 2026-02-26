"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"

import { Header } from "@/components/layout"
import { PatientForm } from "../_components/patient-form"

export default function NovoPacientePage() {
  const router = useRouter()

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Pacientes", href: "/pacientes" },
          { label: "Novo paciente" },
        ]}
      />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Novo paciente</h1>
        </div>
        <PatientForm
          mode="create"
          onSuccess={(id) => router.push(`/pacientes/${id}`)}
          onCancel={() => router.push("/pacientes")}
        />
      </div>
    </>
  )
}
