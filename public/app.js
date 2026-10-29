// The jokes page (Sprint 2). Requires a logged-in user.
// Jokes come from the server, which guarantees no repeats per user.

const username = sessionStorage.getItem("username");

// If nobody is logged in, send them to the login page.
if (!username) {
  window.location.href = "login.html";
}

document.getElementById("welcome").textContent = `Logged in as ${username}`;

// Ask the server for a joke this user has not heard yet.
document.getElementById("joke-btn").addEventListener("click", async () => {
  const jokeEl = document.getElementById("joke");
  const button = document.getElementById("joke-btn");

  try {
    const response = await fetch(`/api/joke?user=${encodeURIComponent(username)}`);
    const data = await response.json();

    if (data.joke) {
      jokeEl.textContent = data.joke;
    } else {
      // No jokes left for this user.
      jokeEl.textContent = data.message;
      button.disabled = true;
    }
  } catch (error) {
    jokeEl.textContent = "Could not load a joke. Is the server running?";
  }
});

// Log out: forget the user and return to the login page.
document.getElementById("logout-btn").addEventListener("click", () => {
  sessionStorage.removeItem("username");
  window.location.href = "login.html";
});
