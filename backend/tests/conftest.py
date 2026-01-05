"""Pytest configuration and fixtures for API testing."""
import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import async_session_maker, init_db


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def setup_database():
    """Initialize database once per session."""
    await init_db()
    yield


@pytest_asyncio.fixture
async def client(setup_database) -> AsyncGenerator[AsyncClient, None]:
    """Create async HTTP client for API testing."""
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
