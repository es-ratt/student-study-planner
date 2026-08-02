// analyticsManager.js
// Aggregates data from tasks, assignments, subjects, and pomodoro sessions
// into chart-ready datasets for the Analytics page. No storage writes here —
// this module only reads and computes.

import { getAllTasks } from './taskManager.js';
import { getAllAssignments } from './assignmentManager.js';
import { getAllSubjects } from './subjectManager.js';
import { getCompletedSessions } from './pomodoroManager.js';

export function getWeeklyStudyHours() {
  const sessions = getCompletedSessions();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date);
  }

  const labels = days.map((d) => d.toLocaleDateString('en-US', { weekday: 'short' }));
  const data = days.map((day) => {
    const dayString = day.toDateString();
    const minutes = sessions
      .filter((s) => new Date(s.completedAt).toDateString() === dayString)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    return Math.round((minutes / 60) * 10) / 10;
  });

  return { labels, data };
}

export function getMonthlyStudyHours() {
  const sessions = getCompletedSessions();
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const currentYear = new Date().getFullYear();

  const data = monthLabels.map((_, monthIndex) => {
    const minutes = sessions
      .filter((s) => {
        const d = new Date(s.completedAt);
        return d.getFullYear() === currentYear && d.getMonth() === monthIndex;
      })
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    return Math.round((minutes / 60) * 10) / 10;
  });

  return { labels: monthLabels, data };
}

export function getSubjectWiseStudyTime() {
  const subjects = getAllSubjects();
  return {
    labels: subjects.map((s) => s.name),
    data: subjects.map((s) => s.studyHours || 0),
  };
}

export function getTaskCompletionStats() {
  const tasks = getAllTasks();
  const completed = tasks.filter((t) => t.completed).length;
  return { completed, pending: tasks.length - completed };
}

export function getProductivityScore() {
  const tasks = getAllTasks();
  const assignments = getAllAssignments();

  const totalItems = tasks.length + assignments.length;
  if (totalItems === 0) return 0;

  const completedItems =
    tasks.filter((t) => t.completed).length +
    assignments.filter((a) => a.status === 'completed').length;

  return Math.round((completedItems / totalItems) * 100);
}

export function getStudyStreak() {
  const sessions = getCompletedSessions();
  if (sessions.length === 0) return 0;

  let streak = 0;
  const checkDate = new Date();

  while (true) {
    const dayString = checkDate.toDateString();
    const studiedThatDay = sessions.some((s) => new Date(s.completedAt).toDateString() === dayString);

    if (!studiedThatDay) break;

    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

export function getAverageDailyStudyMinutes() {
  const sessions = getCompletedSessions();
  if (sessions.length === 0) return 0;

  const minutesByDay = {};
  sessions.forEach((s) => {
    const day = new Date(s.completedAt).toDateString();
    minutesByDay[day] = (minutesByDay[day] || 0) + s.durationMinutes;
  });

  const dayTotals = Object.values(minutesByDay);
  const totalMinutes = dayTotals.reduce((sum, m) => sum + m, 0);

  return Math.round(totalMinutes / dayTotals.length);
}