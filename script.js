const API_BASE = "/.netlify/functions/getmovies?endpoint=";

/* --- 1. SJEKK HVA SOM SKAL LASTES NÅR SIDEN ÅPNES --- */
window.onload = function () {
  updateAuthUI();

  if (document.getElementById("movies")) {
    getMovies("/movie/popular", "movies");
    getMovies("/trending/movie/week", "trending");
    getMovies("/movie/top_rated", "top-rated");
    getPopularActors();
    loadHeroBanner();
  }

  if (document.getElementById("watchlistContainer")) {
    loadWatchlist();
  }
};

/* --- HERO BANNER (STAR TREK) --- */
async function loadHeroBanner() {
  try {
    const response = await fetch(`${API_BASE}/tv/103516`);
    const show = await response.json();

    if (show.backdrop_path) {
      const heroBanner = document.getElementById("heroBanner");
      if (heroBanner) {
        heroBanner.style.backgroundImage = `linear-gradient(to top, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.2)), url('https://image.tmdb.org/t/p/original${show.backdrop_path}')`;
        heroBanner.style.backgroundSize = "cover";
        heroBanner.style.backgroundPosition = "center";
      }
    }
  } catch (error) {
    console.error("Feil ved henting av hero-bilde:", error);
  }
}

/* --- 2. AUTH & INNLOGGING/UTLOGGING --- */
function updateAuthUI() {
  const currentUser = localStorage.getItem("loggedInUser");
  const navRight = document.querySelector(".nav-right");

  const profileNameElem = document.getElementById("profileUsername");
  if (profileNameElem) {
    profileNameElem.textContent = currentUser ? currentUser : "Guest";
  }

  if (!navRight) return;

  if (currentUser) {
    navRight.innerHTML = `
      <a href="Profile.html" class="profile-link">
        <i class="fa-solid fa-user"></i>
      </a>
    `;
  } else {
    navRight.innerHTML = `
      <button onclick="handleLogin()" class="btn btn-primary" style="padding: 6px 14px; font-size: 0.8rem;">
        <i class="fa-solid fa-right-to-bracket"></i> Login / Register
      </button>
    `;
  }
}

function handleLogin() {
  const username = prompt("Skriv inn brukernavnet ditt for å logge inn:");
  if (username && username.trim() !== "") {
    localStorage.setItem("loggedInUser", username.trim());
    alert(`Velkommen, ${username}!`);
    updateAuthUI();
    if (document.getElementById("watchlistContainer")) {
      loadWatchlist();
    }
  }
}

function handleLogout() {
  localStorage.removeItem("loggedInUser");
  alert("Du er nå logget ut.");
  window.location.href = "index.html";
}

/* --- 3. HENT OG VIS FILMER --- */
async function getMovies(endpoint, containerId) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();
    renderMovies(data.results, containerId);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function renderMovies(movies, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  if (!movies || movies.length === 0) {
    container.innerHTML = "<p style='color:#94a3b8;'>Ingen treff funnet.</p>";
    return;
  }

  movies.forEach((movie) => {
    if (!movie.poster_path) return;

    const displayTitle = movie.title || movie.name || "Untitled";
    const mediaType = movie.title ? "movie" : "tv";

    const card = document.createElement("div");
    card.className = "card";

    card.onclick = function () {
      openMovieModal(
        movie.id,
        mediaType,
        displayTitle,
        movie.poster_path,
        movie.vote_average,
        movie.overview
      );
    };

    const img = document.createElement("img");
    img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    img.alt = displayTitle;

    const title = document.createElement("h2");
    title.textContent = displayTitle;

    const rating = document.createElement("p");
    rating.textContent = `⭐ ${
      movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
    }`;

    const btn = document.createElement("button");
    btn.textContent = "+ Watchlist";
    btn.onclick = function (e) {
      e.stopPropagation();
      addToWatchlist(displayTitle, movie.poster_path, movie.vote_average);
    };

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(rating);
    card.appendChild(btn);

    container.appendChild(card);
  });
}

