/**
 * Background Sync Job
 * Runs every 7 days. For every user with a connected platform,
 * pulls fresh data and saves a new score automatically.
 *
 * ACTIVATE: npm install node-cron, then uncomment startSyncJob() in server.js
 */

// import cron from "node-cron";
import axios from "axios";
import { prisma } from "../db.js";
import { decrypt, encrypt } from "../services/crypto.js";
import { calcLDVS, getGrade } from "../ldvs.js";
import { generateRecs } from "../recommendations.js";

/**
 * Pull and score a single user's connected platforms.
 * Returns the saved score record, or null if nothing could be pulled.
 */
export async function syncUserPlatforms(userId) {
  const connections = await prisma.platformConnection.findMany({
    where: { userId },
  });

  if (connections.length === 0) return null;

  let profileComplete = 50; // defaults if pull fails
  let postFreq        = 30;
  let engagement      = 40;
  let responsiveness  = 60;
  const platforms     = [];
  let source          = "auto";

  for (const conn of connections) {
    try {
      let accessToken = decrypt(conn.accessToken);

      // ── Facebook ────────────────────────────────────────────────────────
      if (conn.platform === "facebook" && conn.pageId) {
        const pageToken = accessToken;

        const profileRes = await axios.get(`https://graph.facebook.com/v19.0/${conn.pageId}`, {
          params: { access_token: pageToken, fields: "name,about,phone,location,hours,cover,picture" },
        });
        const pf = profileRes.data;
        const fields = ["name","about","phone","location","hours","cover","picture"];
        profileComplete = Math.round((fields.filter(f => pf[f]).length / fields.length) * 100);

        const since    = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
        const postsRes = await axios.get(`https://graph.facebook.com/v19.0/${conn.pageId}/posts`, {
          params: { access_token: pageToken, since, limit: 100, fields: "id" },
        });
        postFreq = Math.min(100, Math.round(((postsRes.data.data?.length || 0) / 30) * 100));

        const insRes = await axios.get(`https://graph.facebook.com/v19.0/${conn.pageId}/insights`, {
          params: { access_token: pageToken, metric: "page_post_engagements", period: "month" },
        });
        const engVal = insRes.data.data?.[0]?.values?.slice(-1)[0]?.value || 0;
        engagement = Math.min(100, Math.round((engVal / 500) * 100));

        const respRes = await axios.get(`https://graph.facebook.com/v19.0/${conn.pageId}`, {
          params: { access_token: pageToken, fields: "response_rate" },
        });
        responsiveness = respRes.data.response_rate || responsiveness;

        platforms.push("Facebook");

        await prisma.platformConnection.update({
          where: { id: conn.id }, data: { lastSyncedAt: new Date() },
        });
      }

      // ── Google ──────────────────────────────────────────────────────────
      if (conn.platform === "google") {
        // Auto-refresh token if expired
        if (conn.tokenExpiry && new Date(conn.tokenExpiry) < new Date() && conn.refreshToken) {
          try {
            const refreshed = await axios.post("https://oauth2.googleapis.com/token", {
              client_id:     process.env.GOOGLE_CLIENT_ID,
              client_secret: process.env.GOOGLE_CLIENT_SECRET,
              refresh_token: decrypt(conn.refreshToken),
              grant_type:    "refresh_token",
            });
            accessToken = refreshed.data.access_token;
            const expiry = new Date(Date.now() + refreshed.data.expires_in * 1000);
            await prisma.platformConnection.update({
              where: { id: conn.id },
              data:  { accessToken: encrypt(accessToken), tokenExpiry: expiry },
            });
          } catch { continue; }
        }

        const headers = { Authorization: `Bearer ${accessToken}` };
        const accountsRes = await axios.get(
          "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
          { headers }
        );
        const account = accountsRes.data.accounts?.[0];
        if (!account) continue;

        const locRes = await axios.get(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
          { headers, params: { readMask: "name,title,phoneNumbers,regularHours,websiteUri,profile,storefrontAddress" } }
        );
        const loc = locRes.data.locations?.[0];
        if (!loc) continue;

        const gFields = ["title","phoneNumbers","regularHours","websiteUri","profile","storefrontAddress"];
        const googleProfile = Math.round((gFields.filter(f => loc[f]).length / gFields.length) * 100);

        // Average with FB profile if already set
        profileComplete = Math.round((profileComplete + googleProfile) / 2);

        const reviewsRes = await axios.get(
          `https://mybusiness.googleapis.com/v4/${loc.name}/reviews`,
          { headers }
        );
        const reviews      = reviewsRes.data.reviews || [];
        const totalReviews = reviewsRes.data.totalReviewCount || 0;
        const replied      = reviews.filter(r => r.reviewReply).length;
        const googleResp   = totalReviews > 0
          ? Math.round((replied / Math.min(reviews.length, totalReviews)) * 100)
          : 50;
        responsiveness = Math.round((responsiveness + googleResp) / 2);

        platforms.push("Google Maps");

        await prisma.platformConnection.update({
          where: { id: conn.id }, data: { lastSyncedAt: new Date() },
        });
      }
    } catch (err) {
      console.error(`[sync] Error syncing ${conn.platform} for user ${userId}:`, err.message);
    }
  }

  if (platforms.length === 0) return null;

  const metrics = { profileComplete, postFreq, engagement, responsiveness, platforms };
  const score   = calcLDVS(metrics);
  const grade   = getGrade(score);
  const recs    = generateRecs(metrics, "en");

  const user = await prisma.user.findUnique({ where: { id: userId } });

  return prisma.score.create({
    data: {
      userId,
      score, grade,
      profileComplete, postFreq, engagement, responsiveness,
      platforms, recs,
      businessName: user?.businessName || null,
      sector:       user?.sector       || null,
      location:     user?.location     || null,
      source,
    },
  });
}

/**
 * Run a full sync across all users who have at least one platform connected.
 */
export async function runFullSync() {
  console.log("[sync] Starting scheduled sync...");
  const userIds = await prisma.platformConnection.findMany({
    distinct: ["userId"],
    select:   { userId: true },
  });

  let synced = 0;
  for (const { userId } of userIds) {
    try {
      const result = await syncUserPlatforms(userId);
      if (result) synced++;
    } catch (err) {
      console.error(`[sync] Failed for user ${userId}:`, err.message);
    }
  }
  console.log(`[sync] Done. Synced ${synced} / ${userIds.length} users.`);
}

/**
 * Start the cron schedule.
 * Uncomment and call this from server.js once node-cron is installed.
 */
export function startSyncJob() {
  // Runs every Sunday at 03:00 EAT (00:00 UTC)
  // cron.schedule("0 0 * * 0", runFullSync, { timezone: "Africa/Nairobi" });
  // console.log("[sync] Background sync job scheduled (weekly, Sunday 03:00 EAT)");

  // To test immediately: uncomment the line below
  // runFullSync();

  console.log("[sync] Background sync job is READY — uncomment cron.schedule() in jobs/sync.js to activate");
}
