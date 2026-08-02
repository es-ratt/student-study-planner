// sidebar.js
// Renders the left navigation sidebar, shared across every logged-in page.
// Highlights the current page's link based on the HTML filename.

const NAV_ITEMS = [
  { label: 'Dashboard', href: 'dashboard.html', icon: 'fa-gauge-high' },
  { label: 'Planner', href: 'planner.html', icon: 'fa-list-check' },
  { label: 'Subjects', href: 'subjects.html', icon: 'fa-book' },
  { label: 'Assignments', href: 'assignments.html', icon: 'fa-file-lines' },
  { label: 'Exams', href: 'exams.html', icon: 'fa-graduation-cap' },
  { label: 'Calendar', href: 'calendar.html', icon: 'fa-calendar-days' },
  { label: 'Notes', href: 'notes.html', icon: 'fa-note-sticky' },
  { label: 'Pomodoro', href: 'pomodoro.html', icon: 'fa-clock' },
  { label: 'Analytics', href: 'analytics.html', icon: 'fa-chart-line' },
];

export function renderSidebar(rootId = 'sidebarRoot') {
  const root = document.getElementById(rootId);
  if (!root) return;

  const currentPage = window.location.pathname.split('/').pop();

  const linksHTML = NAV_ITEMS.map((item) => {
    const isActive = item.href === currentPage;
    return `
      <li class="nav-item">
        <a class="nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}" href="${item.href}">
          <i class="fa-solid ${item.icon}"></i>
          <span>${item.label}</span>
        </a>
      </li>
    `;
  }).join('');

  root.innerHTML = `
    <aside class="sidebar d-flex flex-column p-3">
      <ul class="nav nav-pills flex-column gap-1">
        ${linksHTML}
      </ul>
    </aside>
  `;
}