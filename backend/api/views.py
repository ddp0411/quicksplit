import hashlib
import json
import time
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.db import transaction
from django.db.models import Avg, Count, Q
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import parsers, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from api.models import (
    Comment, DatasetEntry, Expense, ExpenseShare, Friendship,
    GroupMember, Participant, Settlement, Split, SplitGroup, User,
)
from api.serializers import (
    AddFriendSerializer, AddGroupMemberSerializer,
    BalanceWithUserSerializer, CommentSerializer,
    CreateExpenseSerializer, CreateGroupSerializer, CreateSettlementSerializer,
    DatasetResponseSerializer, DatasetStatsSerializer, DatasetSubmitSerializer,
    ExpenseListSerializer, ExpenseSerializer, FriendshipSerializer,
    GroupBalanceSerializer, LoginSerializer, OCRResultSerializer,
    OCRUploadSerializer, OCRValidationResponseSerializer, OCRValidationSerializer,
    OverallBalanceSerializer, ParticipantPaymentResponseSerializer,
    RegisterSerializer, SettlementSerializer,
    SimplifiedDebtSerializer, SplitCreateSerializer, SplitGroupDetailSerializer,
    SplitGroupSerializer, SplitHistoryItemSerializer, SplitResponseSerializer,
    TokenResponseSerializer, UserMiniSerializer, UserResponseSerializer,
)
from api.services import (
    BalanceService, FileService, OCRService, QRService,
    ShareCalculationService, SplitService, UPIService, to_money_float,
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def token_response(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        "access_token": str(refresh.access_token),
        "token_type": "bearer",
        "user": UserResponseSerializer(user).data,
    }


def participant_payload(participant: Participant, upi_link: str | None = None, qr_code: str | None = None) -> dict:
    upi = UPIService()
    qr = QRService()
    link = upi_link or upi.generate_upi_link(
        upi_id=participant.upi_id or "merchant@upi",
        name=participant.name,
        amount=participant.amount,
    )
    return {
        "id": str(participant.id),
        "name": participant.name,
        "upi_id": participant.upi_id,
        "amount": to_money_float(participant.amount),
        "upi_link": link,
        "qr_code": qr_code or qr.generate_qr_base64(link),
        "payment_status": participant.payment_status,
    }


def split_payload(split: Split, participants: list[Participant] | None = None) -> dict:
    split_participants = participants if participants is not None else list(split.participants.all())
    return {
        "split_id": str(split.id),
        "total_amount": to_money_float(split.total_amount),
        "split_type": split.split_type,
        "participants": [participant_payload(p) for p in split_participants],
        "created_at": split.created_at.isoformat().replace("+00:00", "Z"),
    }


# ─── Auth ─────────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    @extend_schema(request=RegisterSerializer, responses={201: TokenResponseSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            detail = serializer.errors.get("email", serializer.errors)
            if isinstance(detail, list):
                detail = detail[0]
            return Response({"detail": str(detail)}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        return Response(token_response(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.JSONParser, parsers.FormParser, parsers.MultiPartParser]
    serializer_class = LoginSerializer

    @extend_schema(request=LoginSerializer, responses={200: TokenResponseSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Incorrect email or password"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(token_response(serializer.validated_data["user"]))


class MeView(APIView):
    serializer_class = UserResponseSerializer

    @extend_schema(responses={200: UserResponseSerializer})
    def get(self, request):
        return Response(UserResponseSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        for field in ("name", "upi_id", "avatar_color"):
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save(update_fields=["name", "upi_id", "avatar_color", "updated_at"])
        return Response(UserResponseSerializer(user).data)


# ─── OCR ──────────────────────────────────────────────────────────────────────

class OCRUploadView(APIView):
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    serializer_class = OCRUploadSerializer

    @extend_schema(request=OCRUploadSerializer, responses={200: OCRResultSerializer})
    def post(self, request):
        start = time.time()
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"detail": "Receipt image is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            content = FileService.validate_image(uploaded_file)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        image_hash = FileService.calculate_hash(content)
        file_path = FileService.save_upload(content, uploaded_file.name, image_hash)
        result = OCRService().process_image(file_path, request.data.get("preprocessed") == "true")
        return Response({
            "text": result["text"],
            "confidence": result["confidence"],
            "detected_total": result["detected_total"],
            "processing_time": round(time.time() - start, 4),
        })


class OCRValidateView(APIView):
    serializer_class = OCRValidationSerializer

    @extend_schema(request=OCRValidationSerializer, responses={200: OCRValidationResponseSerializer})
    def post(self, request):
        serializer = OCRValidationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data["text"]
        detected_total = serializer.validated_data.get("detected_total")
        return Response(OCRService().validate_ocr_text(text, detected_total))


# ─── Original Split / UPI flow ────────────────────────────────────────────────

class SplitCreateView(APIView):
    serializer_class = SplitCreateSerializer

    @extend_schema(request=SplitCreateSerializer, responses={201: SplitResponseSerializer})
    def post(self, request):
        serializer = SplitCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        participants_data = data["participants"]

        with transaction.atomic():
            split = Split.objects.create(
                user=request.user,
                total_amount=data["total_amount"],
                split_type=data["split_type"],
                metadata=data.get("metadata") or {},
            )
            amounts = SplitService().calculate_equal_split(data["total_amount"], len(participants_data))
            upi = UPIService()
            qr = QRService()
            participants: list[Participant] = []
            response_participants: list[dict] = []

            for index, pd in enumerate(participants_data):
                p = Participant.objects.create(
                    split=split,
                    name=pd["name"],
                    upi_id=pd.get("upi_id"),
                    amount=amounts[index],
                )
                participants.append(p)
                link = upi.generate_upi_link(
                    upi_id=p.upi_id or "merchant@upi",
                    name=p.name,
                    amount=p.amount,
                    note=f"QuickSplit - {request.user.name}",
                )
                response_participants.append(participant_payload(p, link, qr.generate_qr_base64(link)))

        payload = split_payload(split, participants)
        payload["participants"] = response_participants
        return Response(payload, status=status.HTTP_201_CREATED)


class SplitHistoryView(APIView):
    serializer_class = SplitHistoryItemSerializer

    @extend_schema(responses={200: SplitHistoryItemSerializer(many=True)})
    def get(self, request):
        limit = min(int(request.query_params.get("limit", 50)), 100)
        offset = int(request.query_params.get("offset", 0))
        qs = (
            Split.objects.filter(user=request.user)
            .annotate(participant_count=Count("participants"))
            .order_by("-created_at")[offset: offset + limit]
        )
        return Response([
            {
                "split_id": str(s.id),
                "total_amount": to_money_float(s.total_amount),
                "participant_count": s.participant_count,
                "created_at": s.created_at.isoformat().replace("+00:00", "Z"),
            }
            for s in qs
        ])


class SplitDetailView(APIView):
    serializer_class = SplitResponseSerializer

    @extend_schema(responses={200: SplitResponseSerializer})
    def get(self, request, split_id):
        try:
            split = Split.objects.prefetch_related("participants").get(id=split_id, user=request.user)
        except Split.DoesNotExist:
            return Response({"detail": "Split not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(split_payload(split))


class MarkParticipantPaidView(APIView):
    serializer_class = ParticipantPaymentResponseSerializer

    @extend_schema(responses={200: ParticipantPaymentResponseSerializer})
    def post(self, request, split_id, participant_id):
        try:
            participant = Participant.objects.select_related("split").get(
                id=participant_id,
                split_id=split_id,
                split__user=request.user,
            )
        except Participant.DoesNotExist:
            return Response({"detail": "Participant not found"}, status=status.HTTP_404_NOT_FOUND)

        participant.payment_status = Participant.PaymentStatus.PAID
        participant.paid_at = timezone.now()
        participant.save(update_fields=["payment_status", "paid_at"])
        return Response({"message": "Payment marked as completed", "participant_id": str(participant.id)})


# ─── Dataset ──────────────────────────────────────────────────────────────────

class DatasetSubmitView(APIView):
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    serializer_class = DatasetSubmitSerializer

    @extend_schema(request=DatasetSubmitSerializer, responses={201: DatasetResponseSerializer})
    def post(self, request):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"detail": "Receipt image is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            content = FileService.validate_image(uploaded_file)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        image_hash = FileService.calculate_hash(content)
        if DatasetEntry.objects.filter(image_hash=image_hash).exists():
            return Response({"detail": "This receipt has already been submitted"}, status=status.HTTP_409_CONFLICT)

        try:
            metadata = json.loads(request.data.get("metadata") or "{}")
        except json.JSONDecodeError as exc:
            return Response({"detail": f"Invalid metadata JSON: {exc.msg}"}, status=status.HTTP_400_BAD_REQUEST)

        entry = DatasetEntry.objects.create(
            user=request.user,
            image_path=FileService.save_dataset_image(content, uploaded_file.name, image_hash),
            image_hash=image_hash,
            ocr_text=request.data.get("ocr_text", ""),
            actual_total=Decimal(str(request.data.get("actual_total", "0"))),
            detected_total=request.data.get("detected_total") or None,
            confidence=request.data.get("confidence") or None,
            metadata=metadata,
        )
        return Response(DatasetResponseSerializer(entry).data, status=status.HTTP_201_CREATED)


class DatasetStatsView(APIView):
    serializer_class = DatasetStatsSerializer

    @extend_schema(responses={200: DatasetStatsSerializer})
    def get(self, request):
        agg = DatasetEntry.objects.aggregate(
            total=Count("id"),
            verified=Count("id", filter=Q(is_verified=1)),
            unverified=Count("id", filter=Q(is_verified=0)),
            rejected=Count("id", filter=Q(is_verified=-1)),
            average_confidence=Avg("confidence"),
        )
        total_size_bytes = 0
        image_root = Path(settings.DATASET_DIR) / "raw" / "images"
        if image_root.exists():
            for p in image_root.rglob("*"):
                if p.is_file():
                    total_size_bytes += p.stat().st_size
        return Response({
            "total_entries": agg["total"] or 0,
            "verified_entries": agg["verified"] or 0,
            "unverified_entries": agg["unverified"] or 0,
            "rejected_entries": agg["rejected"] or 0,
            "average_confidence": float(agg["average_confidence"] or 0.0),
            "total_images_size_mb": round(total_size_bytes / (1024 * 1024), 2),
        })


# ─── Friends ──────────────────────────────────────────────────────────────────

class FriendListView(APIView):
    """GET  /friends/  — list accepted friends with net balance
       POST /friends/  — send friend request by email"""

    def get(self, request):
        user = request.user
        friendships = Friendship.objects.filter(
            Q(requester=user) | Q(addressee=user),
            status=Friendship.Status.ACCEPTED,
        ).select_related("requester", "addressee")

        balance_service = BalanceService()
        all_balances = {b["user"].pk: b["balance"] for b in balance_service.get_user_balances(user)}

        result = []
        for fs in friendships:
            friend = fs.addressee if fs.requester_id == user.pk else fs.requester
            result.append({
                "friendship_id": fs.pk,
                "user": UserMiniSerializer(friend).data,
                "balance": all_balances.get(friend.pk, 0.0),
                "status": fs.status,
            })

        result.sort(key=lambda x: abs(x["balance"]), reverse=True)
        return Response(result)

    def post(self, request):
        ser = AddFriendSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data["email"].lower()

        if email == request.user.email:
            return Response({"detail": "You cannot add yourself."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "No user with that email found."}, status=status.HTTP_404_NOT_FOUND)

        existing = Friendship.objects.filter(
            Q(requester=request.user, addressee=target) |
            Q(requester=target, addressee=request.user)
        ).first()

        if existing:
            if existing.status == Friendship.Status.ACCEPTED:
                return Response({"detail": "Already friends."}, status=status.HTTP_409_CONFLICT)
            if existing.status == Friendship.Status.PENDING:
                if existing.addressee == request.user:
                    existing.status = Friendship.Status.ACCEPTED
                    existing.save()
                    return Response(FriendshipSerializer(existing).data)
                return Response({"detail": "Friend request already sent."}, status=status.HTTP_409_CONFLICT)

        fs = Friendship.objects.create(requester=request.user, addressee=target)
        return Response(FriendshipSerializer(fs).data, status=status.HTTP_201_CREATED)


class FriendRequestListView(APIView):
    """GET /friends/requests/ — incoming pending requests"""

    def get(self, request):
        requests_qs = Friendship.objects.filter(
            addressee=request.user, status=Friendship.Status.PENDING
        ).select_related("requester")
        return Response(FriendshipSerializer(requests_qs, many=True).data)


class FriendRequestActionView(APIView):
    """POST /friends/requests/{id}/accept|reject"""

    def post(self, request, friendship_id, action):
        try:
            fs = Friendship.objects.get(pk=friendship_id, addressee=request.user, status=Friendship.Status.PENDING)
        except Friendship.DoesNotExist:
            return Response({"detail": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

        if action == "accept":
            fs.status = Friendship.Status.ACCEPTED
            fs.save()
            return Response(FriendshipSerializer(fs).data)
        elif action == "reject":
            fs.delete()
            return Response({"detail": "Request rejected."})
        return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)


class FriendDetailView(APIView):
    """DELETE /friends/{user_id}/ — remove friend"""

    def delete(self, request, user_id):
        fs = Friendship.objects.filter(
            Q(requester=request.user, addressee_id=user_id) |
            Q(requester_id=user_id, addressee=request.user),
            status=Friendship.Status.ACCEPTED,
        ).first()
        if not fs:
            return Response({"detail": "Not friends."}, status=status.HTTP_404_NOT_FOUND)
        fs.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SearchUsersView(APIView):
    """GET /users/search/?q=email — find users to add"""

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if len(q) < 3:
            return Response([])
        users = User.objects.filter(
            Q(email__icontains=q) | Q(name__icontains=q)
        ).exclude(pk=request.user.pk)[:10]
        return Response(UserMiniSerializer(users, many=True).data)


# ─── Groups ───────────────────────────────────────────────────────────────────

class GroupListView(APIView):
    """GET /groups/ — groups the user belongs to
       POST /groups/ — create a group"""

    def get(self, request):
        memberships = GroupMember.objects.filter(user=request.user).select_related("group__created_by")
        balance_service = BalanceService()
        result = []
        for m in memberships:
            group = m.group
            if not group.is_active:
                continue
            group_data = SplitGroupSerializer(group).data
            # Calculate user's balance in this group
            group_bal = balance_service.get_group_balances(group)
            user_bal = next(
                (b["balance"] for b in group_bal["member_balances"] if str(b["user"].pk) == str(request.user.pk)),
                0.0,
            )
            group_data["your_balance"] = user_bal
            result.append(group_data)
        return Response(result)

    def post(self, request):
        ser = CreateGroupSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        with transaction.atomic():
            group = SplitGroup.objects.create(
                name=data["name"],
                description=data.get("description", ""),
                category=data["category"],
                created_by=request.user,
            )
            GroupMember.objects.create(group=group, user=request.user, role=GroupMember.Role.ADMIN)

            for email in data.get("member_emails", []):
                try:
                    member_user = User.objects.get(email=email)
                    if member_user.pk != request.user.pk:
                        GroupMember.objects.get_or_create(group=group, user=member_user)
                except User.DoesNotExist:
                    pass

        return Response(SplitGroupDetailSerializer(group).data, status=status.HTTP_201_CREATED)


class GroupDetailView(APIView):
    """GET/PATCH/DELETE /groups/{group_id}/"""

    def _get_group(self, request, group_id):
        try:
            gm = GroupMember.objects.select_related("group").get(
                group_id=group_id, user=request.user
            )
            return gm.group
        except GroupMember.DoesNotExist:
            return None

    def get(self, request, group_id):
        group = self._get_group(request, group_id)
        if not group:
            return Response({"detail": "Group not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(SplitGroupDetailSerializer(group).data)

    def patch(self, request, group_id):
        group = self._get_group(request, group_id)
        if not group:
            return Response({"detail": "Group not found."}, status=status.HTTP_404_NOT_FOUND)
        if group.created_by != request.user:
            return Response({"detail": "Only the group creator can edit it."}, status=status.HTTP_403_FORBIDDEN)
        for field in ("name", "description", "category"):
            if field in request.data:
                setattr(group, field, request.data[field])
        group.save()
        return Response(SplitGroupDetailSerializer(group).data)

    def delete(self, request, group_id):
        group = self._get_group(request, group_id)
        if not group:
            return Response({"detail": "Group not found."}, status=status.HTTP_404_NOT_FOUND)
        if group.created_by != request.user:
            return Response({"detail": "Only the creator can delete the group."}, status=status.HTTP_403_FORBIDDEN)
        group.is_active = False
        group.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class GroupMemberView(APIView):
    """POST /groups/{group_id}/members/ — add member
       DELETE /groups/{group_id}/members/{user_id}/ — remove member"""

    def post(self, request, group_id):
        try:
            gm = GroupMember.objects.select_related("group").get(group_id=group_id, user=request.user)
        except GroupMember.DoesNotExist:
            return Response({"detail": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        ser = AddGroupMemberSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data["email"].lower()

        try:
            new_member = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "No user with that email."}, status=status.HTTP_404_NOT_FOUND)

        _, created = GroupMember.objects.get_or_create(group=gm.group, user=new_member)
        if not created:
            return Response({"detail": "User already in group."}, status=status.HTTP_409_CONFLICT)
        return Response({"detail": f"{new_member.name} added to group."}, status=status.HTTP_201_CREATED)

    def delete(self, request, group_id, user_id):
        try:
            gm = GroupMember.objects.select_related("group").get(group_id=group_id, user=request.user)
        except GroupMember.DoesNotExist:
            return Response({"detail": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        if str(user_id) == str(request.user.pk) and gm.group.created_by == request.user:
            return Response({"detail": "Creator cannot leave their own group."}, status=status.HTTP_400_BAD_REQUEST)

        GroupMember.objects.filter(group_id=group_id, user_id=user_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GroupBalanceView(APIView):
    """GET /groups/{group_id}/balances/"""

    def get(self, request, group_id):
        try:
            GroupMember.objects.get(group_id=group_id, user=request.user)
        except GroupMember.DoesNotExist:
            return Response({"detail": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        group = SplitGroup.objects.get(pk=group_id)
        data = BalanceService().get_group_balances(group)
        return Response(GroupBalanceSerializer(data).data)


# ─── Expenses ─────────────────────────────────────────────────────────────────

class ExpenseListView(APIView):
    """GET /expenses/  — all expenses involving current user
       POST /expenses/ — create expense"""

    def get(self, request):
        group_id = request.query_params.get("group_id")
        limit = min(int(request.query_params.get("limit", 50)), 200)
        offset = int(request.query_params.get("offset", 0))

        if group_id:
            try:
                GroupMember.objects.get(group_id=group_id, user=request.user)
            except GroupMember.DoesNotExist:
                return Response({"detail": "Group not found."}, status=status.HTTP_404_NOT_FOUND)
            qs = Expense.objects.filter(group_id=group_id)
        else:
            paid_ids = Expense.objects.filter(paid_by=request.user).values_list("id", flat=True)
            share_ids = ExpenseShare.objects.filter(user=request.user).values_list("expense_id", flat=True)
            qs = Expense.objects.filter(Q(id__in=paid_ids) | Q(id__in=share_ids)).distinct()

        qs = qs.select_related("paid_by", "group").order_by("-date", "-created_at")[offset: offset + limit]

        result = []
        for exp in qs:
            share = exp.shares.filter(user=request.user).first()
            d = ExpenseListSerializer(exp).data
            d["your_share"] = float(share.amount_owed) if share else (
                float(exp.amount) if exp.paid_by_id == request.user.pk else 0.0
            )
            result.append(d)
        return Response(result)

    def post(self, request):
        ser = CreateExpenseSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # Validate paid_by user exists and is accessible
        try:
            paid_by_user = User.objects.get(pk=data["paid_by_user_id"])
        except User.DoesNotExist:
            return Response({"detail": "paid_by user not found."}, status=status.HTTP_400_BAD_REQUEST)

        group = None
        if data.get("group_id"):
            try:
                GroupMember.objects.get(group_id=data["group_id"], user=request.user)
                group = SplitGroup.objects.get(pk=data["group_id"])
            except (GroupMember.DoesNotExist, SplitGroup.DoesNotExist):
                return Response({"detail": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            expense = Expense.objects.create(
                group=group,
                description=data["description"],
                amount=data["amount"],
                currency=data.get("currency", "INR"),
                category=data["category"],
                paid_by=paid_by_user,
                split_type=data["split_type"],
                date=data["date"],
                notes=data.get("notes", ""),
                is_recurring=data.get("is_recurring", False),
                recurring_frequency=data.get("recurring_frequency", ""),
                created_by=request.user,
            )

            calc = ShareCalculationService()
            try:
                share_map = calc.calculate_shares(
                    total_amount=data["amount"],
                    split_type=data["split_type"],
                    participant_ids=data.get("participant_ids", []),
                    shares_input=[
                        {"user_id": s["user_id"], "value": s["value"]}
                        for s in data.get("shares", [])
                    ],
                )
            except ValueError as exc:
                raise Exception(str(exc))

            for user_id_str, amount_owed in share_map.items():
                try:
                    member = User.objects.get(pk=user_id_str)
                    ExpenseShare.objects.create(
                        expense=expense,
                        user=member,
                        amount_owed=amount_owed,
                    )
                except User.DoesNotExist:
                    pass

        return Response(ExpenseSerializer(expense).data, status=status.HTTP_201_CREATED)


class ExpenseDetailView(APIView):
    """GET/PATCH/DELETE /expenses/{expense_id}/"""

    def _get_expense(self, request, expense_id):
        paid_ids = Expense.objects.filter(paid_by=request.user).values_list("id", flat=True)
        share_ids = ExpenseShare.objects.filter(user=request.user).values_list("expense_id", flat=True)
        try:
            return Expense.objects.prefetch_related(
                "shares__user", "comments__user"
            ).get(
                Q(id__in=paid_ids) | Q(id__in=share_ids) | Q(created_by=request.user),
                pk=expense_id,
            )
        except Expense.DoesNotExist:
            return None

    def get(self, request, expense_id):
        expense = self._get_expense(request, expense_id)
        if not expense:
            return Response({"detail": "Expense not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ExpenseSerializer(expense).data)

    def patch(self, request, expense_id):
        expense = self._get_expense(request, expense_id)
        if not expense:
            return Response({"detail": "Expense not found."}, status=status.HTTP_404_NOT_FOUND)
        if expense.created_by != request.user:
            return Response({"detail": "Only the creator can edit this expense."}, status=status.HTTP_403_FORBIDDEN)

        for field in ("description", "notes", "category", "date"):
            if field in request.data:
                setattr(expense, field, request.data[field])
        expense.save()
        return Response(ExpenseSerializer(expense).data)

    def delete(self, request, expense_id):
        expense = self._get_expense(request, expense_id)
        if not expense:
            return Response({"detail": "Expense not found."}, status=status.HTTP_404_NOT_FOUND)
        if expense.created_by != request.user:
            return Response({"detail": "Only the creator can delete this expense."}, status=status.HTTP_403_FORBIDDEN)
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ExpenseCommentView(APIView):
    """GET/POST /expenses/{expense_id}/comments/"""

    def get(self, request, expense_id):
        comments = Comment.objects.filter(expense_id=expense_id).select_related("user")
        return Response(CommentSerializer(comments, many=True).data)

    def post(self, request, expense_id):
        content = request.data.get("content", "").strip()
        if not content:
            return Response({"detail": "Comment cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            expense = Expense.objects.get(pk=expense_id)
        except Expense.DoesNotExist:
            return Response({"detail": "Expense not found."}, status=status.HTTP_404_NOT_FOUND)
        comment = Comment.objects.create(expense=expense, user=request.user, content=content)
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


# ─── Balances ─────────────────────────────────────────────────────────────────

class OverallBalanceView(APIView):
    """GET /balances/ — net balance summary for current user"""

    def get(self, request):
        service = BalanceService()
        balances = service.get_user_balances(request.user)

        total_owed = sum(b["balance"] for b in balances if b["balance"] > 0)
        total_you_owe = sum(-b["balance"] for b in balances if b["balance"] < 0)

        return Response({
            "total_owed_to_you": round(total_owed, 2),
            "total_you_owe": round(total_you_owe, 2),
            "net_balance": round(total_owed - total_you_owe, 2),
            "balances": balances,
        })


# ─── Settlements ──────────────────────────────────────────────────────────────

class SettlementListView(APIView):
    """GET /settlements/  — list settlements
       POST /settlements/ — record a payment"""

    def get(self, request):
        qs = Settlement.objects.filter(
            Q(from_user=request.user) | Q(to_user=request.user)
        ).select_related("from_user", "to_user").order_by("-created_at")[:50]
        return Response(SettlementSerializer(qs, many=True).data)

    def post(self, request):
        ser = CreateSettlementSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        try:
            to_user = User.objects.get(pk=data["to_user_id"])
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        group = None
        if data.get("group_id"):
            try:
                group = SplitGroup.objects.get(pk=data["group_id"])
            except SplitGroup.DoesNotExist:
                return Response({"detail": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        settlement = Settlement.objects.create(
            from_user=request.user,
            to_user=to_user,
            amount=data["amount"],
            group=group,
            notes=data.get("notes", ""),
            upi_transaction_id=data.get("upi_transaction_id", ""),
        )

        # Generate UPI link for settlement
        upi = UPIService()
        qr = QRService()
        upi_link = upi.generate_upi_link(
            upi_id=to_user.upi_id or "merchant@upi",
            name=to_user.name,
            amount=settlement.amount,
            note=f"QuickSplit settlement",
        )

        response = SettlementSerializer(settlement).data
        response["upi_link"] = upi_link
        response["qr_code"] = qr.generate_qr_base64(upi_link)
        return Response(response, status=status.HTTP_201_CREATED)


# ─── Activity Feed ────────────────────────────────────────────────────────────

class ActivityFeedView(APIView):
    """GET /activity/ — mixed timeline of expenses and settlements"""

    def get(self, request):
        limit = min(int(request.query_params.get("limit", 30)), 100)

        # Expenses
        paid_ids = Expense.objects.filter(paid_by=request.user).values_list("id", flat=True)
        share_ids = ExpenseShare.objects.filter(user=request.user).values_list("expense_id", flat=True)
        expenses = list(
            Expense.objects
            .filter(Q(id__in=paid_ids) | Q(id__in=share_ids))
            .select_related("paid_by", "group")
            .order_by("-created_at")[:limit]
        )

        # Settlements
        settlements = list(
            Settlement.objects
            .filter(Q(from_user=request.user) | Q(to_user=request.user))
            .select_related("from_user", "to_user")
            .order_by("-created_at")[:limit]
        )

        activity = []
        for exp in expenses:
            share = exp.shares.filter(user=request.user).first()
            your_share = float(share.amount_owed) if share else (
                float(exp.amount) if exp.paid_by_id == request.user.pk else 0.0
            )
            activity.append({
                "type": "expense",
                "id": str(exp.id),
                "description": exp.description,
                "amount": float(exp.amount),
                "your_share": your_share,
                "category": exp.category,
                "group_name": exp.group.name if exp.group else None,
                "paid_by": UserMiniSerializer(exp.paid_by).data,
                "date": str(exp.date),
                "created_at": exp.created_at.isoformat().replace("+00:00", "Z"),
            })

        for s in settlements:
            activity.append({
                "type": "settlement",
                "id": str(s.id),
                "description": f"Payment to {s.to_user.name}" if s.from_user_id == request.user.pk else f"Payment from {s.from_user.name}",
                "amount": float(s.amount),
                "your_share": float(s.amount),
                "category": "settlement",
                "group_name": s.group.name if s.group else None,
                "from_user": UserMiniSerializer(s.from_user).data,
                "to_user": UserMiniSerializer(s.to_user).data,
                "is_outgoing": s.from_user_id == request.user.pk,
                "created_at": s.created_at.isoformat().replace("+00:00", "Z"),
                "date": s.created_at.date().isoformat(),
            })

        activity.sort(key=lambda x: x["created_at"], reverse=True)
        return Response(activity[:limit])
