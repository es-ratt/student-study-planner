// storage.js
// Single source of truth for all app data (tasks, subjects, assignments,
// exams, notes). Every manager module (taskManager.js, subjectManager.js...)
// calls storage.get()/storage.set() exactly like before — this file is the
// ONLY thing that changed to talk to the backend instead of localStorage.
//
// How it works:
//   1. On page load, `storageReady` fetches everything from the API into
//      an in-memory cache.
//   2. storage.get() reads synchronously from that cache (so every manager
//      function that expects a synchronous return value keeps working).
//   3. storage.set() updates the cache immediately (synchronous, so the UI
//      stays responsive), then in the background, diffs the change against
//      what was last synced and sends the right POST/PUT/DELETE calls to
//      the API. If a background sync call fails, it's logged to the
//      console — the local cache still reflects the user's change so the
//      UI doesn't feel broken, but you won't see a toast for it here.
//
// SETTINGS is intentionally NOT synced to the backend — it's low-stakes,
// device-specific UI state, so it stays in localStorage like before.

import { apiRequest, getToken } from './api.js';

const STORAGE_PREFIX = 'studyPlanner_';

// Maps each syncable KEYS.* value to its API endpoint.
const SYNC_ENDPOINTS = {
  tasks: '/tasks',
  subjects: '/subjects',
  assignments: '/assignments',
  exams: '/exams',
  notes: '/notes',
};

// In-memory cache: { tasks: [...], subjects: [...], ... }
const cache = {};

// ---------- INITIAL LOAD ----------
// Fetches every syncable resource from the API once, so storage.get()
// can be synchronous afterwards. Pages should `await storageReady`
// before rendering anything that reads app data (app.js does this).
async function initCache() {
  if (!getToken()) {
    // Not logged in (public pages) — nothing to load.
    Object.keys(SYNC_ENDPOINTS).forEach((key) => { cache[key] = []; });
    return;
  }

  await Promise.all(
    Object.entries(SYNC_ENDPOINTS).map(async ([key, endpoint]) => {
      try {
        const { items } = await apiRequest(endpoint);
        cache[key] = items;
      } catch (error) {
        console.error(`Failed to load "${key}" from server:`, error);
        cache[key] = [];
      }
    })
  );
}

export const storageReady = initCache();

// ---------- BACKGROUND SYNC ----------
// Compares the array being saved against what's currently cached, and
// sends the minimum set of create/update/delete requests to match.
function syncToBackend(key, previousItems, newItems) {
  const endpoint = SYNC_ENDPOINTS[key];
  const previousById = new Map(previousItems.map((item) => [item.id, item]));
  const newById = new Map(newItems.map((item) => [item.id, item]));

  const requests = [];

  // Created or updated
  for (const [id, item] of newById) {
    const before = previousById.get(id);
    if (!before) {
      requests.push(apiRequest(endpoint, { method: 'POST', body: item }));
    } else if (JSON.stringify(before) !== JSON.stringify(item)) {
      requests.push(apiRequest(`${endpoint}/${id}`, { method: 'PUT', body: item }));
    }
  }

  // Deleted
  for (const id of previousById.keys()) {
    if (!newById.has(id)) {
      requests.push(apiRequest(`${endpoint}/${id}`, { method: 'DELETE' }));
    }
  }

  if (requests.length === 0) return;

  Promise.allSettled(requests).then((results) => {
    results.forEach((result) => {
      if (result.status === 'rejected') {
        console.error(`Background sync failed for "${key}":`, result.reason);
      }
    });
  });
}

export const storage = {
  // Reads data for a given key. Synced keys read from the in-memory
  // cache (populate it first via `await storageReady`); everything else
  // (SETTINGS) falls back to localStorage like before.
  get(key, defaultValue = []) {
    if (key in SYNC_ENDPOINTS) {
      return key in cache ? cache[key] : defaultValue;
    }

    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (error) {
      console.error(`Storage read error for key "${key}":`, error);
      return defaultValue;
    }
  },

  // Saves data for a given key. Synced keys update the cache immediately
  // and fire off background API calls; everything else goes to
  // localStorage like before.
  set(key, value) {
    if (key in SYNC_ENDPOINTS) {
      const previous = cache[key] || [];
      cache[key] = value;
      syncToBackend(key, previous, value);
      return true;
    }

    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage write error for key "${key}":`, error);
      return false;
    }
  },

  // Deletes a single key's data.
  remove(key) {
    if (key in SYNC_ENDPOINTS) {
      const previous = cache[key] || [];
      cache[key] = [];
      syncToBackend(key, previous, []);
      return;
    }
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  // Clears all locally-cached/local app data. Used by
  // Settings > "Reset Local Storage". Does NOT delete server data —
  // it's a local-only reset (matches the old localStorage-only behavior
  // for the non-synced keys; synced keys just get re-fetched on next load).
  clearAll() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    Object.keys(cache).forEach((key) => { cache[key] = []; });
  },
};

// Centralized list of all storage keys used across the app.
export const KEYS = {
  TASKS: 'tasks',
  SUBJECTS: 'subjects',
  ASSIGNMENTS: 'assignments',
  EXAMS: 'exams',
  NOTES: 'notes',
  SETTINGS: 'settings',
};
