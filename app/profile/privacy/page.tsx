"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Database, Eye, Trash2 } from "lucide-react"

export default function PrivacyPage() {
  const router = useRouter()
  const { user, isLoading } = useApp()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth")
    }
  }, [user, isLoading, router])

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to delete all your data? This action cannot be undone and will remove all logs, baby profiles, and settings.",
      )
    ) {
      localStorage.clear()
      window.location.href = "/auth"
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Privacy & Data</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Your Data is Safe</CardTitle>
                  <CardDescription>We take your privacy seriously</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Local Storage Only</p>
                  <p className="text-sm text-muted-foreground">
                    In this demo version, all your data is stored locally on your device. Nothing is sent to external
                    servers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Nurse Access</p>
                  <p className="text-sm text-muted-foreground">
                    Your assigned nurse can view your baby&apos;s logs to provide better care. They cannot modify your
                    entries.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleClearData} className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All My Data
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This will permanently delete all your data from this device
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This is a prototype application. For production use, data would be securely
                stored with encryption and proper authentication. Always consult your healthcare provider for medical
                decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
