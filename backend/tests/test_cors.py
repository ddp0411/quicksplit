def test_localhost_and_127_are_allowed(settings):
    assert "http://localhost:3000" in settings.CORS_ALLOWED_ORIGINS
    assert "http://127.0.0.1:3000" in settings.CORS_ALLOWED_ORIGINS
