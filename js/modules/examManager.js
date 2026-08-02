// examManager.js
// Handles CRUD for Exams, plus countdown/status helpers used on the
// Exams page and Dashboard "Upcoming Exams" widget.

import { storage, KEYS } from './storage.js';
import { generateId } from '../utils/idGenerator.js';
import { daysUntil } from '../utils/dateHelpers.js';

// ---------- READ ----------

export function getAllExams() {
  return storage.get(KEYS.EXAMS, []);
}

export function getExamById(id) {
  return getAllExams().find((exam) => exam.id === id);
}

// ---------- CREATE ----------

export function addExam({ name, subjectId, date, time, room }) {
  const exams = getAllExams();

  const newExam = {
    id: generateId(),
    name,
    subjectId: subjectId || null,
    date,
    time: time || '',
    room: room || '',
    prepPercentage: 0,
    createdAt: new Date().toISOString(),
  };

  exams.push(newExam);
  storage.set(KEYS.EXAMS, exams);

  return newExam;
}

// ---------- UPDATE ----------

export function updateExam(id, updates) {
  const exams = getAllExams();
  const updatedExams = exams.map((exam) =>
    exam.id === id ? { ...exam, ...updates } : exam
  );

  storage.set(KEYS.EXAMS, updatedExams);
  return updatedExams.find((exam) => exam.id === id);
}

export function setPrepPercentage(id, percentage) {
  const clamped = Math.max(0, Math.min(100, percentage));
  return updateExam(id, { prepPercentage: clamped });
}

// ---------- DELETE ----------

export function deleteExam(id) {
  const exams = getAllExams();
  const remainingExams = exams.filter((exam) => exam.id !== id);
  storage.set(KEYS.EXAMS, remainingExams);
}

// ---------- STATUS ----------

export function getExamStatus(exam) {
  const days = daysUntil(exam.date);
  if (days === null) return 'unknown';
  if (days < 0) return 'completed';
  if (days === 0) return 'today';
  if (days <= 7) return 'upcoming';
  return 'scheduled';
}

export function getUpcomingExams(withinDays = 7) {
  return getAllExams()
    .filter((exam) => {
      const days = daysUntil(exam.date);
      return days !== null && days >= 0 && days <= withinDays;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}