# Digital Presence Tracker — Backend

Node.js + Express + PostgreSQL + Prisma

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env — fill in DATABASE_URL, JWT_SECRET, TOKEN_ENCRYPTION_KEY at minimum

# 3. Set up the database
npx prisma migrate dev --name init

# 4. Start the dev server
npm run dev
```

Server runs on http://localhost:3001

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | 32+ char secret. Generate: `openssl rand -hex 32` |
| `TOKEN_ENCRYPTION_KEY` | ✅ | 64 hex chars (32 bytes). Generate: `openssl rand -hex 32` |
| `SESSION_SECRET` | ✅ | Random string for OAuth session |
| `FRONTEND_URL` | ✅ | e.g. `http://localhost:5173` |
| `BACKEND_URL` | ✅ | e.g. `http://localhost:3001` |
| `META_APP_ID` | OAuth | Facebook developer console |
| `META_APP_SECRET` | OAuth | Facebook developer console |
| `GOOGLE_CLIENT_ID` | OAuth | Google Cloud console |
| `GOOGLE_CLIENT_SECRET` | OAuth | Google Cloud console |
| `RESEND_API_KEY` | Email | Password reset emails (optional) |
| `ANTHROPIC_API_KEY` | AI | AI recommendations (optional) |

---

## API Routes

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in |
| POST | `/api/auth/logout` | — | Sign out |
| GET | `/api/auth/me` | 🔒 | Get current user |
| POST | `/api/auth/forgot-password` | — | Send reset email |
| POST | `/api/auth/reset-password` | — | Reset with token |
| POST | `/api/auth/change-password` | 🔒 | Change password |

### Scores
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/score` | 🔒 | Calculate and save LDVS score |
| GET | `/api/history` | 🔒 | Last 12 scores for current user |

### User
| Method | Route | Auth | Description |
|---|---|---|---|
| PUT | `/api/user/profile` | 🔒 | Update business name, sector, location |
| DELETE | `/api/user/account` | 🔒 | Delete account and all data |

### Platforms
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/auth/facebook` | 🔒 | Redirect to Meta OAuth |
| GET | `/auth/facebook/callback` | — | OAuth callback |
| GET | `/auth/google` | 🔒 | Redirect to Google OAuth |
| GET | `/auth/google/callback` | — | OAuth callback |
| GET | `/api/auth/status` | 🔒 | Which platforms are connected |
| POST | `/api/auth/disconnect` | 🔒 | Disconnect a platform |
| GET | `/api/meta/insights` | 🔒 | Pull FB + IG data |
| GET | `/api/google/insights` | 🔒 | Pull Google Business data |

---

## File Structure

```
src/
  server.js              # Express app, middleware, route mounting
  db.js                  # Prisma client singleton
  ldvs.js                # LDVS scoring algorithm
  recommendations.js     # Rule-based bilingual recommendations (EN/SW)
  ai.js                  # AI recommendations — uncomment to activate
  middleware/
    auth.js              # JWT cookie middleware (requireAuth, optionalAuth)
  routes/
    auth.js              # Register, login, logout, forgot/reset password
    scores.js            # Score calculation + history
    user.js              # Profile update, account deletion
    platforms.js         # OAuth flows + Meta/Google insights
  services/
    crypto.js            # AES-256-GCM encrypt/decrypt for OAuth tokens
  jobs/
    sync.js              # Weekly background sync — uncomment to activate
prisma/
  schema.prisma          # Database schema (User, Score, PlatformConnection, PasswordResetToken)
```

---

## Database Setup

### Free PostgreSQL options
- **Render**: https://render.com/docs/databases — free tier, deploy backend and DB together
- **Supabase**: https://supabase.com — free tier, generous limits
- **Neon**: https://neon.tech — free serverless PostgreSQL

### Commands
```bash
npx prisma migrate dev --name init    # Create tables (development)
npx prisma migrate deploy             # Apply migrations (production)
npx prisma studio                     # Visual DB browser
npx prisma generate                   # Regenerate client after schema changes
```

---

## Activating Optional Features

### Password reset emails
1. `npm install resend`
2. Sign up at https://resend.com (free: 3,000 emails/month)
3. Add `RESEND_API_KEY` to `.env`
4. Uncomment the Resend block in `src/routes/auth.js`

### AI recommendations
1. `npm install @anthropic-ai/sdk` (or `npm install openai`)
2. Add `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` to `.env`
3. In `src/routes/scores.js`, uncomment the import and the `getAIRecommendations` call

### Background auto-sync (weekly)
1. `npm install node-cron`
2. In `src/jobs/sync.js`, uncomment the `cron.schedule()` line
3. In `src/server.js`, uncomment `startSyncJob()`

### Update LDVS weights (after N1 research)
Open `src/ldvs.js` and update the 5 numbers in the `WEIGHTS` object to match the research-validated values. That is the only change needed.

---

## Deployment to Render

1. Push code to GitHub
2. Render dashboard → New Web Service → connect your repo
3. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Start command: `npm start`
5. Add all environment variables from `.env` to Render's Environment tab
6. Add OAuth redirect URIs in Facebook and Google consoles pointing to your Render URL

---

## Security Notes

- OAuth tokens are encrypted with AES-256-GCM before database storage
- JWT is stored in an httpOnly cookie (not accessible to JavaScript)
- Passwords hashed with bcrypt (12 rounds)
- Password reset tokens are hashed SHA-256 before storage
- Auth routes are rate-limited to 10 attempts per 15 minutes per IP
- All API routes are rate-limited to 60 requests per minute per IP
- Input validation on all auth routes
- Timing-safe password comparison (prevents user enumeration)
