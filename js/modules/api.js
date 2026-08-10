// api.js
// Thin fetch wrapper for talking to the backend API.
// Handles the base URL, attaching the JWT token, and parsing responses.
// Every other module that needs the backend (storage.js, authManager.js)
// goes through this file instead of calling fetch() directly.

// Change this if your backend runs somewhere other than localhost:5000.
const API_BASE = 'http://localhost:5000/api';

const TOKEN_KEY = 'studyPlanner_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    // Backend unreachable (not running, wrong port, no network, etc.)
    throw new Error('Could not reach the server. Is the backend running?');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}
