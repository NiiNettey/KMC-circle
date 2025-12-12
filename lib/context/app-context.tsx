"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  User,
  Baby,
  LogEntry,
  TimerState,
  Notification,
  Language,
  UserRole,
} from "@/lib/types";
import * as storage from "@/lib/storage";
import {
  SEED_NURSES,
  SEED_ADMIN,
  DEMO_PARENT,
  SEED_EDU_CONTENT,
  DEMO_BABY,
  DEMO_REFERRED_BABY,
  DEMO_LOGS,
} from "@/lib/seed-data";
import { v4 as uuid } from "uuid";

interface AppContextType {
  // Auth
  user: User | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string
  ) => { success: boolean; error?: string };
  logout: () => void;
  signup: (
    username: string,
    password: string,
    name: string,
    locale: Language,
    role?: UserRole,
    facility?: string
  ) => { success: boolean; error?: string };
  updateUserProfile: (updates: Partial<User>) => void;

  // Babies
  babies: Baby[];
  currentBaby: Baby | null;
  setCurrentBabyId: (id: string | null) => void;
  addBaby: (baby: Omit<Baby, "id" | "createdAt">) => Baby;
  updateBaby: (baby: Baby) => void;

  // Admin baby functions
  getAllBabies: () => Baby[];
  getReferredBabies: () => Baby[];
  assignBabyToNurse: (babyId: string, nurseId: string) => boolean;
  claimBaby: (claimCode: string) => {
    success: boolean;
    baby?: Baby;
    error?: string;
  };

  // Logs
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, "id" | "timestamp">) => void;
  getLogsByBaby: (babyId: string) => LogEntry[];

  // Timer
  timer: TimerState;
  startTimer: (babyId: string, position: TimerState["position"]) => void;
  stopTimer: () => LogEntry | null;

  // Notifications
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">
  ) => void;
  markNotificationRead: (id: string) => void;

  // Nurses (for dropdown)
  nurses: User[];
  getNurseWorkload: (nurseId: string) => number;
  getNurseMaxCapacity: (nurseId: string) => number;

  // Audio support
  playAudio: (key: string) => void;

  // Refresh data
  refreshBabies: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [babies, setBabies] = useState<Baby[]>([]);
  const [currentBabyId, setCurrentBabyId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    babyId: null,
    position: "chest-to-chest",
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nurses, setNurses] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app data
  useEffect(() => {
    const initializeApp = () => {
      // Seed data if not initialized
      if (!storage.isInitialized()) {
        storage.setUsers([...SEED_NURSES, SEED_ADMIN, DEMO_PARENT]);
        storage.setEduContent(SEED_EDU_CONTENT);
        storage.setBabies([DEMO_BABY, DEMO_REFERRED_BABY]);
        storage.setLogs(DEMO_LOGS);
        storage.markInitialized();
      }

      // Load current user
      const currentUser = storage.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);

        if (currentUser.role === "parent") {
          setBabies(storage.getBabiesByMother(currentUser.id));
        } else if (currentUser.role === "admin") {
          setBabies(storage.getAllBabiesForAdmin());
        } else {
          setBabies(storage.getBabiesByNurse(currentUser.id));
        }

        // Load notifications
        setNotifications(storage.getNotificationsByUser(currentUser.id));
      }

      // Load timer state
      setTimer(storage.getTimerState());

      // Load all logs
      setLogs(storage.getLogs());

      // Load nurses for dropdown
      setNurses(storage.getUsers().filter((u) => u.role === "nurse"));

      setIsLoading(false);
    };

    initializeApp();
  }, []);

  // Persist timer state changes
  useEffect(() => {
    if (!isLoading) {
      storage.setTimerState(timer);
    }
  }, [timer, isLoading]);

  const currentBaby =
    babies.find((b) => b.id === currentBabyId) || babies[0] || null;

  const refreshBabies = useCallback(() => {
    if (!user) return;
    if (user.role === "parent") {
      setBabies(storage.getBabiesByMother(user.id));
    } else if (user.role === "admin") {
      setBabies(storage.getAllBabiesForAdmin());
    } else {
      const assignedBabies = storage.getBabiesByNurse(user.id);
      const pendingBabies = storage.getPendingBabiesForNurse(user.id);
      setBabies([...assignedBabies, ...pendingBabies]);
    }
    setLogs(storage.getLogs());
  }, [user]);

  const login = useCallback((username: string, password: string) => {
    const foundUser = storage.getUserByUsername(username);

    if (!foundUser) {
      return { success: false, error: "User not found" };
    }

    if (foundUser.password !== password) {
      return { success: false, error: "Incorrect password" };
    }

    storage.setCurrentUser(foundUser);
    setUser(foundUser);

    if (foundUser.role === "parent") {
      setBabies(storage.getBabiesByMother(foundUser.id));
    } else if (foundUser.role === "admin") {
      setBabies(storage.getAllBabiesForAdmin());
    } else {
      const assignedBabies = storage.getBabiesByNurse(foundUser.id);
      const pendingBabies = storage.getPendingBabiesForNurse(foundUser.id);
      setBabies([...assignedBabies, ...pendingBabies]);
    }

    // Load notifications
    setNotifications(storage.getNotificationsByUser(foundUser.id));

    return { success: true };
  }, []);

  const logout = useCallback(() => {
    storage.setCurrentUser(null);
    setUser(null);
    setBabies([]);
    setCurrentBabyId(null);
    setNotifications([]);
  }, []);

  const signup = useCallback(
    (
      username: string,
      password: string,
      name: string,
      locale: Language,
      role: UserRole = "parent",
      facility?: string
    ) => {
      const existingUser = storage.getUserByUsername(username);
      if (existingUser) {
        return { success: false, error: "Username already exists" };
      }

      const newUser: User = {
        id: uuid(),
        role,
        username,
        password,
        name,
        locale,
        createdAt: new Date().toISOString(),
        ...(role === "nurse" && facility ? { facility } : {}),
      };

      storage.addUser(newUser);
      storage.setCurrentUser(newUser);
      setUser(newUser);

      // Refresh nurses list if a new nurse registered
      if (role === "nurse") {
        setNurses(storage.getUsers().filter((u) => u.role === "nurse"));
      }

      return { success: true };
    },
    []
  );

  const updateUserProfile = useCallback(
    (updates: Partial<User>) => {
      if (!user) return;
      const updatedUser = { ...user, ...updates };
      storage.updateUser(updatedUser);
      storage.setCurrentUser(updatedUser);
      setUser(updatedUser);
    },
    [user]
  );

  const addBabyFn = useCallback((babyData: Omit<Baby, "id" | "createdAt">) => {
    const newBaby: Baby = {
      ...babyData,
      id: uuid(),
      createdAt: new Date().toISOString(),
    };
    storage.addBaby(newBaby);
    setBabies((prev) => [...prev, newBaby]);
    return newBaby;
  }, []);

  const updateBabyFn = useCallback((baby: Baby) => {
    storage.updateBaby(baby);
    setBabies((prev) => prev.map((b) => (b.id === baby.id ? baby : b)));
  }, []);

  const getAllBabies = useCallback(() => {
    return storage.getAllBabiesForAdmin();
  }, []);

  const getReferredBabies = useCallback(() => {
    return storage.getReferredBabies();
  }, []);

  const assignBabyToNurse = useCallback((babyId: string, nurseId: string) => {
    const baby = storage.getBabyById(babyId);
    const nurse = storage.getUserById(nurseId);
    if (!baby || !nurse) return false;

    // Respect nurse capacity
    const capacity = storage.getNurseMaxCapacity(nurseId);
    const workload = storage.getNurseWorkload(nurseId);
    if (workload >= capacity) {
      return false;
    }

    const updatedBaby: Baby = {
      ...baby,
      assignedNurseId: nurseId,
      status: "assigned",
    };
    storage.updateBaby(updatedBaby);
    setBabies((prev) => prev.map((b) => (b.id === babyId ? updatedBaby : b)));

    // Notify nurse
    const notification: Notification = {
      id: uuid(),
      userId: nurseId,
      type: "baby_assigned",
      title: "New Patient Assigned",
      message: `${baby.babyName} has been assigned to your care.`,
      read: false,
      createdAt: new Date().toISOString(),
      data: { babyId },
    };
    storage.addNotification(notification);

    return true;
  }, []);

  const claimBaby = useCallback(
    (claimCode: string) => {
      if (!user || user.role !== "parent") {
        return { success: false, error: "Only parents can claim babies" };
      }

      const baby = storage.getBabyByClaimCode(claimCode);
      if (!baby) {
        return { success: false, error: "Invalid claim code" };
      }

      if (baby.motherUserId) {
        return { success: false, error: "This baby has already been claimed" };
      }

      const updatedBaby: Baby = {
        ...baby,
        motherUserId: user.id,
        claimCode: null, // Clear the claim code after claiming
      };
      storage.updateBaby(updatedBaby);
      setBabies((prev) => [...prev, updatedBaby]);

      return { success: true, baby: updatedBaby };
    },
    [user]
  );

  const getNurseWorkload = useCallback((nurseId: string) => {
    return storage.getNurseWorkload(nurseId);
  }, []);

  const addLogFn = useCallback(
    (logData: Omit<LogEntry, "id" | "timestamp">) => {
      const newLog = {
        ...logData,
        id: uuid(),
        timestamp: new Date().toISOString(),
      } as LogEntry;
      storage.addLog(newLog);
      setLogs((prev) => [...prev, newLog]);
    },
    []
  );

  const getLogsByBabyFn = useCallback(
    (babyId: string) => {
      return logs.filter((l) => l.babyId === babyId);
    },
    [logs]
  );

  const startTimer = useCallback(
    (babyId: string, position: TimerState["position"]) => {
      const newTimer: TimerState = {
        isRunning: true,
        startTime: new Date().toISOString(),
        babyId,
        position,
      };
      setTimer(newTimer);
    },
    []
  );

  const stopTimer = useCallback(() => {
    if (!timer.isRunning || !timer.startTime || !timer.babyId || !user) {
      setTimer({
        isRunning: false,
        startTime: null,
        babyId: null,
        position: "chest-to-chest",
      });
      return null;
    }

    const endTime = new Date().toISOString();
    const startDate = new Date(timer.startTime);
    const endDate = new Date(endTime);
    const durationMinutes = Math.round(
      (endDate.getTime() - startDate.getTime()) / 60000
    );

    const newLog: LogEntry = {
      id: uuid(),
      babyId: timer.babyId,
      authorUserId: user.id,
      authorRole: user.role,
      type: "kmc_session",
      timestamp: new Date().toISOString(),
      nurseComment: null,
      immutable: user.role === "parent",
      data: {
        startTime: timer.startTime,
        endTime,
        durationMinutes,
        position: timer.position,
        notes: "",
      },
    } as LogEntry;

    storage.addLog(newLog);
    setLogs((prev) => [...prev, newLog]);

    setTimer({
      isRunning: false,
      startTime: null,
      babyId: null,
      position: "chest-to-chest",
    });

    return newLog;
  }, [timer, user]);

  const addNotificationFn = useCallback(
    (notificationData: Omit<Notification, "id" | "createdAt">) => {
      const newNotification: Notification = {
        ...notificationData,
        id: uuid(),
        createdAt: new Date().toISOString(),
      };
      storage.addNotification(newNotification);
      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );

  const markNotificationReadFn = useCallback((id: string) => {
    storage.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const playAudio = useCallback(
    (key: string) => {
      const locale = user?.locale || "en";
      if (locale === "en") return;

      const audioPath = `/audio/${locale}/${key}.mp3`;
      const audio = new Audio(audioPath);
      audio.play().catch(() => {
        console.log(`Audio file not found: ${audioPath}`);
      });
    },
    [user?.locale]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        signup,
        updateUserProfile,
        babies,
        currentBaby,
        setCurrentBabyId,
        addBaby: addBabyFn,
        updateBaby: updateBabyFn,
        getAllBabies,
        getReferredBabies,
        assignBabyToNurse,
        claimBaby,
        logs,
        addLog: addLogFn,
        getLogsByBaby: getLogsByBabyFn,
        timer,
        startTimer,
        stopTimer,
        notifications,
        addNotification: addNotificationFn,
        markNotificationRead: markNotificationReadFn,
        nurses,
        getNurseWorkload,
        getNurseMaxCapacity: storage.getNurseMaxCapacity,
        playAudio,
        refreshBabies,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
