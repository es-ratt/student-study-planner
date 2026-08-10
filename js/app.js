// app.js
// Single entry point loaded (as a module) on every page. Handles auth
// guarding and boots the shared UI shell (theme, navbar, sidebar, fab).
// Page-specific logic (e.g. dashboard.html's own script) runs after this.

import { initTheme } from './modules/themeManager.js';
import { isLoggedIn, sessionReady } from './modules/authManager.js';
import { storageReady } from './modules/storage.js';
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { renderFab } from './components/fab.js';

const PUBLIC_PAGES = ['index.html', 'login.html', 'register.html', '404.html', ''];

// Every page's own inline script should `import { appReady } from
// '../js/app.js'` and `await appReady;` before calling any manager
// functions (getAllTasks, getUpcomingExams, etc.) — this guarantees the
// data has been loaded from the server first.
export const appReady = Promise.all([sessionReady, storageReady]);

function getCurrentPage() {
  return window.location.pathname.split('/').pop();
}

async function boot() {
  initTheme();

  const currentPage = getCurrentPage();
  if (PUBLIC_PAGES.includes(currentPage)) return;

  await sessionReady; // make sure we know if the user is logged in yet

  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  await storageReady; // make sure app data is loaded before rendering

  renderNavbar();
  renderSidebar();
  renderFab();
}

document.addEventListener('DOMContentLoaded', boot);
