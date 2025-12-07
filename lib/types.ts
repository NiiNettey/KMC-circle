// User types
export type UserRole = "parent" | "nurse"
export type Language = "en" | "tw" | "ga" | "ew"

export interface User {
  id: string
  role: UserRole
  username: string
  password: string
  name: string
  facility?: string
  locale: Language
  createdAt: string
}

// Baby types
export type BabyStatus = "pending_nurse_approval" | "assigned" | "unassigned" | "discharged"

export interface Baby {
  id: string
  motherUserId: string
  assignedNurseId: string | null
  status: BabyStatus
  babyName: string
  dob: string
  gestationalAgeWeeks: number
  birthWeightGrams: number
  currentWeightGrams: number
  facility: string
  language: Language
  createdAt: string
  photoUrl: string | null
  colorTag: "purple" | "white"
}

// Log types
export type LogType = "kmc_session" | "daily" | "feeding" | "weight" | "vitals" | "milestone" | "comment"
export type FeedingType = "breast" | "expressed" | "formula" | "EBM" | "DBM"
export type KMCPosition = "chest-to-chest" | "upright-wrap" | "other"
export type BabyMood = "Calm" | "Active" | "Sleeping" | "Fussy"

export interface BaseLogEntry {
  id: string
  babyId: string
  authorUserId: string
  authorRole: UserRole
  type: LogType
  timestamp: string
  nurseComment: string | null
  immutable: boolean
}

export interface KMCSessionData {
  startTime: string
  endTime: string
  durationMinutes: number
  position: KMCPosition
  notes: string
}

export interface KMCSessionLog extends BaseLogEntry {
  type: "kmc_session"
  data: KMCSessionData
}

export interface FeedingData {
  dateTime: string
  type: FeedingType
  amountMl: number | null
  notes: string
}

export interface FeedingLog extends BaseLogEntry {
  type: "feeding"
  data: FeedingData
}

export interface WeightData {
  dateTime: string
  weightGrams: number
  notes: string
}

export interface WeightLog extends BaseLogEntry {
  type: "weight"
  data: WeightData
}

export interface DailyLogData {
  date: string
  weightGrams: number | null
  feedingType: FeedingType | null
  breathingSupport: string | null
  temperatureC: number | null
  babyMood: BabyMood | null
  motherFeelings: string
  todaysWin: string
}

export interface DailyLog extends BaseLogEntry {
  type: "daily"
  data: DailyLogData
}

export interface VitalsData {
  dateTime: string
  temperature: number | null
  heartRate: number | null
  respiratoryRate: number | null
  oxygenSaturation: number | null
  breathingSupport: string | null
  notes: string
}

export interface VitalsLog extends BaseLogEntry {
  type: "vitals"
  data: VitalsData
}

export interface CommentLog extends BaseLogEntry {
  type: "comment"
  parentLogId: string
  data: {
    comment: string
  }
}

export type LogEntry = KMCSessionLog | FeedingLog | WeightLog | DailyLog | VitalsLog | CommentLog

// Timer state
export interface TimerState {
  isRunning: boolean
  startTime: string | null
  babyId: string | null
  position: KMCPosition
}

// Educational content
export type EduCategory = "KMC Basics" | "Breastfeeding" | "Hygiene" | "Support" | "Safety" | "Dads Corner"

export interface EduItem {
  id: string
  category: EduCategory
  title: string
  contentType: "text" | "video" | "audio" | "pdf"
  content: string
  audioFiles: {
    en: string | null
    tw: string | null
    ga: string | null
    ew: string | null
  }
}

// Milestones & Badges
export interface Milestone {
  id: string
  babyId: string
  milestoneId: string
  achievedAt: string
  autoTriggered: boolean
  source: "system" | "user"
  notes: string | null
}

export interface Badge {
  id: string
  title: string
  description: string
  icon: string
  rule: string
}

// Notifications
export interface Notification {
  id: string
  userId: string
  type: "nurse_accepted" | "nurse_declined" | "reminder" | "milestone"
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: Record<string, unknown>
}
