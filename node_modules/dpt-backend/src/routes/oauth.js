/**
 * OAuth Routes
 *
 * GET  /auth/facebook          → connect Facebook to current user
 * GET  /auth/facebook/callback → handle callback
 * GET  /auth/google            → connect Google to current user
 * GET  /auth/google/callback   → handle callback
 *
 * GET  /auth/facebook/login    → login with Facebook (no auth req)
 * GET  /auth/google/login      → login with Google (no auth req)
 *
 * GET  /api/auth/status        → check which platforms are connected
 * POST /api/auth/disconnect    → remove platform connection
 */

import { Router } from "express";
import axios from "axios";
import { prisma } from "../lib/prisma.js";
import { requireAuth, signToken, setAuthCookie } from "../middleware/auth.js";
import { encrypt, decrypt } from "../lib/crypto.js";

const router = Router();

// ── Facebook / Instagram (Connect) ───────────────────────────────────────────
router.get("/facebook", requireAuth, (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID,
    redirect_uri: `${process.env.BACKEND_URL}/auth/facebook/callback`,
    scope: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_read_user_content",
      "instagram_basic",
      "instagram_manage_insights",
      "business_management",
      "read_insights",
    ].join(","),
    response_type: "code",
    state: req.user.id,
  });
  res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
});

router.get("/facebook/callback", async (req, res) => {
  const { code, state: userId, error } = req.query;
  if (error || !code || !userId) {
    return res.redirect(`${process.env.FRONTEND_URL}/settings?error=facebook_auth_failed`);
  }
  try {
    const tokenRes = await axios.get("https://graph.facebook.com/v19.0/oauth/access_token", {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: `${process.env.BACKEND_URL}/auth/facebook/callback`,
        code,
      },
    });
    const accessToken = tokenRes.data.access_token;
    const expiresIn = tokenRes.data.expires_in;
    await prisma.platformConnection.upsert({
      where: { userId_platform: { userId, platform: "facebook" } },
      update: {
        accessToken: encrypt(accessToken),
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        platform: "facebook",
        accessToken: encrypt(accessToken),
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
      },
    });
    res.redirect(`${process.env.FRONTEND_URL}/settings?connected=facebook`);
  } catch (err) {
    console.error("Facebook Connect error:", err.message);
    res.redirect(`${process.env.FRONTEND_URL}/settings?error=facebook_auth_failed`);
  }
});

// ── Google (Connect) ─────────────────────────────────────────────────────────
router.get("/google", requireAuth, (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BACKEND_URL}/auth/google/callback`,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/business.manage",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state: req.user.id,
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get("/google/callback", async (req, res) => {
  const { code, state: userId, error } = req.query;
  if (error || !code || !userId) {
    return res.redirect(`${process.env.FRONTEND_URL}/settings?error=google_auth_failed`);
  }
  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BACKEND_URL}/auth/google/callback`,
      grant_type: "authorization_code",
    });
    const { access_token, refresh_token, expires_in } = tokenRes.data;
    await prisma.platformConnection.upsert({
      where: { userId_platform: { userId, platform: "google" } },
      update: {
        accessToken: encrypt(access_token),
        refreshToken: refresh_token ? encrypt(refresh_token) : undefined,
        expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        platform: "google",
        accessToken: encrypt(access_token),
        refreshToken: refresh_token ? encrypt(refresh_token) : null,
        expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
      },
    });
    res.redirect(`${process.env.FRONTEND_URL}/settings?connected=google`);
  } catch (err) {
    console.error("Google Connect error:", err.message);
    res.redirect(`${process.env.FRONTEND_URL}/settings?error=google_auth_failed`);
  }
});

// ── Login with Google ─────────────────────────────────────────────────────────
router.get("/google/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BACKEND_URL}/auth/google/login/callback`,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get("/google/login/callback", async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);

  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BACKEND_URL}/auth/google/login/callback`,
      grant_type: "authorization_code",
    });

    const userRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
    });

    const { email, name, sub } = userRes.data;
    let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: "oauth-" + sub,
          businessName: name,
        },
      });
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    res.redirect(`${process.env.FRONTEND_URL}${user.hasOnboarded ? "/dashboard" : "/onboarding"}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
  }
});

// ── Login with Facebook ───────────────────────────────────────────────────────
router.get("/facebook/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID,
    redirect_uri: `${process.env.BACKEND_URL}/auth/facebook/login/callback`,
    scope: "email,public_profile",
    response_type: "code",
  });
  res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
});

router.get("/facebook/login/callback", async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) return res.redirect(`${process.env.FRONTEND_URL}/login?error=facebook_failed`);

  try {
    const tokenRes = await axios.get("https://graph.facebook.com/v19.0/oauth/access_token", {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: `${process.env.BACKEND_URL}/auth/facebook/login/callback`,
        code,
      },
    });

    const userRes = await axios.get("https://graph.facebook.com/me", {
      params: { access_token: tokenRes.data.access_token, fields: "id,name,email" },
    });

    const { email, name, id } = userRes.data;
    if (!email) return res.redirect(`${process.env.FRONTEND_URL}/login?error=facebook_no_email`);

    let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: "oauth-" + id,
          businessName: name,
        },
      });
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    res.redirect(`${process.env.FRONTEND_URL}${user.hasOnboarded ? "/dashboard" : "/onboarding"}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=facebook_failed`);
  }
});

// ── Status & Disconnect ───────────────────────────────────────────────────────
router.get("/status", requireAuth, async (req, res) => {
  try {
    const conns = await prisma.platformConnection.findMany({
      where: { userId: req.user.id },
      select: { platform: true },
    });
    const list = conns.map(c => c.platform);
    res.json({ facebook: list.includes("facebook"), google: list.includes("google") });
  } catch {
    res.json({ facebook: false, google: false });
  }
});

router.post("/disconnect", requireAuth, async (req, res) => {
  const { platform } = req.body;
  try {
    await prisma.platformConnection.deleteMany({
      where: { userId: req.user.id, platform },
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to disconnect" });
  }
});

// ── Helper: getToken ─────────────────────────────────────────────────────────
export async function getToken(userId, platform) {
  const conn = await prisma.platformConnection.findUnique({
    where: { userId_platform: { userId, platform } },
  });
  if (!conn) return null;

  if (platform === "google" && conn.expiresAt && conn.expiresAt < new Date()) {
    if (!conn.refreshToken) return null;
    try {
      const refreshRes = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: decrypt(conn.refreshToken),
        grant_type: "refresh_token",
      });
      const { access_token, expires_in } = refreshRes.data;
      await prisma.platformConnection.update({
        where: { userId_platform: { userId, platform } },
        data: {
          accessToken: encrypt(access_token),
          expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
        },
      });
      return access_token;
    } catch { return null; }
  }
  return decrypt(conn.accessToken);
}

export default router;
