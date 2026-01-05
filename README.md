# 🚀 Inventory Dashboard

A production-ready, full-stack **SaaS Inventory Management Dashboard** with a futuristic "Orbital Command Center" UI design.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📦 **Product Management** | Full CRUD with search, pagination, filtering, CSV import/export |
| 📊 **Dashboard Analytics** | Real-time stats, animated charts, low-stock alerts |
| 👥 **User Management** | Role-based access (Admin/Staff), JWT authentication |
| 🏷️ **Category System** | Organize products with categories |
| 🎨 **Orbital UI** | Glassmorphism, dark theme, Framer Motion animations |
| 🐳 **Docker Ready** | One-command deployment with PostgreSQL |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** + Shadcn/UI
- **Framer Motion** (animations)
- **Recharts** (data visualization)
- **Zustand** (state management)

### Backend
- **FastAPI** (Python 3.11+)
- **SQLAlchemy 2.0** (async ORM)
- **PostgreSQL** + asyncpg
- **JWT Authentication** (python-jose)
- **bcrypt** password hashing

---

## 🚀 Quick Start

### Option 1: Single-Process Mode (Development)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/inventory-dashboard.git
cd inventory-dashboard

# Install backend dependencies
pip install -e ./backend

# Build frontend
cd frontend && npm install && npm run build && cd ..

# Run the app
python run_app.py
```

Open **http://localhost:8000**

### Option 2: Docker Compose (Production)

```bash
docker-compose up -d
```

Services:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **PostgreSQL**: localhost:5432

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `admin123` |

⚠️ **Change these in production!**

---

## 📁 Project Structure

```
inventory-dashboard/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── main.py         # App entry + static serving
│   │   ├── config.py       # Settings (pydantic)
│   │   ├── database.py     # SQLAlchemy async setup
│   │   ├── models/         # ORM models
│   │   ├── schemas/        # Pydantic DTOs
│   │   ├── routers/        # API endpoints
│   │   ├── core/           # Auth, security
│   │   └── services/       # Business logic
│   ├── Dockerfile
│   └── pyproject.toml
│
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── pages/          # Route components
│   │   ├── components/     # UI components
│   │   ├── stores/         # Zustand stores
│   │   ├── api/            # Axios clients
│   │   └── types/          # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml       # Multi-service orchestration
├── run_app.py              # Single-process runner
└── verify_deployment_readiness.py  # Pre-deploy checks
```

---

## 🔌 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Auth | Current user |
| GET | `/api/products` | Auth | List products |
| POST | `/api/products` | Admin | Create product |
| PATCH | `/api/products/{id}/quantity` | Auth | Update stock |
| GET | `/api/dashboard/stats` | Auth | Dashboard stats |
| GET | `/api/categories` | Auth | List categories |
| GET | `/api/users` | Admin | List users |

Full API docs: **http://localhost:8000/docs**

---

## ⚙️ Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/inventory_db
JWT_SECRET=your-secret-key-here
FIRST_ADMIN_EMAIL=admin@example.com
FIRST_ADMIN_PASSWORD=secure-password
```

---

## ✅ Pre-Deployment Check

Run the verification script before deploying:

```bash
python verify_deployment_readiness.py
```

---

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

## 👨‍💻 Author

Built with ❤️ using Claude AI assistance.
