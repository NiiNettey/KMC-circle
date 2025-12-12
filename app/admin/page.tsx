"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Baby,
  Users,
  UserPlus,
  ClipboardList,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  LogOut,
} from "lucide-react";
import type { Baby as BabyType } from "@/lib/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    user,
    isLoading,
    logout,
    getAllBabies,
    nurses,
    getNurseWorkload,
    getNurseMaxCapacity,
  } = useApp();
  const [babies, setBabies] = useState<BabyType[]>([]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/auth");
      return;
    }
    if (user?.role === "admin") {
      setBabies(getAllBabies());
    }
  }, [user, isLoading, router, getAllBabies]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const referredBabies = babies.filter((b) => b.status === "referred");
  const assignedBabies = babies.filter((b) => b.status === "assigned");
  const readyForDischargeBabies = babies.filter(
    (b) => b.status === "ready_for_discharge"
  );
  const dischargedBabies = babies.filter((b) => b.status === "discharged");

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <h1 className="text-xl font-bold text-primary">
              KMC Mama&apos;s Circle
            </h1>
            <p className="text-xs text-muted-foreground">
              {user.facility || "Ward Administrator"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">New Referrals</p>
                  <p className="text-3xl font-bold">{referredBabies.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary to-purple-700 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">In KMC Care</p>
                  <p className="text-3xl font-bold">{assignedBabies.length}</p>
                </div>
                <Baby className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Ready to Discharge</p>
                  <p className="text-3xl font-bold">
                    {readyForDischargeBabies.length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Discharged</p>
                  <p className="text-3xl font-bold">
                    {dischargedBabies.length}
                  </p>
                </div>
                <Clock className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors cursor-pointer">
            <Link href="/admin/onboard">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Onboard New Baby</h3>
                  <p className="text-sm text-muted-foreground">
                    Register a new KMC referral
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Link>
          </Card>

          <Card className="border-2 border-dashed border-purple-300 hover:border-purple-500 transition-colors cursor-pointer">
            <Link href="/admin/assign">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Assign to Nurses/Midwives</h3>
                  <p className="text-sm text-muted-foreground">
                    {referredBabies.length} babies awaiting assignment
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Nurses/Midwives Workload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Nurses/Midwives Workload
            </CardTitle>
            <CardDescription>Current patient assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nurses.map((nurse) => {
                const workload = getNurseWorkload(nurse.id);
                const capacity = getNurseMaxCapacity(nurse.id);
                const loadPercent = Math.min((workload / capacity) * 100, 100);
                const atCapacity = workload >= capacity;
                return (
                  <div key={nurse.id} className="flex items-center gap-4">
                    <div className="w-32 truncate font-medium">
                      {nurse.name}
                    </div>
                    <div className="flex-1">
                      <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            loadPercent > 80
                              ? "bg-red-500"
                              : loadPercent > 50
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${loadPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-40 text-right">
                      <Badge variant={atCapacity ? "destructive" : "secondary"}>
                        {workload} / {capacity}
                      </Badge>
                      {atCapacity && (
                        <div className="text-xs text-red-500 mt-1">
                          At Capacity
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {nurses.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No nurses/midwives registered yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals needing assignment */}
        {referredBabies.length > 0 && (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="h-5 w-5" />
                Babies Awaiting Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {referredBabies.slice(0, 5).map((baby) => (
                  <Link
                    key={baby.id}
                    href={`/admin/baby/${baby.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-orange-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{baby.babyName}</p>
                      <p className="text-sm text-muted-foreground">
                        GA: {baby.gestationalAgeWeeks}wks |{" "}
                        {baby.currentWeightGrams}g
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className="bg-orange-100 text-orange-700 border-orange-300"
                      >
                        Needs Assignment
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(baby.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              {referredBabies.length > 5 && (
                <Link href="/admin/assign">
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-orange-700"
                  >
                    View all {referredBabies.length} referrals
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* All Babies List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5" />
              All Babies
            </CardTitle>
            <CardDescription>
              Complete list of babies in KMC program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {babies.map((baby) => {
                const nurse = nurses.find((n) => n.id === baby.assignedNurseId);
                return (
                  <Link
                    key={baby.id}
                    href={`/admin/baby/${baby.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 transition-colors border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          baby.gender === "female"
                            ? "bg-pink-100"
                            : "bg-blue-100"
                        }`}
                      >
                        <Baby
                          className={`h-5 w-5 ${
                            baby.gender === "female"
                              ? "text-pink-600"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{baby.babyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {baby.gestationalAgeWeeks}wks |{" "}
                          {baby.currentWeightGrams}g
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          baby.status === "referred"
                            ? "destructive"
                            : baby.status === "ready_for_discharge"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          baby.status === "ready_for_discharge"
                            ? "bg-green-500"
                            : ""
                        }
                      >
                        {baby.status.replace(/_/g, " ")}
                      </Badge>
                      {nurse && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {nurse.name}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
              {babies.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No babies registered yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
