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

from api.models import DatasetEntry, Participant, Split
from api.serializers import (
    DatasetStatsSerializer,
    DatasetSubmitSerializer,
    DatasetResponseSerializer,
    LoginSerializer,
    OCRResultSerializer,
    OCRUploadSerializer,
    OCRValidationSerializer,
    OCRValidationResponseSerializer,
    ParticipantPaymentResponseSerializer,
    RegisterSerializer,
    SplitCreateSerializer,
    SplitHistoryItemSerializer,
    SplitResponseSerializer,
    TokenResponseSerializer,
    UserResponseSerializer,
)
from api.services import FileService, OCRService, QRService, SplitService, UPIService, to_money_float


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
        "participants": [participant_payload(participant) for participant in split_participants],
        "created_at": split.created_at.isoformat().replace("+00:00", "Z"),
    }


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

        return Response(
            {
                "text": result["text"],
                "confidence": result["confidence"],
                "detected_total": result["detected_total"],
                "processing_time": round(time.time() - start, 4),
            }
        )


class OCRValidateView(APIView):
    serializer_class = OCRValidationSerializer

    @extend_schema(request=OCRValidationSerializer, responses={200: OCRValidationResponseSerializer})
    def post(self, request):
        serializer = OCRValidationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data["text"]
        detected_total = serializer.validated_data.get("detected_total")
        text_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
        _cache_key = f"ocr:validate:{serializer.validated_data['image_hash']}:{text_hash}:{detected_total}"
        return Response(OCRService().validate_ocr_text(text, detected_total))


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

            for index, participant_data in enumerate(participants_data):
                participant = Participant.objects.create(
                    split=split,
                    name=participant_data["name"],
                    upi_id=participant_data.get("upi_id"),
                    amount=amounts[index],
                )
                participants.append(participant)
                upi_link = upi.generate_upi_link(
                    upi_id=participant.upi_id or "merchant@upi",
                    name=participant.name,
                    amount=participant.amount,
                    note=f"QuickSplit - {request.user.name}",
                )
                response_participants.append(participant_payload(participant, upi_link, qr.generate_qr_base64(upi_link)))

        payload = split_payload(split, participants)
        payload["participants"] = response_participants
        return Response(payload, status=status.HTTP_201_CREATED)


class SplitHistoryView(APIView):
    serializer_class = SplitHistoryItemSerializer

    @extend_schema(responses={200: SplitHistoryItemSerializer(many=True)})
    def get(self, request):
        limit = min(int(request.query_params.get("limit", 50)), 100)
        offset = int(request.query_params.get("offset", 0))
        queryset = (
            Split.objects.filter(user=request.user)
            .annotate(participant_count=Count("participants"))
            .order_by("-created_at")[offset : offset + limit]
        )
        return Response(
            [
                {
                    "split_id": str(split.id),
                    "total_amount": to_money_float(split.total_amount),
                    "participant_count": split.participant_count,
                    "created_at": split.created_at.isoformat().replace("+00:00", "Z"),
                }
                for split in queryset
            ]
        )


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
        aggregate = DatasetEntry.objects.aggregate(
            total=Count("id"),
            verified=Count("id", filter=Q(is_verified=1)),
            unverified=Count("id", filter=Q(is_verified=0)),
            rejected=Count("id", filter=Q(is_verified=-1)),
            average_confidence=Avg("confidence"),
        )

        total_size_bytes = 0
        image_root = Path(settings.DATASET_DIR) / "raw" / "images"
        if image_root.exists():
            for image_path in image_root.rglob("*"):
                if image_path.is_file():
                    total_size_bytes += image_path.stat().st_size

        return Response(
            {
                "total_entries": aggregate["total"] or 0,
                "verified_entries": aggregate["verified"] or 0,
                "unverified_entries": aggregate["unverified"] or 0,
                "rejected_entries": aggregate["rejected"] or 0,
                "average_confidence": float(aggregate["average_confidence"] or 0.0),
                "total_images_size_mb": round(total_size_bytes / (1024 * 1024), 2),
            }
        )
