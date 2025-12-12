"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Scale,
  Activity,
  TrendingUp,
  ClipboardCheck,
} from "lucide-react";
import { getBabyById } from "@/lib/storage";
import type {
  Baby,
  WeightLog,
  VitalsLog,
  DischargeReadinessLog,
} from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
} from "recharts";

// Fenton growth chart percentiles (simplified data for preterm babies)
const FENTON_PERCENTILES = {
  male: {
    weight: {
      "3rd": [
        500, 550, 610, 680, 760, 850, 950, 1060, 1190, 1340, 1510, 1700, 1910,
        2140, 2390, 2660, 2940, 3230, 3520,
      ],
      "10th": [
        560, 620, 690, 770, 860, 970, 1090, 1220, 1380, 1560, 1760, 1980, 2220,
        2480, 2760, 3050, 3350, 3650, 3950,
      ],
      "50th": [
        700, 780, 870, 980, 1100, 1240, 1400, 1580, 1790, 2020, 2280, 2560,
        2870, 3190, 3530, 3870, 4210, 4540, 4860,
      ],
      "90th": [
        870, 970, 1090, 1230, 1390, 1570, 1780, 2020, 2290, 2590, 2920, 3280,
        3670, 4070, 4490, 4900, 5300, 5680, 6030,
      ],
      "97th": [
        970, 1090, 1220, 1380, 1560, 1770, 2010, 2280, 2590, 2930, 3310, 3720,
        4160, 4610, 5070, 5530, 5970, 6380, 6760,
      ],
    },
  },
  female: {
    weight: {
      "3rd": [
        470, 520, 580, 650, 730, 820, 920, 1030, 1160, 1310, 1470, 1660, 1860,
        2080, 2320, 2570, 2830, 3100, 3360,
      ],
      "10th": [
        530, 590, 660, 740, 830, 940, 1060, 1190, 1350, 1530, 1720, 1940, 2180,
        2430, 2700, 2980, 3270, 3550, 3830,
      ],
      "50th": [
        660, 740, 830, 940, 1060, 1200, 1360, 1540, 1750, 1980, 2230, 2510,
        2810, 3130, 3460, 3800, 4130, 4450, 4760,
      ],
      "90th": [
        820, 920, 1040, 1180, 1340, 1520, 1730, 1970, 2240, 2540, 2870, 3220,
        3610, 4010, 4420, 4830, 5230, 5600, 5950,
      ],
      "97th": [
        920, 1030, 1170, 1330, 1510, 1720, 1960, 2230, 2540, 2880, 3250, 3660,
        4100, 4550, 5010, 5460, 5900, 6310, 6680,
      ],
    },
  },
};

