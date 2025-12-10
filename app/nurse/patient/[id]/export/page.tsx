"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, FileText, Printer } from "lucide-react";
import { getBabyById, getLogsByBaby, getUserById } from "@/lib/storage";
import type {
  Baby,
  LogEntry,
  KMCSessionLog,
  WeightLog,
  FeedingLog,
  VitalsLog,
} from "@/lib/types";
import {
  getTotalKMCHours,
  calculateWeightGainVelocity,
} from "@/lib/utils/analytics";

export default function NursePatientExportPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useApp();
  const [baby, setBaby] = useState<Baby | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

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

  const mother = useMemo(() => {
    if (!baby) return null;
    if (!baby.motherUserId) return null;
    return getUserById(baby.motherUserId);
  }, [baby]);
  const totalKMCHours = useMemo(
    () => (baby ? getTotalKMCHours(logs, baby.id) : 0),
    [logs, baby]
  );
  const weightVelocity = useMemo(
    () => (baby ? calculateWeightGainVelocity(logs, baby.id) : null),
    [logs, baby]
  );

  const kmcSessions = useMemo(
    () =>
      logs
        .filter((l): l is KMCSessionLog => l.type === "kmc_session")
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
    [logs]
  );

  const weightLogs = useMemo(
    () =>
      logs
        .filter((l): l is WeightLog => l.type === "weight")
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
    [logs]
  );

  const feedingLogs = useMemo(
    () =>
      logs
        .filter((l): l is FeedingLog => l.type === "feeding")
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
    [logs]
  );

  const vitalsLogs = useMemo(
    () =>
      logs
        .filter((l): l is VitalsLog => l.type === "vitals")
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
    [logs]
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!baby || !reportRef.current) return;

    const reportContent = reportRef.current.innerText;
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baby.babyName.replace(/\s+/g, "_")}_care_report_${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/nurse/patient/${baby.id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Export Report</h1>
            <p className="text-xs text-muted-foreground">{baby.babyName}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Action Buttons */}
          <div className="flex gap-3 print:hidden">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleDownload} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          {/* Report Content */}
          <div ref={reportRef} className="space-y-4 print:space-y-6">
            {/* Header */}
            <Card className="print:border-2 print:border-black">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileText className="h-6 w-6 text-primary print:text-black" />
                  <CardTitle className="text-xl">KMC Care Report</CardTitle>
                </div>
                <CardDescription>
                  Mama&apos;s Circle - Kangaroo Mother Care Tracker
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Baby Name</p>
                    <p className="font-semibold">{baby.babyName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p className="font-semibold">
                      {new Date(baby.dob).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mother</p>
                    <p className="font-semibold">{mother?.name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Age</p>
                    <p className="font-semibold">{ageInDays} days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Facility</p>
                    <p className="font-semibold">{baby.facility}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Gestational Age at Birth
                    </p>
                    <p className="font-semibold">
                      {baby.gestationalAgeWeeks} weeks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Summary Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-lg bg-primary/5 p-3 print:border print:border-gray-300">
                    <p className="text-muted-foreground text-xs">
                      Birth Weight
                    </p>
                    <p className="text-lg font-bold">
                      {baby.birthWeightGrams}g
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-3 print:border print:border-gray-300">
                    <p className="text-muted-foreground text-xs">
                      Current Weight
                    </p>
                    <p className="text-lg font-bold text-primary print:text-black">
                      {baby.currentWeightGrams}g
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-3 print:border print:border-gray-300">
                    <p className="text-muted-foreground text-xs">
                      Weight Change
                    </p>
                    <p className="text-lg font-bold">
                      {baby.currentWeightGrams - baby.birthWeightGrams > 0
                        ? "+"
                        : ""}
                      {baby.currentWeightGrams - baby.birthWeightGrams}g
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-3 print:border print:border-gray-300">
                    <p className="text-muted-foreground text-xs">
                      Weight Velocity
                    </p>
                    <p className="text-lg font-bold">
                      {weightVelocity?.toFixed(1) || "N/A"} g/day
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-3 col-span-2 print:border print:border-gray-300">
                    <p className="text-muted-foreground text-xs">
                      Total KMC Hours
                    </p>
                    <p className="text-2xl font-bold text-primary print:text-black">
                      {totalKMCHours.toFixed(1)} hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weight History</CardTitle>
                <CardDescription>{weightLogs.length} records</CardDescription>
              </CardHeader>
              <CardContent>
                {weightLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No weight records
                  </p>
                ) : (
                  <div className="space-y-2">
                    {weightLogs.slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        className="flex justify-between text-sm border-b pb-2"
                      >
                        <span>
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                        <span className="font-medium">
                          {log.data.weightGrams}g
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* KMC Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  KMC Sessions (Recent 10)
                </CardTitle>
                <CardDescription>
                  {kmcSessions.length} total sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {kmcSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No KMC sessions recorded
                  </p>
                ) : (
                  <div className="space-y-2">
                    {kmcSessions.slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        className="flex justify-between text-sm border-b pb-2"
                      >
                        <span>
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                        <div className="text-right">
                          <span className="font-medium">
                            {log.data.durationMinutes} min
                          </span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {log.data.position}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vitals */}
            {vitalsLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vitals History</CardTitle>
                  <CardDescription>{vitalsLogs.length} records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {vitalsLogs.slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        className="flex justify-between text-sm border-b pb-2"
                      >
                        <span>
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                        <div className="text-right text-xs">
                          {log.data.temperature && (
                            <span className="mr-2">
                              Temp: {log.data.temperature}°C
                            </span>
                          )}
                          {log.data.heartRate && (
                            <span className="mr-2">
                              HR: {log.data.heartRate}
                            </span>
                          )}
                          {log.data.oxygenSaturation && (
                            <span>SpO2: {log.data.oxygenSaturation}%</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feeding Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Feeding Summary</CardTitle>
                <CardDescription>
                  {feedingLogs.length} total feedings recorded
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedingLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No feeding records
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { key: "direct_breast", label: "Direct Breast" },
                      { key: "expressed_breast", label: "Expressed Breast" },
                      { key: "formula", label: "Formula" },
                    ].map((t) => {
                      const count = feedingLogs.filter(
                        (l) => l.data.type === t.key
                      ).length;
                      if (count === 0) return null;
                      return (
                        <div key={t.key} className="flex justify-between">
                          <span>{t.label}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>Generated on {new Date().toLocaleString()}</p>
              <p>Report prepared by: {user.name}</p>
              <p className="mt-2">Mama&apos;s Circle - KMC Care Tracker</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
