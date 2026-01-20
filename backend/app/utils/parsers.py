import re
from typing import Optional, List, Dict


class TextParser:
    """Utility class for parsing OCR text"""
    
    @staticmethod
    def extract_amounts(text: str) -> List[float]:
        """
        Extract all amounts from text
        Supports formats: 123.45, 1,234.56, Rs 123, ₹123
        """
        pattern = r'(?:rs\.?|₹)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
        matches = re.findall(pattern, text, re.IGNORECASE)
        
        amounts = []
        for match in matches:
            cleaned = match.replace(',', '')
            try:
                amounts.append(float(cleaned))
            except ValueError:
                continue
        
        return amounts
    
    @staticmethod
    def extract_date(text: str) -> Optional[str]:
        """Extract date from text"""
        # Common date patterns
        patterns = [
            r'\d{2}[/-]\d{2}[/-]\d{4}',  # DD/MM/YYYY or DD-MM-YYYY
            r'\d{4}[/-]\d{2}[/-]\d{2}',  # YYYY/MM/DD or YYYY-MM-DD
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        
        return None
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean and normalize OCR text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters
        text = re.sub(r'[^\w\s.,@₹-]', '', text)
        return text.strip()
