# 🚀 Inventory Management Dashboard

A **commercial-grade** full-stack inventory management system built with FastAPI, React, and AI-powered features.

![Python](https://img.shields.io/badge/Python-3.12+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.128+-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![Redis](https://img.shields.io/badge/Redis-Cached-DC382D?logo=redis)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-8E75B2?logo=google)
![Pytest](https://img.shields.io/badge/Tests-11_Passing-green?logo=pytest)

---

## ✨ Key Features

### Core Functionality
- 📦 **Product Management** - CRUD operations with categories, SKUs, and stock tracking
- 👥 **User Management** - Role-based access (Admin/Staff) with JWT authentication
- 📊 **Analytics Dashboard** - Real-time stats, charts, and KPIs
- 📁 **CSV Import/Export** - Bulk product operations

### 🧠 AI Capabilities
- **Natural Language Search** - Ask questions like *"Show me cheap electronics"* or *"low stock items under $50"*
- **Smart Reorder Predictions** - AI calculates days until stockout and suggests reorder quantities
- **Powered by Gemini 2.0 Flash** with intelligent regex fallback

### 🛡️ Security & Performance
- **Rate Limiting** - 100 req/min global, 10 req/min for AI endpoints
- **Redis Caching** - Dashboard stats cached with 60s TTL
- **JWT Authentication** - Secure access/refresh token flow
- **Automated Tests** - 11 Pytest tests covering all critical paths

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | FastAPI, SQLAlchemy, Pydantic |
| **Frontend** | React 18, Vite, TailwindCSS, Zustand |
| **Database** | PostgreSQL (prod) / SQLite (dev) |
| **Cache** | Redis (Upstash for serverless) |
| **AI** | Google Gemini 2.0 Flash |
| **Testing** | Pytest, HTTPX |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.12+
- Node.js 18+
- Docker (for Redis/PostgreSQL)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/inventory-dashboard.git
cd inventory-dashboard

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Environment Setup

Create `backend/.env`:
```env
DATABASE_URL=sqlite+aiosqlite:///./data/inventory.db
JWT_SECRET=your-super-secret-key
REDIS_URL=redis://localhost:6379/0
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run Services

```bash
# Start Redis (Docker)
docker run -d -p 6379:6379 redis:alpine

# Backend (new terminal)
cd backend
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm run dev
```

### 4. Access
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **Login**: `admin@example.com` / `admin123`

---

## 🧪 Running Tests

```bash
cd backend
python -m pytest tests/ -v
```

Expected output: `11 passed`

---

## 🌐 Deployment (Render + Upstash)

### Step 1: Create Upstash Redis
1. Go to [upstash.com](https://upstash.com) → Create Redis Database
2. Copy the **REST URL** (format: `rediss://default:xxx@xxx.upstash.io:6379`)

### Step 2: Deploy to Render
1. Push code to GitHub
2. Create **Web Service** on Render
3. Set environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql+asyncpg://...` (Render PostgreSQL) |
| `REDIS_URL` | `rediss://default:xxx@xxx.upstash.io:6379` |
| `JWT_SECRET` | (generate a secure random string) |
| `GEMINI_API_KEY` | (from Google AI Studio) |

### Step 3: Build Commands
- **Build**: `pip install -r requirements.txt && cd frontend && npm install && npm run build`
- **Start**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 📁 Project Structure

```
inventory-dashboard/
├── backend/
│   ├── app/
│   │   ├── core/          # Auth, cache, dependencies
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # API endpoints
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic, AI
│   └── tests/             # Pytest tests
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Route pages
│   │   ├── stores/        # Zustand state
│   │   └── api/           # API client
│   └── dist/              # Production build
└── docker-compose.yml
```

---

## 📄 License

MIT License - Feel free to use for commercial projects.

---

**Built with ❤️ using FastAPI, React, and Gemini AI**
