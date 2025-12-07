"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context/app-context"
import { AppHeader } from "@/components/layout/app-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Baby } from "lucide-react"
import Link from "next/link"
import { getBabiesByNurse, getUserById } from "@/lib/storage"
import type { Baby as BabyType } from "@/lib/types"

export default function NursePatientsPage() {
  const router = useRouter()
  const { user, isLoading } = useApp()
  const [babies, setBabies] = useState<BabyType[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "nurse")) {
      router.replace("/auth")
      return
    }

    if (user) {
      setBabies(getBabiesByNurse(user.id).filter((b) => b.status === "assigned"))
    }
  }, [user, isLoading, router])

  const filteredBabies = babies.filter(
    (baby) =>
      baby.babyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      baby.facility.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <AppHeader title="My Patients" />

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Patient List */}
          {filteredBabies.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Baby className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No Patients Found</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  {searchQuery ? "Try a different search term" : "No assigned patients yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredBabies.map((baby) => {
                const mother = getUserById(baby.motherUserId)
                const dobDate = new Date(baby.dob)
                const ageInDays = Math.floor((Date.now() - dobDate.getTime()) / (1000 * 60 * 60 * 24))

                return (
                  <Link key={baby.id} href={`/nurse/patient/${baby.id}`}>
                    <Card className="transition-colors hover:bg-accent">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-lg font-semibold text-primary">{baby.babyName.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{baby.babyName}</p>
                            <Badge variant="secondary" className="text-xs">
                              {ageInDays}d
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">Mother: {mother?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{baby.facility}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">{baby.currentWeightGrams}g</p>
                          <p className="text-xs text-muted-foreground">Current</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
