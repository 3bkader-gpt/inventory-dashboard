"""Routers package."""
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.categories import router as categories_router
from app.routers.products import router as products_router
from app.routers.dashboard import router as dashboard_router
from app.routers.analytics import router as analytics_router
from app.routers.search import router as search_router

__all__ = [
    "auth_router",
    "users_router", 
    "categories_router",
    "products_router",
    "dashboard_router",
    "analytics_router",
    "search_router",
]


