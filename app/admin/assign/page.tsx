"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, Baby, UserCheck, AlertCircle, CheckCircle } from "lucide-react"
import type { Baby as BabyType } from "@/lib/types"

export default function AdminAssignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedBabyId = searchParams.get("baby")

  const { user, isLoading, getAllBabies, nurses, getNurseWorkload, assignBabyToNurse, refreshBabies } = useApp()

  const [referredBabies, setReferredBabies] = useState<BabyType[]>([])
  const [selectedBabyId, setSelectedBabyId] = useState<string>(preselectedBabyId || "")
  const [selectedNurseId, setSelectedNurseId] = useState<string>("")
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/auth")
      return
    }
    if (user?.role === "admin") {
      const babies = getAllBabies().filter((b) => b.status === "referred")
      setReferredBabies(babies)
      if (preselectedBabyId && babies.some((b) => b.id === preselectedBabyId)) {
        setSelectedBabyId(preselectedBabyId)
      }
    }
  }, [user, isLoading, router, getAllBabies, preselectedBabyId])

  const handleAssign = () => {
    if (!selectedBabyId || !selectedNurseId) {
      toast.error("Please select both a baby and a nurse/midwife")
      return
    }

    setIsAssigning(true)
    assignBabyToNurse(selectedBabyId, selectedNurseId)
    refreshBabies()

    const baby = referredBabies.find((b) => b.id === selectedBabyId)
    const nurse = nurses.find((n) => n.id === selectedNurseId)

    toast.success(`${baby?.babyName} assigned to ${nurse?.name}`)

    // Remove from local list
    setReferredBabies((prev) => prev.filter((b) => b.id !== selectedBabyId))
    setSelectedBabyId("")
    setSelectedNurseId("")
    setIsAssigning(false)
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const selectedBaby = referredBabies.find((b) => b.id === selectedBabyId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Assign Babies</h1>
            <p className="text-xs text-muted-foreground">{referredBabies.length} awaiting assignment</p>
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {referredBabies.length === 0 ? (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-8 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-700">All Caught Up!</h3>
                <p className="text-muted-foreground mt-2">
                  No babies are awaiting assignment. New referrals will appear here.
                </p>
                <Button asChild variant="outline" className="mt-4 bg-transparent">
                  <Link href="/admin">Return to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Step 1: Select Baby */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
                      1
                    </div>
                    <div>
                      <CardTitle className="text-base">Select Baby</CardTitle>
                      <CardDescription>Choose a baby to assign</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedBabyId} onValueChange={setSelectedBabyId}>
                    <div className="space-y-3">
                      {referredBabies.map((baby) => (
                        <div key={baby.id} className="flex items-center">
                          <RadioGroupItem value={baby.id} id={baby.id} className="sr-only" />
                          <Label
                            htmlFor={baby.id}
                            className={`flex-1 flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedBabyId === baby.id
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-primary/50"
                            }`}
                          >
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                baby.gender === "female" ? "bg-pink-100" : "bg-blue-100"
                              }`}
                            >
                              <Baby
                                className={`h-5 w-5 ${baby.gender === "female" ? "text-pink-600" : "text-blue-600"}`}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{baby.babyName}</p>
                              <p className="text-sm text-muted-foreground">
                                GA: {baby.gestationalAgeWeeks}wks | {baby.currentWeightGrams}g | {baby.motherName}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                              {baby.referralSource || "New"}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Step 2: Select Nurse/Midwife */}
              <Card className={!selectedBabyId ? "opacity-50 pointer-events-none" : ""}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      2
                    </div>
                    <div>
                      <CardTitle className="text-base">Select Nurse/Midwife</CardTitle>
                      <CardDescription>
                        Choose who will care for {selectedBaby?.babyName || "this baby"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedNurseId} onValueChange={setSelectedNurseId}>
                    <div className="space-y-3">
                      {nurses.map((nurse) => {
                        const workload = getNurseWorkload(nurse.id)
                        const isOverloaded = workload >= 5
                        return (
                          <div key={nurse.id} className="flex items-center">
                            <RadioGroupItem value={nurse.id} id={nurse.id} className="sr-only" />
                            <Label
                              htmlFor={nurse.id}
                              className={`flex-1 flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedNurseId === nurse.id
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:border-primary/50"
                              } ${isOverloaded ? "opacity-60" : ""}`}
                            >
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{nurse.name}</p>
                                <p className="text-sm text-muted-foreground">{nurse.facility}</p>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant={isOverloaded ? "destructive" : workload >= 3 ? "secondary" : "outline"}
                                  className={workload < 3 ? "bg-green-50 text-green-600 border-green-200" : ""}
                                >
                                  {workload} patient{workload !== 1 ? "s" : ""}
                                </Badge>
                                {isOverloaded && (
                                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> High load
                                  </p>
                                )}
                              </div>
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Assign Button */}
              <Button
                onClick={handleAssign}
                disabled={!selectedBabyId || !selectedNurseId || isAssigning}
                className="w-full h-14 text-lg"
              >
                {isAssigning ? "Assigning..." : "Assign Baby to Nurse/Midwife"}
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