/* --- 4. WATCHLIST SYSTEM --- */
function addToWatchlist(title, posterPath, voteAverage) {
  const currentUser = localStorage.getItem("loggedInUser");
  if (!currentUser) {
    alert("Du må være logget inn for å lagre filmer!");
    return;
  }

  let watchlistKey = `watchlist_${currentUser}`;
  let userWatchlist = JSON.parse(localStorage.getItem(watchlistKey)) || [];

  if (userWatchlist.some((movie) => movie.title === title)) {
    alert(`"${title}" er allerede i din Watchlist!`);
    return;
  }

  userWatchlist.push({ title: title, poster: posterPath, rating: voteAverage });
  localStorage.setItem(watchlistKey, JSON.stringify(userWatchlist));
  alert(`"${title}" ble lagt til i din Watchlist!`);
}

function loadWatchlist() {
  const container = document.getElementById("watchlistContainer");
  const currentUser = localStorage.getItem("loggedInUser");

  if (!container) return;

  if (!currentUser) {
    container.innerHTML =
      "<p style='color: var(--text-muted);'>Du må være logget inn for å se din Watchlist.</p>";
    return;
  }

  let watchlistKey = `watchlist_${currentUser}`;
  let userWatchlist = JSON.parse(localStorage.getItem(watchlistKey)) || [];

  if (userWatchlist.length === 0) {
    container.innerHTML =
      "<p style='color: var(--text-muted);'>Din Watchlist er tom.</p>";
    return;
  }

  container.innerHTML = "";

  userWatchlist.forEach((movie, index) => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = `https://image.tmdb.org/t/p/w500${movie.poster}`;
    img.alt = movie.title;

    const title = document.createElement("h2");
    title.textContent = movie.title;

    const rating = document.createElement("p");
    rating.textContent = `⭐ ${
      movie.rating ? Number(movie.rating).toFixed(1) : "N/A"
    }`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Fjern";
    removeBtn.style.backgroundColor = "#ef4444";
    removeBtn.onclick = function (e) {
      e.stopPropagation();
      removeFromWatchlist(index);
    };

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(rating);
    card.appendChild(removeBtn);

    container.appendChild(card);
  });
}

function removeFromWatchlist(index) {
  const currentUser = localStorage.getItem("loggedInUser");
  if (!currentUser) return;

  let watchlistKey = `watchlist_${currentUser}`;
  let userWatchlist = JSON.parse(localStorage.getItem(watchlistKey)) || [];

  userWatchlist.splice(index, 1);
  localStorage.setItem(watchlistKey, JSON.stringify(userWatchlist));

  loadWatchlist();
}

/* --- 5. DEDIKERT AI-SIDE FUNKSJONALITET --- */
function openAIPage() {
  document
    .querySelectorAll(".nav-links a")
    .forEach((a) => a.classList.remove("active"));
  const aiNav = document.getElementById("navAI");
  if (aiNav) aiNav.classList.add("active");

  const hero = document.getElementById("heroBanner");
  if (hero) hero.style.display = "none";

  const mainContainer = document.getElementById("mainContainer");
  if (!mainContainer) return;

  mainContainer.innerHTML = `
    <section class="ai-page-container">
      <div class="ai-card">
        <div class="ai-header">
          <i class="fa-solid fa-wand-magic-sparkles ai-icon"></i>
          <h2>CineAI Assistant</h2>
        </div>
        <p style="color: var(--text-muted); margin-bottom: 20px;">
          Fortell oss hva du har lyst til å se på, så analyserer vår AI databasen for deg!
        </p>
        <div class="ai-input-group">
          <input type="text" id="aiPrompt" placeholder="f.eks. 'mørk sci-fi', 'morsom komedie', 'spennende thriller'..." />
          <button onclick="runAISearch()" class="btn btn-primary" id="aiBtn">
            <i class="fa-solid fa-robot"></i> Generer Anbefalinger
          </button>
        </div>
      </div>

      <div class="movie-section" style="margin-top: 40px;">
        <div class="section-header">
          <h2 id="aiResultTitle">AI Anbefalte Filmer</h2>
        </div>
        <div class="movie-row" id="aiResultsRow">
          <p style="color: var(--text-muted);">Skriv inn et ønske ovenfor for å hente AI-forslag.</p>
        </div>
      </div>
    </section>
  `;
}

