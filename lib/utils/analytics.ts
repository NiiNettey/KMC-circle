import type { LogEntry, KMCSessionLog, WeightLog, FeedingLog } from "@/lib/types"

export function getTodayKMCMinutes(logs: LogEntry[], babyId: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return logs
    .filter(
      (log): log is KMCSessionLog =>
        log.type === "kmc_session" && log.babyId === babyId && new Date(log.timestamp) >= today,
    )
    .reduce((total, log) => total + (log.data.durationMinutes || 0), 0)
}

export function getWeeklyKMCData(logs: LogEntry[], babyId: string): { day: string; minutes: number }[] {
  const result: { day: string; minutes: number }[] = []
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    const dayMinutes = logs
      .filter(
        (log): log is KMCSessionLog =>
          log.type === "kmc_session" &&
          log.babyId === babyId &&
          new Date(log.timestamp) >= date &&
          new Date(log.timestamp) < nextDay,
      )
      .reduce((total, log) => total + (log.data.durationMinutes || 0), 0)

    result.push({
      day: days[date.getDay()],
      minutes: dayMinutes,
    })
  }

  return result
}

export function getWeightTrend(logs: LogEntry[], babyId: string, limit = 10): { date: string; weight: number }[] {
  const weightLogs = logs
    .filter((log): log is WeightLog => log.type === "weight" && log.babyId === babyId)
    .sort((a, b) => new Date(a.data.dateTime).getTime() - new Date(b.data.dateTime).getTime())
    .slice(-limit)

  return weightLogs.map((log) => ({
    date: new Date(log.data.dateTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight: log.data.weightGrams,
  }))
}

export function getTodayFeedingCount(logs: LogEntry[], babyId: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return logs.filter(
    (log): log is FeedingLog => log.type === "feeding" && log.babyId === babyId && new Date(log.timestamp) >= today,
  ).length
}

export function getWeeklyFeedingData(logs: LogEntry[], babyId: string): { day: string; count: number }[] {
  const result: { day: string; count: number }[] = []
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    const dayCount = logs.filter(
      (log): log is FeedingLog =>
        log.type === "feeding" &&
        log.babyId === babyId &&
        new Date(log.timestamp) >= date &&
        new Date(log.timestamp) < nextDay,
    ).length

    result.push({
      day: days[date.getDay()],
      count: dayCount,
    })
  }

  return result
}

export function getTotalKMCHours(logs: LogEntry[], babyId: string): number {
  return (
    logs
      .filter((log): log is KMCSessionLog => log.type === "kmc_session" && log.babyId === babyId)
      .reduce((total, log) => total + (log.data.durationMinutes || 0), 0) / 60
  )
}

export function calculateWeightGainVelocity(logs: LogEntry[], babyId: string): number | null {
  const weightLogs = logs
    .filter((log): log is WeightLog => log.type === "weight" && log.babyId === babyId)
    .sort((a, b) => new Date(a.data.dateTime).getTime() - new Date(b.data.dateTime).getTime())

  if (weightLogs.length < 2) return null

  const first = weightLogs[0]
  const last = weightLogs[weightLogs.length - 1]

  const daysDiff =
    (new Date(last.data.dateTime).getTime() - new Date(first.data.dateTime).getTime()) / (1000 * 60 * 60 * 24)

  if (daysDiff < 1) return null

  return (last.data.weightGrams - first.data.weightGrams) / daysDiff
}
