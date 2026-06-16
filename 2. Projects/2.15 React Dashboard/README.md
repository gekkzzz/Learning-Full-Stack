# Project 2.15 — React Dashboard

**Lecture Notes:** 18. React Advanced

## What You're Building

An analytics-style dashboard with multiple panels, live-ish data, and
advanced React patterns. This is less about the data and more about the
architecture — concurrent features, Suspense, compound components, and
state machines.

Choose a theme: personal finance, fitness stats, social media analytics,
e-commerce overview — whatever motivates you. Use mock/generated data.

---

## Setup

```bash
npm create vite@latest react-dashboard -- --template react-ts
cd react-dashboard
npm install recharts zustand @xstate/react xstate date-fns
npm run dev
```

---

## Task 1 — Layout Architecture

Build a classic dashboard shell:
```
┌─────────────┬──────────────────────────────────────────┐
│             │  Header (user info, notifications)        │
│  Sidebar    ├──────────────────────────────────────────┤
│  (nav links)│                                           │
│             │   Main content area (changes per route)   │
│             │                                           │
└─────────────┴──────────────────────────────────────────┘
```

Structure:
```
src/
  components/
    layout/
      Shell.jsx          ← sidebar + header wrapper
      Sidebar.jsx        ← navigation
      Header.jsx         ← top bar
    ui/
      Card.jsx           ← reusable stat card
      Chart.jsx          ← recharts wrapper
      DataTable.jsx      ← sortable table
      Skeleton.jsx       ← loading placeholder
      ErrorBoundary.jsx  ← React error boundary
  pages/
    Overview.jsx
    Analytics.jsx
    Transactions.jsx
    Settings.jsx
  stores/
    dashboardStore.js    ← Zustand store
  hooks/
    useLiveData.js       ← simulates polling/live data
  lib/
    mockData.js          ← generated mock data
```

---

## Task 2 — Mock Data (`src/lib/mockData.js`)

Generate realistic-looking mock data for:
- Daily revenue for the last 30 days (random walk algorithm)
- 6 months of monthly summaries
- A list of 50 fake transactions (name, amount, date, category, status)
- Top 5 products by sales

A random walk keeps numbers looking natural:
```js
function randomWalk(start, days, volatility = 0.05) {
  const values = [start];
  for (let i = 1; i < days; i++) {
    const change = values[i - 1] * (Math.random() * volatility * 2 - volatility);
    values.push(Math.max(0, values[i - 1] + change));
  }
  return values;
}
```

---

## Task 3 — Zustand Store

Create a simple Zustand store to hold shared dashboard state:
```js
const useDashboardStore = create((set) => ({
  dateRange:    'last30days',
  setDateRange: (range) => set({ dateRange: range }),

  selectedMetric: 'revenue',
  setMetric:      (metric) => set({ selectedMetric: metric }),

  notifications: [],
  addNotification:    (n) => set(state => ({ notifications: [...state.notifications, n] })),
  clearNotifications: ()  => set({ notifications: [] }),
}));
```

---

## Task 4 — Suspense and Skeleton Loading

Simulate async data loading (even though it's mock data) using a fake delay:
```js
function useMockFetch(key, delay = 800) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(getMockData(key));
    }, delay);
    return () => clearTimeout(timer);
  }, [key]);

  return data;
}
```

Use React Suspense with lazy-loaded route components:
```jsx
const Analytics = React.lazy(() => import('./pages/Analytics'));

// In your router:
<Suspense fallback={<PageSkeleton />}>
  <Analytics />
</Suspense>
```

Show `<Skeleton />` placeholder cards while data loads.

---

## Task 5 — Compound Component Pattern

Build a `<StatCard>` using the compound component pattern so it's flexible:
```jsx
<StatCard>
  <StatCard.Title>Total Revenue</StatCard.Title>
  <StatCard.Value>£24,532</StatCard.Value>
  <StatCard.Change value={+12.5} />
  <StatCard.Sparkline data={weeklyData} />
</StatCard>
```

This is more composable than a single component with many props.

---

## Task 6 — Charts with Recharts

Build at least three charts:
1. **Area chart** — revenue over time (AreaChart from recharts)
2. **Bar chart** — monthly comparison
3. **Pie/Donut chart** — revenue breakdown by category

For each chart:
- Wrap in a Card with a title and date range selector
- Add a tooltip showing exact values on hover
- Make it responsive using `<ResponsiveContainer width="100%" height={300}>`

---

## Task 7 — Sortable Data Table

Build a `<DataTable>` component for the transactions list:
- Columns: Date, Description, Category, Amount, Status
- Clicking a column header sorts by that column (toggle asc/desc)
- Status column uses coloured badges (Completed = green, Pending = yellow, Failed = red)
- Pagination: show 10 rows at a time

Use `useReducer` for the table state (sort column, sort direction, current page).

---

## Task 8 — useTransition for Filtering

When filtering the transactions table, use `useTransition` to keep the UI
responsive while the expensive re-render happens in the background:
```jsx
const [isPending, startTransition] = useTransition();

function handleFilterChange(filter) {
  startTransition(() => {
    setFilter(filter);
  });
}

// Show a subtle "loading" indicator when isPending is true
```

---

## Task 9 — Error Boundary

Wrap each dashboard panel in an `<ErrorBoundary>` so a single broken
chart doesn't crash the whole page. React error boundaries must be
class components (as of React 18):
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-card">Failed to load this panel</div>;
    }
    return this.props.children;
  }
}
```

---

## Stretch Goals

- Dark mode toggle (store preference in Zustand + localStorage)
- Keyboard shortcuts to switch between pages (use a custom useKeyboard hook)
- Export transactions as CSV
- Drag-and-drop dashboard panel reordering (react-beautiful-dnd or dnd-kit)
