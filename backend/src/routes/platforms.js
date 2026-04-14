/**
 * Platform Connection Routes
 * GET  /auth/facebook              → Redirect to Meta OAuth
 * GET  /auth/facebook/callback     → Handle callback, store token in DB
 * GET  /auth/google                → Redirect to Google OAuth
 * GET  /auth/google/callback       → Handle callback, store token in DB
 * GET  /api/auth/status            → Return which platforms are connected
 * POST /api/auth/disconnect        → Disconnect a platform
 * GET  /api/meta/insights          → Pull FB + IG data
 * GET  /api/google/insights        → Pull Google Business data
 */

import { Router } from "express";
import axios from "axios";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { encrypt, decrypt } from "../services/crypto.js";

const router = Router();

const BACKEND_URL  = process.env.BACKEND_URL  || "http://localhost:3001";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ── Helper: get decrypted token for a platform ───────────────────────────────
async function getToken(userId, platform) {
  const conn = await prisma.platformConnection.findUnique({
    where: { userId_platform: { userId, platform } },
  });
  if (!conn) return null;
  try {
    return {
      accessToken:  decrypt(conn.accessToken),
      refreshToken: conn.refreshToken ? decrypt(conn.refreshToken) : null,
      tokenExpiry:  conn.tokenExpiry,
      pageId:       conn.pageId,
      pageName:     conn.pageName,
    };
  } catch {
    return null; // Decryption failure — treat as disconnected
  }
}

// ── Helper: refresh Google token if expired ───────────────────────────────────
async function refreshGoogleToken(userId, refreshTokenPlain) {
  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshTokenPlain,
      grant_type:    "refresh_token",
    });

    const newAccess = tokenRes.data.access_token;
    const expiry    = new Date(Date.now() + tokenRes.data.expires_in * 1000);

    await prisma.platformConnection.update({
      where:  { userId_platform: { userId, platform: "google" } },
      data:   { accessToken: encrypt(newAccess), tokenExpiry: expiry },
    });

    return newAccess;
  } catch (err) {
    console.error("Google token refresh failed:", err.response?.data || err.message);
    return null;
  }
}

// ════════════════════════════════════════════════════════
// FACEBOOK / INSTAGRAM OAUTH
// ════════════════════════════════════════════════════════

router.get("/auth/facebook", requireAuth, (req, res) => {
  // Store user ID in session so we can link the connection after callback
  req.session = req.session || {};
  req.session.oauthUserId = req.user.id;

  const params = new URLSearchParams({
    client_id:     process.env.META_APP_ID,
    redirect_uri:  `${BACKEND_URL}/auth/facebook/callback`,
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
    state: req.user.id, // pass user ID as state parameter
  });
  res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
});

router.get("/auth/facebook/callback", async (req, res) => {
  const { code, state: userId, error } = req.query;

  if (error || !code || !userId) {
    return res.redirect(`${FRONTEND_URL}?error=facebook_auth_failed`);
  }

  try {
    // Exchange code for access token
    const tokenRes = await axios.get("https://graph.facebook.com/v19.0/oauth/access_token", {
      params: {
        client_id:     process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri:  `${BACKEND_URL}/auth/facebook/callback`,
        code,
      },
    });

    const accessToken = tokenRes.data.access_token;

    // Get the user's first Facebook Page
    const pagesRes = await axios.get("https://graph.facebook.com/v19.0/me/accounts", {
      params: { access_token: accessToken, fields: "id,name,access_token" },
    });
    const page = pagesRes.data.data?.[0];

    // Store encrypted token in DB (upsert in case they reconnect)
    await prisma.platformConnection.upsert({
      where:  { userId_platform: { userId, platform: "facebook" } },
      create: {
        userId,
        platform:    "facebook",
        accessToken: encrypt(page?.access_token || accessToken),
        pageId:      page?.id   || null,
        pageName:    page?.name || null,
      },
      update: {
        accessToken:  encrypt(page?.access_token || accessToken),
        pageId:       page?.id   || null,
        pageName:     page?.name || null,
        updatedAt:    new Date(),
      },
    });

    res.redirect(`${FRONTEND_URL}?connected=facebook`);
  } catch (err) {
    console.error("Facebook OAuth error:", err.response?.data || err.message);
    res.redirect(`${FRONTEND_URL}?error=facebook_auth_failed`);
  }
});

