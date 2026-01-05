"""Pytest configuration and fixtures for API testing."""
import os
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

# Set test environment BEFORE importing app
os.environ["TESTING"] = "1"

from app.database import init_db


@pytest.fixture(scope="session", autouse=True)
def set_test_env():
    """Set testing environment."""
    os.environ["TESTING"] = "1"
    yield
    os.environ.pop("TESTING", None)


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Create async HTTP client for API testing."""
    # Import app here to ensure TESTING env is set
    from app.main import app
    
    # Initialize database
    await init_db()
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def auth_client(client: AsyncClient) -> AsyncGenerator[AsyncClient, None]:
    """Create authenticated client with admin tokens."""
    # Login as admin
    login_response = await client.post(
        "/api/auth/login",
        data={
            "username": "admin@example.com",
            "password": "admin123",
        },
    )
    
    if login_response.status_code == 200:
        tokens = login_response.json()
        access_token = tokens.get("access_token")
        client.headers["Authorization"] = f"Bearer {access_token}"
    
    yield client


def pytest_configure(config):
    """Configure pytest to exit cleanly."""
    os.environ["TESTING"] = "1"
