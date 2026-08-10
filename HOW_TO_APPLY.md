# Frontend → Backend connection patch

## What's in this patch (ready to use, already tested)

Copy these files into your `student-study-planner` folder, **overwriting** the
existing ones at the same paths:

```
js/modules/api.js          ← NEW file
js/modules/storage.js      ← REPLACES the old one
js/modules/authManager.js  ← REPLACES the old one
js/app.js                  ← REPLACES the old one
pages/login.html           ← REPLACES the old one
pages/register.html        ← REPLACES the old one
pages/profile.html         ← REPLACES the old one
pages/dashboard.html       ← REPLACES the old one
pages/planner.html         ← REPLACES the old one
```

**Nothing else needs to change** — `taskManager.js`, `subjectManager.js`,
`assignmentManager.js`, `examManager.js`, `noteManager.js`, `navbar.js`,
`sidebar.js`, etc. are all untouched. They still call
`storage.get()`/`storage.set()` exactly like before; `storage.js` is now
just quietly talking to your backend behind the scenes instead of
`localStorage`.

## Before testing

1. Make sure the backend is running (`npm run dev` in the `backend` folder).
2. Re-run the schema, since it changed (client-generated string IDs +
   JSON columns instead of the old fixed columns):
   ```
   source sql/schema.sql;
   ```
   (This drops and recreates the `study_planner` database — fine since
   you have no real data in it yet.)
3. If your backend runs on a different port than 5000, update `API_BASE`
   at the top of `js/modules/api.js`.

## What you can test right away

- **Register** a new account on `register.html` → it's created in MySQL
  (password hashed).
- **Login** on `login.html` → you get a real JWT session.
- **Dashboard** and **Planner** (tasks) are fully wired — add/edit/delete
  a task and refresh the page; it'll still be there (now coming from MySQL,
  not the browser).
- **Profile** page reads/updates your real account in the database.

## Finishing the rest (subjects, assignments, exams, notes, calendar, etc.)

Those pages don't need any *logic* changes — only one small addition per
page, so the page waits for data to load from the server before it tries
to render it. In each of these files:

```
pages/subjects.html
pages/assignments.html
pages/exams.html
pages/notes.html
pages/calendar.html
pages/analytics.html
pages/settings.html
pages/pomodoro.html
```

Do exactly what was done to `dashboard.html` and `planner.html`:

**1. Add this import** near the other imports in the page's
`<script type="module">` block:
```js
import { appReady } from '../js/app.js';
```

**2. Add `await appReady;` as the first line inside the
`DOMContentLoaded` listener**, and make that listener `async`:
```js
document.addEventListener('DOMContentLoaded', async () => {
  await appReady;
  // ...rest of the existing code, unchanged...
});
```

That's the whole pattern — copy it into each of the 8 files above and
everything (subjects, assignments, exams, notes) will start reading and
writing to your MySQL database automatically, since `storage.js` already
knows how to sync all five resource types.

If you'd rather I just do this for all 8 files myself, say so and I will.