// ════════════════════════════════════════════════════════
// GOOGLE OAUTH
// ════════════════════════════════════════════════════════

router.get("/auth/google", requireAuth, (req, res) => {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID,
    redirect_uri:  `${BACKEND_URL}/auth/google/callback`,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/business.manage",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    access_type: "offline",
    prompt:      "consent",
    state:       req.user.id,
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get("/auth/google/callback", async (req, res) => {
  const { code, state: userId, error } = req.query;

  if (error || !code || !userId) {
    return res.redirect(`${FRONTEND_URL}?error=google_auth_failed`);
  }

  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  `${BACKEND_URL}/auth/google/callback`,
      grant_type:    "authorization_code",
    });

    const { access_token, refresh_token, expires_in } = tokenRes.data;
    const expiry = new Date(Date.now() + expires_in * 1000);

    await prisma.platformConnection.upsert({
      where:  { userId_platform: { userId, platform: "google" } },
      create: {
        userId,
        platform:     "google",
        accessToken:  encrypt(access_token),
        refreshToken: refresh_token ? encrypt(refresh_token) : null,
        tokenExpiry:  expiry,
      },
      update: {
        accessToken:  encrypt(access_token),
        refreshToken: refresh_token ? encrypt(refresh_token) : null,
        tokenExpiry:  expiry,
        updatedAt:    new Date(),
      },
    });

    res.redirect(`${FRONTEND_URL}?connected=google`);
  } catch (err) {
    console.error("Google OAuth error:", err.response?.data || err.message);
    res.redirect(`${FRONTEND_URL}?error=google_auth_failed`);
  }
});

// ════════════════════════════════════════════════════════
// AUTH STATUS & DISCONNECT
// ════════════════════════════════════════════════════════

router.get("/api/auth/status", requireAuth, async (req, res) => {
  try {
    const connections = await prisma.platformConnection.findMany({
      where:  { userId: req.user.id },
      select: { platform: true, pageName: true, lastSyncedAt: true },
    });
    const status = { facebook: false, google: false };
    const details = {};
    for (const c of connections) {
      status[c.platform]  = true;
      details[c.platform] = { pageName: c.pageName, lastSyncedAt: c.lastSyncedAt };
    }
    res.json({ ...status, details });
  } catch (err) {
    res.status(500).json({ error: "Could not check auth status" });
  }
});

