// idGenerator.js
// Generates a unique ID for every new record (subject, task, exam, etc).
// Centralizing this in one file means if we ever switch strategy
// (e.g. to UUID library), we only change it here — not in every module.

export function generateId() {
  // Combine current timestamp + a random string.
  // Timestamp ensures rough ordering, random suffix avoids collisions
  // if two items are created in the same millisecond.
  const timestamp = Date.now().toString(36); // base36 makes it shorter
  const randomPart = Math.random().toString(36).slice(2, 8);

  return `${timestamp}-${randomPart}`;
}