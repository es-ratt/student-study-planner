// taskManager.js
// Handles CRUD for the Study Planner's generic tasks, plus search/filter/sort
// helpers used on planner.html and the Dashboard "Today's Tasks" widget.

import { storage, KEYS } from './storage.js';
import { generateId } from '../utils/idGenerator.js';
import { daysUntil, isToday } from '../utils/dateHelpers.js';

// ---------- READ ----------

export function getAllTasks() {
  return storage.get(KEYS.TASKS, []);
}

export function getTaskById(id) {
  return getAllTasks().find((task) => task.id === id);
}

// ---------- CREATE ----------

export function addTask({ title, subjectId, priority, deadline, notes }) {
  const tasks = getAllTasks();

  const newTask = {
    id: generateId(),
    title,
    subjectId: subjectId || null,
    priority: priority || 'medium',
    deadline: deadline || '',
    notes: notes || '',
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  storage.set(KEYS.TASKS, tasks);

  return newTask;
}

// ---------- UPDATE ----------

export function updateTask(id, updates) {
  const tasks = getAllTasks();
  const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, ...updates } : task));

  storage.set(KEYS.TASKS, updatedTasks);
  return updatedTasks.find((task) => task.id === id);
}

export function toggleTaskComplete(id) {
  const task = getTaskById(id);
  if (!task) return null;
  return updateTask(id, { completed: !task.completed });
}

// ---------- DELETE ----------

export function deleteTask(id) {
  const tasks = getAllTasks();
  const remaining = tasks.filter((task) => task.id !== id);
  storage.set(KEYS.TASKS, remaining);
}

// ---------- SEARCH / FILTER / SORT ----------

export function searchTasks(query) {
  const tasks = getAllTasks();
  if (!query || !query.trim()) return tasks;

  const lowerQuery = query.trim().toLowerCase();
  return tasks.filter((t) => t.title.toLowerCase().includes(lowerQuery));
}

export function filterTasks({ completed, priority, subjectId } = {}) {
  return getAllTasks().filter((t) => {
    if (completed !== undefined && t.completed !== completed) return false;
    if (priority !== undefined && t.priority !== priority) return false;
    if (subjectId !== undefined && t.subjectId !== subjectId) return false;
    return true;
  });
}

const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

export function sortTasks(tasks, sortBy = 'deadline') {
  const list = [...tasks];

  switch (sortBy) {
    case 'priority':
      return list.sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]);
    case 'title':
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case 'deadline':
    default:
      return list.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
  }
}

// ---------- DASHBOARD HELPERS ----------

export function getTodayTasks() {
  return getAllTasks().filter((t) => !t.completed && (isToday(t.deadline) || !t.deadline));
}

export function getUpcomingTasks(withinDays = 7) {
  return getAllTasks()
    .filter((t) => {
      if (t.completed) return false;
      const days = daysUntil(t.deadline);
      return days !== null && days >= 0 && days <= withinDays;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
}
