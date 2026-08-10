# Student Study Planner — Backend

Node.js + Express + MySQL API for the [student-study-planner](https://github.com/es-ratt/student-study-planner) frontend.

Replaces the frontend's current `localStorage`-only data (`js/modules/storage.js`) and
`localStorage`-only auth (`js/modules/authManager.js`) with a real database and hashed,
token-based authentication.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create the database**
   ```bash
   mysql -u root -p < sql/schema.sql
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your own MySQL credentials and a random `JWT_SECRET`.

4. **Run the server**
   ```bash
   npm run dev   # with auto-reload (nodemon)
   # or
   npm start
   ```

   Server runs at `http://localhost:5000` by default. Check `GET /api/health` to confirm it's up.

## Project structure

```
backend/
├── config/db.js          # MySQL connection pool
├── middleware/auth.js     # JWT verification middleware
├── controllers/           # Business logic per resource
├── routes/                 # Express route definitions
├── sql/schema.sql         # Database schema
└── server.js               # App entry point
```

## API Endpoints

All routes except `/api/auth/register` and `/api/auth/login` require a JWT:
`Authorization: Bearer <token>` header, using the token returned at login.

| Method | Endpoint              | Description               |
|--------|------------------------|----------------------------|
| POST   | `/api/auth/register`   | Create an account          |
| POST   | `/api/auth/login`      | Log in, get a JWT          |
| GET    | `/api/auth/me`         | Get the logged-in user     |
| GET    | `/api/subjects`        | List subjects              |
| POST   | `/api/subjects`        | Create a subject           |
| PUT    | `/api/subjects/:id`    | Update a subject           |
| DELETE | `/api/subjects/:id`    | Delete a subject           |
| GET/POST/PUT/DELETE | `/api/assignments[/:id]` | Same pattern as subjects |
| GET/POST/PUT/DELETE | `/api/exams[/:id]`       | Same pattern as subjects |
| GET/POST/PUT/DELETE | `/api/tasks[/:id]`       | Same pattern as subjects |
| GET/POST/PUT/DELETE | `/api/notes[/:id]`       | Same pattern as subjects |

All list/create/update/delete operations are automatically scoped to the
logged-in user (`req.userId`, decoded from the JWT) — no user can see or
modify another user's data.

## Connecting the existing frontend

To switch the frontend from localStorage to this API, `js/modules/storage.js`
is the only file that needs a full rewrite — every other module (`taskManager.js`,
`examManager.js`, etc.) already goes through `storage.get()`/`storage.set()`
rather than touching `localStorage` directly, so their code shouldn't need to
change. Replace `storage.get()`/`storage.set()` with `fetch()` calls to the
matching endpoint above, and store the JWT (e.g. in `localStorage` under a
`token` key) to attach to the `Authorization` header on every request.

## Security notes

- Passwords are hashed with `bcryptjs` before storage — never stored in plain text.
- Sessions use signed JWTs instead of a plain object in localStorage.
- `.env` is git-ignored — never commit real credentials or `JWT_SECRET`.
