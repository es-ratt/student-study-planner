// domHelpers.js
// Small generic DOM shortcuts used across render/component files.
// Nothing app-specific lives here — just convenience wrappers.

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function createEl(tag, { className = '', html = '', attrs = {} } = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (html) el.innerHTML = html;

  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));

  return el;
}

export function clearChildren(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function toggleClass(el, className, condition) {
  el.classList.toggle(className, condition);
}

export function onAll(selector, event, handler, parent = document) {
  qsa(selector, parent).forEach((el) => el.addEventListener(event, handler));
}