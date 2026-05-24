import base64

import pytest
from rest_framework.test import APIClient


PNG_1X1 = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_client(api_client):
    response = api_client.post(
        "/api/v1/auth/register",
        {
            "email": "rohan@example.com",
            "password": "testpassword123",
            "name": "Rohan",
        },
        format="json",
    )
    token = response.data["access_token"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return api_client
