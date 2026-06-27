import pytest


@pytest.mark.django_db
def test_register_returns_token_and_user(api_client):
    response = api_client.post(
        "/api/v1/auth/register",
        {
            "phone_number": "9876543210",
            "email": "test@example.com",
            "password": "testpassword123",
            "name": "Test User",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["token_type"] == "bearer"
    assert response.data["access_token"]
    assert response.data["user"]["phone_number"] == "9876543210"


@pytest.mark.django_db
def test_register_requires_valid_phone(api_client):
    # Bad phone — too short
    r1 = api_client.post("/api/v1/auth/register",
        {"phone_number": "12345", "name": "Test", "password": "abc123"},
        format="json")
    assert r1.status_code == 400
    assert "10-digit" in r1.data["detail"]

    # Bad phone — starts with 0
    r2 = api_client.post("/api/v1/auth/register",
        {"phone_number": "0123456789", "name": "Test", "password": "abc123"},
        format="json")
    assert r2.status_code == 400


@pytest.mark.django_db
def test_register_duplicate_phone_returns_clear_error(api_client):
    payload = {
        "phone_number": "9000000001",
        "password": "testpassword123",
        "name": "Duplicate User",
    }
    assert api_client.post("/api/v1/auth/register", payload, format="json").status_code == 201

    response = api_client.post("/api/v1/auth/register", payload, format="json")
    assert response.status_code == 400
    assert "already registered" in response.data["detail"]


@pytest.mark.django_db
def test_register_duplicate_email_returns_clear_error(api_client):
    api_client.post("/api/v1/auth/register",
        {"phone_number": "9000000002", "email": "dupe@example.com",
         "password": "testpassword123", "name": "Dupe"},
        format="json")

    response = api_client.post("/api/v1/auth/register",
        {"phone_number": "9000000003", "email": "dupe@example.com",
         "password": "testpassword123", "name": "Dupe2"},
        format="json")
    assert response.status_code == 400
    assert "Email already registered" in response.data["detail"]


@pytest.mark.django_db
def test_login_with_phone_and_current_user(api_client):
    api_client.post(
        "/api/v1/auth/register",
        {"phone_number": "9111111111", "email": "login@example.com",
         "password": "testpassword123", "name": "Login User"},
        format="json",
    )

    login_response = api_client.post(
        "/api/v1/auth/login",
        {"identifier": "9111111111", "password": "testpassword123"},
        format="json",
    )
    assert login_response.status_code == 200
    token = login_response.data["access_token"]

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    me_response = api_client.get("/api/v1/auth/me")
    assert me_response.status_code == 200
    assert me_response.data["phone_number"] == "9111111111"


@pytest.mark.django_db
def test_refresh_and_logout_flow(api_client):
    """Register returns a refresh token; /auth/refresh issues a new access token;
    /auth/logout blacklists the refresh token so it can't be reused."""
    reg = api_client.post(
        "/api/v1/auth/register",
        {"phone_number": "9333333333", "email": "refresh@example.com",
         "password": "testpassword123", "name": "Refresh User"},
        format="json",
    )
    assert reg.status_code == 201
    refresh = reg.data["refresh_token"]
    assert refresh

    # Refresh yields a fresh, working access token.
    r = api_client.post("/api/v1/auth/refresh", {"refresh": refresh}, format="json")
    assert r.status_code == 200, r.data
    new_access = r.data["access"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {new_access}")
    assert api_client.get("/api/v1/auth/me").status_code == 200

    # Rotation issues a new refresh token; log it out (blacklist) and confirm it's dead.
    rotated = r.data.get("refresh", refresh)
    api_client.credentials()
    assert api_client.post("/api/v1/auth/logout", {"refresh": rotated}, format="json").status_code == 200
    assert api_client.post("/api/v1/auth/refresh", {"refresh": rotated}, format="json").status_code == 401


@pytest.mark.django_db
def test_login_with_email(api_client):
    api_client.post(
        "/api/v1/auth/register",
        {"phone_number": "9222222222", "email": "emaillogin@example.com",
         "password": "testpassword123", "name": "Email Login"},
        format="json",
    )

    login_response = api_client.post(
        "/api/v1/auth/login",
        {"identifier": "emaillogin@example.com", "password": "testpassword123"},
        format="json",
    )
    assert login_response.status_code == 200
    assert login_response.data["user"]["email"] == "emaillogin@example.com"
