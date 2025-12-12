"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Play,
  Scale,
  Thermometer,
  TrendingUp,
  FileText,
  Clock,
  MessageSquare,
  Droplets,
  ClipboardList,
  Baby,
  Utensils,
  Activity,
} from "lucide-react";
import { getBabyById, getUserById, getLogsByBaby } from "@/lib/storage";
import type { Baby as BabyType, LogEntry, KMCSessionLog } from "@/lib/types";
import {
  getTodayKMCMinutes,
  getWeeklyKMCData,
  getTotalKMCHours,
  calculateWeightGainVelocity,
} from "@/lib/utils/analytics";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const KMC_DAILY_GOAL_MINUTES = 480;

export default function NursePatientPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading, getDangerSignsByBaby } = useApp();
  const [baby, setBaby] = useState<BabyType | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const babyId = params.id as string;

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.role !== "nurse" && user.role !== "admin"))
    ) {
      router.replace("/auth");
      return;
    }

    if (babyId) {
      const foundBaby = getBabyById(babyId);
      if (foundBaby) {
        setBaby(foundBaby);
        setLogs(getLogsByBaby(babyId));
      }
    }
  }, [user, isLoading, router, babyId]);

  const mother = useMemo(
    () => (baby?.motherUserId ? getUserById(baby.motherUserId) : null),
    [baby]
  );

  const todayMinutes = useMemo(
    () => (baby ? getTodayKMCMinutes(logs, baby.id) : 0),
    [logs, baby]
  );

  const weeklyData = useMemo(
    () => (baby ? getWeeklyKMCData(logs, baby.id) : []),
    [logs, baby]
  );

  const totalKMCHours = useMemo(
    () => (baby ? getTotalKMCHours(logs, baby.id) : 0),
    [logs, baby]
  );

  const weightVelocity = useMemo(
    () => (baby ? calculateWeightGainVelocity(logs, baby.id) : null),
    [logs, baby]
  );

  const recentLogs = useMemo(
    () =>
      logs
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 5),
    [logs]
  );

  const progressPercent = Math.min(
    (todayMinutes / KMC_DAILY_GOAL_MINUTES) * 100,
    100
  );
  const hoursToday = Math.floor(todayMinutes / 60);
  const minutesToday = todayMinutes % 60;

  if (isLoading || !user || !baby) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const dobDate = new Date(baby.dob);
  const ageInDays = Math.floor(
    (Date.now() - dobDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const backUrl =
    user.role === "admin" ? `/admin/baby/${baby.id}` : "/nurse/patients";

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      {/* Custom Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={backUrl}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold leading-none">
              {baby.babyName}
            </h1>
            <p className="text-xs text-muted-foreground">
              Mother: {baby.motherName || mother?.name || "Unknown"}
            </p>
          </div>
          <Badge variant="outline">{ageInDays} days old</Badge>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Baby Info Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="grid grid-cols-3 gap-4 p-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Birth Weight</p>
                <p className="font-semibold">{baby.birthWeightGrams}g</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="font-semibold text-primary">
                  {baby.currentWeightGrams}g
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gest. Age</p>
                <p className="font-semibold">{baby.gestationalAgeWeeks}w</p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Signs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Danger Signs</CardTitle>
            </CardHeader>
            <CardContent>
              {getDangerSignsByBaby(baby.id).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No danger signs reported
                </p>
              ) : (
                <div className="space-y-2">
                  {getDangerSignsByBaby(baby.id).map((d) => (
                    <div key={d.id} className="rounded-lg border p-3 bg-red-50">
                      <p className="font-medium">{d.sign}</p>
                      {d.value && <p className="text-sm">Value: {d.value}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        Reported: {new Date(d.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's KMC Progress */}
          <Card>
            <CardContent className="flex items-center gap-6 p-6">
              <ProgressRing
                progress={progressPercent}
                size={90}
                strokeWidth={6}
                color={progressPercent >= 100 ? "success" : "primary"}
              >
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {hoursToday}:{minutesToday.toString().padStart(2, "0")}
                  </p>
                </div>
              </ProgressRing>
              <div className="flex-1">
                <h3 className="font-semibold">Today&apos;s KMC</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Goal: 8 hours
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-medium">
                      {totalKMCHours.toFixed(1)}h
                    </span>
                  </div>
                  {weightVelocity !== null && (
                    <div>
                      <span className="text-muted-foreground">Gain: </span>
                      <span
                        className={`font-medium ${
                          weightVelocity >= 15 ? "text-success" : ""
                        }`}
                      >
                        {weightVelocity.toFixed(1)}g/day
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Weekly KMC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={weeklyData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="nurseKmcGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(270, 70%, 45%)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(270, 70%, 45%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
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
                      fill="url(#nurseKmcGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Nurse/Midwife Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col gap-1 py-3 bg-transparent"
              >
                <Link href={`/nurse/patient/${baby.id}/vitals`}>
                  <Thermometer className="h-5 w-5 text-primary" />
                  <span className="text-xs">Vitals</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col gap-1 py-3 bg-transparent"
              >
                <Link href={`/nurse/patient/${baby.id}/weight`}>
                  <Scale className="h-5 w-5 text-primary" />
                  <span className="text-xs">Weight</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col gap-1 py-3 bg-transparent"
              >
                <Link href={`/nurse/patient/${baby.id}/feeding`}>
                  <Utensils className="h-5 w-5 text-primary" />
                  <span className="text-xs">Feeding</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col gap-1 py-3 bg-transparent"
              >
                <Link href={`/nurse/patient/${baby.id}/intake-output`}>
                  <Droplets className="h-5 w-5 text-primary" />
                  <span className="text-xs">I/O</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col gap-1 py-3 bg-transparent"
              >
                <Link href={`/nurse/patient/${baby.id}/kmc`}>
                  <Baby className="h-5 w-5 text-primary" />
                  <span className="text-xs">KMC</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col gap-1 py-3 bg-transparent"
              >
                <Link href={`/nurse/patient/${baby.id}/discharge-score`}>
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <span className="text-xs">Score</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col gap-1 py-3 bg-transparent"
              >
                <Link href={`/nurse/patient/${baby.id}/charts`}>
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="text-xs">Charts</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col gap-1 py-3 bg-transparent col-span-2"
              >
                <Link href={`/nurse/patient/${baby.id}/comment`}>
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span className="text-xs">Add Clinical Note</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Logs */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Logs
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/nurse/patient/${baby.id}/logs`}>View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No logs yet
                </p>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map((log) => {
                    const logUser = getUserById(log.authorUserId);
                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            {log.type === "kmc_session" && (
                              <Play className="h-4 w-4 text-primary" />
                            )}
                            {log.type === "feeding" && (
                              <Utensils className="h-4 w-4 text-primary" />
                            )}
                            {log.type === "weight" && (
                              <Scale className="h-4 w-4 text-primary" />
                            )}
                            {log.type === "vitals" && (
                              <Thermometer className="h-4 w-4 text-primary" />
                            )}
                            {log.type === "daily" && (
                              <FileText className="h-4 w-4 text-primary" />
                            )}
                            {log.type === "intake_output" && (
                              <Droplets className="h-4 w-4 text-primary" />
                            )}
                            {log.type === "discharge_readiness" && (
                              <ClipboardList className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {log.type.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              by {logUser?.name || "Unknown"} ({log.authorRole})
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {log.type === "kmc_session" && (
                            <p className="text-sm font-medium">
                              {(log as KMCSessionLog).data.durationMinutes} min
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Button */}
          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href={`/nurse/patient/${baby.id}/export`}>
              <FileText className="mr-2 h-4 w-4" />
              Export Patient Report
            </Link>
          </Button>
        </div>
      </main>

      {user.role === "nurse" && <BottomNav />}
    </div>
  );
}
