import pytest

from app.services.ocr_service import OCRService


def test_total_detection_prefers_total_keywords():
    text = """
    Pasta Alfredo 240.00
    Mocktail 160.00
    Tax 26.00
    Grand Total ₹546.00
    """

    detection = OCRService().detect_total_with_confidence(text)

    assert detection["detected_total"] == 546.0
    assert detection["strategy"] == "keyword"
    assert detection["confidence"] >= 90


def test_total_detection_falls_back_to_largest_number():
    text = "Tea 40.00\nSandwich 180.00\nService 9.00"

    detection = OCRService().detect_total_with_confidence(text)

    assert detection["detected_total"] == 180.0
    assert detection["strategy"] == "largest_number_fallback"


@pytest.mark.asyncio
async def test_validate_ocr_result(auth_headers, client):
    response = await client.post(
        "/api/v1/ocr/validate",
        headers=auth_headers,
        json={
            "text": "Subtotal 500.00\nAmount Due 546.00",
            "detected_total": 546.0,
            "image_hash": "receipt-hash",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["is_valid"] is True
    assert body["suggested_total"] == 546.0
    assert body["confidence"] >= 90
