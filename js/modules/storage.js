// storage.js
// Single source of truth for all localStorage access.
// No other module should call localStorage.getItem/setItem directly —
// everything must go through this file. This makes it easy to swap
// localStorage for a real backend (API) later without touching other files.

// Prefix added to every key, so our app's data doesn't clash with
// other localStorage data that might exist in the same browser.
const STORAGE_PREFIX = 'studyPlanner_';

export const storage = {
  // Reads data for a given key.
  // If the key doesn't exist yet, returns defaultValue instead of crashing.
  get(key, defaultValue = []) {
    try {
      // Fetch the raw string from localStorage (localStorage only stores strings)
      const raw = localStorage.getItem(STORAGE_PREFIX + key);

      // If something was found, parse it back into an object/array.
      // If nothing was found (raw is null), fall back to defaultValue.
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (error) {
      // If JSON.parse fails (corrupted data) or storage is blocked,
      // log the error and return a safe default instead of breaking the app.
      console.error(`Storage read error for key "${key}":`, error);
      return defaultValue;
    }
  },

  // Saves data for a given key.
  set(key, value) {
    try {
      // Convert the JS value (array/object) into a string, since
      // localStorage can only store strings.
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true; // success flag, useful for error handling in UI
    } catch (error) {
      // This can fail if storage is full or disabled (private browsing etc.)
      console.error(`Storage write error for key "${key}":`, error);
      return false;
    }
  },

  // Deletes a single key's data.
  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  // Deletes ALL app data from localStorage.
  // Used by Settings > "Reset Local Storage" feature.
  clearAll() {
    Object.keys(localStorage)
      // Only remove keys that belong to this app (filter by our prefix),
      // so we don't accidentally delete unrelated site data.
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};

// Centralized list of all storage keys used across the app.
// IMPORTANT: every module must import and use these constants
// instead of typing the key name manually — this prevents typos
// (e.g. 'tasks' vs 'task') that would silently create duplicate/lost data.
export const KEYS = {
  TASKS: 'tasks',
  SUBJECTS: 'subjects',
  ASSIGNMENTS: 'assignments',
  EXAMS: 'exams',
  NOTES: 'notes',
  SETTINGS: 'settings',
  USER: 'user',
};