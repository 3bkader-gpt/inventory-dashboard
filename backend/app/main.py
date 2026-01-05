"""FastAPI application entry point."""
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.limiter import limiter

from app.database import async_session_maker, init_db
from app.routers import (
    auth_router,
    analytics_router,
    categories_router,
    dashboard_router,
    products_router,
    search_router,
    users_router,
)
from app.services import seed_initial_data, seed_sales_history

# Path to frontend build output
FRONTEND_DIR = Path(__file__).parent.parent.parent / "frontend" / "dist"


from app.core.cache import cache

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    # Connect Redis
    await cache.connect()

    # Startup: Create tables and seed data
    # Ensure data directory exists for SQLite
    data_dir = Path("./data")
    data_dir.mkdir(exist_ok=True)
    
    await init_db()
    
    # Seed initial data
    async with async_session_maker() as session:
        await seed_initial_data(session)
        await seed_sales_history(session)
    
    yield
    
    # Shutdown: cleanup if needed
    await cache.disconnect()


app = FastAPI(
    title="Inventory Management API",
    description="Backend API for the Inventory Management Dashboard",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiter setup
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration (still useful for development with Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "http://localhost:8000",  # Self for production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(categories_router)
app.include_router(products_router)
app.include_router(dashboard_router)
app.include_router(analytics_router)
app.include_router(search_router)


@app.get("/api/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}


# ============================================================================
# Static Files & SPA Catch-All (must be AFTER API routes)
# ============================================================================

# Mount assets folder if frontend is built
if FRONTEND_DIR.exists():
    assets_dir = FRONTEND_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """
        SPA Catch-All: Serve index.html for any non-API route.
        This allows React Router to handle client-side routing.
        """
        # Check if requesting a specific file in dist (e.g., favicon.ico, vite.svg)
        file_path = FRONTEND_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        
        # Otherwise, serve index.html (let React Router handle it)
        index_path = FRONTEND_DIR / "index.html"
        return FileResponse(index_path)
