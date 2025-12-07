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
import { toast } from "sonner"
import { ArrowLeft, Save, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { WeightLog, Baby } from "@/lib/types"
import { getBabyById, updateBaby as updateBabyStorage } from "@/lib/storage"

export default function NurseWeightPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading, addLog } = useApp()

  const babyId = params.id as string
  const [baby, setBaby] = useState<Baby | null>(null)

  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16))
  const [weight, setWeight] = useState("")
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "nurse")) {
      router.replace("/auth")
      return
    }

    if (babyId) {
      const foundBaby = getBabyById(babyId)
      if (foundBaby) setBaby(foundBaby)
    }
  }, [user, isLoading, router, babyId])

  const previousWeight = baby?.currentWeightGrams || 0
  const weightDiff = weight ? Number.parseInt(weight) - previousWeight : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    if (!user || !baby) {
      toast.error("Unable to save weight")
      setIsSaving(false)
      return
    }

    if (!weight) {
      toast.error("Please enter the weight")
      setIsSaving(false)
      return
    }

    const weightGrams = Number.parseInt(weight)

    const logData: Omit<WeightLog, "id" | "timestamp"> = {
      babyId: baby.id,
      authorUserId: user.id,
      authorRole: user.role,
      type: "weight",
      nurseComment: null,
      immutable: false,
      data: {
        dateTime: new Date(dateTime).toISOString(),
        weightGrams,
        notes,
      },
    }

    addLog(logData as Omit<WeightLog, "id" | "timestamp">)

    // Update baby's current weight
    updateBabyStorage({
      ...baby,
      currentWeightGrams: weightGrams,
    })

    toast.success("Weight recorded!")
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
            <h1 className="text-lg font-semibold">Log Weight</h1>
            <p className="text-xs text-muted-foreground">{baby.babyName}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Previous Weight Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Previous Weight</p>
                <p className="text-2xl font-bold text-primary">{baby.currentWeightGrams}g</p>
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

          <Card>
            <CardHeader>
              <CardTitle>Weight Entry</CardTitle>
              <CardDescription>Record the baby&apos;s weight</CardDescription>
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
                  <Label htmlFor="weight">Weight (grams) *</Label>
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
                    placeholder="Any observations..."
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
                    {isSaving ? "Saving..." : "Save"}
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
