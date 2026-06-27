import pytest
from rest_framework.test import APIClient


def register(phone, email, name):
    """Register a user and return (authenticated_client, user_id)."""
    client = APIClient()
    resp = client.post(
        "/api/v1/auth/register",
        {"phone_number": phone, "email": email, "password": "testpassword123", "name": name},
        format="json",
    )
    assert resp.status_code == 201, resp.data
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access_token']}")
    return client, resp.data["user"]["id"]


def create_equal_expense(client, paid_by_id, participant_ids, amount="200.00"):
    return client.post(
        "/api/v1/expenses/",
        {
            "description": "Dinner",
            "amount": amount,
            "category": "food",
            "paid_by_user_id": paid_by_id,
            "split_type": "equal",
            "date": "2026-06-01",
            "participant_ids": participant_ids,
        },
        format="json",
    )


@pytest.mark.django_db
def test_settlement_clears_share_and_updates_balances():
    """Recording a settlement must clear the matching ExpenseShare so the
    paid-off debt disappears from both users' balances (no double counting)."""
    a_client, a_id = register("9876500001", "a@example.com", "Asha")
    b_client, b_id = register("9876500002", "b@example.com", "Bhanu")

    # Asha pays a 200 dinner split equally with Bhanu → Bhanu owes Asha 100.
    resp = create_equal_expense(a_client, a_id, [a_id, b_id])
    assert resp.status_code == 201, resp.data

    a_bal = a_client.get("/api/v1/balances/").data
    assert a_bal["total_owed_to_you"] == 100.0
    assert a_bal["total_you_owe"] == 0.0

    b_bal = b_client.get("/api/v1/balances/").data
    assert b_bal["total_you_owe"] == 100.0
    assert b_bal["total_owed_to_you"] == 0.0

    # Bhanu settles up: pays Asha 100.
    settle = b_client.post(
        "/api/v1/settlements/",
        {"to_user_id": a_id, "amount": "100.00"},
        format="json",
    )
    assert settle.status_code == 201, settle.data

    # Debt is now cleared on both sides.
    a_bal = a_client.get("/api/v1/balances/").data
    assert a_bal["total_owed_to_you"] == 0.0

    b_bal = b_client.get("/api/v1/balances/").data
    assert b_bal["total_you_owe"] == 0.0


@pytest.mark.django_db
def test_zero_participant_expense_is_rejected():
    """An equal-split expense with no participants must be rejected (400) and
    must not persist a participant-less expense."""
    a_client, a_id = register("9876500003", "c@example.com", "Chiku")

    resp = a_client.post(
        "/api/v1/expenses/",
        {
            "description": "Ghost",
            "amount": "100.00",
            "category": "other",
            "paid_by_user_id": a_id,
            "split_type": "equal",
            "date": "2026-06-01",
            "participant_ids": [],
        },
        format="json",
    )
    assert resp.status_code == 400, resp.data

    # Nothing was created.
    listing = a_client.get("/api/v1/expenses/").data
    assert listing == []


@pytest.mark.django_db
def test_group_balances_require_membership():
    """A non-member must not be able to read a group's balances."""
    a_client, a_id = register("9876500004", "d@example.com", "Devi")
    b_client, b_id = register("9876500005", "e@example.com", "Esha")

    group = a_client.post(
        "/api/v1/groups/",
        {"name": "Goa Trip", "category": "trip"},
        format="json",
    )
    assert group.status_code == 201, group.data
    group_id = group.data["id"]

    # Esha is not a member → 404, not the balances payload.
    resp = b_client.get(f"/api/v1/groups/{group_id}/balances/")
    assert resp.status_code == 404


@pytest.mark.django_db
def test_expenses_with_user_filter():
    """GET /expenses/?with_user=<friend> returns only expenses shared with that friend."""
    a_client, a_id = register("9876500006", "f@example.com", "Farah")
    _, b_id = register("9876500007", "g@example.com", "Gita")
    _, c_id = register("9876500008", "h@example.com", "Hari")

    e_ab = create_equal_expense(a_client, a_id, [a_id, b_id])
    assert e_ab.status_code == 201, e_ab.data
    e_ac = create_equal_expense(a_client, a_id, [a_id, c_id])
    assert e_ac.status_code == 201, e_ac.data

    # Unfiltered: Farah sees both of her expenses.
    all_exp = a_client.get("/api/v1/expenses/").data
    assert len(all_exp) == 2

    # Filtered to Gita: only the expense shared with her.
    with_b = a_client.get(f"/api/v1/expenses/?with_user={b_id}").data
    assert len(with_b) == 1
    assert with_b[0]["id"] == e_ab.data["id"]
