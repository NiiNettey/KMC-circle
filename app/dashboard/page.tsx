"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { AppHeader } from "@/components/layout/app-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AudioButton } from "@/components/ui/audio-button"
import { Play, Utensils, Scale, FileText, Clock, TrendingUp, BookOpen, AlertCircle, Sparkles } from "lucide-react"
import {
  getTodayKMCMinutes,
  getWeeklyKMCData,
  getTodayFeedingCount,
  getTotalKMCHours,
  calculateWeightGainVelocity,
} from "@/lib/utils/analytics"
import { getEduContent } from "@/lib/storage"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { MamaBabyIllustration } from "@/components/illustrations/mama-baby"
import { motion } from "framer-motion"

const KMC_DAILY_GOAL_MINUTES = 240

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading, currentBaby, babies, logs, timer, notifications } = useApp()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth")
      return
    }
    if (!isLoading && user?.role === "nurse") {
      router.replace("/nurse")
      return
    }
    if (!isLoading && babies.length === 0) {
      router.replace("/setup-baby")
    }
  }, [user, isLoading, babies, router])

  const todayMinutes = useMemo(() => (currentBaby ? getTodayKMCMinutes(logs, currentBaby.id) : 0), [logs, currentBaby])
  const weeklyData = useMemo(() => (currentBaby ? getWeeklyKMCData(logs, currentBaby.id) : []), [logs, currentBaby])
  const todayFeedings = useMemo(
    () => (currentBaby ? getTodayFeedingCount(logs, currentBaby.id) : 0),
    [logs, currentBaby],
  )
  const totalKMCHours = useMemo(() => (currentBaby ? getTotalKMCHours(logs, currentBaby.id) : 0), [logs, currentBaby])
  const weightVelocity = useMemo(
    () => (currentBaby ? calculateWeightGainVelocity(logs, currentBaby.id) : null),
    [logs, currentBaby],
  )

  const latestTip = useMemo(() => {
    const edu = getEduContent()
    return edu[Math.floor(Math.random() * edu.length)]
  }, [])

  const unreadNotifications = notifications.filter((n) => !n.read)
  const progressPercent = Math.min((todayMinutes / KMC_DAILY_GOAL_MINUTES) * 100, 100)
  const hoursToday = Math.floor(todayMinutes / 60)
  const minutesToday = todayMinutes % 60

  if (isLoading || !user || !currentBaby) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/5 via-background to-background pb-20">
      <AppHeader />

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/30 p-4"
          >
            <MamaBabyIllustration className="h-20 w-20 shrink-0" variant="kmc" />
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">
                {currentBaby.babyName} is{" "}
                {Math.floor((Date.now() - new Date(currentBaby.dob).getTime()) / (1000 * 60 * 60 * 24))} days old
              </p>
            </div>
          </motion.div>

          {/* Pending Approval Notice */}
          {currentBaby.status === "pending_nurse_approval" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-amber-500/50 bg-amber-500/5">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Awaiting Nurse / Midwife Approval</p>
                    <p className="text-xs text-muted-foreground">Your nurse / midwife will review your request soon</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Unread Notifications */}
          {unreadNotifications.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-primary">
                    You have {unreadNotifications.length} new notification{unreadNotifications.length > 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Today's KMC Progress - Enhanced with animation */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <CardContent className="flex items-center gap-6 p-6 relative">
                <ProgressRing
                  progress={progressPercent}
                  size={110}
                  strokeWidth={10}
                  color={progressPercent >= 100 ? "success" : "primary"}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {hoursToday}:{minutesToday.toString().padStart(2, "0")}
                    </p>
                    <p className="text-xs text-muted-foreground">hours</p>
                  </div>
                </ProgressRing>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Today&apos;s KMC</h3>
                  <p className="text-sm text-muted-foreground mb-3">Goal: 4 hours of skin-to-skin</p>
                  {timer.isRunning && timer.babyId === currentBaby.id ? (
                    <Button asChild className="w-full">
                      <Link href="/timer">
                        <Clock className="mr-2 h-4 w-4 animate-pulse" />
                        Session in Progress
                      </Link>
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button asChild className="flex-1 h-11">
                        <Link href="/timer">
                          <Play className="mr-2 h-4 w-4" />
                          Start KMC
                        </Link>
                      </Button>
                      <AudioButton audioKey="start-kmc" size="default" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Progress Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  This Week
                </CardTitle>
                <CardDescription>Daily KMC minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="kmcGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(270, 70%, 45%)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(270, 70%, 45%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [`${value} min`, "KMC"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="minutes"
                        stroke="hsl(270, 70%, 45%)"
                        fill="url(#kmcGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats - Enhanced cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3"
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{totalKMCHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Hours</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-secondary/50 to-secondary/20">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold">{currentBaby.currentWeightGrams}</p>
                <p className="text-xs text-muted-foreground mt-1">Weight (g)</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{todayFeedings}</p>
                <p className="text-xs text-muted-foreground mt-1">Feeds Today</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weight Gain Indicator */}
          {weightVelocity !== null && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className={weightVelocity >= 15 ? "bg-green-500/5 border-green-500/20" : ""}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${weightVelocity >= 15 ? "bg-green-500/20" : "bg-muted"}`}
                    >
                      <Scale
                        className={`h-5 w-5 ${weightVelocity >= 15 ? "text-green-600" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium">Weight Gain</p>
                      <p className="text-xs text-muted-foreground">Average daily</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${weightVelocity >= 15 ? "text-green-600" : ""}`}>
                      {weightVelocity.toFixed(1)}g
                    </p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Log Buttons - Enhanced with colors */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Log</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  asChild
                  className="h-auto flex-col gap-2 py-4 bg-primary/5 border-primary/20 hover:bg-primary/10"
                >
                  <Link href="/timer">
                    <Play className="h-6 w-6 text-primary" />
                    <span className="text-xs font-medium">KMC</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-auto flex-col gap-2 py-4 bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
                >
                  <Link href="/track/feeding/new">
                    <Utensils className="h-6 w-6 text-amber-600" />
                    <span className="text-xs font-medium">Feed</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-auto flex-col gap-2 py-4 bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10"
                >
                  <Link href="/track/weight/new">
                    <Scale className="h-6 w-6 text-blue-600" />
                    <span className="text-xs font-medium">Weight</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-auto flex-col gap-2 py-4 bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
                >
                  <Link href="/track/daily/new">
                    <FileText className="h-6 w-6 text-green-600" />
                    <span className="text-xs font-medium">Daily</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Latest Tip */}
          {latestTip && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/10 border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Tip of the Day
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {latestTip.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2">{latestTip.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{latestTip.content}</p>
                  <Button variant="link" asChild className="mt-2 h-auto p-0 text-primary">
                    <Link href="/learn">Read more in Learn →</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
