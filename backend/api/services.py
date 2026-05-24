import base64
import hashlib
import re
from decimal import Decimal, ROUND_HALF_UP
from io import BytesIO
from pathlib import Path
from typing import Optional
from urllib.parse import urlencode

import qrcode
from django.conf import settings
from django.core.files.uploadedfile import UploadedFile


def to_decimal(value: float | str | Decimal) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def to_money_float(value: Decimal | float | int) -> float:
    return float(Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


class FileService:
    IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}

    @classmethod
    def validate_image(cls, uploaded_file: UploadedFile) -> bytes:
        suffix = Path(uploaded_file.name or "").suffix.lower()
        if suffix not in cls.IMAGE_EXTENSIONS:
            raise ValueError("Invalid file type. Only images are allowed.")

        content = uploaded_file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise ValueError("File too large. Maximum size is 10MB.")
        return content

    @staticmethod
    def calculate_hash(content: bytes) -> str:
        return hashlib.sha256(content).hexdigest()

    @staticmethod
    def save_upload(content: bytes, filename: str, image_hash: str) -> str:
        suffix = Path(filename or "receipt.png").suffix.lower() or ".png"
        target_dir = Path(settings.UPLOAD_DIR)
        target_dir.mkdir(parents=True, exist_ok=True)
        target = target_dir / f"{image_hash}{suffix}"
        target.write_bytes(content)
        return str(target)

    @staticmethod
    def save_dataset_image(content: bytes, filename: str, image_hash: str) -> str:
        suffix = Path(filename or "receipt.png").suffix.lower() or ".png"
        target_dir = Path(settings.DATASET_DIR) / "raw" / "images"
        target_dir.mkdir(parents=True, exist_ok=True)
        target = target_dir / f"{image_hash}{suffix}"
        target.write_bytes(content)
        return str(target)


class OCRService:
    TOTAL_KEYWORDS = [
        "grand total",
        "amount due",
        "amount payable",
        "total amount",
        "net amount",
        "bill amount",
        "balance due",
        "total",
    ]

    AMOUNT_RE = re.compile(
        r"(?:rs\.?|inr|₹)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)",
        re.IGNORECASE,
    )

    def process_image(self, _image_path: str, _preprocessed: bool = False) -> dict:
        # Browser OCR is the primary path. This endpoint still validates upload,
        # persists the file, and returns a well-shaped response.
        return {"text": "", "confidence": 0.0, "detected_total": None}

    def validate_ocr_text(self, text: str, detected_total: Optional[float]) -> dict:
        detection = self.detect_total_with_confidence(text)
        redetected_total = detection["detected_total"]
        confidence = float(detection["confidence"])

        if detected_total and redetected_total:
            diff_percent = abs(detected_total - redetected_total) / detected_total * 100
            if diff_percent <= 0.01:
                confidence = max(confidence, 96.0)
            elif diff_percent < 5:
                confidence = max(confidence, 88.0)
            elif diff_percent < 10:
                confidence = min(confidence, 76.0)
            else:
                confidence = min(confidence, 60.0)
        elif detected_total:
            confidence = max(confidence, 65.0)

        is_valid = confidence >= 70.0
        return {
            "is_valid": is_valid,
            "confidence": confidence,
            "suggested_total": redetected_total or detected_total,
            "strategy": detection["strategy"],
            "message": "OCR validated successfully" if is_valid else "Low confidence detection",
        }

    def detect_total_with_confidence(self, text: str) -> dict:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        largest_amount = 0.0
        keyword_candidate: Optional[float] = None
        next_line_candidate: Optional[float] = None

        for index, line in enumerate(lines):
            normalized_line = line.lower()
            amounts = self._extract_amounts(line)

            if amounts:
                largest_amount = max(largest_amount, max(amounts))

            if self._has_total_keyword(normalized_line):
                if amounts:
                    keyword_candidate = max(amounts)
                    break
                if index + 1 < len(lines):
                    next_amounts = self._extract_amounts(lines[index + 1])
                    if next_amounts:
                        next_line_candidate = max(next_amounts)

        if keyword_candidate is not None:
            return {"detected_total": keyword_candidate, "confidence": 94.0, "strategy": "keyword"}
        if next_line_candidate is not None:
            return {"detected_total": next_line_candidate, "confidence": 84.0, "strategy": "keyword_next_line"}
        if largest_amount > 0:
            return {"detected_total": largest_amount, "confidence": 62.0, "strategy": "largest_number_fallback"}
        return {"detected_total": None, "confidence": 0.0, "strategy": "not_found"}

    def _extract_amounts(self, line: str) -> list[float]:
        amounts: list[float] = []
        for amount_str in self.AMOUNT_RE.findall(line):
            try:
                amounts.append(round(float(amount_str.replace(",", "")), 2))
            except ValueError:
                continue
        return amounts

    def _has_total_keyword(self, normalized_line: str) -> bool:
        if ("subtotal" in normalized_line or "sub total" in normalized_line) and not any(
            keyword in normalized_line for keyword in self.TOTAL_KEYWORDS if keyword != "total"
        ):
            return False
        return any(keyword in normalized_line for keyword in self.TOTAL_KEYWORDS)


class SplitService:
    def calculate_equal_split(self, total_amount: Decimal | float, num_participants: int) -> list[Decimal]:
        if num_participants <= 0:
            raise ValueError("At least one participant is required.")
        total_paisa = int(to_decimal(total_amount) * 100)
        base_paisa = total_paisa // num_participants
        remainder_paisa = total_paisa - base_paisa * num_participants
        return [
            Decimal(base_paisa + (1 if index < remainder_paisa else 0)) / Decimal(100)
            for index in range(num_participants)
        ]


class UPIService:
    def generate_upi_link(
        self,
        upi_id: str,
        name: str,
        amount: Decimal | float,
        note: Optional[str] = None,
        transaction_ref: Optional[str] = None,
    ) -> str:
        params = {
            "pa": upi_id,
            "pn": name,
            "am": f"{to_money_float(amount):.2f}",
            "cu": "INR",
        }
        if note:
            params["tn"] = note
        if transaction_ref:
            params["tr"] = transaction_ref
        return f"upi://pay?{urlencode(params)}"


class QRService:
    def generate_qr_base64(self, data: str, size: int = 300) -> str:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        image = qr.make_image(fill_color="black", back_color="white")
        if size:
            image = image.resize((size, size))
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{encoded}"
