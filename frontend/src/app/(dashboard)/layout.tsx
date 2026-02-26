"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "ml-[68px]" : "ml-[280px]"
        )}
      >
        <main className="p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
