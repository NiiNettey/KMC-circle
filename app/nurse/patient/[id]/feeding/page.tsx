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
import type { FeedingLog, FeedingType, FeedingRoute } from "@/lib/types"
import { getBabyById } from "@/lib/storage"

const FEEDING_TYPES: { value: FeedingType; label: string }[] = [
  { value: "breast", label: "Breast" },
  { value: "expressed", label: "Expressed BM" },
  { value: "EBM", label: "EBM" },
  { value: "DBM", label: "DBM" },
  { value: "formula", label: "Formula" },
]

const FEEDING_ROUTES: { value: FeedingRoute; label: string }[] = [
  { value: "PO", label: "PO (Oral)" },
  { value: "OG", label: "OG (Orogastric)" },
  { value: "NG", label: "NG (Nasogastric)" },
  { value: "IV", label: "IV (Intravenous)" },
]

export default function NurseFeedingPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading, addLog } = useApp()

  const babyId = params.id as string
  const [baby, setBaby] = useState<ReturnType<typeof getBabyById> | null>(null)

  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16))
  const [feedingType, setFeedingType] = useState<FeedingType>("EBM")
  const [feedingRoute, setFeedingRoute] = useState<FeedingRoute>("OG")
  const [amount, setAmount] = useState("")
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
  }, [user, isLoading, router, babyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    if (!user || !baby) {
      toast.error("Unable to save feeding")
      setIsSaving(false)
      return
    }

    const logData: Omit<FeedingLog, "id" | "timestamp"> = {
      babyId: baby.id,
      authorUserId: user.id,
      authorRole: user.role,
      type: "feeding",
      nurseComment: null,
      immutable: false,
      data: {
        dateTime: new Date(dateTime).toISOString(),
        type: feedingType,
        route: feedingRoute,
        amountMl: amount ? Number.parseFloat(amount) : null,
        notes,
      },
    }

    addLog(logData as Omit<FeedingLog, "id" | "timestamp">)
    toast.success("Feeding recorded!")
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
            <h1 className="text-lg font-semibold">Log Feeding</h1>
            <p className="text-xs text-muted-foreground">{baby.babyName}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Feeding Log</CardTitle>
              <CardDescription>Record feeding type, route, and amount</CardDescription>
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
                  <Label>Feeding Type</Label>
                  <RadioGroup
                    value={feedingType}
                    onValueChange={(v) => setFeedingType(v as FeedingType)}
                    className="grid grid-cols-3 gap-2"
                  >
                    {FEEDING_TYPES.map((type) => (
                      <div key={type.value}>
                        <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
                        <Label
                          htmlFor={type.value}
                          className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-sm"
                        >
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Feeding Route</Label>
                  <RadioGroup
                    value={feedingRoute}
                    onValueChange={(v) => setFeedingRoute(v as FeedingRoute)}
                    className="grid grid-cols-4 gap-2"
                  >
                    {FEEDING_ROUTES.map((route) => (
                      <div key={route.value}>
                        <RadioGroupItem value={route.value} id={`route-${route.value}`} className="peer sr-only" />
                        <Label
                          htmlFor={`route-${route.value}`}
                          className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-sm"
                        >
                          {route.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ml)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 15"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g., Tolerated well, vomited..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                    <Link href={`/nurse/patient/${babyId}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Feeding"}
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
