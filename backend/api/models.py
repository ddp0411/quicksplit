import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, blank=True, null=True, default=None)
    name = models.CharField(max_length=100)
    avatar_color = models.CharField(max_length=7, default='#5b34cd')
    upi_id = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, default='', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.lower().strip()
        if not self.username:
            self.username = self.phone_number or (self.email or '') or str(uuid.uuid4())
        super().save(*args, **kwargs)


# ─── Original QuickSplit models (kept as-is) ──────────────────────────────────

class Split(models.Model):
    class SplitType(models.TextChoices):
        EQUAL = "equal", "Equal"
        CUSTOM = "custom", "Custom"
        PERCENTAGE = "percentage", "Percentage"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, related_name="splits", on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    split_type = models.CharField(max_length=20, choices=SplitType.choices, default=SplitType.EQUAL)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]


class Participant(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    split = models.ForeignKey(Split, related_name="participants", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    upi_id = models.CharField(max_length=100, blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    paid_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class DatasetEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, related_name="dataset_submissions", on_delete=models.SET_NULL, blank=True, null=True)
    image_path = models.CharField(max_length=500)
    image_hash = models.CharField(max_length=128, unique=True, db_index=True)
    ocr_text = models.TextField()
    detected_total = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    actual_total = models.DecimalField(max_digits=12, decimal_places=2)
    confidence = models.FloatField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    annotations = models.JSONField(default=dict, blank=True)
    is_verified = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]


# ─── Splitwise-style models ────────────────────────────────────────────────────

class Friendship(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        BLOCKED = "blocked", "Blocked"

    requester = models.ForeignKey(User, related_name="sent_friend_requests", on_delete=models.CASCADE)
    addressee = models.ForeignKey(User, related_name="received_friend_requests", on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["requester", "addressee"]
        ordering = ["-created_at"]


class SplitGroup(models.Model):
    class GroupCategory(models.TextChoices):
        HOME = "home", "Home"
        TRIP = "trip", "Trip"
        COUPLE = "couple", "Couple"
        WORK = "work", "Work"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=GroupCategory.choices, default=GroupCategory.OTHER)
    created_by = models.ForeignKey(User, related_name="created_groups", on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class GroupMember(models.Model):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        MEMBER = "member", "Member"

    group = models.ForeignKey(SplitGroup, related_name="members", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="group_memberships", on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["group", "user"]


class Expense(models.Model):
    class SplitType(models.TextChoices):
        EQUAL = "equal", "Equal"
        EXACT = "exact", "Exact Amounts"
        PERCENTAGE = "percentage", "Percentages"
        SHARES = "shares", "Shares"

    class Category(models.TextChoices):
        FOOD = "food", "Food & Drink"
        TRANSPORT = "transport", "Transportation"
        UTILITIES = "utilities", "Utilities"
        ENTERTAINMENT = "entertainment", "Entertainment"
        SHOPPING = "shopping", "Shopping"
        TRAVEL = "travel", "Travel"
        MEDICAL = "medical", "Medical"
        EDUCATION = "education", "Education"
        RENT = "rent", "Rent & Mortgage"
        OTHER = "other", "Other"

    class RecurringFrequency(models.TextChoices):
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"
        YEARLY = "yearly", "Yearly"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        SplitGroup, related_name="expenses", on_delete=models.CASCADE, null=True, blank=True
    )
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="INR")
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    paid_by = models.ForeignKey(User, related_name="paid_expenses", on_delete=models.CASCADE)
    split_type = models.CharField(max_length=20, choices=SplitType.choices, default=SplitType.EQUAL)
    date = models.DateField()
    notes = models.TextField(blank=True)
    receipt_image_path = models.CharField(max_length=500, blank=True)
    is_recurring = models.BooleanField(default=False)
    recurring_frequency = models.CharField(
        max_length=10, choices=RecurringFrequency.choices, blank=True
    )
    created_by = models.ForeignKey(User, related_name="created_expenses", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.description} — ₹{self.amount}"


class ExpenseShare(models.Model):
    expense = models.ForeignKey(Expense, related_name="shares", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="expense_shares", on_delete=models.CASCADE)
    amount_owed = models.DecimalField(max_digits=12, decimal_places=2)
    is_settled = models.BooleanField(default=False)
    settled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ["expense", "user"]


class Settlement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        SplitGroup, related_name="settlements", on_delete=models.CASCADE, null=True, blank=True
    )
    from_user = models.ForeignKey(User, related_name="payments_made", on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name="payments_received", on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="INR")
    notes = models.TextField(blank=True)
    upi_transaction_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]


class Comment(models.Model):
    expense = models.ForeignKey(Expense, related_name="comments", on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]


class GroupMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(SplitGroup, related_name="messages", on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
