import re
import re as _re
from decimal import Decimal

INDIAN_PHONE_RE = _re.compile(r'^[6-9]\d{9}$')
from django.contrib.auth import authenticate
from rest_framework import serializers

from api.models import (
    Comment, DatasetEntry, Expense, ExpenseShare, Friendship,
    GroupMember, GroupMessage, Participant, Settlement, Split, SplitGroup, User,
)


UPI_RE = re.compile(r"^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$")


# ─── Auth ─────────────────────────────────────────────────────────────────────

class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name", "is_active", "avatar_color", "upi_id", "phone_number", "created_at"]


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name", "avatar_color", "upi_id", "phone_number"]


class RegisterSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    name         = serializers.CharField(min_length=2, max_length=100)
    password     = serializers.CharField(min_length=6, max_length=100, write_only=True)
    email        = serializers.EmailField(required=False, allow_blank=True, default='')

    def validate_phone_number(self, value):
        value = value.strip().replace(' ', '').replace('-', '')
        if not INDIAN_PHONE_RE.match(value):
            raise serializers.ValidationError(
                'Enter a valid 10-digit Indian mobile number (must start with 6, 7, 8, or 9)'
            )
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError('Phone number already registered')
        return value

    def validate_email(self, value):
        if not value:
            return None
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('Email already registered')
        return email

    def create(self, validated_data):
        phone = validated_data['phone_number']
        email = validated_data.get('email') or None
        user = User(
            username=phone,
            phone_number=phone,
            email=email,
            name=validated_data['name'],
            first_name=validated_data['name'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()    # email OR phone number
    password   = serializers.CharField(write_only=True)

    def validate(self, attrs):
        raw = attrs['identifier'].strip()
        password = attrs['password']
        user = None

        if '@' in raw:
            # Try email login
            user = authenticate(username=raw.lower(), password=password)
            if not user:
                # Username may differ from email for older accounts
                try:
                    u = User.objects.get(email=raw.lower())
                    user = authenticate(username=u.username, password=password)
                except User.DoesNotExist:
                    pass
        else:
            # Phone number login
            try:
                u = User.objects.get(phone_number=raw)
                user = authenticate(username=u.username, password=password)
            except User.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError('Incorrect credentials')
        if not user.is_active:
            raise serializers.ValidationError('Inactive user')
        attrs['user'] = user
        return attrs


class TokenResponseSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    token_type = serializers.CharField()
    user = UserResponseSerializer()


# ─── OCR ──────────────────────────────────────────────────────────────────────

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


# ─── Original Split / Participant ─────────────────────────────────────────────

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


# ─── Dataset ──────────────────────────────────────────────────────────────────

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
            "id", "image_hash", "ocr_text", "detected_total",
            "actual_total", "confidence", "is_verified", "created_at",
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


# ─── Friends ──────────────────────────────────────────────────────────────────

class FriendshipSerializer(serializers.ModelSerializer):
    requester = UserMiniSerializer(read_only=True)
    addressee = UserMiniSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = ["id", "requester", "addressee", "status", "created_at"]


class FriendSerializer(serializers.Serializer):
    """Flattened friend view — whichever side is not the current user."""
    id = serializers.IntegerField()
    friendship_id = serializers.IntegerField()
    user = UserMiniSerializer()
    balance = serializers.FloatField()
    status = serializers.CharField()


class AddFriendSerializer(serializers.Serializer):
    email = serializers.EmailField()


# ─── Groups ───────────────────────────────────────────────────────────────────

class GroupMemberSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = GroupMember
        fields = ["id", "user", "role", "joined_at"]


class SplitGroupSerializer(serializers.ModelSerializer):
    created_by = UserMiniSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()
    your_balance = serializers.FloatField(default=0.0)

    class Meta:
        model = SplitGroup
        fields = [
            "id", "name", "description", "category", "created_by",
            "is_active", "member_count", "your_balance", "created_at",
        ]

    def get_member_count(self, obj):
        return obj.members.count()


class SplitGroupDetailSerializer(serializers.ModelSerializer):
    created_by = UserMiniSerializer(read_only=True)
    members = GroupMemberSerializer(many=True, read_only=True)

    class Meta:
        model = SplitGroup
        fields = [
            "id", "name", "description", "category", "created_by",
            "is_active", "members", "created_at", "updated_at",
        ]


class CreateGroupSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.ChoiceField(choices=SplitGroup.GroupCategory.choices, default="other")
    member_emails = serializers.ListField(
        child=serializers.EmailField(), required=False, default=list
    )

    def validate_member_emails(self, emails):
        return [e.lower().strip() for e in emails]


class AddGroupMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()


# ─── Expenses ─────────────────────────────────────────────────────────────────

class ExpenseShareInputSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    value = serializers.DecimalField(
        max_digits=12, decimal_places=4,
        help_text="Amount for exact, percentage for %, shares count for shares split"
    )


class CreateExpenseSerializer(serializers.Serializer):
    group_id = serializers.UUIDField(required=False, allow_null=True)
    description = serializers.CharField(min_length=1, max_length=200)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.01"))
    currency = serializers.CharField(max_length=3, default="INR")
    category = serializers.ChoiceField(choices=Expense.Category.choices, default="other")
    paid_by_user_id = serializers.UUIDField()
    split_type = serializers.ChoiceField(choices=Expense.SplitType.choices, default="equal")
    date = serializers.DateField()
    notes = serializers.CharField(required=False, allow_blank=True)
    is_recurring = serializers.BooleanField(default=False)
    recurring_frequency = serializers.ChoiceField(
        choices=Expense.RecurringFrequency.choices, required=False, allow_blank=True
    )
    # For non-equal splits: list of {user_id, value}
    shares = ExpenseShareInputSerializer(many=True, required=False, default=list)
    # For equal split: just list of user UUIDs
    participant_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False, default=list
    )


class ExpenseShareSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = ExpenseShare
        fields = ["id", "user", "amount_owed", "is_settled", "settled_at"]


class CommentSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "user", "content", "created_at", "updated_at"]


