// settingsManager.js
// Owns the general app settings blob (notifications, reminders, etc).
// Theme/accent color fields in the same blob are owned by themeManager.js —
// this file leaves those alone and only touches its own fields.

import { storage, KEYS } from './storage.js';

const DEFAULT_SETTINGS = {
  notificationsEnabled: true,
  dailyReminderTime: '09:00',
  examReminderDaysBefore: 3,
  deadlineReminderEnabled: true,
};

export function getSettings() {
  const settings = storage.get(KEYS.SETTINGS, {});
  return { ...DEFAULT_SETTINGS, ...settings };
}

export function updateSettings(updates) {
  const settings = storage.get(KEYS.SETTINGS, {});
  const merged = { ...settings, ...updates };
  storage.set(KEYS.SETTINGS, merged);
  return getSettings();
}

export function toggleNotifications() {
  const current = getSettings();
  return updateSettings({ notificationsEnabled: !current.notificationsEnabled });
}

export function resetAllData() {
  storage.clearAll();
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return await Notification.requestPermission();
}

export function showNotification(title, options = {}) {
  const settings = getSettings();
  if (!settings.notificationsEnabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  new Notification(title, options);
}