// app.js
// Single entry point loaded (as a module) on every page. Handles auth
// guarding and boots the shared UI shell (theme, navbar, sidebar, fab).
// Page-specific logic (e.g. dashboard.html's own script) runs after this.

import { initTheme } from './modules/themeManager.js';
import { isLoggedIn } from './modules/authManager.js';
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { renderFab } from './components/fab.js';

const PUBLIC_PAGES = ['index.html', 'login.html', 'register.html', '404.html', ''];

function getCurrentPage() {
  return window.location.pathname.split('/').pop();
}

function guardAuth() {
  const currentPage = getCurrentPage();
  if (PUBLIC_PAGES.includes(currentPage)) return true;

  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }

  return true;
}

function initShell() {
  if (PUBLIC_PAGES.includes(getCurrentPage())) return;

  renderNavbar();
  renderSidebar();
  renderFab();
}

function boot() {
  initTheme();

  if (!guardAuth()) return;

  initShell();
}

document.addEventListener('DOMContentLoaded', boot);