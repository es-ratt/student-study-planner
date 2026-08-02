// authManager.js
// Handles user registration, login, logout, and session state.
// NOTE: this is localStorage-only auth (no real backend/hashing) —
// fine for a student frontend project, NOT secure for production use.

import { storage, KEYS } from './storage.js';
import { generateId } from '../utils/idGenerator.js';

const SESSION_KEY = 'session'; // stores the currently logged-in user's id

// ---------- REGISTER ----------

export function registerUser({ name, email, password }) {
  const users = storage.get(KEYS.USER, []);

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const newUser = {
    id: generateId(),
    name,
    email,
    password,
    university: '',
    department: '',
    semester: '',
    studyGoal: '',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  storage.set(KEYS.USER, users);

  return { success: true, user: newUser };
}

// ---------- LOGIN ----------

export function loginUser({ email, password }) {
  const users = storage.get(KEYS.USER, []);
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== password) {
    return { success: false, error: 'Incorrect email or password.' };
  }

  storage.set(SESSION_KEY, { userId: user.id });
  return { success: true, user };
}

// ---------- LOGOUT ----------

export function logoutUser() {
  storage.remove(SESSION_KEY);
}

// ---------- SESSION ----------

export function getCurrentUser() {
  const session = storage.get(SESSION_KEY, null);
  if (!session) return null;

  const users = storage.get(KEYS.USER, []);
  return users.find((u) => u.id === session.userId) || null;
}

export function isLoggedIn() {
  return getCurrentUser() !== null;
}

// ---------- PROFILE ----------

export function updateProfile(updates) {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: 'Not logged in.' };

  const users = storage.get(KEYS.USER, []);
  const updatedUsers = users.map((u) =>
    u.id === currentUser.id ? { ...u, ...updates } : u
  );

  storage.set(KEYS.USER, updatedUsers);
  return { success: true, user: updatedUsers.find((u) => u.id === currentUser.id) };
}