export default function NursePatientChartsPage() {
  const router = useRouter();
  const params = useParams();
  const babyId = params.id as string;

  const { user, isLoading, getLogsByBaby } = useApp();
  const [baby, setBaby] = useState<Baby | null>(null);
  const [activeTab, setActiveTab] = useState("weight");

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
      setBaby(foundBaby || null);
    }
  }, [user, isLoading, router, babyId]);

  if (isLoading || !user || !baby) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const logs = getLogsByBaby(baby.id);
  const weightLogs = logs.filter((l) => l.type === "weight") as WeightLog[];
  const vitalsLogs = logs.filter((l) => l.type === "vitals") as VitalsLog[];
  const dischargeLogs = logs.filter(
    (l) => l.type === "discharge_readiness"
  ) as DischargeReadinessLog[];

  // Prepare weight chart data
  const weightChartData = weightLogs
    .sort(
      (a, b) =>
        new Date(a.data.dateTime).getTime() -
        new Date(b.data.dateTime).getTime()
    )
    .map((log, index) => {
      const dayOfLife = Math.floor(
        (new Date(log.data.dateTime).getTime() - new Date(baby.dob).getTime()) /
          (24 * 60 * 60 * 1000)
      );
      return {
        day: dayOfLife,
        date: new Date(log.data.dateTime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        weight: log.data.weightGrams,
        length: log.data.lengthCm,
        headCirc: log.data.headCircumferenceCm,
      };
    });

  // Add birth weight as first point if not present
  if (weightChartData.length === 0 || weightChartData[0].day > 0) {
    weightChartData.unshift({
      day: 0,
      date: new Date(baby.dob).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      weight: baby.birthWeightGrams,
      length: baby.birthLengthCm,
      headCirc: baby.birthHeadCircumferenceCm,
    });
  }

  // Prepare vitals chart data
  const vitalsChartData = vitalsLogs
    .sort(
      (a, b) =>
        new Date(a.data.dateTime).getTime() -
        new Date(b.data.dateTime).getTime()
    )
    .map((log) => ({
      time: new Date(log.data.dateTime).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      temperature: log.data.temperature,
      heartRate: log.data.heartRate,
      respRate: log.data.respiratoryRate,
      spo2: log.data.oxygenSaturation,
      glucose: log.data.glucose,
    }));

  // Prepare Fenton chart data
  const fentonData = [];
  const percentiles = FENTON_PERCENTILES[baby.gender].weight;
  for (let ga = 22; ga <= 40; ga++) {
    const index = ga - 22;
    fentonData.push({
      ga,
      "3rd": percentiles["3rd"][index],
      "10th": percentiles["10th"][index],
      "50th": percentiles["50th"][index],
      "90th": percentiles["90th"][index],
      "97th": percentiles["97th"][index],
    });
  }

  // Add baby's actual weights to Fenton chart
  const babyFentonData = weightChartData.map((d) => {
    const correctedGA = baby.gestationalAgeWeeks + d.day / 7;
    return {
      ga: Math.round(correctedGA * 10) / 10,
      babyWeight: d.weight,
    };
  });

  // Prepare discharge readiness chart data
  const dischargeChartData = dischargeLogs
    .sort(
      (a, b) =>
        new Date(a.data.dateTime).getTime() -
        new Date(b.data.dateTime).getTime()
    )
    .map((log) => ({
      day: log.data.day,
      date: new Date(log.data.dateTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      socioEconomic: log.data.socioEconomicSupport,
      milkProduction: log.data.milkProduction,
      positioning: log.data.positioningAttachment,
      suckling: log.data.sucklingAbility,
      confidence: log.data.motherConfidence,
      weightGain: log.data.weightGainScore,
      total: log.data.totalScore,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/nurse/patient/${baby.id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{baby.babyName} - Charts</h1>
            <p className="text-xs text-muted-foreground">
              Clinical monitoring data
            </p>
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="mx-auto max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="weight" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                <span className="hidden sm:inline">Weight</span>
              </TabsTrigger>
              <TabsTrigger value="vitals" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Vitals</span>
              </TabsTrigger>
              <TabsTrigger value="fenton" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Fenton</span>
              </TabsTrigger>
              <TabsTrigger
                value="discharge"
                className="flex items-center gap-2"
              >
                <ClipboardCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Discharge</span>
              </TabsTrigger>
            </TabsList>

            {/* Weight Trend Chart */}
            <TabsContent value="weight">
              <Card>
                <CardHeader>
                  <CardTitle>Weight Trend</CardTitle>
                  <CardDescription>
                    Daily weight measurements in grams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {weightChartData.length > 1 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={weightChartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e0e0e0"
                          />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis
                            domain={["dataMin - 100", "dataMax + 100"]}
                            tick={{ fontSize: 12 }}
                            label={{
                              value: "Weight (g)",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              borderRadius: "8px",
                              border: "1px solid #e0e0e0",
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="weight"
                            fill="rgba(106, 27, 154, 0.1)"
                            stroke="#6A1B9A"
                            strokeWidth={2}
                            name="Weight (g)"
                          />
                          <Line
                            type="monotone"
                            dataKey="weight"
                            stroke="#6A1B9A"
                            strokeWidth={3}
                            dot={{ fill: "#6A1B9A", r: 5 }}
                            activeDot={{ r: 8 }}
                            name="Weight (g)"
                          />
                          <ReferenceLine
                            y={baby.birthWeightGrams}
                            stroke="#ff9800"
                            strokeDasharray="5 5"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                      <p>
                        Not enough weight data to display chart. Log more
                        weights to see trends.
                      </p>
                    </div>
                  )}

                  {/* Weight Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Birth Weight
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {baby.birthWeightGrams}g
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Current Weight
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {baby.currentWeightGrams}g
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Weight Change
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          baby.currentWeightGrams >= baby.birthWeightGrams
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {baby.currentWeightGrams >= baby.birthWeightGrams
                          ? "+"
                          : ""}
                        {baby.currentWeightGrams - baby.birthWeightGrams}g
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Avg Gain/Day
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {weightChartData.length > 1
                          ? Math.round(
                              (weightChartData[weightChartData.length - 1]
                                .weight -
                                weightChartData[0].weight) /
                                (weightChartData[weightChartData.length - 1]
                                  .day - weightChartData[0].day || 1)
                            )
                          : 0}
                        g
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Head Circumference & Length */}
              {weightChartData.some((d) => d.headCirc || d.length) && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Growth Measurements</CardTitle>
                    <CardDescription>
                      Length and head circumference trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={weightChartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e0e0e0"
                          />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            label={{
                              value: "cm",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="length"
                            stroke="#2196f3"
                            strokeWidth={2}
                            dot={{ fill: "#2196f3", r: 4 }}
                            name="Length (cm)"
                            connectNulls
                          />
                          <Line
                            type="monotone"
                            dataKey="headCirc"
                            stroke="#4caf50"
                            strokeWidth={2}
                            dot={{ fill: "#4caf50", r: 4 }}
                            name="Head Circ (cm)"
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Vitals Chart */}
            <TabsContent value="vitals">
              <div className="space-y-4">
                {/* Temperature */}
                <Card>
                  <CardHeader>
                    <CardTitle>Temperature</CardTitle>
                    <CardDescription>
                      Normal range: 36.5°C - 37.5°C
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {vitalsChartData.length > 0 ? (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={vitalsChartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                            <YAxis domain={[35, 39]} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <ReferenceLine
                              y={36.5}
                              stroke="#4caf50"
                              strokeDasharray="3 3"
                            />
                            <ReferenceLine
                              y={37.5}
                              stroke="#4caf50"
                              strokeDasharray="3 3"
                            />
                            <Area
                              type="monotone"
                              dataKey="temperature"
                              stroke="#ff5722"
                              fill="rgba(255, 87, 34, 0.2)"
                              name="Temp (°C)"
                              connectNulls
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">
                        No temperature data available
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Heart Rate & Respiratory Rate */}
                <Card>
                  <CardHeader>
                    <CardTitle>Heart Rate & Respiratory Rate</CardTitle>
                    <CardDescription>
                      HR: 100-160 bpm | RR: 30-60 /min
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {vitalsChartData.length > 0 ? (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={vitalsChartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="heartRate"
                              stroke="#e91e63"
                              strokeWidth={2}
                              name="Heart Rate (bpm)"
                              connectNulls
                            />
                            <Line
                              type="monotone"
                              dataKey="respRate"
                              stroke="#2196f3"
                              strokeWidth={2}
                              name="Resp Rate (/min)"
                              connectNulls
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">
                        No vitals data available
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Oxygen Saturation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Oxygen Saturation (SpO2)</CardTitle>
                    <CardDescription>Normal range: 90-95%</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {vitalsChartData.length > 0 ? (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={vitalsChartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                            <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <ReferenceLine
                              y={90}
                              stroke="#ff9800"
                              strokeDasharray="3 3"
                            />
                            <Area
                              type="monotone"
                              dataKey="spo2"
                              stroke="#4caf50"
                              fill="rgba(76, 175, 80, 0.2)"
                              name="SpO2 (%)"
                              connectNulls
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">
                        No SpO2 data available
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Blood Glucose */}
                <Card>
                  <CardHeader>
                    <CardTitle>Blood Glucose (RBS)</CardTitle>
                    <CardDescription>
                      Normal range: 2.6-7.0 mmol/L
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {vitalsChartData.some((d) => d.glucose) ? (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={vitalsChartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                            <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <ReferenceLine
                              y={2.6}
                              stroke="#ff9800"
                              strokeDasharray="3 3"
                            />
                            <ReferenceLine
                              y={7}
                              stroke="#ff9800"
                              strokeDasharray="3 3"
                            />
                            <Line
                              type="monotone"
                              dataKey="glucose"
                              stroke="#9c27b0"
                              strokeWidth={2}
                              dot={{ fill: "#9c27b0", r: 4 }}
                              name="Glucose (mmol/L)"
                              connectNulls
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">
                        No glucose data available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Fenton Growth Chart */}
            <TabsContent value="fenton">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Fenton Growth Chart (
                    {baby.gender === "female" ? "Girls" : "Boys"})
                  </CardTitle>
                  <CardDescription>
                    Weight plotted against gestational age with percentile
                    curves
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                          dataKey="ga"
                          type="number"
                          domain={[22, 42]}
                          tick={{ fontSize: 12 }}
                          label={{
                            value: "Gestational Age (weeks)",
                            position: "bottom",
                            offset: 0,
                          }}
                        />
                        <YAxis
                          domain={[0, 5000]}
                          tick={{ fontSize: 12 }}
                          label={{
                            value: "Weight (g)",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip />
                        <Legend />

                        {/* Percentile curves */}
                        <Line
                          data={fentonData}
                          type="monotone"
                          dataKey="3rd"
                          stroke="#ff9800"
                          strokeWidth={1}
                          dot={false}
                          name="3rd percentile"
                        />
                        <Line
                          data={fentonData}
                          type="monotone"
                          dataKey="10th"
                          stroke="#ffc107"
                          strokeWidth={1}
                          dot={false}
                          name="10th percentile"
                        />
                        <Line
                          data={fentonData}
                          type="monotone"
                          dataKey="50th"
                          stroke="#4caf50"
                          strokeWidth={2}
                          dot={false}
                          name="50th percentile"
                        />
                        <Line
                          data={fentonData}
                          type="monotone"
                          dataKey="90th"
                          stroke="#2196f3"
                          strokeWidth={1}
                          dot={false}
                          name="90th percentile"
                        />
                        <Line
                          data={fentonData}
                          type="monotone"
                          dataKey="97th"
                          stroke="#9c27b0"
                          strokeWidth={1}
                          dot={false}
                          name="97th percentile"
                        />

                        {/* Baby's actual weight */}
                        <Line
                          data={babyFentonData}
                          type="monotone"
                          dataKey="babyWeight"
                          stroke="#6A1B9A"
                          strokeWidth={3}
                          dot={{ fill: "#6A1B9A", r: 6 }}
                          name={`${baby.babyName}'s weight`}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Current Status:</strong> {baby.babyName} is at{" "}
                      <strong>{baby.gestationalAgeWeeks} weeks</strong>{" "}
                      gestational age with a weight of{" "}
                      <strong>{baby.currentWeightGrams}g</strong>.
                      {(() => {
                        const idx = Math.min(baby.gestationalAgeWeeks - 22, 18);
                        const p = percentiles;
                        if (baby.currentWeightGrams < p["3rd"][idx])
                          return " Weight is below 3rd percentile.";
                        if (baby.currentWeightGrams < p["10th"][idx])
                          return " Weight is between 3rd and 10th percentile.";
                        if (baby.currentWeightGrams < p["50th"][idx])
                          return " Weight is between 10th and 50th percentile.";
                        if (baby.currentWeightGrams < p["90th"][idx])
                          return " Weight is between 50th and 90th percentile.";
                        if (baby.currentWeightGrams < p["97th"][idx])
                          return " Weight is between 90th and 97th percentile.";
                        return " Weight is above 97th percentile.";
                      })()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Discharge Readiness Chart */}
            <TabsContent value="discharge">
              <Card>
                <CardHeader>
                  <CardTitle>Pre-Discharge Readiness Score</CardTitle>
                  <CardDescription>
                    Daily assessment scores (0-2 per category, total max 12)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dischargeChartData.length > 0 ? (
                    <>
                      {/* Total Score Trend */}
                      <div className="h-64 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={dischargeChartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 12]} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <ReferenceLine
                              y={10}
                              stroke="#4caf50"
                              strokeDasharray="3 3"
                              label="Discharge Ready"
                            />
                            <Area
                              type="monotone"
                              dataKey="total"
                              stroke="#6A1B9A"
                              fill="rgba(106, 27, 154, 0.2)"
                              strokeWidth={3}
                              name="Total Score"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Category Breakdown */}
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={dischargeChartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 2]} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="socioEconomic"
                              stackId="a"
                              fill="#e91e63"
                              name="Socio-Economic"
                            />
                            <Bar
                              dataKey="milkProduction"
                              stackId="a"
                              fill="#9c27b0"
                              name="Milk Production"
                            />
                            <Bar
                              dataKey="positioning"
                              stackId="a"
                              fill="#673ab7"
                              name="Positioning"
                            />
                            <Bar
                              dataKey="suckling"
                              stackId="a"
                              fill="#3f51b5"
                              name="Suckling"
                            />
                            <Bar
                              dataKey="confidence"
                              stackId="a"
                              fill="#2196f3"
                              name="Confidence"
                            />
                            <Bar
                              dataKey="weightGain"
                              stackId="a"
                              fill="#4caf50"
                              name="Weight Gain"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Latest Score Summary */}
                      {dischargeChartData.length > 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-3">
                            Latest Assessment (Day{" "}
                            {
                              dischargeChartData[dischargeChartData.length - 1]
                                .day
                            }
                            )
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                              {
                                label: "Socio-Economic Support",
                                value:
                                  dischargeChartData[
                                    dischargeChartData.length - 1
                                  ].socioEconomic,
                              },
                              {
                                label: "Milk Production",
                                value:
                                  dischargeChartData[
                                    dischargeChartData.length - 1
                                  ].milkProduction,
                              },
                              {
                                label: "Positioning/Attachment",
                                value:
                                  dischargeChartData[
                                    dischargeChartData.length - 1
                                  ].positioning,
                              },
                              {
                                label: "Suckling Ability",
                                value:
                                  dischargeChartData[
                                    dischargeChartData.length - 1
                                  ].suckling,
                              },
                              {
                                label: "Mother's Confidence",
                                value:
                                  dischargeChartData[
                                    dischargeChartData.length - 1
                                  ].confidence,
                              },
                              {
                                label: "Weight Gain",
                                value:
                                  dischargeChartData[
                                    dischargeChartData.length - 1
                                  ].weightGain,
                              },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="flex items-center justify-between p-2 bg-white rounded"
                              >
                                <span className="text-sm text-muted-foreground">
                                  {item.label}
                                </span>
                                <span
                                  className={`font-bold ${
                                    item.value === 2
                                      ? "text-green-600"
                                      : item.value === 1
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {item.value}/2
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t flex items-center justify-between">
                            <span className="font-medium">Total Score</span>
                            <span
                              className={`text-2xl font-bold ${
                                dischargeChartData[
                                  dischargeChartData.length - 1
                                ].total >= 10
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {
                                dischargeChartData[
                                  dischargeChartData.length - 1
                                ].total
                              }
                              /12
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No discharge readiness assessments yet.</p>
                      <p className="text-sm mt-2">
                        Add assessments from the patient page to see trends.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
