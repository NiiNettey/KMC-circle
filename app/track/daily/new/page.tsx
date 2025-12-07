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
import { ArrowLeft, Save, Smile, Frown, Meh, Moon } from "lucide-react"
import type { BabyMood, DailyLog } from "@/lib/types"

const moods: { value: BabyMood; label: string; icon: React.ReactNode }[] = [
  { value: "Calm", label: "Calm", icon: <Smile className="h-5 w-5" /> },
  { value: "Active", label: "Active", icon: <Meh className="h-5 w-5" /> },
  { value: "Sleeping", label: "Sleeping", icon: <Moon className="h-5 w-5" /> },
  { value: "Fussy", label: "Fussy", icon: <Frown className="h-5 w-5" /> },
]

export default function NewDailyLogPage() {
  const router = useRouter()
  const { user, currentBaby, addLog, playAudio } = useApp()

  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [babyMood, setBabyMood] = useState<BabyMood | null>(null)
  const [motherFeelings, setMotherFeelings] = useState("")
  const [todaysWin, setTodaysWin] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!user || !currentBaby) {
      toast.error("Please sign in and add a baby first")
      setIsLoading(false)
      return
    }

    const logData: Omit<DailyLog, "id" | "timestamp"> = {
      babyId: currentBaby.id,
      authorUserId: user.id,
      authorRole: user.role,
      type: "daily",
      nurseComment: null,
      immutable: user.role === "parent",
      data: {
        date,
        weightGrams: null,
        feedingType: null,
        breathingSupport: null,
        temperatureC: null,
        babyMood,
        motherFeelings,
        todaysWin,
      },
    }

    addLog(logData as Omit<DailyLog, "id" | "timestamp">)
    playAudio("save")
    toast.success("Daily log saved!")
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
          <h1 className="text-lg font-semibold flex items-center gap-2">
            Daily Check-in
            <AudioButton audioKey="log-daily" />
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>How is Today Going?</CardTitle>
              <CardDescription>Record your daily observations and feelings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label>How is Baby Today?</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => setBabyMood(mood.value)}
                        className={`rounded-lg border p-3 flex flex-col items-center gap-1 transition-colors ${
                          babyMood === mood.value
                            ? "border-primary bg-primary/5"
                            : "border-border bg-transparent hover:border-primary/50"
                        }`}
                      >
                        {mood.icon}
                        <span className="text-xs">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mother-feelings">How are YOU feeling?</Label>
                  <Textarea
                    id="mother-feelings"
                    placeholder="Share how you're doing today..."
                    value={motherFeelings}
                    onChange={(e) => setMotherFeelings(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Your wellbeing matters too. Be honest with yourself.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="todays-win">Today&apos;s Win</Label>
                  <Textarea
                    id="todays-win"
                    placeholder="What's one good thing that happened today?"
                    value={todaysWin}
                    onChange={(e) => setTodaysWin(e.target.value)}
                    className="resize-none"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Celebrate small victories - every moment of bonding counts!
                  </p>
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
