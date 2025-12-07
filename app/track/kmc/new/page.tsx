"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AudioButton } from "@/components/ui/audio-button"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"
import type { KMCPosition, KMCSessionLog } from "@/lib/types"

const positions: { value: KMCPosition; label: string }[] = [
  { value: "chest-to-chest", label: "Chest to Chest" },
  { value: "upright-wrap", label: "Upright Wrap" },
  { value: "other", label: "Other" },
]

export default function NewKMCLogPage() {
  const router = useRouter()
  const { user, currentBaby, addLog } = useApp()

  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [startTime, setStartTime] = useState("")
  const [duration, setDuration] = useState("")
  const [position, setPosition] = useState<KMCPosition>("chest-to-chest")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!user || !currentBaby) {
      toast.error("Please sign in and add a baby first")
      setIsLoading(false)
      return
    }

    if (!date || !startTime || !duration) {
      toast.error("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    const durationMinutes = Number.parseInt(duration)
    const startDateTime = new Date(`${date}T${startTime}`)
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000)

    const logData: Omit<KMCSessionLog, "id" | "timestamp"> = {
      babyId: currentBaby.id,
      authorUserId: user.id,
      authorRole: user.role,
      type: "kmc_session",
      nurseComment: null,
      immutable: user.role === "parent",
      data: {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        durationMinutes,
        position,
        notes,
      },
    }

    addLog(logData as Omit<KMCSessionLog, "id" | "timestamp">)
    toast.success("KMC session logged!")
    router.push("/track")
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/track">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Log KMC Session</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Manual KMC Entry
                <AudioButton audioKey="log-kmc" />
              </CardTitle>
              <CardDescription>Record a KMC session you forgot to track</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time *</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g., 60"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-12"
                    min="1"
                    max="480"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Position</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {positions.map((pos) => (
                      <button
                        key={pos.value}
                        type="button"
                        onClick={() => setPosition(pos.value)}
                        className={`rounded-lg border p-3 text-center text-sm transition-colors ${
                          position === pos.value
                            ? "border-primary bg-primary/5"
                            : "border-border bg-transparent hover:border-primary/50"
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="How did the session go?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                    <Link href="/track">Cancel</Link>
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Saving..." : "Save"}
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
