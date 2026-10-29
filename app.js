// The Absolute Dad's Jokes Site - Sprint 1
// A minimal, static site: click a button, get a random joke.

// List every joke file in the /jokes folder here.
// When a student adds a new file, they just add its path to this array.
const JOKE_FILES = [
  "jokes/jokes-general.json",
  "jokes/jokes-food.json",
];

// We load every joke into this array once, when the page opens.
let allJokes = [];

// Fetch all joke files and flatten them into a single list.
async function loadJokes() {
  try {
    const responses = await Promise.all(JOKE_FILES.map((file) => fetch(file)));
    const files = await Promise.all(responses.map((res) => res.json()));

    // Each file looks like { "category": "...", "jokes": ["...", "..."] }
    allJokes = files.flatMap((file) => file.jokes);
  } catch (error) {
    console.error("Could not load jokes:", error);
    document.getElementById("joke").textContent =
      "Could not load the jokes. Are you running this with Live Server (http), not file://?";
  }
}

// Pick one joke at random and show it.
function showRandomJoke() {
  if (allJokes.length === 0) return;

  const index = Math.floor(Math.random() * allJokes.length);
  document.getElementById("joke").textContent = allJokes[index];
}

// Wire up the button and load the jokes on startup.
document.getElementById("joke-btn").addEventListener("click", showRandomJoke);
loadJokes();
