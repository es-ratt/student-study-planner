# Student Study Planner

**Live Site:** [es-ratt.github.io/student-study-planner](https://es-ratt.github.io/student-study-planner)

A web-based academic assistant that helps students manage courses, assignments, study schedules, and exam deadlines in one place. Built with plain HTML, CSS, and JavaScript — no framework, no build step, no backend. All data is stored locally in the browser.

## What This Project Does

| Module | What it handles |
|---|---|
| Auth (Login / Register) | Local account creation and session handling, no server involved |
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

## Project Structure

student-study-planner/
├── index.html          → redirects to pages/index.html (entry point for GitHub Pages)
├── pages/               → every screen of the app (login, dashboard, planner, etc.)
├── css/                 → one stylesheet per feature area
├── js/
│   ├── modules/         → core logic (auth, tasks, subjects, exams, notes, analytics...)
│   ├── components/      → reusable UI pieces (navbar, sidebar, toast, modal, fab)
│   └── utils/            → shared helpers (dates, validation, id generation)

## How Data Flows

graph LR
    A[User action on a page] --> B[Manager module]
    B --> C[storage.js]
    C --> D[Browser localStorage]
    D --> C
    C --> B
    B --> E[UI updated on screen]

Every page talks to its manager module (e.g. taskManager.js), and every manager talks to storage.js — the single point that reads/writes localStorage. No page ever touches localStorage directly.

## Tech Stack

| Layer | Tools used |
|---|---|
| Structure | HTML5 |
| Styling | CSS3, Bootstrap 5 (auth pages) |
| Logic | Vanilla JavaScript (ES Modules) |
| Icons/Fonts | Font Awesome, Google Fonts |
| Storage | Browser localStorage (no backend/database) |
| Hosting | GitHub Pages |

## Running It Locally

git clone https://github.com/es-ratt/student-study-planner.git

Open pages/index.html in a browser, or open the project folder in VS Code with the Live Server extension.

## Author

esratt | TasnemRahman
