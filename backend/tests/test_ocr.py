import pytest

from api.services import OCRService


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


@pytest.mark.django_db
def test_validate_ocr_result(auth_client):
    response = auth_client.post(
        "/api/v1/ocr/validate",
        {
            "text": "Subtotal 500.00\nAmount Due 546.00",
            "detected_total": 546.0,
            "image_hash": "receipt-hash",
        },
        format="json",
    )

    assert response.status_code == 200
    assert response.data["is_valid"] is True
    assert response.data["suggested_total"] == 546.0
    assert response.data["confidence"] >= 90
