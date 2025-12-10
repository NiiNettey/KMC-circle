"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { AudioButton } from "@/components/ui/audio-button";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import type { FeedingType, FeedingLog } from "@/lib/types";

const feedingTypes: { value: FeedingType; label: string; audioKey: string }[] =
  [
    {
      value: "direct_breast",
      label: "Direct Breast Milk",
      audioKey: "feeding-breast",
    },
    {
      value: "expressed_breast",
      label: "Expressed Breast Milk",
      audioKey: "feeding-expressed",
    },
    { value: "formula", label: "Formula", audioKey: "feeding-formula" },
  ];

export default function NewFeedingLogPage() {
  const router = useRouter();
  const { user, currentBaby, addLog, playAudio } = useApp();

  const [dateTime, setDateTime] = useState(
    new Date().toISOString().slice(0, 16) // Format: "2024-01-01T12:00"
  );
  const [feedingType, setFeedingType] = useState<FeedingType>("direct_breast");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user || !currentBaby) {
      toast.error("Please sign in and add a baby first");
      setIsLoading(false);
      return;
    }

    // Require amount for expressed breast milk or formula
    if (feedingType !== "direct_breast" && !amount) {
      toast.error("Please enter amount for expressed breast milk or formula");
      setIsLoading(false);
      return;
    }

    const logData: Omit<FeedingLog, "id" | "timestamp"> = {
      babyId: currentBaby.id,
      authorUserId: user.id,
      authorRole: user.role,
      type: "feeding",
      nurseComment: null,
      immutable: user.role === "parent",
      data: {
        dateTime: new Date(dateTime).toISOString(),
        type: feedingType,
        route: "PO",
        amountMl: amount ? Number.parseInt(amount) : null,
        notes,
      },
    };

    addLog(logData as Omit<FeedingLog, "id" | "timestamp">);
    playAudio("save");
    toast.success("Feeding logged!");
    router.push("/track");
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/track">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            Log Feeding
            <AudioButton audioKey="log-feeding" />
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Feeding Entry</CardTitle>
              <CardDescription>Record your baby&apos;s feeding</CardDescription>
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

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Feeding Type
                    <AudioButton audioKey="feeding-breast" />
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {feedingTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setFeedingType(type.value);
                          playAudio(type.audioKey);
                        }}
                        className={`rounded-lg border p-3 text-center text-sm transition-colors ${
                          feedingType === type.value
                            ? "border-primary bg-primary/5"
                            : "border-border bg-transparent hover:border-primary/50"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ml) - optional</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="e.g., 30"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12"
                    min="0"
                    max="200"
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount is optional for Direct Breast Milk. For Expressed
                    Breast Milk or Formula, amount (ml) is required.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="How did feeding go? Any concerns?"
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
                    <Link href="/track">Cancel</Link>
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Saving..." : "Save"}
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
