import os
import shutil
import sys
from pathlib import Path

import pytest_asyncio
from httpx import AsyncClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
RUNTIME_DIR = BACKEND_DIR / ".test-runtime"
DB_PATH = RUNTIME_DIR / "quicksplit_test.db"

os.environ["DEBUG"] = "false"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{DB_PATH}"
os.environ["UPLOAD_DIR"] = str(RUNTIME_DIR / "uploads")
os.environ["DATASET_DIR"] = str(RUNTIME_DIR / "dataset")
os.environ["REDIS_URL"] = "redis://localhost:6399/0"

sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import dataset, split, user  # noqa: F401, E402


@pytest_asyncio.fixture(autouse=True)
async def reset_database():
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as test_client:
        yield test_client


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "rohan@example.com",
            "password": "testpassword123",
            "name": "Rohan",
        },
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def pytest_sessionfinish(session, exitstatus):
    shutil.rmtree(RUNTIME_DIR, ignore_errors=True)
