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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { ArrowLeft, Baby, User, Save, Copy, CheckCircle } from "lucide-react"
import { generateClaimCode } from "@/lib/storage"
import type { Baby as BabyType } from "@/lib/types"

export default function AdminOnboardBabyPage() {
  const router = useRouter()
  const { user, isLoading, addBaby } = useApp()

  const [step, setStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [createdBaby, setCreatedBaby] = useState<BabyType | null>(null)
  const [copied, setCopied] = useState(false)

  // Baby info
  const [babyName, setBabyName] = useState("")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [dob, setDob] = useState("")
  const [gestationalAge, setGestationalAge] = useState("")
  const [birthWeight, setBirthWeight] = useState("")
  const [currentWeight, setCurrentWeight] = useState("")
  const [birthLength, setBirthLength] = useState("")
  const [birthHeadCirc, setBirthHeadCirc] = useState("")
  const [referralSource, setReferralSource] = useState("")

  // Mother info
  const [motherName, setMotherName] = useState("")
  const [motherPhone, setMotherPhone] = useState("")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/auth")
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      if (!babyName || !dob || !gestationalAge || !birthWeight || !currentWeight) {
        toast.error("Please fill in all required fields")
        return
      }
      setStep(2)
      return
    }

    if (!motherName) {
      toast.error("Please enter mother's name")
      return
    }

    setIsSaving(true)

    const claimCode = generateClaimCode()

    const newBaby = addBaby({
      babyName,
      gender,
      dob: new Date(dob).toISOString(),
      gestationalAgeWeeks: Number.parseInt(gestationalAge),
      birthWeightGrams: Number.parseInt(birthWeight),
      currentWeightGrams: Number.parseInt(currentWeight),
      birthLengthCm: birthLength ? Number.parseFloat(birthLength) : null,
      currentLengthCm: birthLength ? Number.parseFloat(birthLength) : null,
      birthHeadCircumferenceCm: birthHeadCirc ? Number.parseFloat(birthHeadCirc) : null,
      currentHeadCircumferenceCm: birthHeadCirc ? Number.parseFloat(birthHeadCirc) : null,
      motherUserId: null,
      assignedNurseId: null,
      status: "referred",
      facility: user?.facility || "KMC Ward",
      language: "en",
      photoUrl: null,
      colorTag: "white",
      claimCode,
      motherName,
      motherPhone: motherPhone || null,
      admissionDate: new Date().toISOString(),
      admissionWeightGrams: Number.parseInt(currentWeight),
      referralSource: referralSource || null,
    })

    setCreatedBaby(newBaby)
    setIsSaving(false)
    setStep(3)
    toast.success("Baby registered successfully!")
  }

  const copyClaimCode = () => {
    if (createdBaby?.claimCode) {
      navigator.clipboard.writeText(createdBaby.claimCode)
      setCopied(true)
      toast.success("Claim code copied!")
      setTimeout(() => setCopied(false), 2000)
    }
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
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Onboard New Baby</h1>
            <p className="text-xs text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="mx-auto max-w-lg">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-gray-200"}`}
              />
            ))}
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Baby className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Baby Information</CardTitle>
                    <CardDescription>Enter the baby's details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="babyName">Baby's Name *</Label>
                    <Input
                      id="babyName"
                      placeholder="e.g., Baby Kofi"
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <RadioGroup value={gender} onValueChange={(v) => setGender(v as "male" | "female")}>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male" className="cursor-pointer">
                            Male
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female" className="cursor-pointer">
                            Female
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gestationalAge">Gestational Age (weeks) *</Label>
                      <Input
                        id="gestationalAge"
                        type="number"
                        placeholder="32"
                        value={gestationalAge}
                        onChange={(e) => setGestationalAge(e.target.value)}
                        className="h-12"
                        min="22"
                        max="42"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthWeight">Birth Weight (g) *</Label>
                      <Input
                        id="birthWeight"
                        type="number"
                        placeholder="1800"
                        value={birthWeight}
                        onChange={(e) => setBirthWeight(e.target.value)}
                        className="h-12"
                        min="400"
                        max="5000"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentWeight">Current Weight (g) *</Label>
                    <Input
                      id="currentWeight"
                      type="number"
                      placeholder="1750"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      className="h-12"
                      min="400"
                      max="5000"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthLength">Birth Length (cm)</Label>
                      <Input
                        id="birthLength"
                        type="number"
                        step="0.1"
                        placeholder="42"
                        value={birthLength}
                        onChange={(e) => setBirthLength(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthHeadCirc">Head Circumference (cm)</Label>
                      <Input
                        id="birthHeadCirc"
                        type="number"
                        step="0.1"
                        placeholder="28"
                        value={birthHeadCirc}
                        onChange={(e) => setBirthHeadCirc(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referralSource">Referral Source</Label>
                    <Input
                      id="referralSource"
                      placeholder="e.g., Labor Ward, Neonatal Unit"
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base">
                    Continue to Mother's Details
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <CardTitle>Mother's Information</CardTitle>
                    <CardDescription>For parent handoff at discharge</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="motherName">Mother's Name *</Label>
                    <Input
                      id="motherName"
                      placeholder="e.g., Akua Mensah"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motherPhone">Mother's Phone Number</Label>
                    <Input
                      id="motherPhone"
                      type="tel"
                      placeholder="e.g., 0241234567"
                      value={motherPhone}
                      onChange={(e) => setMotherPhone(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 text-sm">
                    <p className="font-medium text-primary mb-1">Claim Code System</p>
                    <p className="text-muted-foreground">
                      A unique claim code will be generated. Give this code to the mother at discharge so she can link
                      her app account to this baby's records.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Saving..." : "Register Baby"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 3 && createdBaby && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-700">Baby Registered Successfully!</CardTitle>
                <CardDescription>{createdBaby.babyName} has been added to the KMC program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Claim Code Display */}
                <div className="bg-white rounded-xl p-6 border-2 border-dashed border-primary/30">
                  <p className="text-sm text-center text-muted-foreground mb-2">Claim Code for Parent</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl font-mono font-bold text-primary tracking-wider">
                      {createdBaby.claimCode}
                    </span>
                    <Button variant="outline" size="icon" onClick={copyClaimCode}>
                      {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Give this code to {createdBaby.motherName} at discharge
                  </p>
                </div>

                {/* Baby Summary */}
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">Baby Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{createdBaby.babyName}</span>
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="capitalize">{createdBaby.gender}</span>
                    <span className="text-muted-foreground">GA:</span>
                    <span>{createdBaby.gestationalAgeWeeks} weeks</span>
                    <span className="text-muted-foreground">Weight:</span>
                    <span>{createdBaby.currentWeightGrams}g</span>
                    <span className="text-muted-foreground">Mother:</span>
                    <span>{createdBaby.motherName}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button asChild className="w-full">
                    <Link href={`/admin/assign?baby=${createdBaby.id}`}>Assign to Nurse/Midwife</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/admin">Return to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
