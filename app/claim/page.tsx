"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, Baby, CheckCircle } from "lucide-react"
import type { Baby as BabyType } from "@/lib/types"

export default function ClaimBabyPage() {
  const router = useRouter()
  const { user, isLoading, claimBaby } = useApp()

  const [claimCode, setClaimCode] = useState("")
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimedBaby, setClaimedBaby] = useState<BabyType | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "parent")) {
      router.replace("/auth")
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!claimCode.trim()) {
      toast.error("Please enter a claim code")
      return
    }

    setIsClaiming(true)

    const result = claimBaby(claimCode.trim().toUpperCase())

    if (result.success && result.baby) {
      setClaimedBaby(result.baby)
      toast.success("Baby claimed successfully!")
    } else {
      toast.error(result.error || "Invalid claim code")
    }

    setIsClaiming(false)
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Claim Your Baby</h1>
            <p className="text-xs text-muted-foreground">Link your hospital records</p>
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="mx-auto max-w-lg">
          {!claimedBaby ? (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Baby className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Enter Claim Code</CardTitle>
                <CardDescription>
                  Enter the code given to you by the hospital to link your baby's records to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="claimCode">Claim Code</Label>
                    <Input
                      id="claimCode"
                      placeholder="e.g., KMC-A3X7"
                      value={claimCode}
                      onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                      className="h-14 text-center text-2xl font-mono tracking-wider"
                      maxLength={8}
                    />
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 text-sm">
                    <p className="font-medium text-primary mb-1">Where to find your code?</p>
                    <p className="text-muted-foreground">
                      Your nurse or midwife will give you a claim code when your baby is discharged. The code looks like
                      KMC-XXXX.
                    </p>
                  </div>

                  <Button type="submit" className="w-full h-12" disabled={isClaiming || !claimCode.trim()}>
                    {isClaiming ? "Claiming..." : "Claim Baby"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-700">Baby Claimed Successfully!</CardTitle>
                <CardDescription>Your baby's hospital records are now linked to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        claimedBaby.gender === "female" ? "bg-pink-100" : "bg-blue-100"
                      }`}
                    >
                      <Baby
                        className={`h-6 w-6 ${claimedBaby.gender === "female" ? "text-pink-500" : "text-blue-500"}`}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{claimedBaby.babyName}</p>
                      <p className="text-sm text-muted-foreground">
                        {claimedBaby.gestationalAgeWeeks} weeks | {claimedBaby.currentWeightGrams}g
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-center text-muted-foreground">
                  All KMC sessions, weights, and vitals recorded at the hospital are now visible in your dashboard.
                </p>

                <Button asChild className="w-full">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
