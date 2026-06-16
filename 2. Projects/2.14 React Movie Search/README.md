# Project 2.14 — React Movie Search

**Lecture Notes:** 17. React Intermediate

## What You're Building

A movie search app powered by the OMDB API. Users can search for movies, view
results in a grid, click to see full details, and save favourites.

This project focuses on: custom hooks, useReducer, React Router, TanStack Query,
and component composition patterns.

---

## Setup

```bash
npm create vite@latest movie-search -- --template react
cd movie-search
npm install react-router-dom @tanstack/react-query axios
npm run dev
```

Get a free API key at: http://www.omdbapi.com/apikey.aspx

---

## API Endpoints

Search movies:
```
http://www.omdbapi.com/?apikey=YOUR_KEY&s=SEARCH_TERM&type=movie&page=1
```

Get movie details by ID:
```
http://www.omdbapi.com/?apikey=YOUR_KEY&i=IMDB_ID&plot=full
```

---

## Task 1 — Project Structure

```
src/
  api/
    omdb.js           ← API functions (search, getById)
  components/
    MovieCard.jsx     ← thumbnail card for search results
    MovieGrid.jsx     ← grid of MovieCard components
    SearchBar.jsx     ← controlled input with debounce
    Pagination.jsx    ← next/prev page controls
    FavouriteButton.jsx ← heart button
    StarRating.jsx    ← display movie rating visually
  pages/
    HomePage.jsx      ← search + results
    MoviePage.jsx     ← full movie details
    FavouritesPage.jsx ← saved favourites
  hooks/
    useFavourites.js  ← localStorage-backed favourites
    useDebounce.js    ← debounce a rapidly-changing value
  contexts/
    FavouritesContext.jsx ← share favourites across pages
  App.jsx
```

---

## Task 2 — API Module (`src/api/omdb.js`)

Create and export two async functions:

**searchMovies(query, page = 1)**
  - Fetches `/?s=${query}&page=${page}`
  - Returns `{ movies: data.Search, totalResults: data.totalResults }`
  - If `data.Response === 'False'`, throw an error with `data.Error`

**getMovieById(imdbId)**
  - Fetches `/?i=${imdbId}&plot=full`
  - Returns the movie object

Store your API key in a `.env` file:
```
VITE_OMDB_KEY=your_key_here
```
Access it in code: `import.meta.env.VITE_OMDB_KEY`

---

## Task 3 — useDebounce Hook

When the user types in the search box, you don't want to fire an API
request on every keystroke. Debounce delays the value by 400ms:

```js
function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);  // cleanup cancels the timer on next render
  }, [value, delay]);

  return debouncedValue;
}
```

---

## Task 4 — TanStack Query Setup

Wrap your app in `QueryClientProvider` in `main.jsx`:
```jsx
const queryClient = new QueryClient();
// <QueryClientProvider client={queryClient}> around <App />
```

In `HomePage.jsx`, use `useQuery` to fetch search results:
```js
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['movies', debouncedQuery, page],
  queryFn:  () => searchMovies(debouncedQuery, page),
  enabled:  debouncedQuery.length > 2,  // only fetch if query is long enough
  staleTime: 1000 * 60 * 5,  // cache for 5 minutes
});
```

In `MoviePage.jsx`, use `useQuery` to fetch a single movie's details.

---

## Task 5 — React Router Setup

In `App.jsx`, set up three routes:
```
/              → HomePage
/movie/:imdbId → MoviePage
/favourites    → FavouritesPage
```

Use `<Link>` from react-router-dom for navigation. MovieCard should link to `/movie/${movie.imdbID}`.

---

## Task 6 — Favourites Context

Create a context that provides:
- `favourites`: array of movie objects
- `addFavourite(movie)`: add to array + save to localStorage
- `removeFavourite(imdbID)`: remove from array + save to localStorage
- `isFavourite(imdbID)`: returns boolean

Use `useReducer` inside the context for state management:
```
Actions: ADD_FAVOURITE, REMOVE_FAVOURITE, LOAD_FAVOURITES
```

---

## Task 7 — MovieCard Component

Props: `{ movie }` (from search results)

Display:
- Movie poster (use a placeholder image if `movie.Poster === 'N/A'`)
- Title, year, type
- FavouriteButton in the corner
- The whole card is a Link to `/movie/${movie.imdbID}`

---

## Task 8 — MoviePage Component

Fetch the full movie details using the `imdbID` from `useParams()`.

Display: poster, title, year, rating, runtime, genre, director, actors,
plot, awards, box office. Use the `StarRating` component for the rating.

---

## Stretch Goals

- Add a "Watch list" separate from favourites
- Implement infinite scroll instead of pagination
- Add filter chips for genre, year range
- Write component tests with Vitest + React Testing Library