async function runAISearch() {
  const input = document.getElementById("aiPrompt");
  const row = document.getElementById("aiResultsRow");
  const btn = document.getElementById("aiBtn");

  if (!input || !input.value.trim()) {
    alert("Vennligst skriv inn hva du har lyst til å se!");
    return;
  }

  const query = input.value.trim();

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Analyserer...`;
  row.innerHTML =
    "<p style='color: var(--accent-color);'>🤖 CineAI søker gjennom filmdatabasen...</p>";

  try {
    const response = await fetch(
      `${API_BASE}/search/multi?query=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      renderMovies(data.results, "aiResultsRow");
    } else {
      row.innerHTML = `<p style='color: var(--text-muted);'>🤖 Ingen filmer matchet "${query}". Prøv et annet søkeord!</p>`;
    }
  } catch (err) {
    console.error("AI Page Error:", err);
    row.innerHTML =
      "<p style='color: #ef4444;'>Det oppstod en feil ved henting av forslag.</p>";
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-robot"></i> Generer Anbefalinger`;
  }
}

/* --- 6. POPULAR ACTORS FUNKSJONER --- */
async function getPopularActors() {
  const container = document.getElementById("popular-actors");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE}/person/popular`);
    const data = await response.json();

    container.innerHTML = "";

    data.results.forEach((actor) => {
      if (!actor.profile_path) return;

      const card = document.createElement("div");
      card.className = "actor-card";
      card.onclick = () => openActorModal(actor.id);

      const img = document.createElement("img");
      img.className = "actor-img";
      img.src = `https://image.tmdb.org/t/p/w185${actor.profile_path}`;
      img.alt = actor.name;

      const name = document.createElement("h2");
      name.textContent = actor.name;

      const knownFor = document.createElement("p");
      knownFor.textContent = actor.known_for_department || "Actor";

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(knownFor);

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Feil ved henting av skuespillere:", error);
  }
}

async function openActorModal(actorId) {
  const modal = document.getElementById("movieModal");
  if (!modal) return;

  try {
    const actorRes = await fetch(`${API_BASE}/person/${actorId}`);
    const actor = await actorRes.json();

    const creditsRes = await fetch(
      `${API_BASE}/person/${actorId}/movie_credits`
    );
    const credits = await creditsRes.json();

    const topMovies = credits.cast
      ? credits.cast.sort((a, b) => b.popularity - a.popularity).slice(0, 5)
      : [];

    const movieListHtml =
      topMovies.length > 0
        ? topMovies
            .map(
              (m) =>
                `<li><b>${m.title}</b> (${
                  m.release_date ? m.release_date.split("-")[0] : "N/A"
                })</li>`
            )
            .join("")
        : "<li>Ingen filmer registrert.</li>";

    document.getElementById("modalTitle").textContent = actor.name;
    document.getElementById(
      "modalPoster"
    ).src = `https://image.tmdb.org/t/p/w500${actor.profile_path}`;
    document.getElementById("modalRating").textContent = `🎭 Kjent for: ${
      actor.known_for_department || "Skuespiller"
    }`;

    document.getElementById("modalOverview").innerHTML = `
      <p style="margin-bottom: 12px;">${
        actor.biography ||
        "Ingen biografi tilgjengelig for denne skuespilleren."
      }</p>
      <h3 style="color: var(--accent-color); font-size: 1rem; margin-bottom: 6px;">Kjente filmer:</h3>
      <ul style="padding-left: 20px; color: #cbd5e1; font-size: 0.9rem;">
        ${movieListHtml}
      </ul>
    `;

    document.getElementById("trailerContainer").innerHTML = "";

    const watchlistBtn = document.getElementById("modalWatchlistBtn");
    if (watchlistBtn) watchlistBtn.style.display = "none";

    modal.style.display = "flex";
  } catch (error) {
    console.error("Feil ved henting av skuespillerdetaljer:", error);
  }
}

