// calendarManager.js
// Feeds FullCalendar.js on calendar.html. Combines read-only events derived
// from tasks/assignments/exams with user-created custom events (study
// sessions, generic events), and color-codes everything by type/subject.

import { storage } from './storage.js';
import { generateId } from '../utils/idGenerator.js';
import { getAllTasks } from './taskManager.js';
import { getAllAssignments } from './assignmentManager.js';
import { getAllExams } from './examManager.js';
import { getSubjectById } from './subjectManager.js';

const EVENTS_KEY = 'calendarEvents';

const TYPE_COLORS = {
  task: '#6c5ce7',
  assignment: '#ff8a65',
  exam: '#e5566f',
  study_session: '#33b679',
  event: '#f4b942',
};

// ---------- CUSTOM EVENTS (study sessions / generic events) ----------

export function getCustomEvents() {
  return storage.get(EVENTS_KEY, []);
}

export function addCustomEvent({ title, date, endDate, type = 'event', subjectId }) {
  const events = getCustomEvents();

  const newEvent = {
    id: generateId(),
    title,
    date,
    endDate: endDate || date,
    type, // 'study_session' | 'event'
    subjectId: subjectId || null,
    createdAt: new Date().toISOString(),
  };

  events.push(newEvent);
  storage.set(EVENTS_KEY, events);

  return newEvent;
}

export function deleteCustomEvent(id) {
  const events = getCustomEvents();
  storage.set(EVENTS_KEY, events.filter((e) => e.id !== id));
}

// ---------- MERGED FEED FOR FULLCALENDAR ----------

// Returns an array shaped for FullCalendar's `events` option:
// { id, title, start, end, color, extendedProps: { type } }
export function getCalendarEvents() {
  const events = [];

  getAllTasks().forEach((task) => {
    if (!task.deadline) return;
    events.push({
      id: `task-${task.id}`,
      title: `📝 ${task.title}`,
      start: task.deadline,
      allDay: true,
      color: subjectColorOr(task.subjectId, TYPE_COLORS.task),
      extendedProps: { type: 'task', refId: task.id },
    });
  });

  getAllAssignments().forEach((assignment) => {
    if (!assignment.deadline) return;
    events.push({
      id: `assignment-${assignment.id}`,
      title: `📄 ${assignment.title}`,
      start: assignment.deadline,
      allDay: true,
      color: subjectColorOr(assignment.subjectId, TYPE_COLORS.assignment),
      extendedProps: { type: 'assignment', refId: assignment.id },
    });
  });

  getAllExams().forEach((exam) => {
    if (!exam.date) return;
    events.push({
      id: `exam-${exam.id}`,
      title: `🎓 ${exam.name}`,
      start: exam.time ? `${exam.date}T${exam.time}` : exam.date,
      allDay: !exam.time,
      color: TYPE_COLORS.exam,
      extendedProps: { type: 'exam', refId: exam.id },
    });
  });

  getCustomEvents().forEach((event) => {
    events.push({
      id: `custom-${event.id}`,
      title: event.type === 'study_session' ? `⏱️ ${event.title}` : `📌 ${event.title}`,
      start: event.date,
      end: event.endDate,
      allDay: true,
      color: subjectColorOr(event.subjectId, TYPE_COLORS[event.type] || TYPE_COLORS.event),
      extendedProps: { type: event.type, refId: event.id },
    });
  });

  return events;
}

function subjectColorOr(subjectId, fallback) {
  if (!subjectId) return fallback;
  const subject = getSubjectById(subjectId);
  return subject ? subject.color : fallback;
}
