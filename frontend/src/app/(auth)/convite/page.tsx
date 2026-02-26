"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ConviteContent } from "./content"

export default function ConvitePage() {
  return (
    <Suspense
      fallback={
        <Card className="text-center">
          <CardContent className="pt-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Carregando convite...</p>
          </CardContent>
        </Card>
      }
    >
      <ConviteContent />
    </Suspense>
  )
}
