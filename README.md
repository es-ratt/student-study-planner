# Student Study Planner

**Live Site:** [es-ratt.github.io/student-study-planner](https://es-ratt.github.io/student-study-planner)

> Note: the live site is the frontend only. Login, data, and reminders require the backend to be running — either on your own machine (see [Running It Locally](#running-it-locally)) or on a deployed server. A browser link cannot start a program on your computer for you (this is a security restriction in every browser, not a limitation specific to this project), so `start.bat` has to be run manually the first time; it is not something a link can trigger.

A full-stack academic assistant that helps students manage courses, assignments, study schedules, and exam deadlines in one place. The project started as a static, localStorage-only frontend and has since been extended with a real backend (Node.js, Express, MySQL) and a client-side reminder system for exams and high-priority tasks.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Reminders](#reminders)
- [Running It Locally](#running-it-locally)
- [Environment Variables](#environment-variables)
- [Author](#author)

## Overview

Student Study Planner is split into two parts that live in the same repository:

- **Frontend** (`/`, `/pages`, `/js`, `/css`) — plain HTML, CSS, and vanilla JavaScript (ES Modules). No framework, no build step.
- **Backend** (`/backend`) — a Node.js/Express REST API backed by MySQL, handling authentication and data persistence for every resource the frontend manages.

The frontend was originally built against `localStorage` directly. To avoid rewriting every page, the migration to a real backend was done by keeping the frontend's manager modules (`taskManager.js`, `subjectManager.js`, and so on) completely unchanged, and rewriting only the storage layer underneath them (`storage.js`) to sync with the API in the background. Every manager module still calls `storage.get()` / `storage.set()` exactly as before.

## Features

| Module | What it handles |
|---|---|
| Auth (Login / Register) | Account creation and session handling via the backend, with hashed passwords and JWT sessions |
| Dashboard | Summary view of tasks, assignments, and exams at a glance |
| Planner | Daily/weekly study planning layout |
| Tasks & Assignments | Add, edit, complete, and track deadlines |
| Subjects | Organize courses with their own details |
| Calendar | Visual view of tasks, assignments, and exams by date |
| Exams | Countdown and reminders for upcoming exams |
| Notes | Quick note-taking tied to subjects |
| Pomodoro Timer | Built-in focus/break session timer |
| Analytics | Charts on completed tasks, study time, and progress trends |
| Settings & Profile | Theme (light/dark), profile editing, data reset |
| Reminders | Browser notifications 2 days, 1 day, and 12 hours before exams and high-priority tasks/assignments |

## Architecture

```
Browser (frontend)
   |
   |  fetch() with JWT in Authorization header
   v
Express API (backend/)
   |
   |  mysql2 connection pool
   v
MySQL (study_planner database)
```

Every resource except `users` (subjects, assignments, exams, tasks, notes) is stored as a single JSON blob per row, scoped to a `user_id`. This mirrors the exact object shape the frontend already produces (`id`, `title`, `subjectId`, `priority`, and so on), so the API never needs to know the specific fields of each resource type — one generic controller (`resourceController.js`) handles create/read/update/delete for all five resource tables.

IDs are generated on the client (`js/utils/idGenerator.js`), not by MySQL auto-increment. This lets the frontend create an item and use its ID immediately, without waiting on a round trip to the server, which is what allows `storage.js` to stay synchronous from the perspective of every manager module that calls it.

### storage.js sync strategy

1. On page load, `storage.js` fetches every resource type from the API into an in-memory cache (`storageReady`, awaited once in `app.js` before any page renders).
2. `storage.get()` reads synchronously from that cache.
3. `storage.set()` updates the cache immediately (so the UI stays responsive), then diffs the new array against the last known state and fires the appropriate `POST` / `PUT` / `DELETE` requests to the API in the background.

`SETTINGS` is intentionally excluded from this sync — it is treated as local, device-specific UI state and stays in `localStorage`.

## Tech Stack

| Layer | Tools used |
|---|---|
| Structure | HTML5 |
| Styling | CSS3, Bootstrap 5 |
| Frontend logic | Vanilla JavaScript (ES Modules) |
| Backend | Node.js, Express |
| Database | MySQL (`mysql2`) |
| Auth | bcrypt (password hashing), JSON Web Tokens |
| Icons/Fonts | Font Awesome, Google Fonts |
| Dev tooling | nodemon |

## Project Structure

```
student-study-planner/
├── index.html              entry point, redirects to pages/index.html
├── start.bat                one-click script: starts the backend and opens the site
├── pages/                    every screen of the app (login, dashboard, planner, etc.)
├── css/                       one stylesheet per feature area
├── js/
│   ├── modules/               core frontend logic
│   │   ├── api.js                thin fetch wrapper for the backend (base URL, JWT header)
│   │   ├── storage.js            synchronous cache backed by the API (see above)
│   │   ├── authManager.js        register/login/logout, session cache
│   │   ├── reminderManager.js    browser notifications for exams/high-priority items
│   │   ├── taskManager.js, subjectManager.js, examManager.js, ...
│   ├── components/            reusable UI pieces (navbar, sidebar, toast, modal, fab)
│   └── utils/                  shared helpers (dates, validation, id generation)
├── app.js                    boots the app: session check, data load, reminders, UI shell
└── backend/
    ├── server.js               Express entry point
    ├── config/db.js            MySQL connection pool
    ├── middleware/auth.js      JWT verification middleware
    ├── controllers/
    │   ├── authController.js     register, login, get/update current user
    │   └── resourceController.js  generic CRUD factory used by all five resource types
    ├── routes/
    │   ├── authRoutes.js
    │   └── resourceRoutes.js      generic router factory
    └── sql/schema.sql          database schema
```

## API Reference

All endpoints are prefixed with `/api`. Every route except `/auth/register` and `/auth/login` requires `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Log in, receive a JWT |
| GET | `/auth/me` | Get the logged-in user |
| PUT | `/auth/me` | Update profile fields |
| GET | `/subjects` | List the logged-in user's subjects |
| POST | `/subjects` | Create a subject (body includes client-generated `id`) |
| PUT | `/subjects/:id` | Update a subject |
| DELETE | `/subjects/:id` | Delete a subject |

The same four-endpoint pattern applies to `/assignments`, `/exams`, `/tasks`, and `/notes` — all five resource types share the same generic controller and router implementation.

## Reminders

`reminderManager.js` checks, once on load and then every five minutes for as long as a tab of the site stays open, whether any exam or high-priority task/assignment has crossed a reminder threshold: 48 hours, 24 hours, or 12 hours before its deadline. When it has, and that specific threshold hasn't already fired, it triggers a browser notification via the existing `showNotification()` helper in `settingsManager.js`.

Notes on how deadlines are interpreted:

- Exams have separate `date` and `time` fields, so their deadline is exact.
- Tasks and assignments only store a date, so they are treated as due at 23:59 on that date.
- Every exam is eligible for reminders. Tasks and assignments are only eligible if their `priority` is set to `high`.
- Already-fired reminders are tracked in `localStorage` (not synced to the backend) so the same threshold never fires twice.

This is a browser-only mechanism — it requires a tab of the site to be open, and it does not persist across the browser being fully closed. A background-capable alternative (browser extension) was scoped separately and is not part of this repository.

## Running It Locally

### Prerequisites

- Node.js and npm
- MySQL Server, running locally

### Setup

```bash
git clone https://github.com/es-ratt/student-study-planner.git
cd student-study-planner/backend
npm install
```

Create the database:

```sql
source sql/schema.sql;
```

Create `backend/.env` from the example file and fill in your own values:

```bash
cp .env.example .env
```

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD="your_mysql_password"
DB_NAME=study_planner
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
```

Start the backend:

```bash
npm run dev
```

Open `pages/login.html` in a browser (or use the VS Code Live Server extension) to reach the frontend. The frontend expects the API at `http://localhost:5000` by default — see `API_BASE` in `js/modules/api.js` if the backend runs elsewhere.

### One-click start (Windows)

[`start.bat`](./start.bat) automates the two steps above: it launches the backend in its own terminal window and opens the login page in the default browser once the server is up. Double-click it from inside the project root any time you want to start working.

## Environment Variables

Defined in `backend/.env` (see `backend/.env.example` for the template). Never commit `.env` — it is excluded via `.gitignore`.

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection details |
| `JWT_SECRET` | Signing secret for session tokens |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |

## Author

esratt | TasnemRahman
