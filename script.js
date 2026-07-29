const API_KEY = "8b125010d405bc63482c80733c9f8e91";


window.onload = function () {
  if (document.getElementById("movies")) {
    getMovies("/movie/popular", "movies");
    getMovies("/trending/movie/week", "trending");
    getMovies("/movie/top_rated", "top-rated");
  }
};


async function getMovies(endpoint, containerId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3${endpoint}?api_key=${API_KEY}`
    );
    const data = await response.json();
    renderMovies(data.results, containerId);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}


async function searchMovies() {
  const queryInput = document.getElementById("searchInput");
  if (!queryInput) return;

  const query = queryInput.value.trim();
  if (!query) return;

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
        query
      )}`
    );
    const data = await response.json();
    renderMovies(data.results, "movies");
  } catch (error) {
    console.error("Error during search:", error);
  }
}


function renderMovies(movies, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  movies.forEach((movie) => {
    if (!movie.poster_path) return;

    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    img.alt = movie.title;

    const title = document.createElement("h2");
    title.textContent = movie.title;

    const rating = document.createElement("p");
    rating.textContent = `⭐ ${movie.vote_average.toFixed(1)}`;

    const btn = document.createElement("button");
    btn.textContent = "+ Watchlist";
    btn.addEventListener("click", () => {
      addToWatchlist(movie.title, movie.poster_path, movie.vote_average);
    });

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(rating);
    card.appendChild(btn);

    container.appendChild(card);
  });
}



function addToWatchlist(title, posterPath, voteAverage) {
  const currentUser = localStorage.getItem("loggedInUser");

  if (!currentUser) {
    showToast("You must be logged in to save movies!", "error");
    return;
  }

  let watchlistKey = `watchlist_${currentUser}`;
  let userWatchlist = JSON.parse(localStorage.getItem(watchlistKey)) || [];

  const exists = userWatchlist.some((movie) => movie.title === title);
  if (exists) {
    showToast(`"${title}" is already in your Watchlist!`, "info");
    return;
  }

  userWatchlist.push({ title: title, poster: posterPath, rating: voteAverage });
  localStorage.setItem(watchlistKey, JSON.stringify(userWatchlist));

  showToast(`"${title}" added to your Watchlist!`, "success");
}

function displayWatchlist() {
  const container =
    document.getElementById("watchlistContainer") ||
    document.getElementById("watchlistcontainer");
  const emptyText = document.getElementById("emptyWatchlistText");
  const currentUser = localStorage.getItem("loggedInUser");

  if (!container) return;

  let watchlistKey = `watchlist_${currentUser}`;
  let userWatchlist = JSON.parse(localStorage.getItem(watchlistKey)) || [];

  if (userWatchlist.length > 0) {
    if (emptyText) emptyText.style.display = "none";
    container.innerHTML = "";

    userWatchlist.forEach((movie, index) => {
      const card = document.createElement("div");
      card.className = "watchlist-card";

      const posterUrl = movie.poster
        ? `https://image.tmdb.org/t/p/w500${movie.poster}`
        : "https://via.placeholder.com/170x240?text=No+Image";

      const img = document.createElement("img");
      img.src = posterUrl;
      img.alt = movie.title;

      const title = document.createElement("h2");
      title.textContent = movie.title;

      const rating = document.createElement("p");
      rating.textContent = `⭐ ${Number(movie.rating).toFixed(1)}`;

      const btn = document.createElement("button");
      btn.className = "btn-remove";
      btn.textContent = "Remove";
      btn.addEventListener("click", () => removeFromWatchlist(index));

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(rating);
      card.appendChild(btn);

      container.appendChild(card);
    });
  } else {
    if (emptyText) emptyText.style.display = "block";
  }
}

