"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmarEmailContent } from "./content"

export default function ConfirmarEmailPage() {
  return (
    <Suspense
      fallback={
        <Card className="text-center">
          <CardContent className="pt-6">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold mt-4">Carregando...</h2>
          </CardContent>
        </Card>
      }
    >
      <ConfirmarEmailContent />
    </Suspense>
  )
}
