import type {
  User,
  Baby,
  LogEntry,
  EduItem,
  TimerState,
  Notification,
  Milestone,
  Post,
  Comment,
  ForumType,
  ReactionType,
} from "./types";

// Storage keys
const KEYS = {
  USERS: "kmc_users_v1", // bumped version for new schema
  BABIES: "kmc_babies_v1",
  LOGS: "kmc_logs_v1",
  EDU: "kmc_edu_v0",
  MILESTONES: "kmc_milestones_v0",
  TIMER: "kmc_timer_v0",
  CURRENT_USER: "kmc_current_user_v1",
  NOTIFICATIONS: "kmc_notifications_v0",
  INITIALIZED: "kmc_initialized_v1",
};

const POSTS_KEY = "kmc_posts_v0";
const COMMENTS_KEY = "kmc_comments_v0";

// Default capacity for nurses if not specified on the user record
const DEFAULT_NURSE_CAPACITY = 10;
// Generic storage helpers
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Storage error:", error);
  }
}

// Users
export function getUsers(): User[] {
  return getItem<User[]>(KEYS.USERS, []);
}

export function setUsers(users: User[]): void {
  setItem(KEYS.USERS, users);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  return getUsers().find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  setUsers(users);
}

export function updateUser(user: User): void {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
    setUsers(users);
  }
}

// Current user session
export function getCurrentUser(): User | null {
  return getItem<User | null>(KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: User | null): void {
  setItem(KEYS.CURRENT_USER, user);
}

// Babies
export function getBabies(): Baby[] {
  return getItem<Baby[]>(KEYS.BABIES, []);
}

export function setBabies(babies: Baby[]): void {
  setItem(KEYS.BABIES, babies);
}

export function getBabyById(id: string): Baby | undefined {
  return getBabies().find((b) => b.id === id);
}

export function getBabiesByMother(userId: string): Baby[] {
  return getBabies().filter((b) => b.motherUserId === userId);
}

export function getBabiesByNurse(nurseId: string): Baby[] {
  return getBabies().filter((b) => b.assignedNurseId === nurseId);
}

export function getPendingBabiesForNurse(nurseId: string): Baby[] {
  return getBabies().filter(
    (b) =>
      b.assignedNurseId === nurseId && b.status === "pending_nurse_approval"
  );
}

export function addBaby(baby: Baby): void {
  const babies = getBabies();
  babies.push(baby);
  setBabies(babies);
}

export function updateBaby(baby: Baby): void {
  const babies = getBabies();
  const index = babies.findIndex((b) => b.id === baby.id);
  if (index !== -1) {
    babies[index] = baby;
    setBabies(babies);
  }
}

export function getReferredBabies(): Baby[] {
  return getBabies().filter((b) => b.status === "referred");
}

export function getAllBabiesForAdmin(): Baby[] {
  return getBabies();
}

export function getBabiesReadyForDischarge(): Baby[] {
  return getBabies().filter((b) => b.status === "ready_for_discharge");
}

export function getBabyByClaimCode(code: string): Baby | undefined {
  return getBabies().find(
    (b) => b.claimCode?.toUpperCase() === code.toUpperCase()
  );
}

export function generateClaimCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "KMC-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure uniqueness
  const existing = getBabies().map((b) => b.claimCode);
  if (existing.includes(code)) {
    return generateClaimCode();
  }
  return code;
}

// Logs
export function getLogs(): LogEntry[] {
  return getItem<LogEntry[]>(KEYS.LOGS, []);
}

export function setLogs(logs: LogEntry[]): void {
  setItem(KEYS.LOGS, logs);
}

export function getLogsByBaby(babyId: string): LogEntry[] {
  return getLogs().filter((l) => l.babyId === babyId);
}

export function getLogsByType(
  babyId: string,
  type: LogEntry["type"]
): LogEntry[] {
  return getLogs().filter((l) => l.babyId === babyId && l.type === type);
}

export function addLog(log: LogEntry): void {
  const logs = getLogs();
  logs.push(log);
  setLogs(logs);
}

export function updateLog(log: LogEntry): void {
  const logs = getLogs();
  const index = logs.findIndex((l) => l.id === log.id);
  if (index !== -1) {
    logs[index] = log;
    setLogs(logs);
  }
}

// Timer
export function getTimerState(): TimerState {
  return getItem<TimerState>(KEYS.TIMER, {
    isRunning: false,
    startTime: null,
    babyId: null,
    position: "chest-to-chest",
  });
}

export function setTimerState(state: TimerState): void {
  setItem(KEYS.TIMER, state);
}

// Educational content
export function getEduContent(): EduItem[] {
  return getItem<EduItem[]>(KEYS.EDU, []);
}

