import base64

import pytest


PNG_1X1 = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
)


@pytest.mark.asyncio
async def test_submit_dataset_receipt_and_stats(auth_headers, client):
    response = await client.post(
        "/api/v1/dataset/submit",
        headers=auth_headers,
        files={"file": ("receipt.png", PNG_1X1, "image/png")},
        data={
            "ocr_text": "Grand Total 546.00",
            "actual_total": "546.00",
            "metadata": '{"source":"pytest"}',
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["actual_total"] == 546.0
    assert body["image_hash"]

    stats_response = await client.get("/api/v1/dataset/stats", headers=auth_headers)
    assert stats_response.status_code == 200
    assert stats_response.json()["total_entries"] == 1
