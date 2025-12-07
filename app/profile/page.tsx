"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { AppHeader } from "@/components/layout/app-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { AudioButton } from "@/components/ui/audio-button"
import { toast } from "sonner"
import { Baby, Globe, Bell, FileText, Shield, LogOut, ChevronRight, Pencil, Save, X } from "lucide-react"
import type { Language } from "@/lib/types"

const languages: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "tw", label: "Twi" },
  { value: "ga", label: "Ga" },
  { value: "ew", label: "Ewe" },
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, currentBaby, babies, logout, updateUserProfile } = useApp()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editLocale, setEditLocale] = useState<Language>("en")
  const [reminderEnabled, setReminderEnabled] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      setEditName(user.name)
      setEditLocale(user.locale)
    }
  }, [user])

  const handleSaveProfile = () => {
    updateUserProfile({
      name: editName,
      locale: editLocale,
    })
    setIsEditing(false)
    toast.success("Profile updated!")
  }

  const handleLogout = () => {
    logout()
    router.push("/auth")
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
      <AppHeader title="Profile" showNotifications={false} />

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          {/* User Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="edit-name">Name</Label>
                        <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          Language
                          <AudioButton audioKey="select-language" />
                        </Label>
                        <Select value={editLocale} onValueChange={(v) => setEditLocale(v as Language)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveProfile}>
                          <Save className="mr-1 h-3 w-3" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="bg-transparent"
                        >
                          <X className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold">{user.name}</h2>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {user.role}
                        </Badge>
                        <Badge variant="outline">
                          <Globe className="mr-1 h-3 w-3" />
                          {languages.find((l) => l.value === user.locale)?.label}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Baby Information - Parents only */}
          {user.role === "parent" && currentBaby && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Baby className="h-4 w-4" />
                  My Baby
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{currentBaby.babyName}</p>
                    <p className="text-sm text-muted-foreground">{currentBaby.facility}</p>
                  </div>
                  <Badge
                    variant={
                      currentBaby.status === "assigned"
                        ? "default"
                        : currentBaby.status === "pending_nurse_approval"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {currentBaby.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-muted p-2">
                    <p className="text-muted-foreground text-xs">Birth</p>
                    <p className="font-medium">{currentBaby.birthWeightGrams}g</p>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <p className="text-muted-foreground text-xs">Current</p>
                    <p className="font-medium text-primary">{currentBaby.currentWeightGrams}g</p>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <p className="text-muted-foreground text-xs">Gest. Age</p>
                    <p className="font-medium">{currentBaby.gestationalAgeWeeks}w</p>
                  </div>
                </div>
                {babies.length > 1 && (
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/profile/babies">
                      Manage Babies ({babies.length})
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">KMC Reminders</p>
                    <p className="text-xs text-muted-foreground">Daily reminder to do KMC</p>
                  </div>
                </div>
                <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
              </div>

              <Separator />

              {/* Export Logs */}
              <Link
                href="/track/export"
                className="flex items-center justify-between py-2 hover:bg-accent rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Export Logs</p>
                    <p className="text-xs text-muted-foreground">Download PDF report</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Separator />

              {/* Privacy */}
              <Link
                href="/profile/privacy"
                className="flex items-center justify-between py-2 hover:bg-accent rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Privacy & Data</p>
                    <p className="text-xs text-muted-foreground">Manage your data</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          {/* Logout */}
          <Button variant="outline" className="w-full bg-transparent" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>

          {/* App Info */}
          <p className="text-center text-xs text-muted-foreground">
            Mama&apos;s Circle v0.0.1
            <br />
            Made with love for preterm babies
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
