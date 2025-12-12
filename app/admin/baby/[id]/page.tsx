"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Baby,
  User,
  Copy,
  CheckCircle,
  Activity,
  Scale,
  FileText,
  ClipboardList,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { getBabyById, getUserById } from "@/lib/storage";
import type { Baby as BabyType, User as UserType } from "@/lib/types";

export default function AdminBabyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const babyId = params.id as string;

  const {
    user,
    isLoading,
    getLogsByBaby,
    nurses,
    updateBaby,
    addNotification,
    getDangerSignsByBaby,
  } = useApp();

  const [baby, setBaby] = useState<BabyType | null>(null);
  const [assignedNurse, setAssignedNurse] = useState<UserType | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/auth");
      return;
    }
    if (babyId) {
      const foundBaby = getBabyById(babyId);
      setBaby(foundBaby || null);
      if (foundBaby?.assignedNurseId) {
        const nurse = getUserById(foundBaby.assignedNurseId);
        setAssignedNurse(nurse || null);
      }
    }
  }, [user, isLoading, router, babyId]);

  const copyClaimCode = () => {
    if (baby?.claimCode) {
      navigator.clipboard.writeText(baby.claimCode);
      setCopied(true);
      toast.success("Claim code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const markReadyForDischarge = () => {
    if (!baby) return;
    const updatedBaby: BabyType = { ...baby, status: "ready_for_discharge" };
    updateBaby(updatedBaby);
    setBaby(updatedBaby);

    // Notify nurse
    if (baby.assignedNurseId) {
      addNotification({
        userId: baby.assignedNurseId,
        type: "discharge_ready",
        title: "Patient Ready for Discharge",
        message: `${baby.babyName} has been marked as ready for discharge.`,
        read: false,
        data: { babyId: baby.id },
      });
    }

    toast.success("Baby marked as ready for discharge");
  };

  const dischargeBaby = () => {
    if (!baby) return;
    const updatedBaby: BabyType = { ...baby, status: "discharged" };
    updateBaby(updatedBaby);
    setBaby(updatedBaby);
    toast.success("Baby has been discharged");
  };

  if (isLoading || !user || !baby) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const logs = getLogsByBaby(baby.id);
  const weightLogs = logs.filter((l) => l.type === "weight");
  const vitalsLogs = logs.filter((l) => l.type === "vitals");
  const dischargeLogs = logs.filter((l) => l.type === "discharge_readiness");
  const daysSinceAdmission = baby.admissionDate
    ? Math.floor(
        (Date.now() - new Date(baby.admissionDate).getTime()) /
          (24 * 60 * 60 * 1000)
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{baby.babyName}</h1>
            <p className="text-xs text-muted-foreground">
              Day {daysSinceAdmission} of admission
            </p>
          </div>
          <Badge
            variant={
              baby.status === "referred"
                ? "destructive"
                : baby.status === "ready_for_discharge"
                ? "default"
                : "secondary"
            }
            className={
              baby.status === "ready_for_discharge" ? "bg-green-500" : ""
            }
          >
            {baby.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </header>

      <main className="p-4">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Baby Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Baby Avatar */}
                <div className="flex flex-col items-center">
                  <div
                    className={`h-24 w-24 rounded-full flex items-center justify-center ${
                      baby.gender === "female" ? "bg-pink-100" : "bg-blue-100"
                    }`}
                  >
                    <Baby
                      className={`h-12 w-12 ${
                        baby.gender === "female"
                          ? "text-pink-500"
                          : "text-blue-500"
                      }`}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground capitalize">
                    {baby.gender}
                  </p>
                </div>

                {/* Baby Details */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="font-medium">
                      {new Date(baby.dob).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Gestational Age
                    </p>
                    <p className="font-medium">
                      {baby.gestationalAgeWeeks} weeks
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Birth Weight
                    </p>
                    <p className="font-medium">{baby.birthWeightGrams}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Current Weight
                    </p>
                    <p className="font-semibold text-primary">
                      {baby.currentWeightGrams}g
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Admission Weight
                    </p>
                    <p className="font-medium">
                      {baby.admissionWeightGrams || baby.birthWeightGrams}g
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Referral Source
                    </p>
                    <p className="font-medium">
                      {baby.referralSource || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mother & Nurse Info */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Mother Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Mother Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {baby.motherName || "Not recorded"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {baby.motherPhone || "Not recorded"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">App Status</p>
                    <p className="font-medium">
                      {baby.motherUserId ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-600"
                        >
                          Claimed
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-orange-50 text-orange-600"
                        >
                          Not Claimed
                        </Badge>
                      )}
                    </p>
                  </div>
                  {baby.claimCode && !baby.motherUserId && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">
                        Claim Code
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-mono font-bold text-primary">
                          {baby.claimCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyClaimCode}
                        >
                          {copied ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Nurse Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Assigned Nurse/Midwife
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignedNurse ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{assignedNurse.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Facility</p>
                      <p className="font-medium">
                        {assignedNurse.facility || "Not specified"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="mt-2 bg-transparent"
                    >
                      <Link href={`/admin/assign?baby=${baby.id}`}>
                        Reassign
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      No nurse assigned yet
                    </p>
                    <Button asChild size="sm">
                      <Link href={`/admin/assign?baby=${baby.id}`}>
                        Assign Now
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="text-center">
              <CardContent className="p-4">
                <Scale className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{weightLogs.length}</p>
                <p className="text-xs text-muted-foreground">Weight Logs</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Activity className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{vitalsLogs.length}</p>
                <p className="text-xs text-muted-foreground">Vitals Logs</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <ClipboardList className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{dischargeLogs.length}</p>
                <p className="text-xs text-muted-foreground">Score Sheets</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <FileText className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-xs text-muted-foreground">Total Logs</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href={`/admin/baby/${baby.id}/charts`}>
                  <Activity className="mr-2 h-4 w-4" />
                  View Charts
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/admin/baby/${baby.id}/logs`}>
                  <FileText className="mr-2 h-4 w-4" />
                  View All Logs
                </Link>
              </Button>
              {baby.status === "assigned" && (
                <Button
                  onClick={markReadyForDischarge}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Ready for Discharge
                </Button>
              )}
              {baby.status === "ready_for_discharge" && (
                <Button onClick={dischargeBaby} variant="default">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Discharge Baby
                </Button>
              )}
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
                      <p className="text-xs text-muted-foreground">
                        By: {d.reportedByRole}
                        {d.reportedByUserId ? ` (${d.reportedByUserId})` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
