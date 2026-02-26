"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { RedefinirSenhaContent } from "./content"

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <Card className="text-center">
          <CardContent className="pt-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </CardContent>
        </Card>
      }
    >
      <RedefinirSenhaContent />
    </Suspense>
  )
}
