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
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { ArrowLeft, Save, AlertTriangle, CheckCircle } from "lucide-react"
import type { DischargeReadinessLog, Baby } from "@/lib/types"
import { getBabyById, getLogsByBaby } from "@/lib/storage"
import { DISCHARGE_CRITERIA } from "@/lib/types"

const SCORE_OPTIONS = [
  { value: 0, label: "0", desc: "Needs improvement" },
  { value: 1, label: "1", desc: "Occasionally" },
  { value: 2, label: "2", desc: "Consistently" },
]

interface ScoreFieldProps {
  label: string
  descriptions: string[]
  value: 0 | 1 | 2
  onChange: (v: 0 | 1 | 2) => void
}

function ScoreField({ label, descriptions, value, onChange }: ScoreFieldProps) {
  return (
    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
      <Label className="font-medium">{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score as 0 | 1 | 2)}
            className={`p-2 rounded-lg border-2 text-center transition-all ${
              value === score ? "border-primary bg-primary/10 text-primary" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="text-lg font-bold">{score}</span>
            <p className="text-xs text-muted-foreground mt-1">{descriptions[score]}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function NurseDischargeScorePage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading, addLog, updateBaby, addNotification } = useApp()

  const babyId = params.id as string
  const [baby, setBaby] = useState<Baby | null>(null)

  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16))
  const [day, setDay] = useState(1)
  const [socioEconomic, setSocioEconomic] = useState<0 | 1 | 2>(0)
  const [milkProduction, setMilkProduction] = useState<0 | 1 | 2>(0)
  const [positioning, setPositioning] = useState<0 | 1 | 2>(0)
  const [suckling, setSuckling] = useState<0 | 1 | 2>(0)
  const [confidence, setConfidence] = useState<0 | 1 | 2>(0)
  const [weightGainPerDay, setWeightGainPerDay] = useState("")
  const [breastfeedingStarted, setBreastfeedingStarted] = useState(false)
  const [kmcStarted, setKmcStarted] = useState(false)
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "nurse" && user.role !== "admin"))) {
      router.replace("/auth")
      return
    }

    if (babyId) {
      const foundBaby = getBabyById(babyId)
      setBaby(foundBaby || null)

      if (foundBaby?.admissionDate) {
        const admissionDate = new Date(foundBaby.admissionDate)
        const daysSinceAdmission = Math.floor((Date.now() - admissionDate.getTime()) / (24 * 60 * 60 * 1000)) + 1
        setDay(daysSinceAdmission)
      }

      // Get existing discharge logs to check KMC/BF started
      const logs = getLogsByBaby(babyId)
      const kmcLogs = logs.filter((l) => l.type === "kmc_session")
      const feedingLogs = logs.filter((l) => l.type === "feeding" && (l as any).data?.type === "breast")
      setKmcStarted(kmcLogs.length > 0)
      setBreastfeedingStarted(feedingLogs.length > 0)
    }
  }, [user, isLoading, router, babyId])

  const weightGainScore: 0 | 1 | 2 = !weightGainPerDay
    ? 0
    : Number.parseFloat(weightGainPerDay) > 15
      ? 2
      : Number.parseFloat(weightGainPerDay) >= 10
        ? 1
        : 0

  const totalScore = socioEconomic + milkProduction + positioning + suckling + confidence + weightGainScore

  const isReadyForDischarge = totalScore >= DISCHARGE_CRITERIA.minTotalScore

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    if (!user || !baby) {
      toast.error("Unable to save score")
      setIsSaving(false)
      return
    }

    const logData: Omit<DischargeReadinessLog, "id" | "timestamp"> = {
      babyId: baby.id,
      authorUserId: user.id,
      authorRole: user.role,
      type: "discharge_readiness",
      nurseComment: null,
      immutable: false,
      data: {
        dateTime: new Date(dateTime).toISOString(),
        day,
        socioEconomicSupport: socioEconomic,
        milkProduction,
        positioningAttachment: positioning,
        sucklingAbility: suckling,
        motherConfidence: confidence,
        weightGainGramsPerDay: weightGainPerDay ? Number.parseFloat(weightGainPerDay) : null,
        weightGainScore,
        totalScore,
        breastfeedingStarted,
        kmcStarted,
        notes,
      },
    }

    addLog(logData as Omit<DischargeReadinessLog, "id" | "timestamp">)

    // Auto-flag for discharge if criteria met
    if (isReadyForDischarge && baby.status === "assigned") {
      const updatedBaby: Baby = { ...baby, status: "ready_for_discharge" }
      updateBaby(updatedBaby)

      // Notify admin
      addNotification({
        userId: "admin-acc-001",
        type: "discharge_ready",
        title: "Patient Ready for Discharge",
        message: `${baby.babyName} has met discharge criteria (Score: ${totalScore}/12)`,
        read: false,
        data: { babyId: baby.id },
      })

      toast.success("Score saved! Baby flagged as ready for discharge.")
    } else {
      toast.success("Discharge readiness score saved!")
    }

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
            <h1 className="text-lg font-semibold">Discharge Score</h1>
            <p className="text-xs text-muted-foreground">
              {baby.babyName} - Day {day}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Discharge Readiness Score Sheet</CardTitle>
              <CardDescription>Score each criterion from 0-2 (Total needed: 10/12)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="datetime">Date</Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="day">Day</Label>
                    <Input
                      id="day"
                      type="number"
                      value={day}
                      onChange={(e) => setDay(Number.parseInt(e.target.value) || 1)}
                      className="h-12"
                      min={1}
                    />
                  </div>
                </div>

                <ScoreField
                  label="1. Socio-Economic Support"
                  descriptions={["No helper support", "Occasional helper", "Good support system"]}
                  value={socioEconomic}
                  onChange={setSocioEconomic}
                />

                <ScoreField
                  label="2. Mother's Milk Production"
                  descriptions={["Never able to meet needs", "Often but not always", "Always meets needs"]}
                  value={milkProduction}
                  onChange={setMilkProduction}
                />

                <ScoreField
                  label="3. Positioning & Attachment to Breast"
                  descriptions={["Always needs assistance", "Occasionally needs help", "No assistance needed"]}
                  value={positioning}
                  onChange={setPositioning}
                />

                <ScoreField
                  label="4. Baby's Ability to Suckle"
                  descriptions={["Gets tired very quickly", "Gets tired infrequently", "Always suckles well"]}
                  value={suckling}
                  onChange={setSuckling}
                />

                <ScoreField
                  label="5. Mother's Confidence"
                  descriptions={["Always needs assistance", "Occasionally needs help", "No assistance needed"]}
                  value={confidence}
                  onChange={setConfidence}
                />

                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <Label className="font-medium">6. Weight Gain (g/day)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 18"
                      value={weightGainPerDay}
                      onChange={(e) => setWeightGainPerDay(e.target.value)}
                      className="h-12 flex-1"
                    />
                    <div
                      className={`px-4 py-2 rounded-lg font-bold ${
                        weightGainScore === 2
                          ? "bg-green-100 text-green-700"
                          : weightGainScore === 1
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {weightGainScore}/2
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">0-10g: 0 | 10-15g: 1 | {">"}15g: 2</p>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label>Breastfeeding Started?</Label>
                    <p className="text-xs text-muted-foreground">Started 24h KMC</p>
                  </div>
                  <Switch checked={breastfeedingStarted} onCheckedChange={setBreastfeedingStarted} />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label>KMC Started?</Label>
                    <p className="text-xs text-muted-foreground">Initiated skin-to-skin</p>
                  </div>
                  <Switch checked={kmcStarted} onCheckedChange={setKmcStarted} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Remarks</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none"
                    rows={2}
                  />
                </div>

                {/* Total Score Display */}
                <div
                  className={`p-4 rounded-lg ${isReadyForDischarge ? "bg-green-100 border-green-300" : "bg-orange-100 border-orange-300"} border-2`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isReadyForDischarge ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                      )}
                      <span className="font-medium">Total Score</span>
                    </div>
                    <span
                      className={`text-3xl font-bold ${isReadyForDischarge ? "text-green-600" : "text-orange-600"}`}
                    >
                      {totalScore}/12
                    </span>
                  </div>
                  <p className={`text-sm mt-2 ${isReadyForDischarge ? "text-green-700" : "text-orange-700"}`}>
                    {isReadyForDischarge
                      ? "Baby meets discharge readiness criteria!"
                      : `Needs ${DISCHARGE_CRITERIA.minTotalScore - totalScore} more points for discharge`}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                    <Link href={`/nurse/patient/${babyId}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Score"}
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
