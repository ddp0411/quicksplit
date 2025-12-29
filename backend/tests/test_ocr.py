# OCR tests
import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_upload_receipt():
    """Test receipt upload."""
    # This would require authentication token
    pass


@pytest.mark.asyncio
async def test_scan_receipt():
    """Test receipt scanning."""
    # This would require authentication token
    pass

