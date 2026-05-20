import pytest


@pytest.mark.asyncio
async def test_register_returns_token_and_user(client):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
            "name": "Test User",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_login_and_current_user(client):
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "password": "testpassword123",
            "name": "Login User",
        },
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": "login@example.com",
            "password": "testpassword123",
        },
    )

    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "login@example.com"
