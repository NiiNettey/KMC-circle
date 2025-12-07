"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context/app-context"
import { AppHeader } from "@/components/layout/app-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Check, X, Baby, Calendar, Scale, MapPin } from "lucide-react"
import { getPendingBabiesForNurse, updateBaby, addNotification, getUserById } from "@/lib/storage"
import type { Baby as BabyType } from "@/lib/types"
import { v4 as uuid } from "uuid"

export default function NursePendingPage() {
  const router = useRouter()
  const { user, isLoading, updateBaby: updateBabyContext } = useApp()
  const [pendingBabies, setPendingBabies] = useState<BabyType[]>([])
  const [message, setMessage] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "nurse")) {
      router.replace("/auth")
      return
    }

    if (user) {
      setPendingBabies(getPendingBabiesForNurse(user.id))
    }
  }, [user, isLoading, router])

  const handleAccept = (baby: BabyType) => {
    setProcessingId(baby.id)

    const updatedBaby: BabyType = {
      ...baby,
      status: "assigned",
    }

    updateBaby(updatedBaby)
    updateBabyContext(updatedBaby)

    // Notify mother
    addNotification({
      id: uuid(),
      userId: baby.motherUserId,
      type: "nurse_accepted",
      title: "Nurse Accepted!",
      message: `${user?.name} has accepted to care for ${baby.babyName}`,
      read: false,
      createdAt: new Date().toISOString(),
      data: { babyId: baby.id },
    })

    setPendingBabies((prev) => prev.filter((b) => b.id !== baby.id))
    toast.success(`Accepted ${baby.babyName}`)
    setProcessingId(null)
  }

  const handleDecline = (baby: BabyType) => {
    setProcessingId(baby.id)

    const updatedBaby: BabyType = {
      ...baby,
      status: "unassigned",
      assignedNurseId: null,
    }

    updateBaby(updatedBaby)
    updateBabyContext(updatedBaby)

    // Notify mother
    addNotification({
      id: uuid(),
      userId: baby.motherUserId,
      type: "nurse_declined",
      title: "Please Choose Another Nurse / Midwife",
      message: message || `${user?.name} is unable to accept at this time. Please select another Nurse / Midwife`,
      read: false,
      createdAt: new Date().toISOString(),
      data: { babyId: baby.id },
    })

    setPendingBabies((prev) => prev.filter((b) => b.id !== baby.id))
    toast.info(`Declined ${baby.babyName}`)
    setMessage("")
    setProcessingId(null)
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <AppHeader title="Pending Approvals" />

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          {pendingBabies.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Check className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">All Caught Up!</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  No pending approval requests at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingBabies.map((baby) => {
              const mother = getUserById(baby.motherUserId)
              const dobDate = new Date(baby.dob)
              const ageInDays = Math.floor((Date.now() - dobDate.getTime()) / (1000 * 60 * 60 * 24))

              return (
                <Card key={baby.id} className="overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                          <Baby className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{baby.babyName}</CardTitle>
                          <CardDescription>Mother: {mother?.name || "Unknown"}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {/* Baby Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground text-xs">Age</p>
                          <p className="font-medium">{ageInDays} days old</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground text-xs">Birth Weight</p>
                          <p className="font-medium">{baby.birthWeightGrams}g</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground text-xs">Facility</p>
                          <p className="font-medium">{baby.facility}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Gestational Age at Birth</p>
                      <p className="font-semibold">{baby.gestationalAgeWeeks} weeks</p>
                    </div>

                    {/* Optional message for decline */}
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Optional message to mother (for decline)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="resize-none"
                        rows={2}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleDecline(baby)}
                        disabled={processingId === baby.id}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Decline
                      </Button>
                      <Button className="flex-1" onClick={() => handleAccept(baby)} disabled={processingId === baby.id}>
                        <Check className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
