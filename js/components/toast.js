// toast.js
// Reusable notification component. Any module can call showToast()
// to display a temporary success/error/info message to the user.
// Uses Bootstrap 5's built-in Toast component under the hood.

// Ensures a single container div exists in the DOM to hold all toasts.
// We create it once and reuse it, instead of duplicating containers.
function getToastContainer() {
  let container = document.getElementById('toastContainer');

  if (!container) {
    // Container doesn't exist yet — create it and attach to the page.
    container = document.createElement('div');
    container.id = 'toastContainer';

    // Fixed position, top-right corner, above other content (z-index).
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1080';

    document.body.appendChild(container);
  }

  return container;
}

// Main function other modules will call.
// type: 'success' | 'error' | 'info' | 'warning' — controls the color.
export function showToast(message, type = 'success') {
  const container = getToastContainer();

  // Map type to a Bootstrap background color class.
  const colorMap = {
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-info',
    warning: 'bg-warning',
  };
  const colorClass = colorMap[type] || colorMap.info;

  // Unique ID per toast so multiple toasts can exist without clashing.
  const toastId = `toast-${Date.now()}`;

  // Build the toast markup. `text-white` keeps text readable on colored backgrounds.
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-white ${colorClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  // Insert the new toast into the container.
  container.insertAdjacentHTML('beforeend', toastHTML);

  // Grab the DOM element we just inserted so Bootstrap can control it.
  const toastElement = document.getElementById(toastId);

  // Bootstrap's Toast API — `bootstrap` global comes from the Bootstrap JS bundle,
  // which must be loaded via <script> tag in every HTML page.
  const bsToast = new bootstrap.Toast(toastElement, { delay: 3000 });
  bsToast.show();

  // Clean up the DOM after the toast finishes hiding, so old toasts
  // don't pile up invisibly in the container over time.
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}