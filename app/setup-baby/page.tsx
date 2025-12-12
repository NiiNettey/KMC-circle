"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudioButton } from "@/components/ui/audio-button";
import { toast } from "sonner";
import type { Language, BabyStatus } from "@/lib/types";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Heart,
  Users,
} from "lucide-react";
import { addNotification } from "@/lib/storage";
import { v4 as uuid } from "uuid";
import { MamaBabyIllustration } from "@/components/illustrations/mama-baby";
import { motion, AnimatePresence } from "framer-motion";
import { Confetti } from "@/components/ui/confetti";

const FACILITIES = [
  "Korle Bu General",
  "Greater Accra Clinic",
  "Tamale Regional",
  "Kumasi Maternity",
  "Other",
];

export default function SetupBabyPage() {
  const router = useRouter();
  const { user, nurses, addBaby, getNurseWorkload, getNurseMaxCapacity } =
    useApp();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Form state
  const [babyName, setBabyName] = useState("");
  const [dob, setDob] = useState("");
  const [gestationalAge, setGestationalAge] = useState("");
  const [birthWeight, setBirthWeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [facility, setFacility] = useState("");
  const [selectedNurseId, setSelectedNurseId] = useState<string>("");
  const [language, setLanguage] = useState<Language>(user?.locale || "en");

  const handleNext = () => {
    if (step === 1) {
      if (!babyName || !dob) {
        toast.error("Please enter baby's name and birth date");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!birthWeight || !gestationalAge) {
        toast.error("Please enter birth weight and gestational age");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user) {
      toast.error("Please sign in first");
      setIsLoading(false);
      return;
    }

    const hasNurse =
      selectedNurseId && selectedNurseId !== "none" && selectedNurseId !== "";
    const status: BabyStatus = hasNurse
      ? "pending_nurse_approval"
      : "unassigned";

    const newBaby = addBaby({
      motherUserId: user.id,
      assignedNurseId: hasNurse ? selectedNurseId : null,
      status,
      babyName,
      dob,
      gestationalAgeWeeks: Number.parseInt(gestationalAge),
      birthWeightGrams: Number.parseInt(birthWeight),
      currentWeightGrams: currentWeight
        ? Number.parseInt(currentWeight)
        : Number.parseInt(birthWeight),
      facility: facility || "Not specified",
      language,
      photoUrl: null,
      colorTag: "purple",
    });

    if (hasNurse) {
      addNotification({
        id: uuid(),
        userId: selectedNurseId,
        type: "nurse_accepted",
        title: "New Baby Assignment Request",
        message: `${user.name} has requested you to care for baby ${babyName}`,
        read: false,
        createdAt: new Date().toISOString(),
        data: { babyId: newBaby.id },
      });
      toast.success("Baby profile created! Waiting for nurse approval.");
    } else {
      toast.success("Baby profile created!");
    }

    setShowConfetti(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  if (!user) {
    router.push("/auth");
    return null;
  }

  const stepIcons = [
    <Heart key="1" className="h-4 w-4" />,
    <Sparkles key="2" className="h-4 w-4" />,
    <Users key="3" className="h-4 w-4" />,
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/5 via-background to-secondary/20 p-4">
      <Confetti trigger={showConfetti} />

      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                s <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: s === step ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {s < step ? <Check className="h-5 w-5" /> : stepIcons[s - 1]}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mb-6 flex flex-col items-center"
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <MamaBabyIllustration
            className="h-32 w-32 mb-2"
            variant={step === 3 ? "success" : "kmc"}
          />
          <h1 className="text-xl font-bold text-foreground">
            {step === 1 && "Let's Meet Your Baby"}
            {step === 2 && "Health Information"}
            {step === 3 && "Your Care Team"}
          </h1>
          <p className="text-sm text-muted-foreground">Step {step} of 3</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/10 shadow-lg">
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Baby Details
                        <AudioButton audioKey="enter-baby-name" />
                      </CardTitle>
                      <CardDescription>
                        Tell us about your little one
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="baby-name">Baby&apos;s Name</Label>
                          <AudioButton audioKey="enter-baby-name" />
                        </div>
                        <Input
                          id="baby-name"
                          placeholder="Enter baby's name"
                          value={babyName}
                          onChange={(e) => setBabyName(e.target.value)}
                          className="h-12 text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="dob">Date of Birth</Label>
                          <AudioButton audioKey="enter-birth-date" />
                        </div>
                        <Input
                          id="dob"
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="h-12"
                          max={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="language">Preferred Language</Label>
                          <AudioButton audioKey="select-language" />
                        </div>
                        <Select
                          value={language}
                          onValueChange={(v) => setLanguage(v as Language)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="tw">Twi</SelectItem>
                            <SelectItem value="ga">Ga</SelectItem>
                            <SelectItem value="ew">Ewe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </>
                )}

                {step === 2 && (
                  <>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Birth Information
                        <AudioButton audioKey="enter-weight" />
                      </CardTitle>
                      <CardDescription>
                        Medical details for tracking
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="gestational-age">
                            Gestational Age (weeks)
                          </Label>
                          <AudioButton audioKey="enter-weight" />
                        </div>
                        <Input
                          id="gestational-age"
                          type="number"
                          placeholder="e.g., 34"
                          value={gestationalAge}
                          onChange={(e) => setGestationalAge(e.target.value)}
                          className="h-12 text-lg"
                          min="20"
                          max="42"
                        />
                        <p className="text-xs text-muted-foreground">
                          How many weeks pregnant when baby was born
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="birth-weight">
                            Birth Weight (grams)
                          </Label>
                          <AudioButton audioKey="enter-weight" />
                        </div>
                        <Input
                          id="birth-weight"
                          type="number"
                          placeholder="e.g., 1800"
                          value={birthWeight}
                          onChange={(e) => setBirthWeight(e.target.value)}
                          className="h-12 text-lg"
                          min="400"
                          max="5000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current-weight">
                          Current Weight (grams)
                        </Label>
                        <Input
                          id="current-weight"
                          type="number"
                          placeholder="Leave blank if same as birth"
                          value={currentWeight}
                          onChange={(e) => setCurrentWeight(e.target.value)}
                          className="h-12 text-lg"
                          min="400"
                          max="5000"
                        />
                      </div>
                    </CardContent>
                  </>
                )}

                {step === 3 && (
                  <>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Care Team
                        <AudioButton audioKey="select-nurse" />
                      </CardTitle>
                      <CardDescription>
                        Select your facility and nurse/midwife
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="facility">Facility/Hospital</Label>
                          <AudioButton audioKey="select-facility" />
                        </div>
                        <Select value={facility} onValueChange={setFacility}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select facility" />
                          </SelectTrigger>
                          <SelectContent>
                            {FACILITIES.map((f) => (
                              <SelectItem key={f} value={f}>
                                {f}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="nurse">Assign a Nurse/Midwife</Label>
                          <AudioButton audioKey="select-nurse" />
                        </div>
                        <Select
                          value={selectedNurseId || "none"}
                          onValueChange={setSelectedNurseId}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select nurse (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Skip for now</SelectItem>
                            {nurses
                              .filter(
                                (n) =>
                                  getNurseWorkload(n.id) <
                                  getNurseMaxCapacity(n.id)
                              )
                              .map((nurse) => (
                                <SelectItem key={nurse.id} value={nurse.id}>
                                  {nurse.name} - {nurse.facility || "NICU"}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Your nurse/midwife will be notified and can view
                          baby&apos;s logs
                        </p>
                      </div>

                      {selectedNurseId && selectedNurseId !== "none" && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg bg-primary/10 p-4 border border-primary/20"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-primary">
                                Nurse/Midwife will be notified
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Your selected nurse/midwife will receive a
                                request to approve. You&apos;ll be notified when
                                they respond.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </>
                )}

                <CardContent className="flex gap-3 pt-0">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1 h-12 bg-transparent"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 h-12"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-1 h-12"
                      disabled={isLoading}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {isLoading ? "Creating..." : "Complete Setup"}
                    </Button>
                  )}
                </CardContent>
              </form>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
