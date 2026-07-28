// renderModal.js
// Builds and controls the Add/Edit Subject modal (a Bootstrap 5 modal).
// This same pattern (inject HTML once, open/close via Bootstrap JS API)
// will be reused later for Task, Exam, and Note modals too.

import { addSubject, updateSubject, getSubjectById } from '../modules/subjectManager.js';
import { showToast } from './toast.js';
import { renderSubjects } from './renderCard.js';

// Injects the modal's HTML into the page ONCE.
// Called on page load, before any "Add Subject" button is clicked.
export function injectSubjectModal() {
  // Avoid injecting twice if this function accidentally runs more than once.
  if (document.getElementById('subjectModal')) return;

  const modalHTML = `
    <div class="modal fade" id="subjectModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="subjectModalTitle">Add Subject</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <form id="subjectForm">
              <!-- Hidden field stores the subject id ONLY when editing.
                   Empty means "this is a new subject". -->
              <input type="hidden" id="subjectId" value="" />

              <div class="mb-3">
                <label class="form-label">Subject Name *</label>
                <input type="text" class="form-control" id="subjectName" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Teacher Name</label>
                <input type="text" class="form-control" id="subjectTeacher" />
              </div>

              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label">Credit</label>
                  <input type="number" class="form-control" id="subjectCredit" min="0" step="0.5" />
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label">Color</label>
                  <input type="color" class="form-control form-control-color w-100" id="subjectColor" value="#4361ee" />
                </div>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="saveSubjectBtn">Save Subject</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Append the modal markup to the end of <body> so it isn't nested
  // inside other elements that might clip or hide it (e.g. overflow:hidden containers).
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Wire up the Save button once, right after the modal is created.
  document.getElementById('saveSubjectBtn').addEventListener('click', handleSaveSubject);
}

// Opens the modal in "Add" mode — form starts empty.
export function openAddSubjectModal() {
  document.getElementById('subjectModalTitle').textContent = 'Add Subject';

  // Clear all fields so leftover data from a previous edit doesn't appear.
  document.getElementById('subjectId').value = '';
  document.getElementById('subjectName').value = '';
  document.getElementById('subjectTeacher').value = '';
  document.getElementById('subjectCredit').value = '';
  document.getElementById('subjectColor').value = '#4361ee';

  showModal();
}

// Opens the modal in "Edit" mode — form pre-filled with existing data.
export function openEditSubjectModal(id) {
  const subject = getSubjectById(id);
  if (!subject) return; // safety check in case the id no longer exists

  document.getElementById('subjectModalTitle').textContent = 'Edit Subject';

  // Pre-fill every field with the subject's current values.
  document.getElementById('subjectId').value = subject.id;
  document.getElementById('subjectName').value = subject.name;
  document.getElementById('subjectTeacher').value = subject.teacher;
  document.getElementById('subjectCredit').value = subject.credit;
  document.getElementById('subjectColor').value = subject.color;

  showModal();
}

// Uses Bootstrap's JS Modal API to actually display the modal element.
function showModal() {
  const modalElement = document.getElementById('subjectModal');
  const bsModal = new bootstrap.Modal(modalElement);
  bsModal.show();
}

// Runs when "Save Subject" is clicked — decides whether to
// add a new subject or update an existing one, based on subjectId.
function handleSaveSubject() {
  const id = document.getElementById('subjectId').value;
  const name = document.getElementById('subjectName').value.trim();
  const teacher = document.getElementById('subjectTeacher').value.trim();
  const credit = parseFloat(document.getElementById('subjectCredit').value) || 0;
  const color = document.getElementById('subjectColor').value;

  // Basic validation — name is required, everything else is optional.
  if (!name) {
    showToast('Subject name is required', 'error');
    return;
  }

  if (id) {
    // id exists → we're editing an existing subject
    updateSubject(id, { name, teacher, credit, color });
    showToast('Subject updated successfully', 'success');
  } else {
    // no id → this is a brand new subject
    addSubject({ name, teacher, credit, color });
    showToast('Subject added successfully', 'success');
  }

  // Refresh the card list so the change appears immediately.
  renderSubjects('subjectsList');

  // Close the modal after saving.
  const modalElement = document.getElementById('subjectModal');
  bootstrap.Modal.getInstance(modalElement).hide();
}