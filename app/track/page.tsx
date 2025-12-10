"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Utensils,
  Scale,
  FileText,
  Thermometer,
  Clock,
  Plus,
  Filter,
} from "lucide-react";
import type {
  LogEntry,
  KMCSessionLog,
  FeedingLog,
  WeightLog,
  DailyLog,
  VitalsLog,
} from "@/lib/types";
import { feedingTypeLabel } from "@/lib/utils/analytics";
import { getUserById } from "@/lib/storage";

type LogFilter =
  | "all"
  | "kmc_session"
  | "feeding"
  | "weight"
  | "daily"
  | "vitals";

const filterOptions: { value: LogFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "kmc_session", label: "KMC" },
  { value: "feeding", label: "Feeding" },
  { value: "weight", label: "Weight" },
  { value: "daily", label: "Daily" },
];

function getLogIcon(type: LogEntry["type"]) {
  switch (type) {
    case "kmc_session":
      return <Play className="h-4 w-4 text-primary" />;
    case "feeding":
      return <Utensils className="h-4 w-4 text-primary" />;
    case "weight":
      return <Scale className="h-4 w-4 text-primary" />;
    case "daily":
      return <FileText className="h-4 w-4 text-primary" />;
    case "vitals":
      return <Thermometer className="h-4 w-4 text-primary" />;
    default:
      return <Clock className="h-4 w-4 text-primary" />;
  }
}

function getLogSummary(log: LogEntry): string {
  switch (log.type) {
    case "kmc_session":
      return `${(log as KMCSessionLog).data.durationMinutes} min - ${
        (log as KMCSessionLog).data.position
      }`;
    case "feeding":
      const feeding = log as FeedingLog;
      return `${feedingTypeLabel(feeding.data.type)}${
        feeding.data.amountMl ? ` - ${feeding.data.amountMl}ml` : ""
      }`;
    case "weight":
      return `${(log as WeightLog).data.weightGrams}g`;
    case "daily":
      const daily = log as DailyLog;
      return daily.data.babyMood
        ? `Mood: ${daily.data.babyMood}`
        : "Daily check-in";
    case "vitals":
      const vitals = log as VitalsLog;
      return vitals.data.temperature
        ? `Temp: ${vitals.data.temperature}°C`
        : "Vitals recorded";
    default:
      return "";
  }
}

export default function TrackPage() {
  const router = useRouter();
  const { user, isLoading, currentBaby, logs } = useApp();
  const [filter, setFilter] = useState<LogFilter>("all");

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth");
    }
  }, [user, isLoading, router]);

  const filteredLogs = useMemo(() => {
    if (!currentBaby) return [];

    let filtered = logs.filter((log) => log.babyId === currentBaby.id);

    if (filter !== "all") {
      filtered = filtered.filter((log) => log.type === filter);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [logs, currentBaby, filter]);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: { [date: string]: LogEntry[] } = {};

    filteredLogs.forEach((log) => {
      const date = new Date(log.timestamp).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
    });

    return groups;
  }, [filteredLogs]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <AppHeader title="Track" />

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Quick Add Buttons */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Log New Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col gap-1 py-3 bg-transparent"
              >
                <Link href="/track/kmc/new">
                  <Play className="h-5 w-5 text-primary" />
                  <span className="text-xs">KMC</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col gap-1 py-3 bg-transparent"
              >
                <Link href="/track/feeding/new">
                  <Utensils className="h-5 w-5 text-primary" />
                  <span className="text-xs">Feed</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col gap-1 py-3 bg-transparent"
              >
                <Link href="/track/weight/new">
                  <Scale className="h-5 w-5 text-primary" />
                  <span className="text-xs">Weight</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto flex-col gap-1 py-3 bg-transparent"
              >
                <Link href="/track/daily/new">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-xs">Daily</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Filter Tabs */}
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as LogFilter)}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-5">
              {filterOptions.map((opt) => (
                <TabsTrigger
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={filter} className="mt-4 space-y-4">
              {Object.keys(groupedLogs).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-12">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Filter className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No Logs Yet</h3>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Start tracking to see your entries here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                Object.entries(groupedLogs).map(([date, dayLogs]) => (
                  <div key={date}>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {date}
                    </p>
                    <div className="space-y-2">
                      {dayLogs.map((log) => {
                        const author = getUserById(log.authorUserId);
                        return (
                          <Card key={log.id} className="overflow-hidden">
                            <CardContent className="flex items-center gap-4 p-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                {getLogIcon(log.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium capitalize">
                                    {log.type.replace("_", " ")}
                                  </p>
                                  {log.nurseComment && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Has note
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {getLogSummary(log)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(log.timestamp).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}{" "}
                                  • {author?.name || "Unknown"} (
                                  {log.authorRole})
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Export Button */}
          {filteredLogs.length > 0 && (
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/track/export">
                <FileText className="mr-2 h-4 w-4" />
                Export Logs (PDF)
              </Link>
            </Button>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
