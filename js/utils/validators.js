// validators.js
// Small, dependency-free form validation helpers shared by auth pages,
// modals, and settings forms. Each returns true/false; error copy is
// decided by the calling page so messages can stay contextual.

export function isValidEmail(value) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPassword(value, minLength = 6) {
  return typeof value === 'string' && value.length >= minLength;
}

export function isRequired(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

export function isValidDate(value) {
  if (!value) return false;
  return !isNaN(new Date(value).getTime());
}

export function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword;
}

export function minLength(value, length) {
  return typeof value === 'string' && value.trim().length >= length;
}

export function isValidUrl(value) {
  if (!value) return true; // optional field in most forms
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// Runs a set of {value, rules} checks and returns the first failing message,
// or null if everything passes. Keeps form submit handlers short.
// rules: array of [validatorFn, errorMessage]
export function validateField(value, rules) {
  for (const [validator, message] of rules) {
    if (!validator(value)) return message;
  }
  return null;
}
