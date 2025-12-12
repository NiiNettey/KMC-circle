"use client";

import { useState } from "react";
import * as storage from "@/lib/storage";
import { useApp } from "@/lib/context/app-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const CATEGORIES: Record<string, string[]> = {
  "Breathing Problems": [
    "Fast breathing",
    "Chest in-drawing",
    "Grunting",
    "Blue lips",
  ],
  "Feeding Problems": ["Poor sucking", "Refusing feeds", "Vomits everything"],
  "Temperature Problems": ["Baby too cold", "Baby too hot"],
  "Infection Signs": [
    "Fever",
    "Pus at cord",
    "Red cord",
    "Baby unusually sleepy",
  ],
  Jaundice: ["Yellow eyes", "Yellow skin or palms"],
  "Emergency Signs": ["Convulsions", "No movement", "Baby not waking up"],
};

export default function DangerSignsPage() {
  const { user, isLoading, babies, reportDanger } = useApp();
  // Ensure parents only see their own babies
  const availableBabies =
    user?.role === "parent" ? storage.getBabiesByMother(user.id) : babies;
  const [selectedBabyId, setSelectedBabyId] = useState<string>(
    availableBabies[0]?.id || ""
  );
  const [selectedBabyIds, setSelectedBabyIds] = useState<string[]>([]);

  if (isLoading || !user) return null;

  const toggleBaby = (id: string) => {
    // Only allow toggling babies the user is allowed to see
    if (!availableBabies.some((b) => b.id === id)) return;
    setSelectedBabyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleReportForMultiple = (sign: string) => {
    if (selectedBabyIds.length === 0) {
      toast.error("Please select at least one baby to report for");
      return;
    }

    const confirmed = confirm(
      `Report \"${sign}\" for ${selectedBabyIds.length} baby(ies)?`
    );
    if (!confirmed) return;

    let success = 0;
    let failed = 0;
    selectedBabyIds.forEach((babyId) => {
      const entry = reportDanger(babyId, sign);
      if (entry) success++;
      else failed++;
    });

    if (success > 0)
      toast.success(`Reported ${success} danger(s); ${failed} failed`);
    if (failed > 0) toast.error(`${failed} reports failed`);
  };

  const handleReport = (sign: string) => {
    // For parents allow multiple selection; for others single
    if (user?.role === "parent") {
      handleReportForMultiple(sign);
      return;
    }

    if (!selectedBabyId) {
      toast.error("Please select a baby to report for");
      return;
    }

    const confirmed = confirm(`Report \"${sign}\" for selected baby?`);
    if (!confirmed) return;

    const entry = reportDanger(selectedBabyId, sign);
    if (entry) {
      toast.success("Danger reported — nurse and admin notified");
    } else {
      toast.error("Unable to report danger");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 p-4">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Danger Signs</CardTitle>
            <CardDescription>
              {user.role === "parent"
                ? "Report urgent warning signs for your baby"
                : "Staff view — use patient vitals or profile to record clinical alerts"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label>Select Baby</Label>
              {user.role === "parent" ? (
                <div className="space-y-2 mt-2">
                  {availableBabies.map((b) => (
                    <label key={b.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedBabyIds.includes(b.id)}
                        onCheckedChange={() => toggleBaby(b.id)}
                      />
                      <span>
                        {b.babyName} — {b.motherName || b.id}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <Select
                  value={selectedBabyId}
                  onValueChange={setSelectedBabyId}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Choose baby" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBabies.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.babyName} — {b.motherName || b.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-4">
              {Object.entries(CATEGORIES).map(([cat, items]) => (
                <Card key={cat} className="border">
                  <CardHeader>
                    <CardTitle className="text-sm">{cat}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((it) =>
                        user.role === "parent" ? (
                          <Button
                            key={it}
                            variant="outline"
                            onClick={() => handleReport(it)}
                            className="justify-start"
                          >
                            {it}
                          </Button>
                        ) : (
                          <div
                            key={it}
                            className="p-2 rounded border border-muted bg-muted/50 text-sm"
                          >
                            {it}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
