import pytest

from api.models import Participant
from api.services import SplitService


def test_equal_split_uses_paisa_rounding():
    amounts = SplitService().calculate_equal_split(100.0, 3)

    assert [float(amount) for amount in amounts] == [33.34, 33.33, 33.33]
    assert round(sum(float(amount) for amount in amounts), 2) == 100.0


@pytest.mark.django_db
def test_create_get_history_and_mark_paid(auth_client):
    create_response = auth_client.post(
        "/api/v1/splits/create",
        {
            "total_amount": 546.0,
            "participants": [
                {"name": "Rohan", "upi_id": "rohan@upi"},
                {"name": "Aman", "upi_id": "aman@upi"},
                {"name": "Priya", "upi_id": "priya@upi"},
            ],
            "split_type": "equal",
        },
        format="json",
    )

    assert create_response.status_code == 201
    split = create_response.data
    assert split["split_type"] == "equal"
    assert [participant["amount"] for participant in split["participants"]] == [182.0, 182.0, 182.0]
    assert all(participant["upi_link"].startswith("upi://pay?") for participant in split["participants"])
    assert all(participant["qr_code"].startswith("data:image/png;base64,") for participant in split["participants"])

    split_id = split["split_id"]
    get_response = auth_client.get(f"/api/v1/splits/{split_id}")
    assert get_response.status_code == 200
    assert get_response.data["split_id"] == split_id

    history_response = auth_client.get("/api/v1/splits/history")
    assert history_response.status_code == 200
    assert history_response.data[0]["participant_count"] == 3

    participant_id = split["participants"][0]["id"]
    paid_response = auth_client.post(f"/api/v1/splits/{split_id}/participants/{participant_id}/paid")
    assert paid_response.status_code == 200

    participant = Participant.objects.get(id=participant_id)
    assert participant.payment_status == Participant.PaymentStatus.PAID
    assert participant.paid_at is not None
