import base64
import hashlib
import re
from collections import defaultdict
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


# ─── Splitwise-style balance and share calculation ────────────────────────────

class ShareCalculationService:
    """Calculates per-user share amounts for all split types."""

    def calculate_shares(
        self,
        total_amount: Decimal,
        split_type: str,
        participant_ids: list,
        shares_input: list[dict],
    ) -> dict[str, Decimal]:
        """
        Returns {user_id_str: amount_owed}.

        shares_input items: {"user_id": str, "value": Decimal}
        For equal:      values ignored, IDs from participant_ids
        For exact:      value = exact rupee amount each person owes
        For percentage: value = % (must sum to 100)
        For shares:     value = # of shares (proportional)
        """
        result: dict[str, Decimal] = {}

        if split_type == "equal":
            count = len(participant_ids)
            if count == 0:
                raise ValueError("At least one participant required.")
            total_paisa = int(to_decimal(total_amount) * 100)
            base_paisa = total_paisa // count
            rem = total_paisa - base_paisa * count
            for i, uid in enumerate(participant_ids):
                result[str(uid)] = Decimal(base_paisa + (1 if i < rem else 0)) / 100

        elif split_type == "exact":
            total_check = sum(Decimal(str(s["value"])) for s in shares_input)
            if abs(total_check - to_decimal(total_amount)) > Decimal("0.02"):
                raise ValueError("Exact amounts must sum to the total.")
            for s in shares_input:
                result[str(s["user_id"])] = to_decimal(s["value"])

        elif split_type == "percentage":
            pct_sum = sum(Decimal(str(s["value"])) for s in shares_input)
            if abs(pct_sum - 100) > Decimal("0.01"):
                raise ValueError("Percentages must sum to 100.")
            for s in shares_input:
                result[str(s["user_id"])] = to_decimal(
                    to_decimal(total_amount) * Decimal(str(s["value"])) / 100
                )

        elif split_type == "shares":
            total_shares = sum(Decimal(str(s["value"])) for s in shares_input)
            if total_shares == 0:
                raise ValueError("Total shares cannot be zero.")
            for s in shares_input:
                result[str(s["user_id"])] = to_decimal(
                    to_decimal(total_amount) * Decimal(str(s["value"])) / total_shares
                )

        else:
            raise ValueError(f"Unknown split type: {split_type}")

        return result


class BalanceService:
    """
    Computes net balances between users from Expense + Settlement records.

    Convention:
      balance[uid] = net amount *owed to* the current user by uid
      positive → uid owes current user
      negative → current user owes uid
    """

    def get_user_balances(self, user) -> dict:
        """
        Overall balance: aggregate across all expenses and settlements
        involving the user.
        Returns list of {user, balance} dicts (serializer-ready).
        """
        from api.models import Expense, ExpenseShare, User as UserModel

        # net[other_user_id] = amount other user owes current user (signed)
        net: dict[str, Decimal] = defaultdict(Decimal)

        # Expenses paid by current user
        for expense in Expense.objects.filter(paid_by=user).prefetch_related("shares"):
            for share in expense.shares.all():
                if share.user_id != user.pk and not share.is_settled:
                    net[str(share.user_id)] += share.amount_owed

        # Expenses involving current user as a debtor
        for share in (
            ExpenseShare.objects
            .filter(user=user, is_settled=False)
            .select_related("expense__paid_by")
        ):
            paid_by_id = str(share.expense.paid_by_id)
            if paid_by_id != str(user.pk):
                net[paid_by_id] -= share.amount_owed

        # Settlements are not summed here: recording a settlement marks the
        # matching ExpenseShares settled (is_settled=True), so they drop out of
        # the unsettled-share sums above. This avoids double-counting a payment.

        # Build response
        user_ids = [uid for uid, bal in net.items() if abs(bal) >= Decimal("0.01")]
        users = {str(u.pk): u for u in UserModel.objects.filter(pk__in=user_ids)}

        result = []
        for uid, balance in net.items():
            if abs(balance) < Decimal("0.01"):
                continue
            if uid in users:
                result.append({"user": users[uid], "balance": float(balance)})

        result.sort(key=lambda x: abs(x["balance"]), reverse=True)
        return result

    def get_group_balances(self, group) -> dict:
        """
        Balances within a single group.
        Returns member_balances (raw per-member net), simplified_debts, total_expenses.
        """
        from api.models import User as UserModel

        net: dict[str, Decimal] = defaultdict(Decimal)
        total_expenses = Decimal("0")

        # For each unsettled share: credit the payer, debit the share holder.
        # Settled shares (cleared by a recorded settlement) are skipped, so a
        # settlement reduces the outstanding balance without a separate term.
        for expense in group.expenses.all().prefetch_related("shares"):
            total_expenses += expense.amount
            for share in expense.shares.all():
                if share.is_settled:
                    continue
                net[str(expense.paid_by_id)] += share.amount_owed
                net[str(share.user_id)] -= share.amount_owed

        member_ids = list({str(m.user_id) for m in group.members.all()})
        users = {str(u.pk): u for u in UserModel.objects.filter(pk__in=member_ids)}

        member_balances = [
            {"user": users[uid], "balance": float(net.get(uid, Decimal("0")))}
            for uid in member_ids
            if uid in users
        ]

        simplified = self._simplify_debts(net, users)

        return {
            "member_balances": member_balances,
            "simplified_debts": simplified,
            "total_expenses": float(total_expenses),
        }

    def _simplify_debts(self, net: dict, users: dict) -> list:
        """Greedy debt simplification — minimises transaction count."""
        creditors = sorted(
            [[uid, float(bal)] for uid, bal in net.items() if bal > Decimal("0.005") and uid in users],
            key=lambda x: -x[1],
        )
        debtors = sorted(
            [[uid, float(-bal)] for uid, bal in net.items() if bal < Decimal("-0.005") and uid in users],
            key=lambda x: -x[1],
        )

        transactions = []
        i = j = 0
        while i < len(creditors) and j < len(debtors):
            cred_uid, cred_amt = creditors[i]
            debt_uid, debt_amt = debtors[j]
            settle = round(min(cred_amt, debt_amt), 2)

            transactions.append({
                "from_user": users[debt_uid],
                "to_user": users[cred_uid],
                "amount": settle,
            })

            creditors[i][1] = round(cred_amt - settle, 2)
            debtors[j][1] = round(debt_amt - settle, 2)

            if creditors[i][1] < 0.005:
                i += 1
            if debtors[j][1] < 0.005:
                j += 1

        return transactions