/* --- 7. POPUP / MODAL MED TRAILER --- */
async function openMovieModal(id, type, title, posterPath, rating, overview) {
  const modal = document.getElementById("movieModal");
  if (!modal) return;

  const watchlistBtn = document.getElementById("modalWatchlistBtn");
  if (watchlistBtn) watchlistBtn.style.display = "inline-block";

  document.getElementById("modalTitle").textContent = title;
  document.getElementById(
    "modalPoster"
  ).src = `https://image.tmdb.org/t/p/w500${posterPath}`;
  document.getElementById("modalRating").textContent = `⭐ ${
    rating ? Number(rating).toFixed(1) : "N/A"
  }`;
  document.getElementById("modalOverview").textContent =
    overview || "No description available.";

  if (watchlistBtn) {
    watchlistBtn.onclick = function () {
      addToWatchlist(title, posterPath, rating);
    };
  }

  const trailerContainer = document.getElementById("trailerContainer");
  if (trailerContainer) {
    trailerContainer.innerHTML = "";

    try {
      const response = await fetch(`${API_BASE}/${type}/${id}/videos`);
      const data = await response.json();

      const trailer = data.results.find(
        (vid) =>
          vid.site === "YouTube" &&
          (vid.type === "Trailer" || vid.type === "Teaser")
      );

      if (trailer) {
        trailerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>`;
      } else {
        trailerContainer.innerHTML =
          "<p style='color:#94a3b8;'>No trailer available.</p>";
      }
    } catch (error) {
      trailerContainer.innerHTML =
        "<p style='color:#94a3b8;'>Failed to load trailer.</p>";
    }
  }

  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("movieModal");
  if (modal) {
    modal.style.display = "none";
    document.getElementById("trailerContainer").innerHTML = "";
  }
}

window.onclick = function (event) {
  const modal = document.getElementById("movieModal");
  if (event.target === modal) {
    closeModal();
  }
};

/* --- 8. NAVIGASJON OG SØK --- */
function toggleSearchInput() {
  const searchBox = document.getElementById("searchBox");
  if (!searchBox) return;
  searchBox.style.display =
    searchBox.style.display === "none" ? "flex" : "none";
}

function handleSearch(event) {
  if (event.key === "Enter") executeSearch();
}

async function executeSearch() {
  const queryInput = document.getElementById("searchInput");
  if (!queryInput) return;
  const query = queryInput.value.trim();
  if (!query) return;

  try {
    const response = await fetch(
      `${API_BASE}/search/multi?query=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    const hero = document.getElementById("heroBanner");
    if (hero) hero.style.display = "none";

    renderMovies(data.results, "trending");
  } catch (error) {
    console.error("Search error:", error);
  }
}

function filterCategory(type) {
  document
    .querySelectorAll(".nav-links a")
    .forEach((a) => a.classList.remove("active"));

  if (type === "movie") {
    getMovies("/discover/movie", "trending");
    getMovies("/movie/popular", "movies");
    getMovies("/movie/top_rated", "top-rated");
  } else if (type === "tv") {
    getMovies("/discover/tv", "trending");
    getMovies("/tv/popular", "movies");
    getMovies("/tv/top_rated", "top-rated");
  }
}

function goHome() {
  window.location.href = "index.html";
}
