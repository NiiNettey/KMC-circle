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
import { ArrowLeft, Save, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { WeightLog } from "@/lib/types"

export default function NewWeightLogPage() {
  const router = useRouter()
  const { user, currentBaby, addLog, updateBaby, playAudio } = useApp()

  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16))
  const [weight, setWeight] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const previousWeight = currentBaby?.currentWeightGrams || 0
  const weightDiff = weight ? Number.parseInt(weight) - previousWeight : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!user || !currentBaby) {
      toast.error("Please sign in and add a baby first")
      setIsLoading(false)
      return
    }

    if (!weight) {
      toast.error("Please enter the weight")
      setIsLoading(false)
      return
    }

    const weightGrams = Number.parseInt(weight)

    const logData: Omit<WeightLog, "id" | "timestamp"> = {
      babyId: currentBaby.id,
      authorUserId: user.id,
      authorRole: user.role,
      type: "weight",
      nurseComment: null,
      immutable: user.role === "parent",
      data: {
        dateTime: new Date(dateTime).toISOString(),
        weightGrams,
        notes,
      },
    }

    addLog(logData as Omit<WeightLog, "id" | "timestamp">)

    // Update baby's current weight
    updateBaby({
      ...currentBaby,
      currentWeightGrams: weightGrams,
    })

    playAudio("save")
    toast.success("Weight logged!")
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
            Log Weight
            <AudioButton audioKey="log-weight" />
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Previous Weight Card */}
          {currentBaby && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Previous Weight</p>
                  <p className="text-2xl font-bold text-primary">{currentBaby.currentWeightGrams}g</p>
                </div>
                {weight && (
                  <div
                    className={`flex items-center gap-1 ${weightDiff > 0 ? "text-success" : weightDiff < 0 ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {weightDiff > 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : weightDiff < 0 ? (
                      <TrendingDown className="h-5 w-5" />
                    ) : (
                      <Minus className="h-5 w-5" />
                    )}
                    <span className="text-lg font-semibold">
                      {weightDiff > 0 ? "+" : ""}
                      {weightDiff}g
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Weight Entry</CardTitle>
              <CardDescription>Record your baby&apos;s weight</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="datetime">Date & Time</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    Weight (grams) *
                    <AudioButton audioKey="enter-weight" />
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 1850"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="h-14 text-2xl font-bold text-center"
                    min="400"
                    max="5000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any observations about the weigh-in?"
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
