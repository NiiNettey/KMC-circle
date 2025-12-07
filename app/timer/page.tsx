"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { AudioButton } from "@/components/ui/audio-button"
import { ProgressRing } from "@/components/ui/progress-ring"
import { toast } from "sonner"
import { Play, Square, ArrowLeft, Heart } from "lucide-react"
import type { KMCPosition } from "@/lib/types"
import Link from "next/link"

const positions: { value: KMCPosition; label: string; description: string }[] = [
  { value: "chest-to-chest", label: "Chest to Chest", description: "Baby lying on your bare chest" },
  { value: "upright-wrap", label: "Upright Wrap", description: "Baby wrapped upright on chest" },
  { value: "other", label: "Other Position", description: "Alternative comfortable position" },
]

export default function TimerPage() {
  const router = useRouter()
  const { user, isLoading, currentBaby, timer, startTimer, stopTimer, playAudio } = useApp()

  const [position, setPosition] = useState<KMCPosition>("chest-to-chest")
  const [notes, setNotes] = useState("")
  const [elapsed, setElapsed] = useState(0)

  // Calculate elapsed time
  useEffect(() => {
    if (!timer.isRunning || !timer.startTime) {
      setElapsed(0)
      return
    }

    const updateElapsed = () => {
      const start = new Date(timer.startTime!).getTime()
      const now = Date.now()
      setElapsed(Math.floor((now - start) / 1000))
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [timer.isRunning, timer.startTime])

  // Sync position from timer state
  useEffect(() => {
    if (timer.isRunning && timer.position) {
      setPosition(timer.position)
    }
  }, [timer.isRunning, timer.position])

  const handleStart = useCallback(() => {
    if (!currentBaby) {
      toast.error("Please add a baby first")
      return
    }
    startTimer(currentBaby.id, position)
    playAudio("start-kmc")
    toast.success("KMC session started!")
  }, [currentBaby, position, startTimer, playAudio])

  const handleStop = useCallback(() => {
    const log = stopTimer()
    playAudio("end-kmc")
    if (log) {
      toast.success(
        `Session saved: ${Math.round((log as { data: { durationMinutes: number } }).data.durationMinutes)} minutes`,
      )
    }
    router.push("/dashboard")
  }, [stopTimer, playAudio, router])

  const formatTime = useMemo(() => {
    const hours = Math.floor(elapsed / 3600)
    const minutes = Math.floor((elapsed % 3600) / 60)
    const seconds = elapsed % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }, [elapsed])

  const progressPercent = useMemo(() => {
    // Goal: 1 hour per session = 100%
    return Math.min((elapsed / 3600) * 100, 100)
  }, [elapsed])

  useEffect(() => {
    if (!isLoading && !user) {
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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">KMC Timer</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Timer Display */}
          <div className="flex flex-col items-center py-8">
            <ProgressRing
              progress={progressPercent}
              size={200}
              strokeWidth={12}
              color={timer.isRunning ? "primary" : "primary"}
              className="mb-6"
            >
              <div className="text-center">
                {timer.isRunning && (
                  <Heart className="mx-auto mb-2 h-6 w-6 text-primary animate-pulse" fill="currentColor" />
                )}
                <p className="text-3xl font-bold tracking-wider">{formatTime}</p>
                <p className="text-sm text-muted-foreground">{timer.isRunning ? "In Progress" : "Ready"}</p>
              </div>
            </ProgressRing>

            {currentBaby && (
              <p className="text-center text-muted-foreground">
                {timer.isRunning ? `${currentBaby.babyName} is enjoying KMC` : `Start KMC with ${currentBaby.babyName}`}
              </p>
            )}
          </div>

          {/* Position Selector */}
          {!timer.isRunning && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Position
                  <AudioButton audioKey="position-chest" />
                </CardTitle>
                <CardDescription>How are you holding baby?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {positions.map((pos) => (
                  <button
                    key={pos.value}
                    type="button"
                    onClick={() => setPosition(pos.value)}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      position === pos.value
                        ? "border-primary bg-primary/5"
                        : "border-border bg-transparent hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium">{pos.label}</p>
                    <p className="text-sm text-muted-foreground">{pos.description}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Session Notes - show when running */}
          {timer.isRunning && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Session Notes</CardTitle>
                <CardDescription>Optional notes about this session</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="How is baby responding? Any observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </CardContent>
            </Card>
          )}

          {/* Tips while running */}
          {timer.isRunning && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <p className="text-sm text-primary font-medium mb-2">During KMC:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keep baby&apos;s head turned to the side</li>
                  <li>• Monitor baby&apos;s breathing</li>
                  <li>• Stay hydrated - have water nearby</li>
                  <li>• Relax and enjoy this bonding time</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {timer.isRunning ? (
              <Button onClick={handleStop} variant="destructive" className="flex-1 h-14 text-lg">
                <Square className="mr-2 h-5 w-5" />
                End Session
                <AudioButton audioKey="end-kmc" className="ml-2" />
              </Button>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <Button onClick={handleStart} className="flex-1 h-14 text-lg">
                  <Play className="mr-2 h-5 w-5" />
                  Start KMC
                </Button>
                <AudioButton audioKey="start-kmc" size="default" />
              </div>
            )}
          </div>

          {/* Manual Entry Option */}
          {!timer.isRunning && (
            <div className="text-center">
              <Button variant="link" asChild className="text-muted-foreground">
                <Link href="/track/kmc/new">Forgot to start? Log manually</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
