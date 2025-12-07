import type { User, Baby, LogEntry, EduItem, TimerState, Notification, Milestone } from "./types"

// Storage keys
const KEYS = {
  USERS: "kmc_users_v0",
  BABIES: "kmc_babies_v0",
  LOGS: "kmc_logs_v0",
  EDU: "kmc_edu_v0",
  MILESTONES: "kmc_milestones_v0",
  TIMER: "kmc_timer_v0",
  CURRENT_USER: "kmc_current_user_v0",
  NOTIFICATIONS: "kmc_notifications_v0",
  INITIALIZED: "kmc_initialized_v0",
}

// Generic storage helpers
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Storage error:", error)
  }
}

// Users
export function getUsers(): User[] {
  return getItem<User[]>(KEYS.USERS, [])
}

export function setUsers(users: User[]): void {
  setItem(KEYS.USERS, users)
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id)
}

export function getUserByUsername(username: string): User | undefined {
  return getUsers().find((u) => u.username.toLowerCase() === username.toLowerCase())
}

export function addUser(user: User): void {
  const users = getUsers()
  users.push(user)
  setUsers(users)
}

export function updateUser(user: User): void {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === user.id)
  if (index !== -1) {
    users[index] = user
    setUsers(users)
  }
}

// Current user session
export function getCurrentUser(): User | null {
  return getItem<User | null>(KEYS.CURRENT_USER, null)
}

export function setCurrentUser(user: User | null): void {
  setItem(KEYS.CURRENT_USER, user)
}

// Babies
export function getBabies(): Baby[] {
  return getItem<Baby[]>(KEYS.BABIES, [])
}

export function setBabies(babies: Baby[]): void {
  setItem(KEYS.BABIES, babies)
}

export function getBabyById(id: string): Baby | undefined {
  return getBabies().find((b) => b.id === id)
}

export function getBabiesByMother(userId: string): Baby[] {
  return getBabies().filter((b) => b.motherUserId === userId)
}

export function getBabiesByNurse(nurseId: string): Baby[] {
  return getBabies().filter((b) => b.assignedNurseId === nurseId)
}

export function getPendingBabiesForNurse(nurseId: string): Baby[] {
  return getBabies().filter((b) => b.assignedNurseId === nurseId && b.status === "pending_nurse_approval")
}

export function addBaby(baby: Baby): void {
  const babies = getBabies()
  babies.push(baby)
  setBabies(babies)
}

export function updateBaby(baby: Baby): void {
  const babies = getBabies()
  const index = babies.findIndex((b) => b.id === baby.id)
  if (index !== -1) {
    babies[index] = baby
    setBabies(babies)
  }
}

// Logs
export function getLogs(): LogEntry[] {
  return getItem<LogEntry[]>(KEYS.LOGS, [])
}

export function setLogs(logs: LogEntry[]): void {
  setItem(KEYS.LOGS, logs)
}

export function getLogsByBaby(babyId: string): LogEntry[] {
  return getLogs().filter((l) => l.babyId === babyId)
}

export function getLogsByType(babyId: string, type: LogEntry["type"]): LogEntry[] {
  return getLogs().filter((l) => l.babyId === babyId && l.type === type)
}

export function addLog(log: LogEntry): void {
  const logs = getLogs()
  logs.push(log)
  setLogs(logs)
}

export function updateLog(log: LogEntry): void {
  const logs = getLogs()
  const index = logs.findIndex((l) => l.id === log.id)
  if (index !== -1) {
    logs[index] = log
    setLogs(logs)
  }
}

// Timer
export function getTimerState(): TimerState {
  return getItem<TimerState>(KEYS.TIMER, {
    isRunning: false,
    startTime: null,
    babyId: null,
    position: "chest-to-chest",
  })
}

export function setTimerState(state: TimerState): void {
  setItem(KEYS.TIMER, state)
}

// Educational content
export function getEduContent(): EduItem[] {
  return getItem<EduItem[]>(KEYS.EDU, [])
}

export function setEduContent(content: EduItem[]): void {
  setItem(KEYS.EDU, content)
}

// Milestones
export function getMilestones(): Milestone[] {
  return getItem<Milestone[]>(KEYS.MILESTONES, [])
}

export function setMilestones(milestones: Milestone[]): void {
  setItem(KEYS.MILESTONES, milestones)
}

export function getMilestonesByBaby(babyId: string): Milestone[] {
  return getMilestones().filter((m) => m.babyId === babyId)
}

export function addMilestone(milestone: Milestone): void {
  const milestones = getMilestones()
  milestones.push(milestone)
  setMilestones(milestones)
}

// Notifications
export function getNotifications(): Notification[] {
  return getItem<Notification[]>(KEYS.NOTIFICATIONS, [])
}

export function setNotifications(notifications: Notification[]): void {
  setItem(KEYS.NOTIFICATIONS, notifications)
}

export function getNotificationsByUser(userId: string): Notification[] {
  return getNotifications().filter((n) => n.userId === userId)
}

export function addNotification(notification: Notification): void {
  const notifications = getNotifications()
  notifications.push(notification)
  setNotifications(notifications)
}

export function markNotificationRead(id: string): void {
  const notifications = getNotifications()
  const index = notifications.findIndex((n) => n.id === id)
  if (index !== -1) {
    notifications[index].read = true
    setNotifications(notifications)
  }
}

// Initialization check
export function isInitialized(): boolean {
  return getItem<boolean>(KEYS.INITIALIZED, false)
}

export function markInitialized(): void {
  setItem(KEYS.INITIALIZED, true)
}
