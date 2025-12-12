"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

const ACTIONS_BY_SIGN: Record<string, string[]> = {
  "Fast breathing": [
    "Keep baby upright on chest and stay calm",
    "Check for nasal flaring or chest in-drawing",
    "Seek immediate nurse/doctor review",
  ],
  "Chest in-drawing": [
    "Ensure airway is clear and position for ease of breathing",
    "Call for urgent clinical review",
  ],
  Grunting: ["Keep baby warm, reduce stimulation, call for help"],
  "Blue lips": ["Provide warmth and seek immediate medical help"],
  "Poor sucking": [
    "Try repositioning at breast and encourage feeding; notify nurse",
  ],
  "Refusing feeds": ["Offer small frequent feeds and notify staff"],
  "Vomits everything": ["Hold feeds and seek nurse review"],
  "Baby too cold": ["Provide skin-to-skin and check room temperature"],
  "Baby too hot": ["Remove excess clothing and cool gradually"],
  Fever: ["Keep baby comfortable, check temperature, notify nurse"],
  "Pus at cord": ["Keep cord clean and notify nurse for review"],
  "Red cord": ["Assess for infection and notify staff"],
  "Baby unusually sleepy": ["Stimulate gently and seek clinical assessment"],
  "Yellow eyes": ["Ensure feeding, seek nurse assessment for jaundice"],
  "Yellow skin or palms": ["Notify nurse; may need bilirubin check"],
  Convulsions: ["Protect baby from injury and call for emergency help"],
  "No movement": ["Call for immediate medical assistance"],
  "Baby not waking up": ["Stimulate and call emergency assistance"],
};

export default function DangerSignsPage() {
  const { user, isLoading, babies, reportDanger } = useApp();

  const availableBabies =
    user?.role === "parent" ? storage.getBabiesByMother(user.id) : babies;
  const [selectedBabyId, setSelectedBabyId] = useState<string>(
    availableBabies[0]?.id || ""
  );
  const [selectedBabyIds, setSelectedBabyIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSign, setModalSign] = useState<string | null>(null);

  if (isLoading || !user) return null;

  const toggleBaby = (id: string) => {
    if (!availableBabies.some((b) => b.id === id)) return;
    setSelectedBabyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openModalFor = (sign: string) => {
    setModalSign(sign);
    setModalOpen(true);
  };

  const sendAlertForSign = (sign: string) => {
    if (!user) return;

    if (user.role === "parent") {
      if (selectedBabyIds.length === 0) {
        toast.error("Please select at least one baby to report for");
        return;
      }

      let success = 0;
      let failed = 0;
      selectedBabyIds.forEach((babyId) => {
        const entry = reportDanger(babyId, sign);
        if (entry) success++;
        else failed++;
      });

      if (success > 0) toast.success(`Alert sent — ${success} reported`);
      if (failed > 0) toast.error(`${failed} failed`);
      setModalOpen(false);
      return;
    }

    toast(
      "This is a staff view. Use patient vitals or admin tools to record clinical alerts."
    );
    setModalOpen(false);
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
                            onClick={() => openModalFor(it)}
                            className="justify-start"
                          >
                            {it}
                          </Button>
                        ) : (
                          <button
                            key={it}
                            onClick={() => openModalFor(it)}
                            className="w-full text-left p-2 rounded border border-muted bg-muted/50 text-sm"
                          >
                            {it}
                          </button>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal for instructions and sending alert */}
        {modalOpen && modalSign && (
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{modalSign}</DialogTitle>
                <DialogDescription>
                  Immediate actions and first-aid steps
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <ul className="list-disc pl-5 space-y-2">
                  {(
                    ACTIONS_BY_SIGN[modalSign] || [
                      "Follow clinical guidance and seek help",
                    ]
                  ).map((a, i) => (
                    <li key={i} className="text-sm">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <DialogFooter>
                <div className="flex w-full justify-end gap-2">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>
                    Close
                  </Button>
                  {user.role === "parent" && (
                    <Button onClick={() => sendAlertForSign(modalSign)}>
                      Send Alert to Nurse
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
