// reminderManager.js
// Fires a browser notification 2 days, 1 day, and 12 hours before each
// exam, and before any task/assignment marked High priority.
//
// Runs entirely in the browser — no backend or extension involved.
// Uses the existing showNotification()/requestNotificationPermission()
// from settingsManager.js. Checked once when the app loads, then every
// CHECK_INTERVAL_MS while any page of the app stays open in a tab.
//
// A "sent" record is kept in localStorage (not synced to the server —
// it's just local device state) so the same reminder never fires twice.

import { getAllExams } from './examManager.js';
import { getAllTasks } from './taskManager.js';
import { getAllAssignments } from './assignmentManager.js';
import { getSettings, showNotification, requestNotificationPermission } from './settingsManager.js';

const SENT_KEY = 'studyPlanner_sentReminders'; // raw localStorage key, not synced
const REMINDER_OFFSETS_HOURS = [48, 24, 12]; // 2 days, 1 day, 12 hours before
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // re-check every 5 minutes while a tab is open

function getSentSet() {
  try {
    return JSON.parse(localStorage.getItem(SENT_KEY) || '{}');
  } catch {
    return {};
  }
}

function markSent(key) {
  const sent = getSentSet();
  sent[key] = true;
  localStorage.setItem(SENT_KEY, JSON.stringify(sent));
}

// Exams have separate date + time fields; tasks/assignments only store a
// date, so we treat those as due at the end of that day (23:59).
function getDueDate(item, kind) {
  if (kind === 'exam') return new Date(`${item.date}T${item.time || '23:59'}`);
  return new Date(`${item.deadline}T23:59:00`);
}

function isImportant(item, kind) {
  if (kind === 'exam') return true; // every exam gets reminders
  return item.priority === 'high';
}

function labelFor(kind) {
  return kind === 'exam' ? 'Exam' : kind === 'task' ? 'Task' : 'Assignment';
}

function offsetText(offsetHours) {
  if (offsetHours === 48) return 'in 2 days';
  if (offsetHours === 24) return 'in 1 day';
  return 'in 12 hours';
}

function checkReminders() {
  const settings = getSettings();
  if (!settings.notificationsEnabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const exams = getAllExams();
  const tasks = getAllTasks().filter((t) => !t.completed);
  const assignments = getAllAssignments().filter((a) => a.status !== 'completed');

  const items = [
    ...exams.map((item) => ({ item, kind: 'exam' })),
    ...tasks.map((item) => ({ item, kind: 'task' })),
    ...assignments.map((item) => ({ item, kind: 'assignment' })),
  ];

  const sent = getSentSet();
  const now = Date.now();

  for (const { item, kind } of items) {
    if (!isImportant(item, kind)) continue;

    const dueDate = getDueDate(item, kind);
    if (Number.isNaN(dueDate.getTime())) continue;

    for (const offsetHours of REMINDER_OFFSETS_HOURS) {
      const triggerTime = dueDate.getTime() - offsetHours * 60 * 60 * 1000;
      const sentKey = `${item.id}:${offsetHours}`;

      // Fire once we've crossed the trigger time, as long as we haven't
      // already sent it and the deadline itself hasn't passed yet.
      if (now >= triggerTime && now < dueDate.getTime() && !sent[sentKey]) {
        const name = item.title || item.name || 'Untitled';
        showNotification(`${labelFor(kind)} coming up ${offsetText(offsetHours)}`, {
          body: `${name} — due ${dueDate.toLocaleString()}`,
        });
        markSent(sentKey);
      }
    }
  }
}

// ---------- setup ----------
// Called once from app.js after login, on every protected page.
export async function initReminders() {
  const settings = getSettings();
  if (!settings.notificationsEnabled) return;

  if ('Notification' in window && Notification.permission === 'default') {
    await requestNotificationPermission();
  }

  checkReminders(); // check immediately on load
  setInterval(checkReminders, CHECK_INTERVAL_MS); // and periodically while the tab stays open
}
