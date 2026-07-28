import { openEditSubjectModal } from './renderModal.js';
// renderCard.js
// Responsible for turning a subject's data into an HTML card,
// and rendering the full list of subject cards into the page.
// Keeping rendering logic separate from data logic (subjectManager.js)
// makes both easier to maintain independently.

import { getAllSubjects, deleteSubject } from '../modules/subjectManager.js';
import { showToast } from './toast.js';

// Builds the HTML string for ONE subject card.
// Kept as a separate function so it can be reused (e.g. in search/filter results).
function buildSubjectCardHTML(subject) {
  return `
    <div class="col-md-4 mb-4" data-subject-id="${subject.id}">
      <div class="card h-100 shadow-sm border-0" style="border-left: 5px solid ${subject.color};">
        <div class="card-body">
          <h5 class="card-title mb-1">${subject.name}</h5>
          <p class="text-muted mb-2">${subject.teacher || 'No teacher assigned'}</p>

          <div class="d-flex justify-content-between small text-secondary mb-3">
            <span><i class="fa-solid fa-graduation-cap"></i> ${subject.credit} Credit</span>
            <span><i class="fa-solid fa-clock"></i> ${subject.studyHours}h studied</span>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary edit-subject-btn" data-id="${subject.id}">
              Edit
            </button>
            <button class="btn btn-sm btn-outline-danger delete-subject-btn" data-id="${subject.id}">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Renders ALL subjects into a given container element.
// containerId: the id of the wrapping <div> in the HTML page (e.g. "subjectsList")
export function renderSubjects(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return; // safety check — do nothing if container isn't on this page

  const subjects = getAllSubjects();

  // Show an empty-state message instead of a blank area when there's no data.
  if (subjects.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center text-muted py-5">
        <i class="fa-solid fa-book fa-2x mb-3"></i>
        <p>No subjects added yet. Click "Add Subject" to get started.</p>
      </div>
    `;
    return;
  }

  // Convert each subject into HTML and join them into one string,
  // then insert all at once (faster than inserting one-by-one in a loop).
  container.innerHTML = subjects.map(buildSubjectCardHTML).join('');

  // Attach click handlers AFTER the HTML is in the DOM —
  // elements must exist before we can attach listeners to them.
  attachCardEventListeners(containerId);
}

// Wires up Edit/Delete button clicks for the rendered cards.
function attachCardEventListeners(containerId) {
  const container = document.getElementById(containerId);

  // Event delegation would be more efficient for large lists,
  // but direct binding is simpler to understand for now.
  container.querySelectorAll('.delete-subject-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id; // read the subject id we stored earlier

      // Confirm before destructive action, to avoid accidental deletes.
      const confirmed = confirm('Are you sure you want to delete this subject?');
      if (!confirmed) return;

      deleteSubject(id);
      showToast('Subject deleted', 'success');

      // Re-render the list so the deleted card disappears immediately.
      renderSubjects(containerId);
    });
  });

  container.querySelectorAll('.edit-subject-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;

      // Open the edit modal, pre-filled with this subject's data.
      openEditSubjectModal(id);
    });
  });
}