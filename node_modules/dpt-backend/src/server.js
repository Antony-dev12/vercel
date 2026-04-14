/**
 * Digital Presence Tracker — Backend Server
 *
 * Routes:
 *  POST /api/auth/register        — create account
 *  POST /api/auth/login           — sign in
 *  POST /api/auth/logout          — sign out
 *  GET  /api/auth/me              — get current user
 *  POST /api/auth/forgot-password — send reset email
 *  POST /api/auth/reset-password  — apply reset token
 *  POST /api/auth/change-password — change password (auth required)
 *
 *  PUT    /api/user/profile       — update profile (auth required)
 *  DELETE /api/user/account       — delete account (auth required)
 *
 *  POST /api/score                — calculate + save score (auth required)
 *  GET  /api/history              — score history for current user (auth required)
 *
 *  GET  /auth/facebook            — start Facebook OAuth (auth required)
 *  GET  /auth/facebook/callback   — Facebook OAuth callback
 *  GET  /auth/google              — start Google OAuth (auth required)
 *  GET  /auth/google/callback     — Google OAuth callback
 *  GET  /api/auth/status          — check connected platforms (auth required)
 *  POST /api/auth/disconnect      — remove platform connection (auth required)
 *
 *  GET  /api/meta/insights        — pull Meta data (auth required)
 *  GET  /api/google/insights      — pull Google data (auth required)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SETUP:
 *  1. cp .env.example .env  and fill in all values
 *  2. npm install
 *  3. npx prisma migrate dev --name init
 *  4. npm run dev
 * ─────────────────────────────────────────────────────────────────────────────
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes     from "./routes/auth.js";
import userRoutes     from "./routes/user.js";
import scoreRoutes    from "./routes/scores.js";
import oauthRoutes    from "./routes/oauth.js";
import insightRoutes  from "./routes/insights.js";

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true, // required for cookies
}));
app.use(express.json());
app.use(cookieParser()); // required for reading httpOnly JWT cookie

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/user",    userRoutes);
app.use("/api",         scoreRoutes);   // POST /api/score, GET /api/history
app.use("/auth",        oauthRoutes);   // GET /auth/facebook, /auth/google
app.use("/api/auth",    oauthRoutes);   // GET /api/auth/status, POST /api/auth/disconnect
app.use("/api/meta",    insightRoutes); // GET /api/meta/insights (mapped to /meta in router)
app.use("/api/google",  insightRoutes); // GET /api/google/insights (mapped to /google in router)

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`DPT Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
