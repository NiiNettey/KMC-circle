"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context/app-context"
import { AppHeader } from "@/components/layout/app-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, ClipboardCheck, Clock, Baby } from "lucide-react"
import Link from "next/link"
import { getPendingBabiesForNurse, getBabiesByNurse } from "@/lib/storage"

export default function NurseDashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useApp()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "nurse")) {
      router.replace("/auth")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const pendingBabies = getPendingBabiesForNurse(user.id)
  const assignedBabies = getBabiesByNurse(user.id).filter((b) => b.status === "assigned")

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <AppHeader title={`Hello, ${user.name}`} subtitle="Nurse/Midwife Dashboard" />

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{assignedBabies.length}</p>
                  <p className="text-xs text-muted-foreground">Active Patients</p>
                </div>
              </CardContent>
            </Card>

            <Card className={pendingBabies.length > 0 ? "bg-warning/10 border-warning/30" : ""}>
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${pendingBabies.length > 0 ? "bg-warning/20" : "bg-muted"}`}
                >
                  <Clock className={`h-5 w-5 ${pendingBabies.length > 0 ? "text-warning" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${pendingBabies.length > 0 ? "text-warning" : ""}`}>
                    {pendingBabies.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending Requests</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals Alert */}
          {pendingBabies.length > 0 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    Pending Approvals
                  </CardTitle>
                  <Badge variant="outline" className="border-warning text-warning">
                    {pendingBabies.length} new
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {pendingBabies.length} mother{pendingBabies.length > 1 ? "s have" : " has"} requested your care
                </p>
                <Button asChild className="w-full">
                  <Link href="/nurse/pending">Review Requests</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* My Patients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Baby className="h-4 w-4" />
                My Patients
              </CardTitle>
              <CardDescription>Babies currently under your care</CardDescription>
            </CardHeader>
            <CardContent>
              {assignedBabies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No assigned patients yet</p>
              ) : (
                <div className="space-y-3">
                  {assignedBabies.slice(0, 5).map((baby) => (
                    <Link
                      key={baby.id}
                      href={`/nurse/patient/${baby.id}`}
                      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-semibold text-primary">{baby.babyName.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{baby.babyName}</p>
                        <p className="text-xs text-muted-foreground">{baby.facility}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {baby.currentWeightGrams}g
                      </Badge>
                    </Link>
                  ))}
                  {assignedBabies.length > 5 && (
                    <Button variant="ghost" asChild className="w-full">
                      <Link href="/nurse/patients">View all {assignedBabies.length} patients</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" asChild className="h-auto flex-col gap-2 py-4 bg-transparent">
                <Link href="/nurse/patients">
                  <Users className="h-5 w-5" />
                  <span className="text-xs">All Patients</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto flex-col gap-2 py-4 bg-transparent">
                <Link href="/nurse/pending">
                  <ClipboardCheck className="h-5 w-5" />
                  <span className="text-xs">Pending</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
