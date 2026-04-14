/**
 * Insights Routes (all require auth)
 *
 * GET /api/meta/insights    — pull live data from Facebook + Instagram
 * GET /api/google/insights  — pull live data from Google Business Profile
 */

import { Router } from "express";
import axios from "axios";
import { requireAuth } from "../middleware/auth.js";
import { getToken } from "./oauth.js";

const router = Router();
router.use(requireAuth);

// ── Meta (Facebook + Instagram) ───────────────────────────────────────────────
router.get("/meta", async (req, res) => {
  const token = await getToken(req.user.id, "facebook");
  if (!token) {
    return res.status(401).json({ error: "Not connected to Facebook. Please reconnect." });
  }

  try {
    // 1. Get managed pages
    const pagesRes = await axios.get("https://graph.facebook.com/v19.0/me/accounts", {
      params: { access_token: token, fields: "id,name,access_token,instagram_business_account" },
    });

    const page = pagesRes.data.data[0];
    if (!page) return res.status(404).json({ error: "No Facebook Page found on this account." });

    const pageToken = page.access_token;

    // 2. Profile completeness
    const profileRes = await axios.get(`https://graph.facebook.com/v19.0/${page.id}`, {
      params: { access_token: pageToken, fields: "name,about,phone,location,hours,cover,picture" },
    });
    const profile = profileRes.data;
    const profileFields = ["name", "about", "phone", "location", "hours", "cover", "picture"];
    const profileComplete = Math.round((profileFields.filter(f => profile[f]).length / profileFields.length) * 100);

    // 3. Post frequency (last 30 days)
    const since = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
    const postsRes = await axios.get(`https://graph.facebook.com/v19.0/${page.id}/posts`, {
      params: { access_token: pageToken, since, limit: 100, fields: "id,created_time" },
    });
    const postCount = postsRes.data.data?.length || 0;
    const postFreq = Math.min(100, Math.round((postCount / 30) * 100));

    // 4. Engagement (page insights)
    const insightsRes = await axios.get(`https://graph.facebook.com/v19.0/${page.id}/insights`, {
      params: { access_token: pageToken, metric: "page_post_engagements,page_fan_adds", period: "month" },
    });
    const engValue = insightsRes.data.data?.[0]?.values?.slice(-1)[0]?.value || 0;
    const engagement = Math.min(100, Math.round((engValue / 500) * 100));

    // 5. Responsiveness
    const respRes = await axios.get(`https://graph.facebook.com/v19.0/${page.id}`, {
      params: { access_token: pageToken, fields: "response_rate,response_time" },
    });
    const responsiveness = respRes.data.response_rate || 0;

    // 6. Instagram (if connected)
    let igData = null;
    if (page.instagram_business_account) {
      const igRes = await axios.get(`https://graph.facebook.com/v19.0/${page.instagram_business_account.id}`, {
        params: { access_token: pageToken, fields: "followers_count,media_count,biography,website" },
      });
      igData = igRes.data;
    }

    res.json({
      source: "facebook",
      pageName: page.name,
      profileComplete,
      postFreq,
      engagement,
      responsiveness,
      hasInstagram: !!igData,
      instagram: igData,
    });
  } catch (err) {
    console.error("Meta insights error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch Facebook data.", detail: err.response?.data });
  }
});

// ── Google Business Profile ───────────────────────────────────────────────────
router.get("/google", async (req, res) => {
  const token = await getToken(req.user.id, "google");
  if (!token) {
    return res.status(401).json({ error: "Not connected to Google. Please reconnect." });
  }

  try {
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Get account
    const accountsRes = await axios.get(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers }
    );
    const account = accountsRes.data.accounts?.[0];
    if (!account) return res.status(404).json({ error: "No Google Business account found." });

    // 2. Get locations
    const locRes = await axios.get(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
      { headers, params: { readMask: "name,title,phoneNumbers,regularHours,websiteUri,profile,storefrontAddress" } }
    );
    const location = locRes.data.locations?.[0];
    if (!location) return res.status(404).json({ error: "No Google Business location found." });

    // 3. Profile completeness
    const gFields = ["title", "phoneNumbers", "regularHours", "websiteUri", "profile", "storefrontAddress"];
    const profileComplete = Math.round((gFields.filter(f => location[f]).length / gFields.length) * 100);

    // 4. Review response rate
    const reviewsRes = await axios.get(
      `https://mybusiness.googleapis.com/v4/${location.name}/reviews`,
      { headers }
    );
    const reviews = reviewsRes.data.reviews || [];
    const totalReviews = reviewsRes.data.totalReviewCount || 0;
    const repliedReviews = reviews.filter(r => r.reviewReply).length;
    const responsiveness = totalReviews > 0
      ? Math.round((repliedReviews / Math.min(reviews.length, totalReviews)) * 100)
      : 50;

    res.json({
      source: "google",
      businessName: location.title,
      profileComplete,
      responsiveness,
      totalReviews,
    });
  } catch (err) {
    console.error("Google insights error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch Google data.", detail: err.response?.data });
  }
});

export default router;
