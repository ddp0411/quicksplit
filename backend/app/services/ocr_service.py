import re
from typing import Dict, Optional


class OCRService:
    """
    OCR service for backend validation
    Frontend does primary OCR with Tesseract.js
    Backend validates and enhances results
    """
    
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
    
    async def process_image(self, image_path: str, preprocessed: bool = False) -> Dict:
        """
        Process image for OCR (validation only)
        Primary OCR is done on frontend for speed
        """
        # In production, you might use Tesseract/Paddle OCR here for validation
        # For now, return placeholder
        return {
            "text": "",
            "confidence": 0.0,
            "detected_total": None,
        }
    
    async def validate_ocr_text(
        self, 
        text: str, 
        detected_total: Optional[float]
    ) -> Dict:
        """
        Validate OCR results from frontend
        Cross-check detected total with text analysis
        """
        detection = self.detect_total_with_confidence(text)
        redetected_total = detection["detected_total"]
        confidence = detection["confidence"]

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

    def detect_total_with_confidence(self, text: str) -> Dict[str, Optional[float] | str]:
        """
        Detect total amount and explain confidence.

        Priority:
        1. Amount beside a strong total keyword.
        2. Amount on the line immediately after a total keyword.
        3. Largest amount found in the receipt text.
        """
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
            return {
                "detected_total": keyword_candidate,
                "confidence": 94.0,
                "strategy": "keyword",
            }

        if next_line_candidate is not None:
            return {
                "detected_total": next_line_candidate,
                "confidence": 84.0,
                "strategy": "keyword_next_line",
            }

        if largest_amount > 0:
            return {
                "detected_total": largest_amount,
                "confidence": 62.0,
                "strategy": "largest_number_fallback",
            }

        return {"detected_total": None, "confidence": 0.0, "strategy": "not_found"}

    def detect_total_amount(self, text: str) -> Optional[float]:
        """
        Detect total amount from OCR text
        Uses keyword matching and pattern recognition
        """
        return self.detect_total_with_confidence(text)["detected_total"]  # type: ignore[return-value]

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
            keyword in normalized_line
            for keyword in self.TOTAL_KEYWORDS
            if keyword != "total"
        ):
            return False
        return any(keyword in normalized_line for keyword in self.TOTAL_KEYWORDS)
