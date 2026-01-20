<div align="center">

# 📦 Inventory Dashboard

### AI-Powered SaaS Inventory Management Platform

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Front%20end-3178C6.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

**AI Search • Predictive Analytics • Postgres + Redis • Full-Stack Monolith**

[Features](#-features) • [Architecture](#-architecture) • [Docker Deployment](#-docker-deployment) • [Local Development](#-local-development)

</div>

---

## 🎯 Overview

Inventory Dashboard is a **full‑stack SaaS-style inventory platform** built with:

- **FastAPI** (Python) for the backend
- **React + TypeScript** for the frontend
- **PostgreSQL** as the primary database
- **Redis** for caching and rate limiting

It includes:

- Natural language **AI search** using Gemini
- **Predictive analytics** for demand and inventory
- **JWT authentication** and role-based access
- A modern dashboard UI for products, categories, alerts and analytics

---

## 🌟 Features

- 🔍 **AI-powered search** – natural language queries for inventory
- 📊 **Predictive analytics** – forecasts demand and low-stock risks
- 📦 **Inventory operations** – CRUD for products, categories, orders
- ⚡ **Redis caching** – up to ~90% latency reduction on hot endpoints
- 🔐 **JWT auth** – access & refresh tokens
- 🚦 **Rate limiting** – protect APIs from abuse
- 🐳 **Docker Compose** – one command to boot full stack (DB + cache + API + UI)

---

## 🏗 Architecture

- `backend/`
  - `app/` – FastAPI application (routers, models, schemas, services)
  - `Dockerfile` – builds a Python 3.11 image and runs `uvicorn app.main:app`
- `frontend/`
  - React + TypeScript + Vite + Tailwind
  - `Dockerfile` – builds static assets and serves them with nginx
- `docker-compose.yml`
  - `db` – Postgres 15
  - `redis` – Redis cache (internal network only)
  - `backend` – FastAPI API service (container port 8000, exposed as 8030)
  - `frontend` – nginx serving React app on container port `80` (exposed as `3000`)

---

## 🐳 Docker Deployment

### Prerequisites

- Docker Engine
- Docker Compose plugin (`docker compose`)

### Quick Start

```bash
# Clone repository
git clone https://github.com/3bkader-gpt/inventory-dashboard.git
cd inventory-dashboard

# Build images and start all services
docker compose up -d --build
```

This will start the following services:

- **db** – PostgreSQL on internal hostname `db`, exposed on host `5432`
- **redis** – Redis cache on internal hostname `redis`
- **backend** – FastAPI app on container port `8000` (exposed as host `8030`)
- **frontend** – nginx serving React app on container port `80` (exposed as host `3000`)

Now open the dashboard in your browser:

```text
http://<server-ip>:3000/
```

Backend API will be reachable (for tools / testing) at:

```text
http://<server-ip>:8030/
```

### Default Admin Credentials (development)

- Email: `admin@example.com`
- Password: `admin123`

These are configured via environment variables in `docker-compose.yml` and `app/config.py`.

### Managing the stack

```bash
# Show running containers
docker compose ps

# Tail logs
docker compose logs -f

# Stop and remove all services
docker compose down
```

---

## 💻 Local Development (without Docker)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Ensure Postgres and Redis are running (locally or in Docker)
# Update DATABASE_URL and REDIS_URL via environment or .env

uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 3000
```

During local dev, make sure `REACT_APP_API_URL` / Vite config points to your backend URL (e.g. `http://127.0.0.1:8000`).

---

## 📄 License

This project is open-source under the MIT License.
