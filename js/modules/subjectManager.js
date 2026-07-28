// subjectManager.js
// Handles all CRUD (Create, Read, Update, Delete) operations for Subjects.
// This is the FIRST real feature module — it sets the pattern that
// taskManager, examManager, etc. will all copy.

import { storage, KEYS } from './storage.js';
import { generateId } from '../utils/idGenerator.js';

// ---------- READ ----------

// Returns the full list of subjects from storage.
// Every other function in this file builds on top of this one.
export function getAllSubjects() {
  return storage.get(KEYS.SUBJECTS, []); // default to empty array if none exist
}

// Finds and returns a single subject by its ID.
// Returns undefined if not found (caller should handle that case).
export function getSubjectById(id) {
  const subjects = getAllSubjects();
  return subjects.find((subject) => subject.id === id);
}

// ---------- CREATE ----------

// Adds a new subject to storage.
// Accepts a plain object with the subject's fields (name, teacher, etc.)
export function addSubject({ name, teacher, credit, color, studyHours }) {
  const subjects = getAllSubjects();

  // Build the full subject record, including fields the caller doesn't provide
  const newSubject = {
    id: generateId(),          // unique identifier, used for edit/delete lookups
    name,                      // subject name, e.g. "Data Structures"
    teacher: teacher || '',    // optional field, default to empty string
    credit: credit || 0,       // optional numeric field
    color: color || '#4361ee', // used for calendar/task color-coding
    studyHours: studyHours || 0, // running total, updated by other modules later
    createdAt: new Date().toISOString(), // useful for sorting "recently added"
  };

  // Append the new subject and persist the whole updated array.
  // We always save the FULL array back — localStorage has no concept
  // of "insert one row", so this is the standard pattern for all CRUD here.
  subjects.push(newSubject);
  storage.set(KEYS.SUBJECTS, subjects);

  return newSubject; // return it so the UI can immediately render it
}

// ---------- UPDATE ----------

// Updates an existing subject's fields by ID.
// `updates` is a partial object — only the fields being changed.
export function updateSubject(id, updates) {
  const subjects = getAllSubjects();

  // Map over all subjects; only the matching one gets merged with updates.
  // This avoids mutating objects directly, which is safer and more predictable.
  const updatedSubjects = subjects.map((subject) =>
    subject.id === id ? { ...subject, ...updates } : subject
  );

  storage.set(KEYS.SUBJECTS, updatedSubjects);

  // Return the updated subject so the caller can use it right away
  return updatedSubjects.find((subject) => subject.id === id);
}

// ---------- DELETE ----------

// Removes a subject by ID.
// IMPORTANT: this does NOT delete tasks/assignments/exams linked to this
// subject — that cascading logic will be handled when we build those
// modules, so they can decide whether to delete or "unlink" related items.
export function deleteSubject(id) {
  const subjects = getAllSubjects();

  // Keep everything EXCEPT the subject with the matching id
  const remainingSubjects = subjects.filter((subject) => subject.id !== id);

  storage.set(KEYS.SUBJECTS, remainingSubjects);
}