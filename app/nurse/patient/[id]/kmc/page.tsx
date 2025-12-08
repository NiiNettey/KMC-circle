"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"
import type { KMCSessionLog, KMCPosition } from "@/lib/types"
import { getBabyById } from "@/lib/storage"

const POSITIONS: { value: KMCPosition; label: string }[] = [
  { value: "chest-to-chest", label: "Chest-to-Chest" },
  { value: "upright-wrap", label: "Upright Wrap" },
  { value: "other", label: "Other" },
]

export default function NurseKMCPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading, addLog } = useApp()

  const babyId = params.id as string
  const [baby, setBaby] = useState<ReturnType<typeof getBabyById> | null>(null)

  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [position, setPosition] = useState<KMCPosition>("chest-to-chest")
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "nurse" && user.role !== "admin"))) {
      router.replace("/auth")
      return
    }

    if (babyId) {
      const foundBaby = getBabyById(babyId)
      setBaby(foundBaby)
    }

    // Set default times
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    setEndTime(now.toISOString().slice(0, 16))
    setStartTime(oneHourAgo.toISOString().slice(0, 16))
  }, [user, isLoading, router, babyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    if (!user || !baby || !startTime || !endTime) {
      toast.error("Please fill in start and end times")
      setIsSaving(false)
      return
    }

    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000)

    if (durationMinutes <= 0) {
      toast.error("End time must be after start time")
      setIsSaving(false)
      return
    }

    const logData: Omit<KMCSessionLog, "id" | "timestamp"> = {
      babyId: baby.id,
      authorUserId: user.id,
      authorRole: user.role,
      type: "kmc_session",
      nurseComment: null,
      immutable: false,
      data: {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        durationMinutes,
        position,
        notes,
      },
    }

    addLog(logData as Omit<KMCSessionLog, "id" | "timestamp">)
    toast.success(`KMC session recorded! (${durationMinutes} minutes)`)
    router.push(`/nurse/patient/${babyId}`)
    setIsSaving(false)
  }

  if (isLoading || !user || !baby) {
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
            <Link href={`/nurse/patient/${babyId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Log KMC Session</h1>
            <p className="text-xs text-muted-foreground">{baby.babyName}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>KMC Session</CardTitle>
              <CardDescription>Record Kangaroo Mother Care session</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Position</Label>
                  <RadioGroup
                    value={position}
                    onValueChange={(v) => setPosition(v as KMCPosition)}
                    className="grid grid-cols-3 gap-2"
                  >
                    {POSITIONS.map((pos) => (
                      <div key={pos.value}>
                        <RadioGroupItem value={pos.value} id={pos.value} className="peer sr-only" />
                        <Label
                          htmlFor={pos.value}
                          className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-sm"
                        >
                          {pos.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g., Baby calm, mother comfortable..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                    <Link href={`/nurse/patient/${babyId}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Session"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
