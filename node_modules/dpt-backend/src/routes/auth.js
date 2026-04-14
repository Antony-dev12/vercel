/**
 * Auth Routes
 *
 * POST /api/auth/register        — create account
 * POST /api/auth/login           — sign in
 * POST /api/auth/logout          — sign out
 * GET  /api/auth/me              — get current user (requires auth)
 * POST /api/auth/forgot-password — send reset email
 * POST /api/auth/reset-password  — apply new password via token
 * POST /api/auth/change-password — change password (requires auth)
 */

import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { signToken, setAuthCookie, clearAuthCookie, requireAuth } from "../middleware/auth.js";
import { sendPasswordResetEmail } from "../lib/email.js";

const router = Router();
const BCRYPT_ROUNDS = 12;

// ── Register ─────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { email, password, businessName, name, sector, location } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name?.trim() || null,
        businessName: businessName?.trim() || null,
        sector: sector?.trim() || null,
        location: location?.trim() || null,
      },
    });

    const token = signToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, businessName: user.businessName, hasOnboarded: user.hasOnboarded },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Could not create account. Please try again." });
  }
});

// ── Login ────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // Constant-time response to avoid user enumeration
      await bcrypt.hash("dummy", BCRYPT_ROUNDS);
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, businessName: user.businessName, sector: user.sector, location: user.location, language: user.language, hasOnboarded: user.hasOnboarded },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ── Logout ───────────────────────────────────────────────────────────────────
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

// ── Get current user ─────────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, businessName: true, sector: true, location: true, language: true, hasOnboarded: true },
    });
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch user." });
  }
});

// ── Forgot password ───────────────────────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // Always return 200 — never reveal whether email exists
  res.json({ ok: true });

  if (!email) return;

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return; // Silent — do not reveal

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing unused tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token: tokenHash, expiresAt },
    });

    // Send email with rawToken in the link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&id=${user.id}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    console.error("Forgot password error:", err);
    // Swallow — user already got 200
  }
});

// ── Reset password ────────────────────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  const { token, userId, newPassword } = req.body;

  if (!token || !userId || !newPassword) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  try {
    // Find all valid (unused, not expired) tokens for this user
    const records = await prisma.passwordResetToken.findMany({
      where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
    });

    // Find the matching token (bcrypt compare)
    let matched = null;
    for (const record of records) {
      const ok = await bcrypt.compare(token, record.token);
      if (ok) { matched = record; break; }
    }

    if (!matched) {
      return res.status(400).json({ error: "Invalid or expired reset link." });
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Update password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: matched.id }, data: { usedAt: new Date() } }),
    ]);

    res.json({ ok: true });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Could not reset password. Please try again." });
  }
});

// ── Change password (authenticated) ──────────────────────────────────────────
router.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both current and new password are required." });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });

    res.json({ ok: true });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Could not change password." });
  }
});

export default router;
