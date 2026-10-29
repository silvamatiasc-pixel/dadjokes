// Handles the login form: sends the username/password to the server,
// and on success remembers who is logged in for the current tab.

document.getElementById("login-btn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.ok) {
      // Remember the logged-in user for this browser tab, then go to the site.
      sessionStorage.setItem("username", data.username);
      window.location.href = "index.html";
    } else {
      message.textContent = data.message;
    }
  } catch (error) {
    message.textContent = "Could not reach the server. Is it running?";
  }
});
