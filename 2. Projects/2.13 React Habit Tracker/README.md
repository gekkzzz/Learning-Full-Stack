# Project 2.13 — React Habit Tracker

**Lecture Notes:** 16. React Foundations, 17. React Intermediate

## What You're Building

A habit tracking app where users can add daily habits and mark them as complete
each day. Built with React — either via Vite or Create React App.

Track: exercise, reading, drinking water, coding, whatever habits you're working on.

---

## Setup

```bash
npm create vite@latest habit-tracker -- --template react
cd habit-tracker
npm install
npm run dev
```

---

## App Features

- Add and remove habits
- Check off habits each day
- View a weekly streak for each habit (how many days in a row completed)
- Data persists in localStorage

---

## Task 1 — Project Structure

Organise your src/ folder:
```
src/
  components/
    HabitForm.jsx       ← form to add a new habit
    HabitList.jsx       ← renders the list of habits
    HabitItem.jsx       ← a single habit row with checkbox + streak
    StreakBadge.jsx     ← displays the streak count
  hooks/
    useLocalStorage.js  ← custom hook for localStorage sync
    useHabits.js        ← custom hook with all habit logic
  App.jsx
  main.jsx
```

---

## Task 2 — Data Model

Each habit should be an object:
```js
{
  id:          crypto.randomUUID(),
  name:        'Read for 30 minutes',
  colour:      '#6366f1',   // user picks a colour
  completions: {            // keyed by date string 'YYYY-MM-DD'
    '2025-01-15': true,
    '2025-01-16': true,
  }
}
```

Use `new Date().toISOString().slice(0, 10)` to get today's date as `'YYYY-MM-DD'`.

---

## Task 3 — useLocalStorage Hook (`src/hooks/useLocalStorage.js`)

A custom hook that syncs state to localStorage:
```js
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

---

## Task 4 — useHabits Hook (`src/hooks/useHabits.js`)

Centralise all habit logic here. Implement:

**addHabit(name, colour)**
  - Creates a new habit object and adds it to state

**removeHabit(id)**
  - Filters the habit out of state

**toggleToday(id)**
  - Gets today's date string
  - If today's completion exists and is true, remove it (uncheck)
  - Otherwise set it to true (check)

**isCompletedToday(habit)**
  - Returns `habit.completions[todayString] === true`

**getStreak(habit)**
  - Count how many consecutive days ending on today the habit was completed
  - Start from today and go backwards until you find a gap
  - Return the count

---

## Task 5 — HabitForm Component

A controlled form component:
- A text input for the habit name (required)
- A colour picker (`<input type="color">`) for the habit colour
- A submit button
- On submit: call `addHabit(name, colour)`, then clear the input

---

## Task 6 — HabitItem Component

Props: `{ habit, onToggle, onRemove }`

Display:
- A coloured indicator dot (using `habit.colour`)
- The habit name
- Today's checkbox — checked if completed today
- The streak count badge (e.g. "🔥 5")
- A delete button (small, appears on hover)

---

## Task 7 — Weekly View (Stretch → Core)

Add 7 small circles to each HabitItem showing the last 7 days.
Filled circle = completed that day. Empty circle = missed.

Generate the last 7 date strings:
```js
const days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return d.toISOString().slice(0, 10);
});
```

---

## Task 8 — App Component

The root component brings it all together:
- Uses `useHabits()`
- Renders a header with today's date
- Renders `HabitForm`
- Renders `HabitList` with the habits array and callbacks

---

## Stretch Goals

- Add categories/tags to habits and filter by them
- Add a "heatmap" view showing the whole month (like GitHub's contribution graph)
- Animate habit completion with a confetti effect (use `canvas-confetti` npm package)
- Add habit notes — let users write a short note when completing a habit
