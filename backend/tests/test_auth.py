import pytest


@pytest.mark.django_db
def test_register_returns_token_and_user(api_client):
    response = api_client.post(
        "/api/v1/auth/register",
        {
            "email": "test@example.com",
            "password": "testpassword123",
            "name": "Test User",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["token_type"] == "bearer"
    assert response.data["access_token"]
    assert response.data["user"]["email"] == "test@example.com"


@pytest.mark.django_db
def test_register_duplicate_email_returns_clear_error(api_client):
    payload = {
        "email": "dupe@example.com",
        "password": "testpassword123",
        "name": "Duplicate User",
    }
    assert api_client.post("/api/v1/auth/register", payload, format="json").status_code == 201

    response = api_client.post("/api/v1/auth/register", payload, format="json")

    assert response.status_code == 400
    assert response.data["detail"] == "Email already registered"


@pytest.mark.django_db
def test_login_and_current_user(api_client):
    api_client.post(
        "/api/v1/auth/register",
        {
            "email": "login@example.com",
            "password": "testpassword123",
            "name": "Login User",
        },
        format="json",
    )

    login_response = api_client.post(
        "/api/v1/auth/login",
        {
            "username": "login@example.com",
            "password": "testpassword123",
        },
        format="multipart",
    )

    assert login_response.status_code == 200
    token = login_response.data["access_token"]

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    me_response = api_client.get("/api/v1/auth/me")
    assert me_response.status_code == 200
    assert me_response.data["email"] == "login@example.com"
