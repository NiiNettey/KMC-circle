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
import type { IntakeOutputLog } from "@/lib/types"
import { getBabyById } from "@/lib/storage"

const STOOL_OPTIONS = [
  { value: "none", label: "None" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
]

export default function NurseIntakeOutputPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading, addLog } = useApp()

  const babyId = params.id as string
  const [baby, setBaby] = useState<ReturnType<typeof getBabyById> | null>(null)

  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16))
  const [feedingMl, setFeedingMl] = useState("")
  const [ivFluidsMl, setIvFluidsMl] = useState("")
  const [urineMl, setUrineMl] = useState("")
  const [stool, setStool] = useState<"none" | "small" | "medium" | "large">("none")
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
      toast.error("Unable to save intake/output")
      setIsSaving(false)
      return
    }

    const intake = (feedingMl ? Number.parseFloat(feedingMl) : 0) + (ivFluidsMl ? Number.parseFloat(ivFluidsMl) : 0)
    const output = urineMl ? Number.parseFloat(urineMl) : 0
    const netBalance = intake - output

    const logData: Omit<IntakeOutputLog, "id" | "timestamp"> = {
      babyId: baby.id,
      authorUserId: user.id,
      authorRole: user.role,
      type: "intake_output",
      nurseComment: null,
      immutable: false,
      data: {
        dateTime: new Date(dateTime).toISOString(),
        feedingMl: feedingMl ? Number.parseFloat(feedingMl) : null,
        ivFluidsMl: ivFluidsMl ? Number.parseFloat(ivFluidsMl) : null,
        urineMl: urineMl ? Number.parseFloat(urineMl) : null,
        stool,
        netBalance,
        notes,
      },
    }

    addLog(logData as Omit<IntakeOutputLog, "id" | "timestamp">)
    toast.success("Intake/Output recorded!")
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
            <h1 className="text-lg font-semibold">Intake/Output</h1>
            <p className="text-xs text-muted-foreground">{baby.babyName}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Fluid Balance</CardTitle>
              <CardDescription>Net (ml) = Input - Output</CardDescription>
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

                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-700 mb-3">Input</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="feedingMl">Feeding (ml)</Label>
                      <Input
                        id="feedingMl"
                        type="number"
                        step="0.5"
                        placeholder="0"
                        value={feedingMl}
                        onChange={(e) => setFeedingMl(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ivFluidsMl">IV Fluids (ml)</Label>
                      <Input
                        id="ivFluidsMl"
                        type="number"
                        step="0.5"
                        placeholder="0"
                        value={ivFluidsMl}
                        onChange={(e) => setIvFluidsMl(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-orange-700 mb-3">Output</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="urineMl">Urine (ml)</Label>
                      <Input
                        id="urineMl"
                        type="number"
                        step="0.5"
                        placeholder="0"
                        value={urineMl}
                        onChange={(e) => setUrineMl(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stool</Label>
                      <RadioGroup
                        value={stool}
                        onValueChange={(v) => setStool(v as typeof stool)}
                        className="grid grid-cols-2 gap-1"
                      >
                        {STOOL_OPTIONS.map((opt) => (
                          <div key={opt.value}>
                            <RadioGroupItem value={opt.value} id={`stool-${opt.value}`} className="peer sr-only" />
                            <Label
                              htmlFor={`stool-${opt.value}`}
                              className="flex items-center justify-center rounded border-2 border-muted bg-white p-2 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-xs"
                            >
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any observations..."
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
                    {isSaving ? "Saving..." : "Save I/O"}
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
