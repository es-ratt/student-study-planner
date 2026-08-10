-- Student Study Planner — MySQL schema (v2)
-- Run this to (re)create the database structure:
--   In the mysql prompt: source sql/schema.sql;
--
-- Design note: subjects/assignments/exams/tasks/notes are stored as a
-- single JSON `data` column per row, matching the exact object shape the
-- frontend already creates in localStorage (id, title, subjectId, etc).
-- This means the frontend's manager files (taskManager.js, subjectManager.js...)
-- do not need to change at all — only storage.js talks to this API.
--
-- IDs are client-generated strings (from idGenerator.js), not MySQL
-- auto-increment — so the frontend can create an item and use its id
-- immediately, without waiting on a round trip to the server.

DROP DATABASE IF EXISTS study_planner;
CREATE DATABASE study_planner
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE study_planner;

-- ---------- users ----------
-- The only table with server-owned (auto-increment) IDs, since accounts
-- are always created through the backend directly.
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  university    VARCHAR(150),
  department    VARCHAR(150),
  semester      VARCHAR(50),
  study_goal    VARCHAR(255),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- generic resource tables ----------
-- subjects, assignments, exams, tasks, notes all follow the same shape:
-- one JSON blob per row, scoped to a user.

CREATE TABLE subjects (
  id          VARCHAR(40) PRIMARY KEY,
  user_id     INT NOT NULL,
  data        JSON NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE assignments (
  id          VARCHAR(40) PRIMARY KEY,
  user_id     INT NOT NULL,
  data        JSON NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE exams (
  id          VARCHAR(40) PRIMARY KEY,
  user_id     INT NOT NULL,
  data        JSON NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
  id          VARCHAR(40) PRIMARY KEY,
  user_id     INT NOT NULL,
  data        JSON NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id          VARCHAR(40) PRIMARY KEY,
  user_id     INT NOT NULL,
  data        JSON NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
