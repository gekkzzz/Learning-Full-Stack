/*
  PROJECT 2.8 — WEATHER APP — script.js
  ═══════════════════════════════════════
  Lecture Notes: 15. APIs, 10. JavaScript Intermediate


  ══════════════════════════════════════════════════════════
  STEP 1 — API KEY AND CONFIGURATION
  ══════════════════════════════════════════════════════════
  Store your OpenWeatherMap API key and base URLs here:
    const API_KEY = 'your_key_here';
    const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  Also track the current display unit:
    let currentUnit = 'metric';  // 'metric' = Celsius, 'imperial' = Fahrenheit


  ══════════════════════════════════════════════════════════
  STEP 2 — DOM REFERENCES
  ══════════════════════════════════════════════════════════
  Grab references to everything you'll need to update:
    const searchForm      = document.getElementById('search-form');
    const cityInput       = document.getElementById('city-input');
    const emptyState      = document.getElementById('empty-state');
    const loadingState    = document.getElementById('loading-state');
    const errorState      = document.getElementById('error-state');
    const errorMessage    = document.getElementById('error-message');
    const weatherResult   = document.getElementById('weather-result');
    const forecastGrid    = document.getElementById('forecast-grid');

  And the elements you'll fill with data:
    const cityNameEl      = document.getElementById('city-name');
    const countryEl       = document.getElementById('country-code');
    const dateEl          = document.getElementById('current-date');
    const weatherIconEl   = document.getElementById('weather-icon');
    const temperatureEl   = document.getElementById('temperature');
    const descriptionEl   = document.getElementById('description');
    const feelsLikeEl     = document.getElementById('feels-like');
    const humidityEl      = document.getElementById('humidity');
    const windSpeedEl     = document.getElementById('wind-speed');
    const visibilityEl    = document.getElementById('visibility');


  ══════════════════════════════════════════════════════════
  STEP 3 — showState(state) HELPER
  ══════════════════════════════════════════════════════════
  Write a function that hides all four state panels and then
  shows just the one you want. This prevents having to manually
  hide and show multiple elements everywhere in your code.

  function showState(state) {
    // Hide all of them first
    emptyState.classList.add('hidden');
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    weatherResult.classList.add('hidden');

    // Show the requested one
    if (state === 'empty')   emptyState.classList.remove('hidden');
    if (state === 'loading') loadingState.classList.remove('hidden');
    if (state === 'error')   errorState.classList.remove('hidden');
    if (state === 'result')  weatherResult.classList.remove('hidden');
  }

  On page load, call: showState('empty');


  ══════════════════════════════════════════════════════════
  STEP 4 — fetchWeather(city) MAIN FUNCTION
  ══════════════════════════════════════════════════════════
  This is the core of the app. It should:

  1. Show the loading state:
       showState('loading');

  2. Fetch current weather:
       const url = `${BASE_URL}/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}`;
       const response = await fetch(url);

  3. Check if the response is ok:
       if (!response.ok) {
         if (response.status === 404) throw new Error('City not found. Check the spelling.');
         throw new Error('Something went wrong. Try again.');
       }

  4. Parse the JSON:
       const data = await response.json();

  5. Fetch the 5-day forecast (same pattern, different endpoint):
       const forecastUrl = `${BASE_URL}/forecast?q=${city}&units=${currentUnit}&appid=${API_KEY}`;
       const forecastResponse = await fetch(forecastUrl);
       const forecastData = await forecastResponse.json();

  6. Pass data to display functions:
       displayCurrentWeather(data);
       displayForecast(forecastData);

  7. Show the result state:
       showState('result');

  8. Wrap everything in try/catch:
       catch (error) {
         errorMessage.textContent = error.message;
         showState('error');
       }

  Make fetchWeather an async function.


  ══════════════════════════════════════════════════════════
  STEP 5 — displayCurrentWeather(data) FUNCTION
  ══════════════════════════════════════════════════════════
  The API response object has this structure (simplified):
    data.name                  → city name (e.g. "London")
    data.sys.country           → country code (e.g. "GB")
    data.weather[0].description → weather description
    data.weather[0].icon        → icon code (e.g. "10d")
    data.main.temp             → temperature
    data.main.feels_like       → feels like temperature
    data.main.humidity         → humidity (0–100)
    data.wind.speed            → wind speed
    data.visibility            → visibility in metres

  Fill in your DOM elements:
    cityNameEl.textContent    = data.name;
    countryEl.textContent     = data.sys.country;
    dateEl.textContent        = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    weatherIconEl.src         = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIconEl.alt         = data.weather[0].description;

    const unit = currentUnit === 'metric' ? '°C' : '°F';
    temperatureEl.textContent = `${Math.round(data.main.temp)}${unit}`;
    descriptionEl.textContent = data.weather[0].description;
    feelsLikeEl.textContent   = `${Math.round(data.main.feels_like)}${unit}`;
    humidityEl.textContent    = `${data.main.humidity}%`;
    windSpeedEl.textContent   = `${Math.round(data.wind.speed)} ${currentUnit === 'metric' ? 'km/h' : 'mph'}`;
    visibilityEl.textContent  = `${(data.visibility / 1000).toFixed(1)} km`;


  ══════════════════════════════════════════════════════════
  STEP 6 — displayForecast(data) FUNCTION
  ══════════════════════════════════════════════════════════
  The forecast API returns readings every 3 hours for 5 days.
  You need to filter this down to one reading per day.

  A good approach: filter for readings at 12:00:00 (noon):
    const dailyForecasts = data.list.filter(item =>
      item.dt_txt.includes('12:00:00')
    );

  Then build the HTML:
    forecastGrid.innerHTML = '';  // clear any previous forecast

    dailyForecasts.forEach(day => {
      const date = new Date(day.dt * 1000);  // dt is UNIX timestamp
      const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' });

      const card = document.createElement('div');
      card.className = 'forecast-card';
      card.innerHTML = `
        <span class="day-name">${dayName}</span>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png"
             alt="${day.weather[0].description}" />
        <span class="temp-high">${Math.round(day.main.temp_max)}°</span>
        <span class="temp-low">${Math.round(day.main.temp_min)}°</span>
      `;
      forecastGrid.appendChild(card);
    });


  ══════════════════════════════════════════════════════════
  STEP 7 — FORM SUBMIT EVENT
  ══════════════════════════════════════════════════════════
  Listen for the search form's submit event:
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();  // prevent page reload
      const city = cityInput.value.trim();
      if (!city) return;  // do nothing if input is empty
      fetchWeather(city);
    });


  ══════════════════════════════════════════════════════════
  STEP 8 — UNITS TOGGLE
  ══════════════════════════════════════════════════════════
  Listen for the unit toggle buttons:
    document.getElementById('btn-celsius').addEventListener('click', () => {
      currentUnit = 'metric';
      // update active class on buttons
      // if a city is already displayed, re-fetch it
      const city = cityNameEl.textContent;
      if (city) fetchWeather(city);
    });

  Do the same for Fahrenheit (currentUnit = 'imperial').

  To update the active button style:
    document.querySelectorAll('.unit-btn').forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');


  ══════════════════════════════════════════════════════════
  STEP 9 — INITIALISE
  ══════════════════════════════════════════════════════════
  At the bottom of your file:
    showState('empty');

  OPTIONAL: Load the last searched city from localStorage:
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) fetchWeather(lastCity);

  To save to localStorage on each successful search, add this
  inside fetchWeather() after a successful fetch:
    localStorage.setItem('lastCity', city);
*/
