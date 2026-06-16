# Project 2.21 — Security Audit and Hardening

**Lecture Notes:** 26. Web Security

## What You're Building

This project is different from the others — instead of building something from scratch,
you will audit an existing Express + PostgreSQL API for security vulnerabilities, then
fix them one by one.

You will also build a small demo page that shows several attacks in action (in a safe,
controlled local environment) so you can see exactly how they work.

---

## Part 1 — Vulnerable App (Build this first, then fix it)

### Setup

```bash
mkdir security-audit && cd security-audit
npm init -y
npm install express pg dotenv
npm install --save-dev nodemon
```

Create `src/vulnerable.js` — a deliberately insecure Express API.

---

### Vulnerability 1 — SQL Injection

Build this endpoint that is vulnerable to SQL injection:

```js
// VULNERABLE — do not use in production
app.get('/users/search', async (req, res) => {
  const { name } = req.query;
  const query = `SELECT id, name, email FROM users WHERE name = '${name}'`;
  const result = await pool.query(query);
  res.json(result.rows);
});
```

**Your task:** Test the vulnerability:
  1. Normal request: `/users/search?name=Alice` — works as expected
  2. Injection: `/users/search?name=' OR '1'='1` — returns ALL users
  3. Destructive: `/users/search?name='; DROP TABLE users;--` (don't actually run this one)

**Fix it:** Rewrite the endpoint using parameterised queries:
```js
app.get('/users/search', async (req, res) => {
  const { name } = req.query;
  const result = await pool.query('SELECT id, name, email FROM users WHERE name = $1', [name]);
  res.json(result.rows);
});
```

---

### Vulnerability 2 — Exposed Passwords

Build a registration endpoint that stores passwords in plain text:

```js
// VULNERABLE
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, password]);
  res.json({ message: 'Registered' });
});
```

**Your task:** Register a user and look at the `users` table directly. The password is there in plain text.

**Fix it:** Hash the password with bcrypt before storing it:
```bash
npm install bcrypt
```
```js
import bcrypt from 'bcrypt';

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 12);
  await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashed]);
  res.json({ message: 'Registered' });
});
```

---

### Vulnerability 3 — Hardcoded Secrets

Put a real-looking secret directly in your source code:

```js
// VULNERABLE
const JWT_SECRET = 'mysecret123';
const DB_PASSWORD = 'admin123';
```

**Your task:**
  1. Commit this to a local git repo (don't push to GitHub)
  2. Then move the secrets to `.env` and add `.env` to `.gitignore`
  3. Verify the secret is no longer in the code

---

### Vulnerability 4 — Missing Rate Limiting

Build a login endpoint with no rate limiting:

```js
// VULNERABLE — allows unlimited login attempts
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  // ... password check
});
```

**Your task:** Write a script that makes 100 rapid login attempts. With no rate limiting,
all 100 go through. This simulates a brute force attack.

**Fix it:** Add rate limiting with `express-rate-limit`:
```bash
npm install express-rate-limit
```
```js
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Try again in 15 minutes.' }
});

app.post('/login', loginLimiter, loginHandler);
```

---

### Vulnerability 5 — XSS via innerHTML

Create an `index.html` that unsafely renders user-supplied text:

```html
<!-- VULNERABLE -->
<input id="comment" placeholder="Add a comment...">
<button onclick="addComment()">Post</button>
<div id="comments"></div>

<script>
  function addComment() {
    const text = document.getElementById('comment').value;
    document.getElementById('comments').innerHTML += `<p>${text}</p>`;
  }
</script>
```

**Your task:** Type this into the comment box and click Post:
  ```
  <img src="x" onerror="alert('XSS! Cookie: ' + document.cookie)">
  ```

You'll see an alert pop up — that's XSS working.

**Fix it:** Use `textContent` instead of `innerHTML`:
```js
const p = document.createElement('p');
p.textContent = text;  // escapes all HTML
document.getElementById('comments').appendChild(p);
```

---

### Vulnerability 6 — Verbose Error Messages

This endpoint exposes the full error (including database details) to the client:

```js
// VULNERABLE
app.get('/admin', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM admin_secrets');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
    // This tells attackers your database structure, table names, etc.
  }
});
```

**Fix it:** Log the full error server-side, send a generic message to the client:
```js
} catch (err) {
  console.error('[ERROR]', err);  // detailed log on the server
  res.status(500).json({ error: 'Something went wrong' });  // generic message to client
}
```

---

## Part 2 — Hardened Version

Build `src/secure.js` — a hardened version that fixes all six vulnerabilities:

1. All SQL queries use `$1` parameterised statements
2. Passwords hashed with bcrypt (cost factor 12)
3. All secrets loaded from `.env` via `dotenv`
4. Rate limiting on auth endpoints
5. No innerHTML with user data
6. Generic error messages, detailed logs

Add security headers with `helmet`:
```bash
npm install helmet
```
```js
import helmet from 'helmet';
app.use(helmet());
```

---

## Part 3 — Security Checklist Audit

Go through the security checklist from lecture note 26 and for each item, document:
- Where the vulnerability exists in your vulnerable.js
- What the fix is
- Whether it's fixed in your secure.js

Create a file `SECURITY_AUDIT.md` with your findings in this format:

```markdown
## Security Audit Report

### SQL Injection
- **Vulnerable code:** `/users/search` endpoint — string concatenation
- **Risk:** Attacker can read/modify/delete any data in the database
- **Fix:** Parameterised queries in `secure.js`
- **Status:** Fixed ✅

### ...
```

---

## Part 4 — Secrets Leak Simulation

1. Create a new local git repo: `git init`
2. Add a `.env` file with a fake API key
3. Accidentally commit it: `git add . && git commit -m "initial"`
4. Realise the mistake — practice the recovery steps:
   - Add `.env` to `.gitignore`
   - Remove from tracking: `git rm --cached .env`
   - Commit the fix
   - Verify: `git log --all --full-history -- .env` (the commit still exists in history!)
5. Understand why you need to revoke the key even after removing the commit

---

## Stretch Goals

- Set up GitHub's Dependabot on your repo to alert for vulnerable dependencies
- Run `npm audit` on one of your other projects and fix the reported vulnerabilities
- Add logging with Winston or Pino — log all authentication events (login success, failure, lockout)
- Research and implement Content Security Policy headers manually (without helmet)
- Look up a real CVE (Common Vulnerability and Exposure) and understand what the vulnerability was and how it was patched
