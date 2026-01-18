<div align="center">

# 📦 Inventory Dashboard

### AI-Powered SaaS Inventory Management Platform

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Latest-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178C6.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

**AI-Powered • High Performance • Predictive Analytics • Full-Stack**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Contributing](#-contributing)

[العربية](README-ar.md) | [English](#-inventory-dashboard)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Technologies Used](#-technologies-used)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🎯 Overview

**Inventory Dashboard** is a complete SaaS inventory management platform with integrated frontend and backend. Uses Gemini 2.0 Flash for natural language search, Redis caching (90% performance boost), predictive analytics, and rate-limited APIs.

### ✨ Why Inventory Dashboard?

- 🤖 **AI-Powered** - Natural language search using Gemini
- ⚡ **Ultra Performance** - Redis cache reduces response time by 90%
- 📊 **Smart Analytics** - Predictive forecasts for inventory and demand
- 🔒 **Secure** - JWT authentication and security
- 🚀 **Full-Stack** - FastAPI + React

---

## 🌟 Features

### 🚀 Main Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI-Powered** | Using Gemini 2.0 Flash for natural language search |
| ⚡ **High Performance** | Redis caching (90% performance boost) |
| 📊 **Predictive Analytics** | Smart forecasts for inventory and demand |
| 🔒 **Secure** | JWT authentication and security |
| 🚀 **Full-Stack** | FastAPI backend and React frontend |
| 🐳 **Docker** | Ready for deployment using Docker |
| 📈 **Rate Limiting** | Rate-limited APIs |

### 🎯 Advanced Features

- ✅ **Smart Search** - Natural language search
- ✅ **Real-time Updates** - Instant inventory updates
- ✅ **Detailed Reports** - Comprehensive analytics and statistics
- ✅ **Alerts** - Low stock notifications
- ✅ **Data Export** - Export reports in various formats

---

## 📦 Requirements

Before starting, make sure you have installed:

- **Docker** and **Docker Compose** (recommended)
- **Python** 3.8+ (for backend)
- **Node.js** 16+ (for frontend)
- **PostgreSQL** (or use Docker)
- **Redis** (or use Docker)
- **Gemini API Key** (optional for AI search)

---

## 🚀 Installation

### Method 1: Using Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/3bkader-gpt/inventory-dashboard.git
cd inventory-dashboard

# 2. Set up environment file
cp .env.example .env
# Edit .env file with your data

# 3. Run the application
docker-compose up -d

# 4. Open browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Method 2: Manual Installation

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Set up database
# Create PostgreSQL database

# Run server
uvicorn main:app --reload
```

#### Frontend

```bash
cd frontend

# Install requirements
npm install

# Run application
npm start
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/inventory_db

# Redis
REDIS_URL=redis://localhost:6379

# Gemini AI (optional)
GEMINI_API_KEY=your_gemini_api_key_here

# JWT
SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Frontend
REACT_APP_API_URL=http://localhost:8000

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Database Setup

```bash
# Using Docker
docker-compose up -d postgres

# Or manually
createdb inventory_db
```

---

## 📖 Usage

### AI-Powered Search

You can search for products using natural language:

- "Show me all products expiring this month"
- "What are the best-selling products?"
- "Display low stock products"
- "Which products need reordering?"

### Inventory Management

#### Adding a New Product

1. Go to "Add Product" page
2. Fill in required data
3. Save product

#### Editing a Product

1. Search for product
2. Click "Edit"
3. Make required changes
4. Save changes

#### Viewing Reports

1. Go to "Reports" page
2. Select report type
3. Set time period
4. View report

---

## 📁 Project Structure

```
inventory-dashboard/
├── 📂 backend/              # Backend API (FastAPI)
│   ├── 📂 app/
│   │   ├── 📂 api/          # Endpoints
│   │   ├── 📂 models/       # Data models
│   │   ├── 📂 services/     # Business logic
│   │   └── 📂 utils/        # Utilities
│   ├── 📄 main.py           # Entry point
│   └── 📄 requirements.txt   # Requirements
├── 📂 frontend/             # Frontend (React)
│   ├── 📂 src/
│   │   ├── 📂 components/    # Components
│   │   ├── 📂 pages/        # Pages
│   │   ├── 📂 services/     # API services
│   │   └── 📂 utils/        # Utilities
│   └── 📄 package.json       # Requirements
├── 📂 docs/                  # Documentation
├── 🐳 docker-compose.yml     # Docker setup
└── 📄 .env.example           # Environment file example
```

---

## 🛠️ Technologies Used

### Backend

<div align="center">

| Technology | Description |
|------------|-------------|
| ![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?logo=fastapi&logoColor=white) | Web framework |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-316192?logo=postgresql&logoColor=white) | Database |
| ![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis&logoColor=white) | Caching |
| ![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google&logoColor=white) | AI |
| ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-29A4D1?logo=sqlalchemy&logoColor=white) | ORM |
| ![Pydantic](https://img.shields.io/badge/Pydantic-Validation-E92063?logo=pydantic&logoColor=white) | Data validation |

</div>

### Frontend

<div align="center">

| Technology | Description |
|------------|-------------|
| ![React](https://img.shields.io/badge/React-Latest-61DAFB?logo=react&logoColor=white) | JavaScript library |
| ![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178C6?logo=typescript&logoColor=white) | Programming language |
| ![Material-UI](https://img.shields.io/badge/Material--UI-Latest-0081CB?logo=material-ui&logoColor=white) | UI components |
| ![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?logo=axios&logoColor=white) | HTTP requests |

</div>

---

## 📊 Advanced Features

### Predictive Analytics

- 📈 Future demand forecasting
- 📊 Sales trend analysis
- 🔮 Optimal inventory predictions
- ⚠️ Low stock alerts

### Performance Optimization

- ⚡ Redis cache reduces response time by 90%
- 🔄 Real-time inventory updates
- 📦 Progressive data loading
- 🚀 Database query optimization

---

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment

- **Render**: See `render.yaml` file
- **Heroku**: See `Procfile` file
- **AWS**: Use ECS or EC2
- **DigitalOcean**: Use App Platform

---

## 🤝 Contributing

Contributions are welcome! 🎉

1. 🍴 Fork the project
2. 🌿 Create a branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push (`git push origin feature/AmazingFeature`)
5. 🔄 Open a Pull Request

---

## 📄 License

This project is open source and available for free use.

---

## 📞 Contact & Support

- 🐛 **Report Issues**: [Open an Issue](https://github.com/3bkader-gpt/inventory-dashboard/issues)
- 💡 **Suggest Features**: [Open an Issue](https://github.com/3bkader-gpt/inventory-dashboard/issues)
- 📧 **Email**: medo.omar.salama@gmail.com

---

<div align="center">

**Made with ❤️ by [Mohamed Omar](https://github.com/3bkader-gpt)**

⭐ If you like this project, don't forget to give it a star!

[⬆ Back to Top](#-inventory-dashboard)

</div>