# Deploy to Render — Step-by-Step Guide

**Time needed:** ~15 minutes  
**Cost:** Free (90-day free PostgreSQL + free web services)

---

## Prerequisites
- A [Render](https://render.com) account (free — sign up with GitHub)
- Your code pushed to GitHub (already connected to `https://github.com/Antony-dev12/vercel.git`)

---

## Step 1 — Push latest code to GitHub

Open a terminal in the project root and run:
```bash
git add .
git commit -m "feat: manual entry quiz + Render deployment config"
git push origin main
```

---

## Step 2 — Create everything with one Blueprint click

1. Log in to **https://dashboard.render.com**
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repo (`Antony-dev12/vercel`)
4. Render will find the `render.yaml` file automatically
5. Click **"Apply"**

Render will now create:
- ✅ **dpt-db** — PostgreSQL database (free, 90 days)
- ✅ **dpt-backend** — Node.js API on port 3001
- ✅ **dpt-frontend** — React static site

Wait ~5 minutes for the first deploy to complete.

---

## Step 3 — Note your service URLs

Once deployed, go to your Render dashboard and copy these two URLs:

| Service | URL (example) |
|---|---|
| dpt-backend | `https://dpt-backend.onrender.com` |
| dpt-frontend | `https://dpt-frontend.onrender.com` |

Your exact URLs will have a random suffix like `https://dpt-backend-xxxx.onrender.com`.

---

## Step 4 — Set the cross-service environment variables

These two steps are needed because the frontend and backend need to know each other's URLs.

### 4a — Backend: set FRONTEND_URL and BACKEND_URL

1. Render dashboard → **dpt-backend** → **Environment**
2. Add / update:
   ```
   FRONTEND_URL = https://dpt-frontend-xxxx.onrender.com
   BACKEND_URL  = https://dpt-backend-xxxx.onrender.com
   ```
3. Click **"Save Changes"** — backend redeploys automatically

### 4b — Frontend: set VITE_API_URL

1. Render dashboard → **dpt-frontend** → **Environment**
2. Add:
   ```
   VITE_API_URL = https://dpt-backend-xxxx.onrender.com
   ```
3. Click **"Save Changes"**
4. Then go to **Manual Deploy** → **"Deploy latest commit"** to rebuild the frontend with the new env var

---

## Step 5 — Done! 🎉

Visit your frontend URL: `https://dpt-frontend-xxxx.onrender.com`

- Register an account
- Complete the 2-step onboarding quiz
- See your LDVS score on the dashboard

---

## Troubleshooting

### "Application failed to respond" on backend
- Check **Logs** in the Render dashboard for the dpt-backend service
- Most common cause: DB connection. Check if `DATABASE_URL` was auto-set from dpt-db.

### Auth doesn't work (always redirects to login)
- Make sure `FRONTEND_URL` on the backend matches your exact frontend URL (no trailing slash)
- The cookies use `sameSite: "none"` in production — this requires HTTPS, which Render provides automatically

### Frontend shows blank page or 404 on refresh
- The `render.yaml` already sets up the SPA rewrite rule (`/* → /index.html`). If you deployed manually (not via Blueprint), make sure to add this redirect rule in the Render static site settings.

### Database connection error
- Render's free PostgreSQL takes ~30 seconds to wake up after inactivity
- Check that `DATABASE_URL` in dpt-backend environment is set and points to dpt-db

---

## Free Tier Limits (Render)

| Resource | Free Limit |
|---|---|
| PostgreSQL | 90 days, 1 GB storage |
| Web Services (backend) | Spins down after 15 min inactivity — first request takes ~30s to wake up |
| Static Sites (frontend) | Always on — no sleep |

> **Tip:** Render free web services sleep after 15 minutes. The first API call after sleeping will take ~30 seconds. This is normal. Consider using [UptimeRobot](https://uptimerobot.com) (free) to ping `/health` every 10 minutes to keep it awake.

---

## Keeping It Running Beyond 90 Days

When the free PostgreSQL expires:
1. Export data: `pg_dump $DATABASE_URL > backup.sql`
2. Create a new free Render PostgreSQL
3. Restore: `psql $NEW_DATABASE_URL < backup.sql`
4. Update the `DATABASE_URL` env var in dpt-backend
