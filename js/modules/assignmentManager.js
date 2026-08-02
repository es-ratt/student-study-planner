// assignmentManager.js
// Handles CRUD for Assignments, plus search/filter and countdown/status
// helpers used on the Assignments page and Dashboard widget.

import { storage, KEYS } from './storage.js';
import { generateId } from '../utils/idGenerator.js';
import { daysUntil } from '../utils/dateHelpers.js';

// ---------- READ ----------

export function getAllAssignments() {
  return storage.get(KEYS.ASSIGNMENTS, []);
}

export function getAssignmentById(id) {
  return getAllAssignments().find((assignment) => assignment.id === id);
}

// ---------- CREATE ----------

export function addAssignment({ title, subjectId, deadline, priority, submissionLink }) {
  const assignments = getAllAssignments();

  const newAssignment = {
    id: generateId(),
    title,
    subjectId: subjectId || null,
    deadline,
    priority: priority || 'medium',
    submissionLink: submissionLink || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  assignments.push(newAssignment);
  storage.set(KEYS.ASSIGNMENTS, assignments);

  return newAssignment;
}

// ---------- UPDATE ----------

export function updateAssignment(id, updates) {
  const assignments = getAllAssignments();
  const updatedAssignments = assignments.map((assignment) =>
    assignment.id === id ? { ...assignment, ...updates } : assignment
  );

  storage.set(KEYS.ASSIGNMENTS, updatedAssignments);
  return updatedAssignments.find((assignment) => assignment.id === id);
}

export function markAssignmentComplete(id, completed = true) {
  return updateAssignment(id, { status: completed ? 'completed' : 'pending' });
}

// ---------- DELETE ----------

export function deleteAssignment(id) {
  const assignments = getAllAssignments();
  const remaining = assignments.filter((assignment) => assignment.id !== id);
  storage.set(KEYS.ASSIGNMENTS, remaining);
}

// ---------- SEARCH / FILTER ----------

export function searchAssignments(query) {
  const assignments = getAllAssignments();
  if (!query || !query.trim()) return assignments;

  const lowerQuery = query.trim().toLowerCase();
  return assignments.filter((a) => a.title.toLowerCase().includes(lowerQuery));
}

export function filterAssignments({ status, priority, subjectId } = {}) {
  return getAllAssignments().filter((a) => {
    if (status !== undefined && a.status !== status) return false;
    if (priority !== undefined && a.priority !== priority) return false;
    if (subjectId !== undefined && a.subjectId !== subjectId) return false;
    return true;
  });
}

// ---------- STATUS / COUNTDOWN ----------

export function isOverdueAssignment(assignment) {
  const days = daysUntil(assignment.deadline);
  return assignment.status === 'pending' && days !== null && days < 0;
}

export function getUpcomingAssignments(withinDays = 7) {
  return getAllAssignments()
    .filter((a) => {
      if (a.status !== 'pending') return false;
      const days = daysUntil(a.deadline);
      return days !== null && days >= 0 && days <= withinDays;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
}