"""API endpoint tests."""
import pytest
from httpx import AsyncClient


class TestHealthCheck:
    """Health check endpoint tests."""

    @pytest.mark.asyncio
    async def test_health_check_returns_200(self, client: AsyncClient):
        """Test that health check endpoint is accessible."""
        response = await client.get("/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data


class TestAuthentication:
    """Authentication flow tests."""

    @pytest.mark.asyncio
    async def test_login_with_valid_credentials(self, client: AsyncClient):
        """Test successful login with admin credentials."""
        response = await client.post(
            "/api/auth/login",
            data={
                "username": "admin@example.com",
                "password": "admin123",
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_with_invalid_credentials(self, client: AsyncClient):
        """Test login failure with wrong password."""
        response = await client.post(
            "/api/auth/login",
            data={
                "username": "admin@example.com",
                "password": "wrong-password",
            },
        )
        
        assert response.status_code == 401


class TestProtectedRoutes:
    """Protected route access tests."""

    @pytest.mark.asyncio
    async def test_dashboard_requires_auth(self, client: AsyncClient):
        """Test that dashboard endpoint requires authentication."""
        response = await client.get("/api/dashboard/stats")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_products_requires_auth(self, client: AsyncClient):
        """Test that products endpoint requires authentication."""
        response = await client.get("/api/products")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_dashboard_accessible_with_auth(self, auth_client: AsyncClient):
        """Test that dashboard is accessible when authenticated."""
        response = await auth_client.get("/api/dashboard/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_products" in data
        assert "total_categories" in data

    @pytest.mark.asyncio
    async def test_products_accessible_with_auth(self, auth_client: AsyncClient):
        """Test that products list is accessible when authenticated."""
        response = await auth_client.get("/api/products")
        assert response.status_code == 200
        
        data = response.json()
        assert "items" in data
        assert "total" in data


class TestSmartSearch:
    """Smart search endpoint tests."""

    @pytest.mark.asyncio
    async def test_smart_search_requires_auth(self, client: AsyncClient):
        """Test that smart search requires authentication."""
        response = await client.post(
            "/api/search/smart",
            json={"query": "low stock items"},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_smart_search_with_auth(self, auth_client: AsyncClient):
        """Test smart search returns results."""
        response = await auth_client.post(
            "/api/search/smart",
            json={"query": "low stock"},
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert "parsed_query" in data
        assert "parse_method" in data


class TestAnalytics:
    """Analytics endpoint tests."""

    @pytest.mark.asyncio
    async def test_forecast_requires_auth(self, client: AsyncClient):
        """Test that forecast endpoint requires authentication."""
        response = await client.get("/api/analytics/forecast")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_forecast_with_auth(self, auth_client: AsyncClient):
        """Test forecast returns predictions."""
        response = await auth_client.get("/api/analytics/forecast")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
