# Project 2.18 — Full Stack CRUD App

**Lecture Notes:** 22. Node.js Advanced, 23. Databases

## What You're Building

A full stack task management app with a React frontend and a Node.js/Express
backend connected to a real PostgreSQL database. This is where everything
comes together: REST API + database + authentication + frontend.

---

## Setup — Backend

```bash
mkdir taskboard-api && cd taskboard-api
npm init -y
npm install express pg dotenv bcrypt jsonwebtoken cors uuid morgan
npm install --save-dev nodemon
```

You need a PostgreSQL database. Options:
- **Local**: Install PostgreSQL, create a database
- **Free hosted**: Neon.tech or Supabase (free tier, get a connection string)

Set up `.env`:
```
DATABASE_URL=postgresql://user:password@host:5432/taskboard
JWT_SECRET=your-random-secret-here
PORT=3001
```

---

## Setup — Frontend

```bash
npm create vite@latest taskboard-client -- --template react
cd taskboard-client
npm install axios react-router-dom
```

---

## Task 1 — Database Schema

Write these SQL statements and run them against your database.
Save them in `api/src/db/schema.sql` so you have a record.

```sql
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE boards (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority    VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  board_id    UUID REFERENCES boards(id) ON DELETE CASCADE,
  due_date    DATE,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

---

## Task 2 — Database Connection (`api/src/db/pool.js`)

Use the `pg` library's connection pool:
```js
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;
```

The pool manages multiple simultaneous database connections automatically.

---

## Task 3 — Authentication (`api/src/routes/auth.js`)

**POST /api/auth/register**
  - Validate email and password length
  - Check if email already exists
  - Hash the password: `await bcrypt.hash(password, 12)`
  - Insert the user, return a JWT token

**POST /api/auth/login**
  - Find the user by email
  - Compare passwords: `await bcrypt.compare(plaintext, hashed)`
  - If valid, sign and return a JWT:
      ```js
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      ```

**Auth middleware** — protect routes:
```js
export function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];  // "Bearer TOKEN"
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

---

## Task 4 — Boards Routes (`api/src/routes/boards.js`)

All routes protected by `authenticate` middleware.

**GET /api/boards** — list the authenticated user's boards
```js
const { rows } = await pool.query(
  'SELECT * FROM boards WHERE user_id = $1 ORDER BY created_at DESC',
  [req.user.userId]
);
```

**POST /api/boards** — create a new board for the user

**DELETE /api/boards/:id** — delete board (verify it belongs to the user first)

---

## Task 5 — Tasks Routes (`api/src/routes/tasks.js`)

**GET /api/boards/:boardId/tasks** — get all tasks for a board
  - Verify the board belongs to req.user.userId first (security!)
  - Support `?status=todo` filter

**POST /api/boards/:boardId/tasks** — create a task

**PATCH /api/tasks/:id** — update task (title, description, status, priority, due_date)
  - Partial update: only update provided fields
  - Tip: build the SET clause dynamically from req.body keys

**DELETE /api/tasks/:id** — delete a task

---

## Task 6 — React Frontend

The frontend structure:
```
src/
  api/
    client.js         ← axios instance with base URL + auth token header
    auth.js           ← register/login API calls
    boards.js         ← board CRUD API calls
    tasks.js          ← task CRUD API calls
  context/
    AuthContext.jsx   ← user auth state (token, user info, login/logout)
  pages/
    LoginPage.jsx
    RegisterPage.jsx
    DashboardPage.jsx ← list of boards
    BoardPage.jsx     ← tasks for a board (3-column kanban layout)
  components/
    ProtectedRoute.jsx ← redirect to login if not authenticated
    TaskCard.jsx
    BoardCard.jsx
    TaskForm.jsx
```

**Axios client** (`src/api/client.js`):
```js
import axios from 'axios';

const client = axios.create({ baseURL: 'http://localhost:3001/api' });

// Attach the JWT token to every request automatically
client.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## Task 7 — Kanban Board View

The `BoardPage` shows tasks in 3 columns: Todo / In Progress / Done.

Group tasks by status:
```js
const columns = {
  todo:        tasks.filter(t => t.status === 'todo'),
  in_progress: tasks.filter(t => t.status === 'in_progress'),
  done:        tasks.filter(t => t.status === 'done'),
};
```

Clicking a task's status badge should cycle it through the stages
(call `PATCH /api/tasks/:id` with the new status).

---

## Stretch Goals

- Drag and drop between columns (dnd-kit library)
- Due date colour coding (red if overdue, yellow if today)
- Invite team members to a board (extra users table + board_members join table)
- Add WebSocket live updates (when one user moves a task, others see it move)