export function setEduContent(content: EduItem[]): void {
  setItem(KEYS.EDU, content);
}

// Milestones
export function getMilestones(): Milestone[] {
  return getItem<Milestone[]>(KEYS.MILESTONES, []);
}

export function setMilestones(milestones: Milestone[]): void {
  setItem(KEYS.MILESTONES, milestones);
}

export function getMilestonesByBaby(babyId: string): Milestone[] {
  return getMilestones().filter((m) => m.babyId === babyId);
}

export function addMilestone(milestone: Milestone): void {
  const milestones = getMilestones();
  milestones.push(milestone);
  setMilestones(milestones);
}

// Notifications
export function getNotifications(): Notification[] {
  return getItem<Notification[]>(KEYS.NOTIFICATIONS, []);
}

export function setNotifications(notifications: Notification[]): void {
  setItem(KEYS.NOTIFICATIONS, notifications);
}

export function getNotificationsByUser(userId: string): Notification[] {
  return getNotifications().filter((n) => n.userId === userId);
}

export function addNotification(notification: Notification): void {
  const notifications = getNotifications();
  notifications.push(notification);
  setNotifications(notifications);
}

export function markNotificationRead(id: string): void {
  const notifications = getNotifications();
  const index = notifications.findIndex((n) => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    setNotifications(notifications);
  }
}

// Initialization check
export function isInitialized(): boolean {
  return getItem<boolean>(KEYS.INITIALIZED, false);
}

export function markInitialized(): void {
  setItem(KEYS.INITIALIZED, true);
}

export function getAllNurses(): User[] {
  return getUsers().filter((u) => u.role === "nurse");
}

export function getNurseMaxCapacity(nurseId: string): number {
  const nurse = getUserById(nurseId);
  return nurse && nurse.maxPatients
    ? nurse.maxPatients
    : DEFAULT_NURSE_CAPACITY;
}

export function getNurseWorkload(nurseId: string): number {
  return getBabies().filter(
    (b) =>
      b.assignedNurseId === nurseId &&
      (b.status === "assigned" || b.status === "ready_for_discharge")
  ).length;
}

// Posts
export function getPosts(): Post[] {
  return getItem<Post[]>(POSTS_KEY, []);
}

export function setPosts(posts: Post[]): void {
  setItem(POSTS_KEY, posts);
}

export function getPostsByForum(forumType: ForumType): Post[] {
  return getPosts()
    .filter((p) => p.forumType === forumType)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getPostById(id: string): Post | undefined {
  return getPosts().find((p) => p.id === id);
}

export function addPost(post: Post): void {
  const posts = getPosts();
  posts.push(post);
  setPosts(posts);
}

export function updatePost(post: Post): void {
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === post.id);
  if (index !== -1) {
    posts[index] = post;
    setPosts(posts);
  }
}

export function toggleReaction(
  postId: string,
  reactionType: ReactionType,
  userId: string
): void {
  const posts = getPosts();
  const post = posts.find((p) => p.id === postId);
  if (post) {
    if (!post.reactions[reactionType]) {
      post.reactions[reactionType] = [];
    }
    const userIndex = post.reactions[reactionType].indexOf(userId);
    if (userIndex === -1) {
      post.reactions[reactionType].push(userId);
    } else {
      post.reactions[reactionType].splice(userIndex, 1);
    }
    setPosts(posts);
  }
}

// Comments
export function getComments(): Comment[] {
  return getItem<Comment[]>(COMMENTS_KEY, []);
}

export function setComments(comments: Comment[]): void {
  setItem(COMMENTS_KEY, comments);
}

export function getCommentsByPost(postId: string): Comment[] {
  return getComments()
    .filter((c) => c.postId === postId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export function addComment(comment: Comment): void {
  const comments = getComments();
  comments.push(comment);
  setComments(comments);

  // Update post comment count
  const posts = getPosts();
  const post = posts.find((p) => p.id === comment.postId);
  if (post) {
    post.commentCount = (post.commentCount || 0) + 1;
    setPosts(posts);
  }
}

export function toggleCommentReaction(
  commentId: string,
  reactionType: ReactionType,
  userId: string
): void {
  const comments = getComments();
  const comment = comments.find((c) => c.id === commentId);
  if (comment) {
    if (!comment.reactions[reactionType]) {
      comment.reactions[reactionType] = [];
    }
    const userIndex = comment.reactions[reactionType].indexOf(userId);
    if (userIndex === -1) {
      comment.reactions[reactionType].push(userId);
    } else {
      comment.reactions[reactionType].splice(userIndex, 1);
    }
    setComments(comments);
  }
}
