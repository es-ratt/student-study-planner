// pomodoroManager.js
// Owns Pomodoro timer state (durations, session counter) and persists
// completed sessions so analyticsManager.js can chart study time.
// The countdown tick itself lives in pomodoro.html's page script —
// this module only stores config + finished-session records.

import { storage } from './storage.js';

const SESSIONS_KEY = 'pomodoroSessions';
const CONFIG_KEY = 'pomodoroConfig';

const DEFAULT_CONFIG = {
  focusMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

// ---------- CONFIG ----------

export function getConfig() {
  return { ...DEFAULT_CONFIG, ...storage.get(CONFIG_KEY, {}) };
}

export function updateConfig(updates) {
  const merged = { ...getConfig(), ...updates };
  storage.set(CONFIG_KEY, merged);
  return merged;
}

// ---------- SESSIONS ----------

export function getCompletedSessions() {
  return storage.get(SESSIONS_KEY, []);
}

// Records one finished focus/break block. `subjectId` is optional and lets
// analytics attribute time to a subject when the user picks one before starting.
export function recordSession({ type = 'focus', durationMinutes, subjectId = null }) {
  const sessions = getCompletedSessions();

  const session = {
    id: `${Date.now()}`,
    type,
    durationMinutes,
    subjectId,
    completedAt: new Date().toISOString(),
  };

  sessions.push(session);
  storage.set(SESSIONS_KEY, sessions);

  return session;
}

export function getTodaySessionCount() {
  const todayString = new Date().toDateString();
  return getCompletedSessions().filter(
    (s) => s.type === 'focus' && new Date(s.completedAt).toDateString() === todayString
  ).length;
}

export function clearSessions() {
  storage.set(SESSIONS_KEY, []);
}
