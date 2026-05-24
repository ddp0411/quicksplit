import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from tests.conftest import PNG_1X1


@pytest.mark.django_db
def test_submit_dataset_receipt_and_stats(auth_client, settings, tmp_path):
    settings.DATASET_DIR = tmp_path / "dataset"
    image = SimpleUploadedFile("receipt.png", PNG_1X1, content_type="image/png")

    response = auth_client.post(
        "/api/v1/dataset/submit",
        {
            "file": image,
            "ocr_text": "Grand Total 546.00",
            "actual_total": "546.00",
            "metadata": '{"source":"pytest"}',
        },
        format="multipart",
    )

    assert response.status_code == 201
    assert response.data["actual_total"] == 546.0
    assert response.data["image_hash"]

    stats_response = auth_client.get("/api/v1/dataset/stats")
    assert stats_response.status_code == 200
    assert stats_response.data["total_entries"] == 1
