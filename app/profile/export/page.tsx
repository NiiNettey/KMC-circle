"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText, Printer } from "lucide-react"
import { getLogsByBaby, getUserById } from "@/lib/storage"
import type { LogEntry, KMCSessionLog, WeightLog, FeedingLog } from "@/lib/types"
import { getTotalKMCHours, calculateWeightGainVelocity } from "@/lib/utils/analytics"

export default function ParentExportPage() {
  const router = useRouter()
  const { user, isLoading, currentBaby } = useApp()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth")
      return
    }

    if (currentBaby) {
      setLogs(getLogsByBaby(currentBaby.id))
    }
  }, [user, isLoading, router, currentBaby])

  const nurse = useMemo(
    () => (currentBaby?.assignedNurseId ? getUserById(currentBaby.assignedNurseId) : null),
    [currentBaby],
  )
  const totalKMCHours = useMemo(() => (currentBaby ? getTotalKMCHours(logs, currentBaby.id) : 0), [logs, currentBaby])
  const weightVelocity = useMemo(
    () => (currentBaby ? calculateWeightGainVelocity(logs, currentBaby.id) : null),
    [logs, currentBaby],
  )

  const kmcSessions = useMemo(
    () =>
      logs
        .filter((l): l is KMCSessionLog => l.type === "kmc_session")
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [logs],
  )

  const weightLogs = useMemo(
    () =>
      logs
        .filter((l): l is WeightLog => l.type === "weight")
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [logs],
  )

  const feedingLogs = useMemo(
    () =>
      logs
        .filter((l): l is FeedingLog => l.type === "feeding")
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [logs],
  )

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (!currentBaby || !reportRef.current) return

    const reportContent = reportRef.current.innerText
    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${currentBaby.babyName.replace(/\s+/g, "_")}_care_report_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading || !user || !currentBaby) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const dobDate = new Date(currentBaby.dob)
  const ageInDays = Math.floor((Date.now() - dobDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Export Care Report</h1>
            <p className="text-xs text-muted-foreground">{currentBaby.babyName}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Action Buttons */}
          <div className="flex gap-3 print:hidden">
            <Button onClick={handlePrint} variant="outline" className="flex-1 bg-transparent">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleDownload} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          {/* Report Content */}
          <div ref={reportRef} className="space-y-4 print:space-y-6">
            {/* Header */}
            <Card className="print:border-2 print:border-black">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileText className="h-6 w-6 text-primary print:text-black" />
                  <CardTitle className="text-xl">My Baby&apos;s Care Report</CardTitle>
                </div>
                <CardDescription>Mama&apos;s Circle - Kangaroo Mother Care Tracker</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Baby Name</p>
                    <p className="font-semibold">{currentBaby.babyName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p className="font-semibold">{new Date(currentBaby.dob).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mother</p>
                    <p className="font-semibold">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Age</p>
                    <p className="font-semibold">{ageInDays} days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Facility</p>
                    <p className="font-semibold">{currentBaby.facility}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Assigned Nurse</p>
                    <p className="font-semibold">{nurse?.name || "Not assigned"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progress Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-lg bg-primary/5 p-3 print:border print:border-gray-300">
                    <p className="text-muted-foreground text-xs">Birth Weight</p>
                    <p className="text-lg font-bold">{currentBaby.birthWeightGrams}g</p>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-3 print:border print:border-gray-300">
                    <p className="text-muted-foreground text-xs">Current Weight</p>
                    <p className="text-lg font-bold text-primary print:text-black">{currentBaby.currentWeightGrams}g</p>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-3 print:border print:border-gray-300">
                    <p className="text-muted-foreground text-xs">Weight Gained</p>
                    <p className="text-lg font-bold">
                      {currentBaby.currentWeightGrams - currentBaby.birthWeightGrams > 0 ? "+" : ""}
                      {currentBaby.currentWeightGrams - currentBaby.birthWeightGrams}g
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-3 print:border print:border-gray-300">
                    <p className="text-muted-foreground text-xs">Daily Gain Rate</p>
                    <p className="text-lg font-bold">{weightVelocity?.toFixed(1) || "N/A"} g/day</p>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-3 col-span-2 print:border print:border-gray-300">
                    <p className="text-muted-foreground text-xs">Total Skin-to-Skin Time</p>
                    <p className="text-2xl font-bold text-primary print:text-black">{totalKMCHours.toFixed(1)} hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight Journey */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weight Journey</CardTitle>
                <CardDescription>{weightLogs.length} measurements recorded</CardDescription>
              </CardHeader>
              <CardContent>
                {weightLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No weight records yet</p>
                ) : (
                  <div className="space-y-2">
                    {weightLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex justify-between text-sm border-b pb-2">
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                        <span className="font-medium">{log.data.weightGrams}g</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* KMC Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">KMC Sessions</CardTitle>
                <CardDescription>{kmcSessions.length} total sessions - Keep going!</CardDescription>
              </CardHeader>
              <CardContent>
                {kmcSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No KMC sessions yet - Start your journey today!</p>
                ) : (
                  <div className="space-y-2">
                    {kmcSessions.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex justify-between text-sm border-b pb-2">
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                        <div className="text-right">
                          <span className="font-medium">{log.data.durationMinutes} min</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {log.data.position}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feeding Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Feeding Summary</CardTitle>
                <CardDescription>{feedingLogs.length} feedings logged</CardDescription>
              </CardHeader>
              <CardContent>
                {feedingLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No feeding records yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {["breast", "expressed", "formula", "EBM", "DBM"].map((type) => {
                      const count = feedingLogs.filter((l) => l.data.type === type).length
                      if (count === 0) return null
                      return (
                        <div key={type} className="flex justify-between">
                          <span className="capitalize">{type}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>Generated on {new Date().toLocaleString()}</p>
              <p className="mt-2">Mama&apos;s Circle - Every moment of skin-to-skin counts!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
