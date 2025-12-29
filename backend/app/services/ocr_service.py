# OCR service
try:
    import pytesseract
    from PIL import Image
except ImportError:
    pytesseract = None
    Image = None

import io
import base64
import re
from typing import Dict, List


async def process_receipt_image(image_data: str) -> Dict:
    """Process receipt image and extract text."""
    if not pytesseract or not Image:
        raise ImportError("pytesseract and Pillow are required for OCR")
    
    # Decode base64 image
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes))
    
    # Perform OCR
    text = pytesseract.image_to_string(image)
    
    # Extract items and total
    items = extract_items(text)
    total = extract_total(text)
    
    return {
        "text": text,
        "items": items,
        "total": total,
    }


def extract_items(text: str) -> List[Dict[str, any]]:
    """Extract items from OCR text."""
    items = []
    lines = text.split('\n')
    
    for line in lines:
        # Look for price patterns
        price_match = re.search(r'(\d+\.\d{2})', line)
        if price_match:
            price = float(price_match.group(1))
            name = line.replace(price_match.group(1), '').strip()
            if name:
                items.append({"name": name, "price": price})
    
    return items


def extract_total(text: str) -> float:
    """Extract total amount from OCR text."""
    # Look for "TOTAL" or "TOTAL:" followed by amount
    total_patterns = [
        r'TOTAL[:\s]+(\d+\.\d{2})',
        r'Total[:\s]+(\d+\.\d{2})',
        r'AMOUNT[:\s]+(\d+\.\d{2})',
    ]
    
    for pattern in total_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
    
    return 0.0

