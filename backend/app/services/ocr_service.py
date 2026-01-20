import re
from typing import Dict, Optional
from pathlib import Path


class OCRService:
    """
    OCR service for backend validation
    Frontend does primary OCR with Tesseract.js
    Backend validates and enhances results
    """
    
    TOTAL_KEYWORDS = [
        'total', 'grand total', 'amount due', 'net amount',
        'bill amount', 'total amount', 'amount payable'
    ]
    
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
            "detected_total": None
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
        # Re-detect total from text
        redetected_total = self.detect_total_amount(text)
        
        # Calculate confidence based on match
        confidence = 1.0
        if detected_total and redetected_total:
            diff_percent = abs(detected_total - redetected_total) / detected_total * 100
            if diff_percent < 5:
                confidence = 0.95
            elif diff_percent < 10:
                confidence = 0.85
            else:
                confidence = 0.70
        
        is_valid = confidence >= 0.70
        
        return {
            "is_valid": is_valid,
            "confidence": confidence,
            "suggested_total": redetected_total or detected_total,
            "message": "OCR validated successfully" if is_valid else "Low confidence detection"
        }
    
    def detect_total_amount(self, text: str) -> Optional[float]:
        """
        Detect total amount from OCR text
        Uses keyword matching and pattern recognition
        """
        lines = text.lower().split('\n')
        detected_amount: Optional[float] = None
        highest_amount = 0.0
        
        for line in lines:
            # Check if line contains total keyword
            has_keyword = any(keyword in line for keyword in self.TOTAL_KEYWORDS)
            
            # Extract amounts from line
            # Supports: 123.45, 1,234.56, Rs 123, ₹123
            amounts = re.findall(
                r'(?:rs\.?|₹)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                line,
                re.IGNORECASE
            )
            
            if amounts:
                for amount_str in amounts:
                    # Clean and parse
                    cleaned = amount_str.replace(',', '')
                    try:
                        amount = float(cleaned)
                        
                        # If keyword found, this is likely the total
                        if has_keyword and amount > 0:
                            detected_amount = amount
                            break
                        
                        # Track highest amount as fallback
                        if amount > highest_amount:
                            highest_amount = amount
                    except ValueError:
                        continue
            
            if detected_amount:
                break
        
        return detected_amount or (highest_amount if highest_amount > 0 else None)
