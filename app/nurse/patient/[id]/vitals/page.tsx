"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import type { VitalsLog } from "@/lib/types";
import { getBabyById } from "@/lib/storage";

export default function NurseVitalsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading, addLog, reportDanger } = useApp();

  const babyId = params.id as string;
  const [baby, setBaby] = useState<ReturnType<typeof getBabyById> | null>(null);

  const [dateTime, setDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [oxygenSat, setOxygenSat] = useState("");
  const [breathingSupport, setBreathingSupport] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [glucose, setGlucose] = useState("");
  const [bilirubin, setBilirubin] = useState("");
  const [phototherapy, setPhototherapy] = useState(false);
  const [painScore, setPainScore] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
      setBaby(foundBaby);
    }
  }, [user, isLoading, router, babyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (!user || !baby) {
      toast.error("Unable to save vitals");
      setIsSaving(false);
      return;
    }

    // Calculate MAP if BP provided
    let map: number | null = null;
    if (bpSystolic && bpDiastolic) {
      const sys = Number.parseFloat(bpSystolic);
      const dia = Number.parseFloat(bpDiastolic);
      map = Math.round((sys + 2 * dia) / 3);
    }

    const logData: Omit<VitalsLog, "id" | "timestamp"> = {
      babyId: baby.id,
      authorUserId: user.id,
      authorRole: user.role,
      type: "vitals",
      nurseComment: null,
      immutable: false,
      data: {
        dateTime: new Date(dateTime).toISOString(),
        temperature: temperature ? Number.parseFloat(temperature) : null,
        heartRate: heartRate ? Number.parseInt(heartRate) : null,
        respiratoryRate: respiratoryRate
          ? Number.parseInt(respiratoryRate)
          : null,
        oxygenSaturation: oxygenSat ? Number.parseInt(oxygenSat) : null,
        breathingSupport: breathingSupport || null,
        bloodPressureSystolic: bpSystolic ? Number.parseInt(bpSystolic) : null,
        bloodPressureDiastolic: bpDiastolic
          ? Number.parseInt(bpDiastolic)
          : null,
        bloodPressureMAP: map,
        glucose: glucose ? Number.parseFloat(glucose) : null,
        bilirubin: bilirubin ? Number.parseFloat(bilirubin) : null,
        phototherapyGiven: phototherapy,
        painScore: painScore ? Number.parseInt(painScore) : null,
        notes,
      },
    };

    addLog(logData as Omit<VitalsLog, "id" | "timestamp">);
    // Automatic temperature trigger
    const tempVal = temperature ? Number.parseFloat(temperature) : null;
    if (tempVal !== null && (tempVal < 36.5 || tempVal > 37.5)) {
      reportDanger(baby.id, "Abnormal temperature", tempVal);
      toast.error(
        "Danger sign detected: abnormal temperature — notified staff"
      );
    } else {
      toast.success("Vitals recorded!");
    }

    router.push(`/nurse/patient/${babyId}`);
    setIsSaving(false);
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
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/nurse/patient/${babyId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Record Vitals</h1>
            <p className="text-xs text-muted-foreground">{baby.babyName}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
              <CardDescription>
                NICU/Baby Unit Chart - Record clinical observations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="datetime">Date & Time</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="36.5"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="h-12"
                      min="35"
                      max="42"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
                    <Input
                      id="heart-rate"
                      type="number"
                      placeholder="140"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="h-12"
                      min="60"
                      max="220"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="respiratory-rate">Resp. Rate (/min)</Label>
                    <Input
                      id="respiratory-rate"
                      type="number"
                      placeholder="40"
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(e.target.value)}
                      className="h-12"
                      min="10"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oxygen-sat">SpO2 (%)</Label>
                    <Input
                      id="oxygen-sat"
                      type="number"
                      placeholder="95"
                      value={oxygenSat}
                      onChange={(e) => setOxygenSat(e.target.value)}
                      className="h-12"
                      min="70"
                      max="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bp-systolic">BP Systolic (mmHg)</Label>
                    <Input
                      id="bp-systolic"
                      type="number"
                      placeholder="60"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bp-diastolic">BP Diastolic (mmHg)</Label>
                    <Input
                      id="bp-diastolic"
                      type="number"
                      placeholder="35"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="glucose">Glucose/RBS (mmol/L)</Label>
                    <Input
                      id="glucose"
                      type="number"
                      step="0.1"
                      placeholder="4.5"
                      value={glucose}
                      onChange={(e) => setGlucose(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bilirubin">Bilirubin/TcB</Label>
                    <Input
                      id="bilirubin"
                      type="number"
                      step="0.1"
                      placeholder=""
                      value={bilirubin}
                      onChange={(e) => setBilirubin(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pain-score">Pain Score (NIPS)</Label>
                    <Input
                      id="pain-score"
                      type="number"
                      placeholder="0-7"
                      value={painScore}
                      onChange={(e) => setPainScore(e.target.value)}
                      className="h-12"
                      min="0"
                      max="7"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phototherapy Given?</Label>
                    <div className="flex items-center h-12 space-x-2">
                      <Switch
                        checked={phototherapy}
                        onCheckedChange={setPhototherapy}
                      />
                      <span className="text-sm">
                        {phototherapy ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breathing-support">Breathing Support</Label>
                  <Input
                    id="breathing-support"
                    placeholder="e.g., Room air, CPAP, O2 1L/min"
                    value={breathingSupport}
                    onChange={(e) => setBreathingSupport(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Clinical Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any clinical observations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="flex-1 bg-transparent"
                  >
                    <Link href={`/nurse/patient/${babyId}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Vitals"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
