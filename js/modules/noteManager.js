// noteManager.js
// Handles CRUD for Notes, plus search, category filtering, and pinning
// used on notes.html and the Dashboard "Recent Notes" widget.

import { storage, KEYS } from './storage.js';
import { generateId } from '../utils/idGenerator.js';

// ---------- READ ----------

export function getAllNotes() {
  return storage.get(KEYS.NOTES, []);
}

export function getNoteById(id) {
  return getAllNotes().find((note) => note.id === id);
}

// ---------- CREATE ----------

export function addNote({ title, content, category, subjectId }) {
  const notes = getAllNotes();

  const newNote = {
    id: generateId(),
    title: title || 'Untitled note',
    content: content || '',
    category: category || 'General',
    subjectId: subjectId || null,
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  notes.unshift(newNote);
  storage.set(KEYS.NOTES, notes);

  return newNote;
}

// ---------- UPDATE ----------

export function updateNote(id, updates) {
  const notes = getAllNotes();
  const updatedNotes = notes.map((note) =>
    note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
  );

  storage.set(KEYS.NOTES, updatedNotes);
  return updatedNotes.find((note) => note.id === id);
}

export function togglePinNote(id) {
  const note = getNoteById(id);
  if (!note) return null;
  return updateNote(id, { pinned: !note.pinned });
}

// ---------- DELETE ----------

export function deleteNote(id) {
  const notes = getAllNotes();
  const remaining = notes.filter((note) => note.id !== id);
  storage.set(KEYS.NOTES, remaining);
}

// ---------- SEARCH / FILTER ----------

export function searchNotes(query) {
  const notes = getAllNotes();
  if (!query || !query.trim()) return notes;

  const lowerQuery = query.trim().toLowerCase();
  return notes.filter(
    (n) => n.title.toLowerCase().includes(lowerQuery) || n.content.toLowerCase().includes(lowerQuery)
  );
}

export function filterNotesByCategory(category) {
  if (!category || category === 'all') return getAllNotes();
  return getAllNotes().filter((n) => n.category === category);
}

export function getCategories() {
  const notes = getAllNotes();
  return [...new Set(notes.map((n) => n.category))];
}

// Pinned notes first, then most recently updated.
export function getSortedNotes(notes = getAllNotes()) {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
}

export function getRecentNotes(limit = 3) {
  return getSortedNotes().slice(0, limit);
}