class ExpenseSerializer(serializers.ModelSerializer):
    paid_by = UserMiniSerializer(read_only=True)
    created_by = UserMiniSerializer(read_only=True)
    shares = ExpenseShareSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    group_name = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = [
            "id", "group", "group_name", "description", "amount", "currency",
            "category", "paid_by", "split_type", "date", "notes",
            "is_recurring", "recurring_frequency", "created_by",
            "shares", "comments", "created_at", "updated_at",
        ]

    def get_group_name(self, obj):
        return obj.group.name if obj.group else None


class ExpenseListSerializer(serializers.ModelSerializer):
    paid_by = UserMiniSerializer(read_only=True)
    your_share = serializers.FloatField(default=0.0)
    group_name = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = [
            "id", "group", "group_name", "description", "amount", "currency",
            "category", "paid_by", "split_type", "date", "your_share", "created_at",
        ]

    def get_group_name(self, obj):
        return obj.group.name if obj.group else None


# ─── Settlements ──────────────────────────────────────────────────────────────

class CreateSettlementSerializer(serializers.Serializer):
    to_user_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.01"))
    group_id = serializers.UUIDField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    upi_transaction_id = serializers.CharField(required=False, allow_blank=True)


class SettlementSerializer(serializers.ModelSerializer):
    from_user = UserMiniSerializer(read_only=True)
    to_user = UserMiniSerializer(read_only=True)

    class Meta:
        model = Settlement
        fields = [
            "id", "group", "from_user", "to_user", "amount",
            "currency", "notes", "upi_transaction_id", "created_at",
        ]


# ─── Balances ─────────────────────────────────────────────────────────────────

class BalanceWithUserSerializer(serializers.Serializer):
    user = UserMiniSerializer()
    balance = serializers.FloatField()  # positive = they owe you, negative = you owe them


class SimplifiedDebtSerializer(serializers.Serializer):
    from_user = UserMiniSerializer()
    to_user = UserMiniSerializer()
    amount = serializers.FloatField()


class GroupBalanceSerializer(serializers.Serializer):
    member_balances = BalanceWithUserSerializer(many=True)
    simplified_debts = SimplifiedDebtSerializer(many=True)
    total_expenses = serializers.FloatField()


class OverallBalanceSerializer(serializers.Serializer):
    total_owed_to_you = serializers.FloatField()
    total_you_owe = serializers.FloatField()
    net_balance = serializers.FloatField()
    balances = BalanceWithUserSerializer(many=True)


class GroupMessageSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = GroupMessage
        fields = ["id", "user", "content", "created_at"]
