import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { FitnessTargets } from "./calculations";

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  age: number;
  gender: "male" | "female";
  heightCm: number;
  weightKg: number;
  goal: "lose" | "maintain" | "gain" | "muscle";
  activity: "sedentary" | "light" | "moderate" | "active" | "very_active";
  lifestyle: "hostel" | "home" | "office" | "solo";
  diet: "vegetarian" | "non_vegetarian" | "vegan";
  budget: "low" | "medium" | "high";
  healthConditions: string[];
  targets: FitnessTargets;
  onboardingComplete: boolean;
  avatarDataUrl?: string;
  bio?: string;
  createdAt?: Timestamp;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number; // liters
  steps: number;
  sleepHours: number;
  meals: Array<{ name: string; calories: number; protein: number }>;
  workouts?: Workout[];
  distanceKm?: number;
  activeMinutes?: number;
  restingHr?: number;
  mood?: 1 | 2 | 3 | 4 | 5;
  energy?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface Workout {
  id: string;
  type: string; // Running, Cycling, Strength, Yoga, HIIT, Walking, Swimming
  durationMin: number;
  calories: number;
  distanceKm?: number;
  intensity?: "low" | "moderate" | "high";
  notes?: string;
}

/** Recovery score 0-100 from sleep + resting HR + active minutes balance. */
export function recoveryScore(log: Partial<DailyLog> | null | undefined): number {
  if (!log) return 0;
  const sleep = log.sleepHours ?? 0;
  const active = log.activeMinutes ?? 0;
  const rhr = log.restingHr ?? 0;
  const sleepScore = Math.min(50, (sleep / 8) * 50); // 0..50
  const rhrScore = rhr > 0 ? Math.max(0, 30 - Math.max(0, rhr - 55)) : 20; // lower is better
  const balance = active > 0 && active < 120 ? 20 : active >= 120 ? 12 : 8;
  return Math.round(Math.min(100, sleepScore + rhrScore + balance));
}

export function todayKey(d = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getDb(), "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function saveProfile(uid: string, profile: Partial<UserProfile>) {
  await setDoc(
    doc(getDb(), "users", uid),
    { ...profile, userId: uid, createdAt: serverTimestamp() },
    { merge: true },
  );
}

export async function getLog(uid: string, date: string): Promise<DailyLog | null> {
  const snap = await getDoc(doc(getDb(), "users", uid, "logs", date));
  return snap.exists() ? (snap.data() as DailyLog) : null;
}

export async function upsertLog(uid: string, date: string, patch: Partial<DailyLog>) {
  await setDoc(doc(getDb(), "users", uid, "logs", date), { date, ...patch }, { merge: true });
}

export async function getRecentLogs(uid: string, days = 7): Promise<DailyLog[]> {
  const q = query(
    collection(getDb(), "users", uid, "logs"),
    orderBy("date", "desc"),
    limit(days),
  );
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => d.data() as DailyLog).reverse();
}

export async function deleteAllUserData(uid: string) {
  const db = getDb();
  const subs = ["logs", "weights"] as const;
  for (const sub of subs) {
    const snaps = await getDocs(collection(db, "users", uid, sub));
    await Promise.all(snaps.docs.map((d) => deleteDoc(d.ref)));
  }
  await deleteDoc(doc(db, "users", uid));
}

export async function addWeight(uid: string, weightKg: number, bodyFat?: number) {
  const date = todayKey();
  await setDoc(
    doc(getDb(), "users", uid, "weights", date),
    { date, weightKg, bodyFat: bodyFat ?? null, createdAt: serverTimestamp() },
    { merge: true },
  );
  // Also update current weight on profile
  await updateDoc(doc(getDb(), "users", uid), { weightKg });
}

export async function getWeightHistory(uid: string, days = 30) {
  const q = query(
    collection(getDb(), "users", uid, "weights"),
    orderBy("date", "desc"),
    limit(days),
  );
  const snaps = await getDocs(q);
  return snaps.docs
    .map((d) => d.data() as { date: string; weightKg: number; bodyFat?: number | null })
    .reverse();
}

// Streak: count of consecutive days (ending today or yesterday) with any log
export function computeStreak(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;
  const set = new Set(logs.map((l) => l.date));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const key = todayKey(d);
    if (set.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (i === 0) {
      // allow missing today; check from yesterday
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// quoted import fix: type-only re-export
export type { FitnessTargets };