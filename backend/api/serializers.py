import re
from decimal import Decimal

from django.contrib.auth import authenticate
from rest_framework import serializers

from api.models import DatasetEntry, Participant, Split, User


UPI_RE = re.compile(r"^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$")


class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name", "is_active", "created_at"]


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(min_length=2, max_length=100)
    password = serializers.CharField(min_length=6, max_length=100, write_only=True)

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email already registered")
        return email

    def create(self, validated_data):
        email = validated_data["email"]
        user = User(
            username=email,
            email=email,
            name=validated_data["name"],
            first_name=validated_data["name"],
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs["username"].lower().strip()
        user = authenticate(username=email, password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Incorrect email or password")
        if not user.is_active:
            raise serializers.ValidationError("Inactive user")
        attrs["user"] = user
        return attrs


class TokenResponseSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    token_type = serializers.CharField()
    user = UserResponseSerializer()


class OCRUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    preprocessed = serializers.BooleanField(required=False, default=False)


class OCRResultSerializer(serializers.Serializer):
    text = serializers.CharField(allow_blank=True)
    confidence = serializers.FloatField()
    detected_total = serializers.FloatField(allow_null=True)
    processing_time = serializers.FloatField()


class OCRValidationSerializer(serializers.Serializer):
    text = serializers.CharField(allow_blank=True)
    detected_total = serializers.FloatField(required=False, allow_null=True)
    image_hash = serializers.CharField(max_length=128)


class OCRValidationResponseSerializer(serializers.Serializer):
    is_valid = serializers.BooleanField()
    confidence = serializers.FloatField()
    suggested_total = serializers.FloatField(allow_null=True)
    strategy = serializers.CharField()
    message = serializers.CharField()


class ParticipantCreateSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=100)
    upi_id = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=100)

    def validate_upi_id(self, value):
        if not value:
            return None
        if not UPI_RE.match(value):
            raise serializers.ValidationError("Invalid UPI ID")
        return value


class SplitCreateSerializer(serializers.Serializer):
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.01"))
    participants = ParticipantCreateSerializer(many=True, allow_empty=False)
    split_type = serializers.ChoiceField(choices=Split.SplitType.choices, default=Split.SplitType.EQUAL)
    metadata = serializers.DictField(required=False, default=dict)


class ParticipantPaymentResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    participant_id = serializers.UUIDField()


class ParticipantPayloadSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    upi_id = serializers.CharField(allow_null=True, required=False)
    amount = serializers.FloatField()
    upi_link = serializers.CharField()
    qr_code = serializers.CharField()
    payment_status = serializers.CharField()


class SplitResponseSerializer(serializers.Serializer):
    split_id = serializers.UUIDField()
    total_amount = serializers.FloatField()
    split_type = serializers.CharField()
    participants = ParticipantPayloadSerializer(many=True)
    created_at = serializers.DateTimeField()


class SplitHistoryItemSerializer(serializers.Serializer):
    split_id = serializers.UUIDField()
    total_amount = serializers.FloatField()
    participant_count = serializers.IntegerField()
    created_at = serializers.DateTimeField()


class DatasetSubmitSerializer(serializers.Serializer):
    file = serializers.FileField()
    ocr_text = serializers.CharField()
    actual_total = serializers.DecimalField(max_digits=12, decimal_places=2)
    detected_total = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    confidence = serializers.FloatField(required=False, allow_null=True)
    metadata = serializers.CharField(required=False, allow_blank=True)


class DatasetResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatasetEntry
        fields = [
            "id",
            "image_hash",
            "ocr_text",
            "detected_total",
            "actual_total",
            "confidence",
            "is_verified",
            "created_at",
        ]


class ParticipantResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ["id", "name", "upi_id", "amount", "payment_status"]


class DatasetStatsSerializer(serializers.Serializer):
    total_entries = serializers.IntegerField()
    verified_entries = serializers.IntegerField()
    unverified_entries = serializers.IntegerField()
    rejected_entries = serializers.IntegerField()
    average_confidence = serializers.FloatField()
    total_images_size_mb = serializers.FloatField()
