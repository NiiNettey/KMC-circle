"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Play,
  Scale,
  Thermometer,
  FileText,
  MessageSquare,
  Filter,
} from "lucide-react";
import { getBabyById, getLogsByBaby, getUserById } from "@/lib/storage";
import { feedingTypeLabel } from "@/lib/utils/analytics";
import type {
  Baby,
  LogEntry,
  KMCSessionLog,
  WeightLog,
  FeedingLog,
  VitalsLog,
  CommentLog,
} from "@/lib/types";

export default function NursePatientLogsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useApp();
  const [baby, setBaby] = useState<Baby | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const babyId = params.id as string;

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "nurse")) {
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

  const filteredLogs = useMemo(() => {
    let filtered = logs;
    if (filter !== "all") {
      filtered = logs.filter((log) => log.type === filter);
    }
    return filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [logs, filter]);

  const groupedLogs = useMemo(() => {
    const groups: Record<string, LogEntry[]> = {};
    filteredLogs.forEach((log) => {
      const date = new Date(log.timestamp).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return groups;
  }, [filteredLogs]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case "kmc_session":
        return <Play className="h-4 w-4 text-primary" />;
      case "feeding":
        return <span className="text-sm">🍼</span>;
      case "weight":
        return <Scale className="h-4 w-4 text-primary" />;
      case "vitals":
        return <Thermometer className="h-4 w-4 text-primary" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-primary" />;
      default:
        return <FileText className="h-4 w-4 text-primary" />;
    }
  };

  const getLogDetail = (log: LogEntry) => {
    switch (log.type) {
      case "kmc_session":
        return `${(log as KMCSessionLog).data.durationMinutes} min`;
      case "weight":
        return `${(log as WeightLog).data.weightGrams}g`;
      case "feeding":
        const feedLog = log as FeedingLog;
        return `${feedingTypeLabel(feedLog.data.type)}${
          feedLog.data.amountMl ? ` - ${feedLog.data.amountMl}ml` : ""
        }`;
      case "vitals":
        const vitals = (log as VitalsLog).data;
        return vitals.temperature ? `${vitals.temperature}°C` : "Recorded";
      case "comment":
        return (log as CommentLog).data.comment.substring(0, 50) + "...";
      default:
        return "";
    }
  };

  if (isLoading || !user || !baby) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/nurse/patient/${baby.id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">All Logs</h1>
            <p className="text-xs text-muted-foreground">{baby.babyName}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Filter logs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logs</SelectItem>
                <SelectItem value="kmc_session">KMC Sessions</SelectItem>
                <SelectItem value="feeding">Feeding</SelectItem>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="vitals">Vitals</SelectItem>
                <SelectItem value="comment">Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs */}
          {Object.keys(groupedLogs).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No logs found</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedLogs).map(([date, dateLogs]) => (
              <div key={date}>
                <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
                  {date}
                </p>
                <div className="space-y-2">
                  {dateLogs.map((log) => {
                    const logUser = getUserById(log.authorUserId);
                    return (
                      <Card key={log.id}>
                        <CardContent className="flex items-center gap-3 p-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            {getLogIcon(log.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium capitalize">
                              {log.type.replace("_", " ")}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              by {logUser?.name || "Unknown"} ({log.authorRole})
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {getLogDetail(log)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {log.immutable && (
                            <Badge variant="outline" className="text-xs">
                              Locked
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
