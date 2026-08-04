// themeManager.js
// Owns dark/light mode + accent color. Toggling sets a data-theme attribute
// on <html>, which dark-mode.css hooks into to re-point CSS variables.

import { storage } from './storage.js';

const THEME_KEY = 'theme';
const ACCENT_KEY = 'accentColor';

const DEFAULT_ACCENT = '#6c5ce7';

export function getCurrentTheme() {
  return storage.get(THEME_KEY, 'light');
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function initTheme() {
  const theme = getCurrentTheme();
  applyTheme(theme);

  const accent = getAccentColor();
  document.documentElement.style.setProperty('--accent-color', accent);
}

export function setTheme(theme) {
  storage.set(THEME_KEY, theme);
  applyTheme(theme);
}

export function toggleTheme() {
  const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function getAccentColor() {
  return storage.get(ACCENT_KEY, DEFAULT_ACCENT);
}

export function setAccentColor(color) {
  storage.set(ACCENT_KEY, color);
  document.documentElement.style.setProperty('--accent-color', color);
}
