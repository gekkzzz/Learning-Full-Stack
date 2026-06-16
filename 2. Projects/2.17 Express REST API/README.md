# Project 2.17 — Express REST API

**Lecture Notes:** 21. Node.js Foundations

## What You're Building

A RESTful API for a bookstore, built with Express.js. No database yet —
data is stored in a JSON file for persistence. This teaches you to think
in terms of routes, middleware, HTTP methods, and proper API design.

---

## Setup

```bash
mkdir express-bookstore-api && cd express-bookstore-api
npm init -y
npm install express morgan dotenv uuid
npm install --save-dev nodemon
```

Add to `package.json`:
```json
"scripts": {
  "dev": "nodemon src/index.js",
  "start": "node src/index.js"
}
```

---

## Task 1 — Project Structure

```
express-bookstore-api/
  src/
    index.js          ← server entry point
    routes/
      books.js        ← /api/books routes
      authors.js      ← /api/authors routes (stretch)
    middleware/
      validate.js     ← request body validation
      errorHandler.js ← global error handler
    data/
      books.json      ← JSON file acting as the "database"
    lib/
      storage.js      ← read/write JSON file
  .env
  .gitignore
```

---

## Task 2 — Server Setup (`src/index.js`)

```js
import express from 'express';
import morgan  from 'morgan';
import 'dotenv/config';

const app  = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());      // parse JSON request bodies
app.use(morgan('dev'));        // log requests to the console

// Routes
app.use('/api/books', booksRouter);

// 404 handler (must be after all routes)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last, and must have 4 params)
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## Task 3 — JSON Storage (`src/lib/storage.js`)

Since there's no database, store data in a JSON file:

```js
import fs   from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src/data/books.json');

export function readBooks() {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function writeBooks(books) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(books, null, 2));
}
```

Seed `books.json` with 5–10 sample books:
```json
[
  {
    "id": "1",
    "title": "The Pragmatic Programmer",
    "author": "David Thomas",
    "genre": "Technology",
    "year": 1999,
    "price": 29.99,
    "inStock": true
  }
]
```

---

## Task 4 — Books Routes (`src/routes/books.js`)

Implement full CRUD:

**GET /api/books**
  - Returns all books
  - Support query params for filtering:
      - `?genre=Technology` — filter by genre
      - `?author=David` — filter by author (case-insensitive)
      - `?inStock=true` — only in-stock books
  - Response: `{ books: [...], total: n }`

**GET /api/books/:id**
  - Returns one book by ID
  - If not found: 404 with `{ error: 'Book not found' }`

**POST /api/books**
  - Creates a new book
  - Generates a UUID for the ID: `import { v4 as uuid } from 'uuid'`
  - Validates that required fields are present (see middleware)
  - Returns the created book with 201 status

**PUT /api/books/:id**
  - Replaces an existing book (full update)
  - 404 if not found

**PATCH /api/books/:id**
  - Partial update — only update the fields provided in the request body
  - Hint: `const updated = { ...existing, ...req.body, id: existing.id }`

**DELETE /api/books/:id**
  - Removes the book and returns 204 (No Content)
  - 404 if not found

---

## Task 5 — Validation Middleware (`src/middleware/validate.js`)

Write a middleware factory that checks required fields:
```js
export function requireFields(...fields) {
  return (req, res, next) => {
    const missing = fields.filter(field => req.body[field] === undefined);
    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }
    next();
  };
}
```

Use it in routes:
```js
router.post('/', requireFields('title', 'author', 'genre', 'year', 'price'), createBook);
```

---

## Task 6 — Error Handler (`src/middleware/errorHandler.js`)

A global error handler catches any error passed to `next(error)`:
```js
export function errorHandler(err, req, res, next) {
  console.error(err.stack);
  const status  = err.status  ?? 500;
  const message = err.message ?? 'Internal Server Error';
  res.status(status).json({ error: message });
}
```

In routes, wrap async code and pass errors forward:
```js
router.get('/:id', async (req, res, next) => {
  try {
    // ...
  } catch (error) {
    next(error);
  }
});
```

---

## Task 7 — Test Your API

Use Thunder Client (VS Code extension) or curl to test each endpoint:

```bash
# Get all books
curl http://localhost:3000/api/books

# Create a book
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Clean Code","author":"Robert Martin","genre":"Technology","year":2008,"price":35.00,"inStock":true}'

# Update in stock status
curl -X PATCH http://localhost:3000/api/books/1 \
  -H "Content-Type: application/json" \
  -d '{"inStock": false}'

# Delete
curl -X DELETE http://localhost:3000/api/books/1
```

---

## Stretch Goals

- Add pagination: `?page=1&limit=10`
- Add sorting: `?sortBy=price&order=asc`
- Add a `GET /api/books/stats` endpoint (count by genre, average price, etc.)
- Add `/api/authors` routes that reference books by their author field
- Write integration tests with Vitest + Supertest
