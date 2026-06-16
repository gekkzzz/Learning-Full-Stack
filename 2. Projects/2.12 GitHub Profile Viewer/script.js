/*
  PROJECT 2.12 — GITHUB PROFILE VIEWER — script.js
  ══════════════════════════════════════════════════


  ══════════════════════════════════════════════════════════
  STEP 1 — DOM REFERENCES AND STATE
  ══════════════════════════════════════════════════════════
  Grab references to all your UI elements:
    const searchForm    = document.getElementById('search-form');
    const usernameInput = document.getElementById('username-input');
    const emptyState    = document.getElementById('empty-state');
    const loadingState  = document.getElementById('loading-state');
    const errorState    = document.getElementById('error-state');
    const errorMessage  = document.getElementById('error-message');
    const profileResult = document.getElementById('profile-result');

  And each profile element:
    const avatarEl      = document.getElementById('avatar');
    const fullNameEl    = document.getElementById('full-name');
    const usernameEl    = document.getElementById('username-display');
    const bioEl         = document.getElementById('bio');
    const locationEl    = document.getElementById('location');
    const blogLinkEl    = document.getElementById('blog-link');
    const joinDateEl    = document.getElementById('join-date');
    const followersEl   = document.getElementById('followers');
    const followingEl   = document.getElementById('following');
    const reposCountEl  = document.getElementById('public-repos');
    const gistsEl       = document.getElementById('public-gists');
    const reposGrid     = document.getElementById('repos-grid');


  ══════════════════════════════════════════════════════════
  STEP 2 — showState(state) HELPER
  ══════════════════════════════════════════════════════════
  Same pattern as the weather app — hide all panels, show one:
    function showState(state) {
      [emptyState, loadingState, errorState, profileResult].forEach(el => {
        el.classList.add('hidden');
      });
      if (state === 'empty')   emptyState.classList.remove('hidden');
      if (state === 'loading') loadingState.classList.remove('hidden');
      if (state === 'error')   errorState.classList.remove('hidden');
      if (state === 'result')  profileResult.classList.remove('hidden');
    }

  Initialise on load: showState('empty');


  ══════════════════════════════════════════════════════════
  STEP 3 — fetchProfile(username) — MAIN FUNCTION
  ══════════════════════════════════════════════════════════
  Make this an async function:
    async function fetchProfile(username) {
      showState('loading');
      try {
        // Fetch user profile and repos in parallel using Promise.all
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`)
        ]);

        if (!userRes.ok) {
          if (userRes.status === 404) throw new Error(`User "${username}" not found.`);
          throw new Error('GitHub API error. Try again.');
        }

        const user  = await userRes.json();
        const repos = await reposRes.json();

        displayProfile(user);
        displayRepos(repos);
        showState('result');

      } catch (error) {
        errorMessage.textContent = error.message;
        showState('error');
      }
    }

  Note the use of Promise.all — this fires both requests at the same
  time and waits for both to finish, rather than doing them one after
  the other. This is roughly twice as fast.


  ══════════════════════════════════════════════════════════
  STEP 4 — displayProfile(user) FUNCTION
  ══════════════════════════════════════════════════════════
  The GitHub user API response includes (among other things):
    user.avatar_url      → image URL
    user.login           → username (e.g. "torvalds")
    user.name            → full name (may be null)
    user.bio             → bio (may be null)
    user.location        → location (may be null)
    user.blog            → website URL (may be empty string)
    user.created_at      → ISO date string (e.g. "2011-02-03T18:00:00Z")
    user.followers       → number
    user.following       → number
    user.public_repos    → number
    user.public_gists    → number

  Fill in your DOM elements:
    avatarEl.src       = user.avatar_url;
    avatarEl.alt       = `${user.login}'s avatar`;
    fullNameEl.textContent  = user.name ?? user.login;  // fallback to login if no name
    usernameEl.textContent  = `@${user.login}`;
    bioEl.textContent       = user.bio ?? '';
    bioEl.hidden            = !user.bio;

    // Location — hide the element if null
    locationEl.textContent = user.location ?? '';
    locationEl.hidden      = !user.location;

    // Blog link — hide if empty string
    if (user.blog) {
      blogLinkEl.href        = user.blog.startsWith('http') ? user.blog : `https://${user.blog}`;
      blogLinkEl.textContent = user.blog;
      blogLinkEl.hidden      = false;
    } else {
      blogLinkEl.hidden = true;
    }

    // Join date — format it nicely
    joinDateEl.textContent = new Date(user.created_at).toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // Stats
    followersEl.textContent  = user.followers.toLocaleString();  // adds commas to large numbers
    followingEl.textContent  = user.following.toLocaleString();
    reposCountEl.textContent = user.public_repos.toLocaleString();
    gistsEl.textContent      = user.public_gists.toLocaleString();


  ══════════════════════════════════════════════════════════
  STEP 5 — displayRepos(repos) FUNCTION
  ══════════════════════════════════════════════════════════
  Build a card for each repository:
    function displayRepos(repos) {
      reposGrid.innerHTML = '';

      repos.forEach(repo => {
        const card = document.createElement('article');
        card.className = 'repo-card';

        const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-GB', {
          year: 'numeric', month: 'short', day: 'numeric'
        });

        card.innerHTML = `
          <a class="repo-name" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
            ${repo.name}
          </a>
          <p class="repo-description">${repo.description ?? 'No description'}</p>
          <div class="repo-meta">
            ${repo.language ? `<span class="language">${repo.language}</span>` : ''}
            <span>⭐ ${repo.stargazers_count}</span>
            <span>🍴 ${repo.forks_count}</span>
            <span>Updated ${updatedDate}</span>
          </div>
        `;

        reposGrid.appendChild(card);
      });
    }


  ══════════════════════════════════════════════════════════
  STEP 6 — FORM SUBMIT EVENT
  ══════════════════════════════════════════════════════════
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = usernameInput.value.trim();
      if (!username) return;
      fetchProfile(username);
    });


  ══════════════════════════════════════════════════════════
  STEP 7 — INITIALISE AND OPTIONAL IMPROVEMENTS
  ══════════════════════════════════════════════════════════
  Show the empty state on load:
    showState('empty');

  Optional: pre-fill with a demo username so the page isn't
  blank when first opened — just call fetchProfile('torvalds')
  or your own GitHub username.

  Optional: add rate limit handling. The GitHub API allows 60
  requests per hour without a token. If you get a 403:
    if (response.status === 403) throw new Error('Rate limit reached. Wait an hour or add a GitHub token.');
*/