router.post("/api/auth/disconnect", requireAuth, async (req, res) => {
  const { platform } = req.body;
  if (!["facebook", "google"].includes(platform)) {
    return res.status(400).json({ error: "Invalid platform" });
  }
  try {
    await prisma.platformConnection.deleteMany({
      where: { userId: req.user.id, platform },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Could not disconnect" });
  }
});

// ════════════════════════════════════════════════════════
// META INSIGHTS
// ════════════════════════════════════════════════════════

router.get("/api/meta/insights", requireAuth, async (req, res) => {
  const tokenData = await getToken(req.user.id, "facebook");
  if (!tokenData) {
    return res.status(401).json({ error: "Not connected to Facebook" });
  }

  try {
    const pageToken = tokenData.accessToken;
    const pageId    = tokenData.pageId;

    if (!pageId) {
      return res.status(404).json({ error: "No Facebook Page found — reconnect your account" });
    }

    // 1. Profile completeness
    const profileRes = await axios.get(`https://graph.facebook.com/v19.0/${pageId}`, {
      params: { access_token: pageToken, fields: "name,about,phone,location,hours,cover,picture" },
    });
    const profile      = profileRes.data;
    const profileFields = ["name", "about", "phone", "location", "hours", "cover", "picture"];
    const filledFields  = profileFields.filter(f => profile[f]);
    const profileComplete = Math.round((filledFields.length / profileFields.length) * 100);

    // 2. Posting frequency — posts in last 30 days
    const since    = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
    const postsRes = await axios.get(`https://graph.facebook.com/v19.0/${pageId}/posts`, {
      params: { access_token: pageToken, since, limit: 100, fields: "id,created_time" },
    });
    const postCount = postsRes.data.data?.length || 0;
    const postFreq  = Math.min(100, Math.round((postCount / 30) * 100));

    // 3. Engagement — from Page insights
    const insightsRes = await axios.get(`https://graph.facebook.com/v19.0/${pageId}/insights`, {
      params: { access_token: pageToken, metric: "page_post_engagements,page_fan_adds", period: "month" },
    });
    const engData  = insightsRes.data.data;
    const engValue = engData?.[0]?.values?.slice(-1)[0]?.value || 0;
    const engagement = Math.min(100, Math.round((engValue / 500) * 100));

    // 4. Responsiveness
    const respRes = await axios.get(`https://graph.facebook.com/v19.0/${pageId}`, {
      params: { access_token: pageToken, fields: "response_rate,response_time" },
    });
    const responsiveness = respRes.data.response_rate || 0;

    // 5. Instagram
    let igData = null;
    const pageFullRes = await axios.get(`https://graph.facebook.com/v19.0/${pageId}`, {
      params: { access_token: pageToken, fields: "instagram_business_account" },
    });
    if (pageFullRes.data.instagram_business_account) {
      const igId  = pageFullRes.data.instagram_business_account.id;
      const igRes = await axios.get(`https://graph.facebook.com/v19.0/${igId}`, {
        params: { access_token: pageToken, fields: "followers_count,media_count,biography,website" },
      });
      igData = igRes.data;
    }

    // Update lastSyncedAt
    await prisma.platformConnection.update({
      where: { userId_platform: { userId: req.user.id, platform: "facebook" } },
      data:  { lastSyncedAt: new Date() },
    });

    res.json({
      source: "facebook",
      pageName: tokenData.pageName || profile.name,
      profileComplete, postFreq, engagement, responsiveness,
      hasInstagram: !!igData, instagram: igData,
    });
  } catch (err) {
    console.error("Meta insights error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch Meta insights", detail: err.response?.data });
  }
});

// ════════════════════════════════════════════════════════
// GOOGLE INSIGHTS
// ════════════════════════════════════════════════════════

router.get("/api/google/insights", requireAuth, async (req, res) => {
  let tokenData = await getToken(req.user.id, "google");
  if (!tokenData) {
    return res.status(401).json({ error: "Not connected to Google" });
  }

  // Auto-refresh if expired
  if (tokenData.tokenExpiry && new Date(tokenData.tokenExpiry) < new Date()) {
    if (tokenData.refreshToken) {
      const newToken = await refreshGoogleToken(req.user.id, tokenData.refreshToken);
      if (newToken) tokenData.accessToken = newToken;
    }
  }

  try {
    const headers = { Authorization: `Bearer ${tokenData.accessToken}` };

    // 1. Get accounts
    const accountsRes = await axios.get(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers }
    );
    const account = accountsRes.data.accounts?.[0];
    if (!account) return res.status(404).json({ error: "No Google Business account found" });

    // 2. Get locations
    const locRes = await axios.get(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
      { headers, params: { readMask: "name,title,phoneNumbers,regularHours,websiteUri,profile,storefrontAddress" } }
    );
    const location = locRes.data.locations?.[0];
    if (!location) return res.status(404).json({ error: "No Google Business location found" });

    // 3. Profile completeness
    const gFields    = ["title", "phoneNumbers", "regularHours", "websiteUri", "profile", "storefrontAddress"];
    const gFilled    = gFields.filter(f => location[f]);
    const profileComplete = Math.round((gFilled.length / gFields.length) * 100);

    // 4. Reviews / responsiveness
    const reviewsRes = await axios.get(
      `https://mybusiness.googleapis.com/v4/${location.name}/reviews`,
      { headers }
    );
    const reviews        = reviewsRes.data.reviews || [];
    const totalReviews   = reviewsRes.data.totalReviewCount || 0;
    const repliedReviews = reviews.filter(r => r.reviewReply).length;
    const responsiveness = totalReviews > 0
      ? Math.round((repliedReviews / Math.min(reviews.length, totalReviews)) * 100)
      : 50;

    // Update lastSyncedAt
    await prisma.platformConnection.update({
      where: { userId_platform: { userId: req.user.id, platform: "google" } },
      data:  { lastSyncedAt: new Date() },
    });

    res.json({
      source: "google",
      businessName: location.title,
      profileComplete, responsiveness, totalReviews,
      locationName: location.name,
    });
  } catch (err) {
    console.error("Google insights error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch Google insights", detail: err.response?.data });
  }
});

export default router;
