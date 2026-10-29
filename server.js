// The Absolute Dad's Jokes Site - Sprint 2
// Adds a login page and a simple JSON "database" so that:
//   1. Users log in with hard-coded credentials (data/users.json).
//   2. Each user only ever hears a joke once (data/seen.json).
//
// NOTE (for the class): storing passwords in plain text and trusting a
// username in the query string is intentionally insecure. It keeps the
// exercise simple. In a real app you would hash passwords and use real
// sessions/tokens. This is a great talking point for a security review.

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Read-only content that ships with the deployment (safe to keep next to the code)
const JOKES_DIR = path.join(__dirname, "jokes");

// Writable runtime data: must live outside the deployed package.
// On Azure App Service Linux, /home is the only persistent, writable path.
// Locally, fall back to the project's own data/ folder so nothing breaks in dev.
const WRITABLE_DATA_DIR = process.env.WEBSITE_INSTANCE_ID
  ? path.join("/home", "data")
  : path.join(__dirname, "data");
const USERS_FILE = path.join(WRITABLE_DATA_DIR, "users.json");
const SEEN_FILE = path.join(WRITABLE_DATA_DIR, "seen.json");

// Ensure the writable directory exists on first run in any environment.
if (!fs.existsSync(WRITABLE_DATA_DIR)) {
  fs.mkdirSync(WRITABLE_DATA_DIR, { recursive: true });
}

const SEED_USERS_FILE = path.join(__dirname, "data", "users.json");
if (!fs.existsSync(USERS_FILE) && fs.existsSync(SEED_USERS_FILE)) {
  fs.copyFileSync(SEED_USERS_FILE, USERS_FILE);
}

// The joke files that make up our content. Keep this in sync with /jokes.
const JOKE_FILES = [
  "jokes-general.json",
  "jokes-food.json",
  "jokes-animals.json",
  "jokes-technology.json",
  "jokes-misc.json",
];

// ---- Small helpers to read/write our JSON "database" ----

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

// Load and flatten all jokes from every file into one array.
function loadAllJokes() {
  let jokes = [];
  for (const fileName of JOKE_FILES) {
    const file = readJson(path.join(JOKES_DIR, fileName), { jokes: [] });
    jokes = jokes.concat(file.jokes);
  }
  return jokes;
}

// ---- API: login ----
// Checks the username/password against data/users.json.
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const users = readJson(USERS_FILE, []);

  const match = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (match) {
    res.json({ ok: true, username });
  } else {
    res
      .status(401)
      .json({ ok: false, message: "Invalid username or password." });
  }
});

// ---- API: get a joke this user has NOT heard yet ----
// Records the joke against the user so it is never repeated.
app.get("/api/joke", (req, res) => {
  const username = req.query.user;
  if (!username) {
    return res.status(400).json({ message: "Missing user." });
  }

  const allJokes = loadAllJokes();
  const seen = readJson(SEEN_FILE, {});
  const seenByUser = seen[username] || [];

  // Only keep jokes this user has not heard before.
  const remaining = allJokes.filter((joke) => !seenByUser.includes(joke));

  if (remaining.length === 0) {
    return res.json({
      joke: null,
      message: "You've heard them all! Come back after we add more.",
    });
  }

  const joke = remaining[Math.floor(Math.random() * remaining.length)];

  // Remember that this user has now heard this joke, then save to disk.
  seenByUser.push(joke);
  seen[username] = seenByUser;
  writeJson(SEEN_FILE, seen);

  res.json({ joke, remaining: remaining.length - 1 });
});

app.listen(PORT, () => {
  console.log(`Dad's Jokes site running at http://localhost:${PORT}`);
});
