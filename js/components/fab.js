// fab.js
// Floating Action Button — bottom-right quick-add button shown on
// every logged-in page. Opens a small menu of "quick add" shortcuts.

import { createEl } from '../utils/domHelpers.js';

const QUICK_ACTIONS = [
  { label: 'New Task', icon: 'fa-list-check', event: 'quickadd:task' },
  { label: 'New Note', icon: 'fa-note-sticky', event: 'quickadd:note' },
  { label: 'New Assignment', icon: 'fa-file-lines', event: 'quickadd:assignment' },
];

export function renderFab(rootId = 'fabRoot') {
  const root = document.getElementById(rootId);
  if (!root) return;

  const fab = createEl('div', { className: 'fab-container' });

  const mainButton = createEl('button', {
    className: 'fab-main btn btn-primary rounded-circle shadow',
    html: '<i class="fa-solid fa-plus"></i>',
    attrs: { 'aria-label': 'Quick add', type: 'button' },
  });

  const menu = createEl('div', { className: 'fab-menu d-none' });

  QUICK_ACTIONS.forEach((action) => {
    const item = createEl('button', {
      className: 'fab-menu-item btn btn-light shadow-sm d-flex align-items-center gap-2',
      html: `<i class="fa-solid ${action.icon}"></i><span>${action.label}</span>`,
      attrs: { type: 'button' },
    });

    item.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent(action.event));
      closeMenu();
    });

    menu.appendChild(item);
  });

  function toggleMenu() {
    menu.classList.toggle('d-none');
    mainButton.classList.toggle('fab-main-open');
  }

  function closeMenu() {
    menu.classList.add('d-none');
    mainButton.classList.remove('fab-main-open');
  }

  mainButton.addEventListener('click', toggleMenu);

  document.addEventListener('click', (e) => {
    if (!fab.contains(e.target)) closeMenu();
  });

  fab.appendChild(menu);
  fab.appendChild(mainButton);
  root.appendChild(fab);
}