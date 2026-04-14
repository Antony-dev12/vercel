# Digital Presence Tracker — Setup Guide

## Project Structure
```
radabiz/
├── dpt ver 2(backend)/
│   ├── dpt-backend/          [Express API, Prisma, OAuth integrations]
│   └── dpt-frontend/         [React + Vite frontend]
├── DPT--main(frontend)/      [TypeScript React + Vite with modern stack]
└── ldvs-platform-main/       [Supabase functions and DB management]
```

## Current Status ✅
- [x] Copied all project files
- [x] Installed backend dependencies (dpt-backend)
- [x] Installed frontend dependencies (dpt-frontend, DPT--main)
- [x] Created .env and .env.local files
- [ ] Configure Database (Supabase)
- [ ] Run Prisma migration
- [ ] Start backend and frontend servers

## Next Steps

### 1. Configure Supabase Database URL
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select project: `xagbguncsimivveezckc`
3. Go to **Settings** → **Database** → **Connection Strings**
4. Select **"PostgreSQL"** under Connection Strings
5. Copy the **"Connection pooling"** URL
6. Update `c:\Users\ANTONY\CascadeProjects\radabiz\dpt ver 2(backend)\dpt-backend\.env`
   - Replace: `DATABASE_URL=postgresql://user:password@localhost:5432/dpt_db`
   - With your Supabase connection string

### 2. Generate Security Keys
For the .env file in dpt-backend, generate secure random strings:
```powershell
# Generate JWT_SECRET (use openssl or Python)
python -c "import secrets; print(secrets.token_hex(32))"

# Generate TOKEN_ENCRYPTION_KEY (must be 64 hex characters = 32 bytes)
python -c "import secrets; print(secrets.token_hex(32))"

# Generate SESSION_SECRET
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3. OAuth Configuration (Optional for development)
Update these in .env if you want to test OAuth login:
- `META_APP_ID` – Facebook App ID
- `META_APP_SECRET` – Facebook App Secret
- `TWITTER_API_KEY` / `TWITTER_API_SECRET`
- `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

### 4. Run Database Migration
Once .env is configured with proper DATABASE_URL:
```bash
cd "dpt ver 2(backend)/dpt-backend"
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start Development Servers

**Backend (dpt-backend):**
```bash
cd "dpt ver 2(backend)/dpt-backend"
npm run dev
# Runs on http://localhost:3001
```

**Frontend (dpt-frontend):**
```bash
cd "dpt ver 2(backend)/dpt-frontend"
npm run dev
# Runs on http://localhost:5173
```

**Main Frontend (DPT--main):**
```bash
cd "DPT--main(frontend)"
npm run dev
# Runs on http://localhost:5173 (or next available port)
```

## Important Security Notes
- **Never commit .env files** – they're in .gitignore
- **Keep secrets safe** – regenerate keys in production
- **Supabase reference:** xagbguncsimivveezckc
- **Supabase URL:** https://xagbguncsimivveezckc.supabase.co

## Database Schema
The Prisma schema includes:
- **User** – Business users with email, name, sector, location
- **PlatformConnection** – OAuth tokens for Instagram, Facebook, LinkedIn, TikTok, etc.
- **Score** – Business presence scores (0-100, A-F grades)
- **PasswordResetToken** – Secure password reset flow

## Troubleshooting

**Database connection fails?**
- Verify DATABASE_URL format in .env
- Check Supabase project is running
- Ensure connection pooling mode is enabled in Supabase

**Migration errors?**
- Run: `npx prisma migrate resolve --rolled-back <migration_name>` to retry
- Run: `npx prisma db push` to sync without migrations

**Dependencies missing?**
- Backend: `cd "dpt ver 2(backend)/dpt-backend" && npm install`
- Frontend: `cd "dpt ver 2(backend)/dpt-frontend" && npm install`
- Main: `cd "DPT--main(frontend)" && npm install`

