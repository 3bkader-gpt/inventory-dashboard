# 🚀 Deployment Checklist: Render + Upstash

## Prerequisites
- [ ] GitHub repository with latest code pushed
- [ ] Google Cloud account for Gemini API key

---

## Step 1: Upstash Redis (Free Tier)

1. **Sign up** at [console.upstash.com](https://console.upstash.com)
2. Click **Create Database** → Select **Global** region
3. Copy the **Redis URL** (starts with `rediss://`)

> ⚠️ Use `rediss://` (with double 's') for TLS connections

---

## Step 2: Render PostgreSQL

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New** → **PostgreSQL**
3. Name: `inventory-db`
4. Plan: **Free**
5. Copy the **Internal Database URL** after creation

---

## Step 3: Render Web Service

1. Click **New** → **Web Service**
2. Connect your **GitHub repository**
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `inventory-api` |
| **Region** | Oregon (US West) or closest |
| **Branch** | `main` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r backend/requirements.txt && cd frontend && npm install && npm run build` |
| **Start Command** | `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

---

## Step 4: Environment Variables

Add these in Render Dashboard → **Environment**:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@host/db` | From Render PostgreSQL (convert `postgres://` to `postgresql+asyncpg://`) |
| `REDIS_URL` | `rediss://default:xxx@xxx.upstash.io:6379` | From Upstash |
| `JWT_SECRET` | `your-super-secret-random-string` | Generate with `openssl rand -hex 32` |
| `GEMINI_API_KEY` | `AIzaSy...` | From [Google AI Studio](https://aistudio.google.com/apikey) |
| `FIRST_ADMIN_EMAIL` | `admin@yourcompany.com` | Optional |
| `FIRST_ADMIN_PASSWORD` | `secure-password` | Optional |

---

## Step 5: Deploy

1. Click **Create Web Service**
2. Wait for build (~3-5 minutes)
3. Access your app at `https://inventory-api.onrender.com`

---

## Verification Checklist

- [ ] API health check: `GET /api/health` returns `{"status": "healthy"}`
- [ ] Login works with admin credentials
- [ ] Dashboard loads with stats
- [ ] Smart Search (`Ctrl+K`) returns AI-parsed results
- [ ] Redis shows `✅ Redis Connected` in logs

---

## Troubleshooting

### Redis Connection Failed
- Ensure `REDIS_URL` uses `rediss://` (TLS) not `redis://`
- Check Upstash dashboard for connection limits

### Database Connection Failed
- Convert `postgres://` to `postgresql+asyncpg://` in URL
- Ensure Internal URL is used (not External)

### Gemini AI Not Working
- Check `GEMINI_API_KEY` is valid
- Verify quota at Google AI Studio

---

**🎉 Your Commercial Inventory Dashboard is Live!**
