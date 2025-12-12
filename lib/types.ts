// User types
export type UserRole = "parent" | "nurse" | "admin";
export type Language = "en" | "tw" | "ga" | "ew";

export interface User {
  id: string;
  role: UserRole;
  username: string;
  password: string;
  name: string;
  facility?: string;
  locale: Language;
  createdAt: string;
  // Optional: maximum number of babies this nurse/midwife can be assigned
  maxPatients?: number;
}

// Baby types
export type BabyStatus =
  | "referred"
  | "pending_nurse_approval"
  | "assigned"
  | "ready_for_discharge"
  | "discharged"
  | "unassigned";

export interface Baby {
  id: string;
  motherUserId: string | null; // null when created by admin before parent claims
  assignedNurseId: string | null;
  status: BabyStatus;
  babyName: string;
  dob: string;
  gender: "male" | "female";
  gestationalAgeWeeks: number;
  birthWeightGrams: number;
  currentWeightGrams: number;
  birthLengthCm: number | null;
  currentLengthCm: number | null;
  birthHeadCircumferenceCm: number | null;
  currentHeadCircumferenceCm: number | null;
  facility: string;
  language: Language;
  createdAt: string;
  photoUrl: string | null;
  colorTag: "purple" | "white";
  claimCode: string | null;
  motherName: string | null;
  motherPhone: string | null;
  admissionDate: string | null;
  admissionWeightGrams: number | null;
  referralSource: string | null;
}

// Log types
export type LogType =
  | "kmc_session"
  | "daily"
  | "feeding"
  | "weight"
  | "vitals"
  | "milestone"
  | "comment"
  | "intake_output"
  | "discharge_readiness";
// Simplified feeding types (internal codes). UI shows human labels.
export type FeedingType = "direct_breast" | "expressed_breast" | "formula";
export type FeedingRoute = "PO" | "OG";
export type KMCPosition = "chest-to-chest" | "upright-wrap" | "other";
export type BabyMood = "Calm" | "Active" | "Sleeping" | "Fussy";

export interface BaseLogEntry {
  id: string;
  babyId: string;
  authorUserId: string;
  authorRole: UserRole;
  type: LogType;
  timestamp: string;
  nurseComment: string | null;
  immutable: boolean;
}

export interface KMCSessionData {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  position: KMCPosition;
  notes: string;
}

export interface KMCSessionLog extends BaseLogEntry {
  type: "kmc_session";
  data: KMCSessionData;
}

export interface FeedingData {
  dateTime: string;
  type: FeedingType;
  route: FeedingRoute | null;
  amountMl: number | null;
  notes: string;
}

export interface FeedingLog extends BaseLogEntry {
  type: "feeding";
  data: FeedingData;
}

export interface WeightData {
  dateTime: string;
  weightGrams: number;
  lengthCm: number | null;
  headCircumferenceCm: number | null;
  notes: string;
}

export interface WeightLog extends BaseLogEntry {
  type: "weight";
  data: WeightData;
}

export interface DailyLogData {
  date: string;
  weightGrams: number | null;
  feedingType: FeedingType | null;
  breathingSupport: string | null;
  temperatureC: number | null;
  babyMood: BabyMood | null;
  motherFeelings: string;
  todaysWin: string;
}

export interface DailyLog extends BaseLogEntry {
  type: "daily";
  data: DailyLogData;
}

export interface VitalsData {
  dateTime: string;
  temperature: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  breathingSupport: string | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  bloodPressureMAP: number | null;
  glucose: number | null;
  bilirubin: number | null;
  phototherapyGiven: boolean | null;
  painScore: number | null;
  notes: string;
}

export interface VitalsLog extends BaseLogEntry {
  type: "vitals";
  data: VitalsData;
}

export interface IntakeOutputData {
  dateTime: string;
  feedingMl: number | null;
  ivFluidsMl: number | null;
  // Keep numeric urine (for net balance) but also expose a presence flag for quick Yes/No UI
  urinePresent?: boolean;
  urineMl: number | null;
  // Stool recorded as presence (Yes/No)
  stoolPresent?: boolean;
  netBalance: number | null;
  notes: string;
}

export interface IntakeOutputLog extends BaseLogEntry {
  type: "intake_output";
  data: IntakeOutputData;
}

export interface DischargeReadinessData {
  dateTime: string;
  day: number;
  socioEconomicSupport: 0 | 1 | 2;
  milkProduction: 0 | 1 | 2;
  positioningAttachment: 0 | 1 | 2;
  sucklingAbility: 0 | 1 | 2;
  motherConfidence: 0 | 1 | 2;
  weightGainGramsPerDay: number | null;
  weightGainScore: 0 | 1 | 2;
  totalScore: number;
  breastfeedingStarted: boolean;
  kmcStarted: boolean;
  notes: string;
}

export interface DischargeReadinessLog extends BaseLogEntry {
  type: "discharge_readiness";
  data: DischargeReadinessData;
}

export interface CommentLog extends BaseLogEntry {
  type: "comment";
  parentLogId: string;
  data: {
    comment: string;
  };
}

export type LogEntry =
  | KMCSessionLog
  | FeedingLog
  | WeightLog
  | DailyLog
  | VitalsLog
  | CommentLog
  | IntakeOutputLog
  | DischargeReadinessLog;

// Timer state
export interface TimerState {
  isRunning: boolean;
  startTime: string | null;
  babyId: string | null;
  position: KMCPosition;
}

// Educational content
export type EduCategory =
  | "KMC Basics"
  | "Breastfeeding"
  | "Hygiene"
  | "Support"
  | "Safety"
  | "Dads Corner";

export interface EduItem {
  id: string;
  category: EduCategory;
  title: string;
  contentType: "text" | "video" | "audio" | "pdf";
  content: string;
  audioFiles: {
    en: string | null;
    tw: string | null;
    ga: string | null;
    ew: string | null;
  };
}

// Milestones & Badges
export interface Milestone {
  id: string;
  babyId: string;
  milestoneId: string;
  achievedAt: string;
  autoTriggered: boolean;
  source: "system" | "user";
  notes: string | null;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rule: string;
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  type:
    | "nurse_accepted"
    | "nurse_declined"
    | "reminder"
    | "milestone"
    | "baby_assigned"
    | "discharge_ready"
    | "claim_code"
    | "nurse_comment";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export const DISCHARGE_CRITERIA = {
  minTotalScore: 10, // out of 12
  minDaysWithGoodScore: 2,
  minWeightGainPerDay: 15, // grams
};

// Community/Forum types for Circle feature
export type ForumType = "moms" | "dads";
export type ReactionType = "heart" | "hug" | "pray" | "celebrate";

export interface Post {
  id: string;
  forumType: ForumType;
  authorUserId: string;
  authorName: string;
  title: string;
  content: string;
  reactions: Record<ReactionType, string[]>; // reaction type -> array of user IDs
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorUserId: string;
  authorName: string;
  content: string;
  reactions: Record<ReactionType, string[]>;
  createdAt: string;
}
