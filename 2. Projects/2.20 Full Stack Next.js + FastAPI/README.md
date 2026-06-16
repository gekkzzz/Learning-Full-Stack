# Project 2.20 — Full Stack Next.js + FastAPI

**Lecture Notes:** 25. Python Full Stack, 20. Next.js Advanced

## What You're Building

A full stack app combining a Next.js frontend with a Python FastAPI backend.
This is the capstone project — it ties together everything you've learned.

**Theme: Personal Finance Tracker**
Track income, expenses, and savings goals. You pick the domain if you prefer
something else (recipe manager, workout log, reading tracker, etc.)

---

## Architecture

```
┌─────────────────────────────────┐
│  Next.js Frontend (port 3000)   │
│  - React components             │
│  - Server Actions               │
│  - NextAuth.js authentication   │
└──────────────┬──────────────────┘
               │ HTTP / fetch
┌──────────────▼──────────────────┐
│  FastAPI Backend (port 8000)    │
│  - REST API endpoints           │
│  - JWT authentication           │
│  - SQLAlchemy ORM               │
└──────────────┬──────────────────┘
               │ SQLAlchemy
┌──────────────▼──────────────────┐
│  PostgreSQL Database            │
│  (Neon, Supabase, or local)     │
└─────────────────────────────────┘
```

---

## Setup — Backend

```bash
mkdir finance-api && cd finance-api
python -m venv venv
venv\Scripts\activate

pip install fastapi "uvicorn[standard]" sqlalchemy psycopg2-binary \
            pydantic python-dotenv python-jose passlib bcrypt alembic
```

`.env` file:
```
DATABASE_URL=postgresql://user:pass@host:5432/financedb
SECRET_KEY=your-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

Run: `uvicorn main:app --reload --port 8000`

---

## Setup — Frontend

```bash
npx create-next-app@latest finance-frontend --typescript --tailwind --app
cd finance-frontend
npm install next-auth@beta axios recharts date-fns
```

`.env.local` file:
```
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run: `npm run dev`

---

## Backend Task 1 — Database Schema

Design and create these tables:

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  currency      VARCHAR(3) DEFAULT 'GBP',
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name    VARCHAR(50) NOT NULL,
  colour  VARCHAR(7),         -- hex colour for UI
  icon    VARCHAR(50),        -- emoji or icon name
  type    VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount      NUMERIC(12, 2) NOT NULL,
  description VARCHAR(255),
  type        VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES categories(id),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE savings_goals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100) NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) DEFAULT 0,
  deadline     DATE,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Backend Task 2 — Authentication

Implement JWT-based auth with these endpoints:

**POST /auth/register** — create user, return token
**POST /auth/login** — verify password, return token
**GET /auth/me** — return current user (protected)

Use `passlib` for password hashing:
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

Use `python-jose` for JWT:
```python
from jose import JWTError, jwt
from datetime import datetime, timedelta

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({**data, "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
```

---

## Backend Task 3 — API Endpoints

**Transactions:**
- `GET /transactions` — list with filters: `?type=expense&category_id=...&start_date=...&end_date=...`
- `POST /transactions` — create
- `PUT /transactions/{id}` — update
- `DELETE /transactions/{id}` — delete

**Stats (summary endpoint):**
- `GET /transactions/summary` — returns total income, total expenses,
  net balance, breakdown by category for a date range

**Categories:**
- `GET /categories` — list user's categories (with defaults for new users)
- `POST /categories` — create custom category
- `DELETE /categories/{id}` — delete

**Savings Goals:**
- Full CRUD
- `PATCH /savings-goals/{id}/deposit` — add an amount to current_amount

---

## Backend Task 4 — Alembic Migrations

Set up Alembic so you can change the schema without losing data:

```bash
alembic init alembic
# Edit alembic.ini: set sqlalchemy.url = your DATABASE_URL
# Edit alembic/env.py: import your Base and models

alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

---

## Frontend Task 5 — NextAuth.js Setup

Configure NextAuth with a Credentials provider that calls your FastAPI login endpoint:

```ts
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email:    { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return { id: data.user.id, email: data.user.email, token: data.access_token };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.accessToken = user.token;
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    }
  }
});

export { handler as GET, handler as POST };
```

---

## Frontend Task 6 — Dashboard Page

The main dashboard shows:
- Balance summary card (total income - total expenses this month)
- Expense breakdown donut chart (recharts PieChart)
- Income vs Expenses bar chart (last 6 months)
- Recent transactions list (last 10)
- Savings goals progress bars

Use Server Components for the data fetching — call your FastAPI endpoints
server-side using the session token:
```ts
// In a Server Component:
const session = await getServerSession();
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/summary`, {
  headers: { Authorization: `Bearer ${session.accessToken}` }
});
```

---

## Frontend Task 7 — Transaction Management

Build a transactions page with:
- A table of all transactions (sortable, filterable by type/category/date)
- An "Add Transaction" modal/drawer with a form
- Edit and delete per row
- Date range filter

---

## Frontend Task 8 — Server Actions

Use Next.js Server Actions for form submissions (no separate API route needed):
```ts
'use server';

export async function createTransaction(formData: FormData) {
  const session = await getServerSession();
  const data = Object.fromEntries(formData);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`
    },
    body: JSON.stringify(data)
  });

  revalidatePath('/dashboard');  // refresh the dashboard data after adding
}
```

---

## Stretch Goals

- CSV/PDF export of transactions
- Recurring transactions (set up once, auto-added monthly)
- Budget limits per category with alerts when approaching the limit
- Docker Compose setup to run both services with one command
- Deploy: backend to Railway/Render, frontend to Vercel
