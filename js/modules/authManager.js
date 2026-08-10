// authManager.js
// Handles user registration, login, logout, and session state — now backed
// by the real API (hashed passwords + JWT) instead of localStorage.
//
// registerUser/loginUser/updateProfile are now async (they make network
// calls) — any page calling them needs `await`. getCurrentUser() and
// isLoggedIn() stay SYNCHRONOUS on purpose: they read from an in-memory
// cache that's populated once via `sessionReady`, so components like
// navbar.js don't need to change at all.

import { apiRequest, setToken, clearToken, getToken } from './api.js';

let currentUser = null; // in-memory cache, populated by sessionReady

function mapUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    university: u.university || '',
    department: u.department || '',
    semester: u.semester || '',
    studyGoal: u.study_goal || u.studyGoal || '',
  };
}

// ---------- INITIAL SESSION LOAD ----------
// If a token is already saved (returning visitor), fetch the current user
// so getCurrentUser() works synchronously right after this resolves.
// app.js awaits this before guarding routes or rendering the navbar.
async function loadSession() {
  if (!getToken()) {
    currentUser = null;
    return null;
  }

  try {
    const { user } = await apiRequest('/auth/me');
    currentUser = mapUser(user);
    return currentUser;
  } catch (error) {
    // Token expired/invalid — clear it so the user gets sent to login.
    clearToken();
    currentUser = null;
    return null;
  }
}

export const sessionReady = loadSession();

// ---------- REGISTER ----------

export async function registerUser({ name, email, password }) {
  try {
    const { token, user } = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    setToken(token);
    currentUser = mapUser(user);
    return { success: true, user: currentUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ---------- LOGIN ----------

export async function loginUser({ email, password }) {
  try {
    const { token, user } = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setToken(token);
    currentUser = mapUser(user);
    return { success: true, user: currentUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ---------- LOGOUT ----------

export function logoutUser() {
  clearToken();
  currentUser = null;
}

// ---------- SESSION (synchronous — reads the in-memory cache) ----------

export function getCurrentUser() {
  return currentUser;
}

export function isLoggedIn() {
  return currentUser !== null;
}

// ---------- PROFILE ----------

export async function updateProfile(updates) {
  try {
    const { user } = await apiRequest('/auth/me', { method: 'PUT', body: updates });
    currentUser = mapUser(user);
    return { success: true, user: currentUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
