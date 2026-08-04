// dateHelpers.js
// Small date utilities shared by every module that deals with deadlines,
// exam dates, calendar events, or streak calculations.

// Returns the number of whole days between today and a given date string.
// Positive = in the future, negative = in the past, 0 = today.
// Returns null if the date is missing/invalid so callers can bail out safely.
export function daysUntil(dateString) {
  if (!dateString) return null;

  const target = new Date(dateString);
  if (isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target - today) / msPerDay);
}

// Human-friendly countdown label, e.g. "in 3 days", "Today", "2 days overdue".
export function formatCountdown(dateString) {
  const days = daysUntil(dateString);
  if (days === null) return '';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1) return `In ${days} days`;
  return `${Math.abs(days)} days overdue`;
}

// Formats a date string into "Jan 5, 2026" style, used across cards/tables.
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Formats a time string (HH:MM, 24h) into "9:00 AM" style.
export function formatTime(timeString) {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours)) return timeString;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function isToday(dateString) {
  return daysUntil(dateString) === 0;
}

export function isPast(dateString) {
  const days = daysUntil(dateString);
  return days !== null && days < 0;
}

// Returns an ISO date string (YYYY-MM-DD) for "today", useful as a default
// value for <input type="date"> fields.
export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// Returns an array of 7 Date objects for the current week, Sunday first.
export function getCurrentWeekDates() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
}
