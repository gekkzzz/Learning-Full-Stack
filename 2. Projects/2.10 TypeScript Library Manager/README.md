# Project 2.10 — TypeScript Library Manager

**Lecture Notes:** 12. TypeScript Foundations, 13. TypeScript Intermediate

## What You're Building

A command-line book library manager built with TypeScript. You'll practise defining
types, interfaces, enums, generics, and utility types in a real application context.

This runs in Node.js (no browser needed) — perfect for focusing purely on TypeScript.

---

## Setup Instructions

1. Create a new folder and initialise a project:
   ```
   npm init -y
   npm install typescript ts-node @types/node --save-dev
   npx tsc --init
   ```

2. In `tsconfig.json`, set:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "commonjs",
       "strict": true,
       "outDir": "./dist"
     }
   }
   ```

3. Add to `package.json` scripts:
   ```json
   "scripts": {
     "dev": "ts-node src/index.ts",
     "build": "tsc"
   }
   ```

---

## Task 1 — Define Your Types (`src/types.ts`)

Create and export the following:

**Enum for genres:**
```ts
enum Genre {
  Fiction    = 'Fiction',
  NonFiction = 'Non-Fiction',
  SciFi      = 'Science Fiction',
  Biography  = 'Biography',
  // Add more as you like
}
```

**Book interface:**
```ts
interface Book {
  id:        string;
  title:     string;
  author:    string;
  year:      number;
  genre:     Genre;
  read:      boolean;
  rating?:   number;  // optional: 1–5
}
```

**A generic Result type** for operations that can succeed or fail:
```ts
type Result<T> =
  | { success: true;  data: T }
  | { success: false; error: string };
```

---

## Task 2 — Build the Library Class (`src/library.ts`)

Create a `Library` class that manages an array of `Book` objects.

Implement these methods:

**addBook(book: Omit<Book, 'id'>): Book**
  - Generates a unique ID (e.g. using `Date.now().toString()`)
  - Adds the book to the internal array
  - Returns the new book with its ID

**removeBook(id: string): Result<Book>**
  - Finds the book, removes it, returns it inside a Result
  - If not found, returns `{ success: false, error: 'Book not found' }`

**getBook(id: string): Book | undefined**
  - Returns the book with that ID, or undefined

**getAllBooks(): Book[]**
  - Returns all books

**searchBooks(query: string): Book[]**
  - Case-insensitive search against title and author
  - Hint: `book.title.toLowerCase().includes(query.toLowerCase())`

**markAsRead(id: string, rating?: number): Result<Book>**
  - Sets `read: true` and optionally sets the rating
  - Validate rating is 1–5 if provided

**getBooksByGenre(genre: Genre): Book[]**
  - Returns books filtered by genre

**getStats(): LibraryStats**
  - Define a `LibraryStats` interface with: totalBooks, readBooks, unreadBooks,
    averageRating, booksByGenre (Record<Genre, number>)
  - Calculate and return these stats

---

## Task 3 — Utility Functions (`src/utils.ts`)

Write these typed utility functions:

**formatBook(book: Book): string**
  - Returns a nicely formatted string of a book's details

**sortBooks(books: Book[], key: keyof Book, direction?: 'asc' | 'desc'): Book[]**
  - Sorts an array of books by any Book property
  - `keyof Book` is a TypeScript built-in that gives you all valid property names

**filterBooks(books: Book[], filters: Partial<Pick<Book, 'genre' | 'read'>>): Book[]**
  - Filters books by optional genre and/or read status
  - `Partial<Pick<...>>` makes both filters optional

---

## Task 4 — CLI Interface (`src/index.ts`)

Build a simple interactive menu using Node's `readline` module:

```
=== My Book Library ===
1. List all books
2. Add a book
3. Search books
4. Mark as read
5. Remove a book
6. View stats
7. Exit
```

For each option, call the appropriate Library method and display results.

This is the most open-ended task — focus on making it work rather than making it pretty.

---

## Task 5 — Persistence (`src/storage.ts`)

Save and load the library data to a JSON file using Node's `fs` module:

**saveLibrary(books: Book[], path: string): void**
  - `fs.writeFileSync(path, JSON.stringify(books, null, 2))`

**loadLibrary(path: string): Book[]**
  - Check if the file exists first
  - Return the parsed array, or [] if the file doesn't exist

Load the library at startup, save it after every change.

---

## Stretch Goals
- Add a `toBorrow` flag and track who borrowed each book
- Export the library to CSV format (practise template literal types)
- Add validation with a type guard: `function isValidBook(obj: unknown): obj is Book`
- Write unit tests with Vitest
