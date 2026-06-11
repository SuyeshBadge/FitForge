import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayLog, ProgressEntry } from '../types';

const KEYS = {
  DAY_LOG: 'fitforge_day_',
  PROGRESS: 'fitforge_progress',
  SETTINGS: 'fitforge_settings',
  STEP_GOAL: 'fitforge_step_goal',
};

// ── Day Logs ──

export async function getDayLog(date: string): Promise<DayLog> {
  const raw = await AsyncStorage.getItem(KEYS.DAY_LOG + date);
  if (raw) return JSON.parse(raw);
  return { date, exercises: {}, meals: {}, steps: 0 };
}

export async function saveDayLog(log: DayLog): Promise<void> {
  await AsyncStorage.setItem(KEYS.DAY_LOG + log.date, JSON.stringify(log));
}

export async function getAllDayLogs(): Promise<DayLog[]> {
  const keys = await AsyncStorage.getAllKeys();
  const dayKeys = keys.filter(k => k.startsWith(KEYS.DAY_LOG));
  const results = await AsyncStorage.multiGet(dayKeys);
  return results
    .map(([, v]) => (v ? JSON.parse(v) : null))
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date));
}

// ── Progress ──

export async function getProgress(): Promise<ProgressEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.PROGRESS);
  return raw ? JSON.parse(raw) : [];
}

export async function addProgress(entry: ProgressEntry): Promise<void> {
  const all = await getProgress();
  const idx = all.findIndex(p => p.date === entry.date);
  if (idx >= 0) all[idx] = entry;
  else all.push(entry);
  all.sort((a, b) => a.date.localeCompare(b.date));
  await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(all));
}

// ── Settings ──

export async function getSettings(): Promise<Record<string, any>> {
  const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
  return raw ? JSON.parse(raw) : {
    name: 'Suyesh',
    age: 25,
    height: 188,
    startWeight: 88.1,
    startWaist: 41,
    targetWeight: 80,
    targetWaist: 35,
    wakeUpTime: '06:30',
    stepGoal: 6000,
  };
}

export async function saveSettings(s: Record<string, any>): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(s));
}

// ── Streak ──

export async function calculateStreak(): Promise<number> {
  const logs = await getAllDayLogs();
  if (logs.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const log = logs.find(l => l.date === dateStr);
    if (log) {
      const hasActivity = Object.values(log.exercises).some(e => e.completed) || log.steps > 0;
      if (hasActivity) streak++;
      else break;
    } else {
      if (i === 0) continue; // today not logged yet is ok
      break;
    }
  }
  return streak;
}
