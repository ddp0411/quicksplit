import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.lower().strip()
        if not self.username and self.email:
            self.username = self.email
        super().save(*args, **kwargs)


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
