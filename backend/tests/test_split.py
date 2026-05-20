import pytest

from app.services.split_service import SplitService


def test_equal_split_uses_paisa_rounding():
    amounts = SplitService().calculate_equal_split(100.0, 3)

    assert amounts == [33.34, 33.33, 33.33]
    assert round(sum(amounts), 2) == 100.0


@pytest.mark.asyncio
async def test_create_get_history_and_mark_paid(auth_headers, client):
    create_response = await client.post(
        "/api/v1/splits/create",
        headers=auth_headers,
        json={
            "total_amount": 546.0,
            "participants": [
                {"name": "Rohan", "upi_id": "rohan@upi"},
                {"name": "Aman", "upi_id": "aman@upi"},
                {"name": "Priya", "upi_id": "priya@upi"},
            ],
            "split_type": "equal",
        },
    )

    assert create_response.status_code == 201
    split = create_response.json()
    assert split["split_type"] == "equal"
    assert [p["amount"] for p in split["participants"]] == [182.0, 182.0, 182.0]
    assert all(p["upi_link"].startswith("upi://pay?") for p in split["participants"])
    assert all(p["qr_code"].startswith("data:image/png;base64,") for p in split["participants"])

    split_id = split["split_id"]
    get_response = await client.get(f"/api/v1/splits/{split_id}", headers=auth_headers)
    assert get_response.status_code == 200
    assert get_response.json()["split_id"] == split_id

    history_response = await client.get("/api/v1/splits/history", headers=auth_headers)
    assert history_response.status_code == 200
    assert history_response.json()[0]["participant_count"] == 3

    participant_id = split["participants"][0]["id"]
    paid_response = await client.post(
        f"/api/v1/splits/{split_id}/participants/{participant_id}/paid",
        headers=auth_headers,
    )
    assert paid_response.status_code == 200
