import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from api.models import Expense, SplitGroup


SPLITWISE_CSV = (
    b"Date,Description,Category,Cost,Currency\n"
    b"2026-06-01,Hotel,Travel,3000,INR\n"
    b"2026-06-02,Groceries,Groceries,800,INR\n"
    b"2026-06-03,Cab,Transport,450,INR\n"
)


@pytest.mark.django_db
def test_import_splitwise_csv_creates_group_and_expenses(auth_client):
    """Regression: GroupImportView must set Expense.created_by.

    Before the fix it created expenses without `created_by`, which violates the
    NOT NULL constraint on Postgres and 500s. This asserts the import succeeds and
    every imported expense has `created_by` populated.
    """
    csv_file = SimpleUploadedFile("goa-trip-2026.csv", SPLITWISE_CSV, content_type="text/csv")

    response = auth_client.post("/api/v1/groups/import/", {"file": csv_file}, format="multipart")

    assert response.status_code == 201, response.data
    assert response.data["expenses_imported"] == 3
    assert response.data["group"]["name"] == "Goa Trip 2026"

    group = SplitGroup.objects.get(id=response.data["group"]["id"])
    expenses = Expense.objects.filter(group=group)
    assert expenses.count() == 3
    # The regression itself: created_by was NULL before the fix.
    assert expenses.filter(created_by__isnull=True).count() == 0
    for exp in expenses:
        assert exp.created_by_id == exp.paid_by_id


@pytest.mark.django_db
def test_import_rejects_missing_file(auth_client):
    response = auth_client.post("/api/v1/groups/import/", {}, format="multipart")
    assert response.status_code == 400
