// navbar.js
// Renders the top sticky navbar, shared across every logged-in page.
// Call renderNavbar() once per page load, after the DOM's #navbarRoot exists.

import { getCurrentUser, logoutUser } from '../modules/authManager.js';
import { getCurrentTheme, toggleTheme } from '../modules/themeManager.js';

export function renderNavbar(rootId = 'navbarRoot') {
  const root = document.getElementById(rootId);
  if (!root) return;

  const user = getCurrentUser();
  const isDark = getCurrentTheme() === 'dark';

  root.innerHTML = `
    <nav class="navbar navbar-expand-lg sticky-top shadow-sm px-3 study-navbar">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="dashboard.html">
          <i class="fa-solid fa-graduation-cap me-2"></i>Study Planner
        </a>

        <div class="d-flex align-items-center ms-auto gap-3">
          <button id="themeToggleBtn" class="btn btn-sm btn-outline-secondary" aria-label="Toggle dark mode">
            <i class="fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}"></i>
          </button>

          <div class="dropdown">
            <button class="btn btn-sm btn-light dropdown-toggle d-flex align-items-center gap-2"
                    type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-circle-user"></i>
              <span>${user ? user.name : 'Guest'}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="profile.html">Profile</a></li>
              <li><a class="dropdown-item" href="settings.html">Settings</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><button id="logoutBtn" class="dropdown-item text-danger">Logout</button></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `;

  attachNavbarEvents();
}

function attachNavbarEvents() {
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      toggleTheme();
      renderNavbar();
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutUser();
      window.location.href = 'login.html';
    });
  }
}