"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context/app-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading, babies } = useApp()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.replace("/auth")
      return
    }

    if (user.role === "nurse") {
      router.replace("/nurse")
      return
    }

    // Parent flow
    if (babies.length === 0) {
      router.replace("/setup-baby")
    } else {
      router.replace("/dashboard")
    }
  }, [user, isLoading, babies, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <span className="text-2xl font-bold text-primary-foreground">MC</span>
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