function removeFromWatchlist(index) {
  const currentUser = localStorage.getItem("loggedInUser");
  let watchlistKey = `watchlist_${currentUser}`;
  let userWatchlist = JSON.parse(localStorage.getItem(watchlistKey)) || [];

  userWatchlist.splice(index, 1);
  localStorage.setItem(watchlistKey, JSON.stringify(userWatchlist));
  displayWatchlist();
  showToast("Movie removed from your Watchlist", "info");
}


function goHome() {
  window.location.href = "index.html";
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (sidebar && overlay) {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const usernameDisplay =
    document.getElementById("profileUsername") ||
    document.getElementById("profileusername");
  if (usernameDisplay) {
    const savedName = localStorage.getItem("loggedInUser");
    usernameDisplay.innerText = savedName ? savedName : "Guest";
  }

  displayWatchlist();


  const watchlist =
    document.getElementById("watchlistContainer") ||
    document.getElementById("watchlistcontainer");
  if (watchlist) {
    watchlist.addEventListener("wheel", (evt) => {
      evt.preventDefault();
      watchlist.scrollLeft += evt.deltaY;
    });
  }
});


function handleRegister() {
  const usernameInput = document.getElementById("registerUsername");
  const emailInput = document.getElementById("registerEmail");
  const passwordInput = document.getElementById("registerPassword");

  if (!usernameInput || !emailInput || !passwordInput) return;

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!username || !email || !password) {
    showToast("Please fill in all fields!", "error");
    return;
  }

  let users = JSON.parse(localStorage.getItem("cineAI_users")) || [];
  const userExists = users.some(
    (user) =>
      user.username.toLowerCase() === username.toLowerCase() ||
      user.email.toLowerCase() === email.toLowerCase()
  );

  if (userExists) {
    showToast("Username or email is already registered!", "error");
    return;
  }

  users.push({ username, email, password });
  localStorage.setItem("cineAI_users", JSON.stringify(users));
  localStorage.setItem("loggedInUser", username);

  window.location.href = "Profile.html";
}

function handleLogin() {
  const usernameInput = document.getElementById("loginUsername");
  const emailInput = document.getElementById("loginEmail");

  if (!usernameInput || !emailInput) return;

  const usernameOrEmail = usernameInput.value.trim() || emailInput.value.trim();
  if (!usernameOrEmail) {
    showToast("Please enter username or email!", "error");
    return;
  }

  let users = JSON.parse(localStorage.getItem("cineAI_users")) || [];
  const foundUser = users.find(
    (user) =>
      user.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
      user.email.toLowerCase() === usernameOrEmail.toLowerCase()
  );

  const finalName = foundUser ? foundUser.username : usernameOrEmail;
  localStorage.setItem("loggedInUser", finalName);
  window.location.href = "Profile.html";
}

function handleLogout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

function changePassword() {
  const oldPasswordInput = document.getElementById("oldPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const currentUser = localStorage.getItem("loggedInUser");

  if (!oldPasswordInput || !newPasswordInput || !currentUser) return;

  const oldPwd = oldPasswordInput.value;
  const newPwd = newPasswordInput.value;

  const passwordPattern = /^(?=.*[0-9]).{8,}$/;
  if (!passwordPattern.test(newPwd)) {
    showToast(
      "New password must contain at least 8 characters and 1 number!",
      "error"
    );
    return;
  }

  let users = JSON.parse(localStorage.getItem("cineAI_users")) || [];
  const userIndex = users.findIndex(
    (user) => user.username.toLowerCase() === currentUser.toLowerCase()
  );

  if (userIndex !== -1) {
    if (users[userIndex].password !== oldPwd) {
      showToast("Incorrect old password!", "error");
      return;
    }

    users[userIndex].password = newPwd;
    localStorage.setItem("cineAI_users", JSON.stringify(users));
    showToast("Password updated successfully!", "success");

    oldPasswordInput.value = "";
    newPasswordInput.value = "";
  } else {
    showToast("Guests cannot change passwords.", "info");
  }
}


function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
