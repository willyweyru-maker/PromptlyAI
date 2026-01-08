import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";

/* ================= CONFIG ================= */

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "dev_secret_change_later";

const PLAN_LIMITS = {
  free: 5,
  pro: 50,
  admin: Infinity,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ================= RATE LIMIT ================= */

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

/* ================= DATABASE ================= */

const db = new Database("db.sqlite");

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    plan TEXT DEFAULT 'free',
    usage INTEGER DEFAULT 0,
    last_used TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    created_at TEXT
  )
`).run();

/* ================= LOGGING ================= */

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ================= AUTH ================= */

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

/* ================= USAGE LIMIT ================= */

function usageLimiter(req, res, next) {
  const today = new Date().toISOString().slice(0, 10);

  const user = db.prepare(
    "SELECT usage, plan, last_used FROM users WHERE id = ?"
  ).get(req.user.id);

  if (!user) return res.sendStatus(401);

  if (user.last_used !== today) {
    db.prepare(
      "UPDATE users SET usage = 0, last_used = ? WHERE id = ?"
    ).run(today, req.user.id);
    user.usage = 0;
  }

  const limit = PLAN_LIMITS[user.plan];

  if (user.usage >= limit) {
    return res.status(429).json({
      error: "Daily limit reached",
      plan: user.plan,
      limit,
    });
  }

  next();
}

/* ================= AUTH ROUTES ================= */

app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    const result = db.prepare(
      "INSERT INTO users (email, password) VALUES (?, ?)"
    ).run(email, hash);

    const token = jwt.sign({ id: result.lastInsertRowid }, JWT_SECRET);
    res.json({ token });
  } catch {
    res.status(400).json({ error: "User exists" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare(
    "SELECT * FROM users WHERE email = ?"
  ).get(email);

  if (!user) return res.sendStatus(401);

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.sendStatus(401);

  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token });
});

/* ================= ADMIN PLAN UPGRADE ================= */

app.post("/admin/upgrade", auth, (req, res) => {
  const { userId, plan } = req.body;

  if (!["free", "pro", "admin"].includes(plan)) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  db.prepare(
    "UPDATE users SET plan = ? WHERE id = ?"
  ).run(plan, userId);

  res.json({ success: true });
});

/* ================= GENERATE POSTS ================= */

app.post("/generate", auth, usageLimiter, async (req, res) => {
  const { business } = req.body;
  if (!business) return res.status(400).json({ error: "Business required" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You generate short marketing posts." },
        { role: "user", content: `Create 3 social posts for ${business}` },
      ],
      max_tokens: 120,
    });

    const posts = completion.choices[0].message.content
      .split("\n")
      .filter(Boolean)
      .slice(0, 3);

    const now = new Date().toISOString();
    const insert = db.prepare(
      "INSERT INTO posts (user_id, content, created_at) VALUES (?, ?, ?)"
    );

    posts.forEach(p => insert.run(req.user.id, p, now));

    db.prepare(
      "UPDATE users SET usage = usage + 1 WHERE id = ?"
    ).run(req.user.id);

    res.json({ posts });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Generation failed" });
  }
});

/* ================= SERVER ================= */

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
