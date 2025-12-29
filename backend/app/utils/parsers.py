# Parsers utilities
import re
from typing import List, Dict


def parse_receipt_text(text: str) -> Dict:
    """Parse receipt text to extract structured data."""
    items = []
    total = 0.0
    
    lines = text.split('\n')
    for line in lines:
        # Look for item-price patterns
        price_match = re.search(r'(\d+\.\d{2})', line)
        if price_match:
            price = float(price_match.group(1))
            name = line.replace(price_match.group(1), '').strip()
            if name:
                items.append({"name": name, "price": price})
    
    # Extract total
    total_patterns = [
        r'TOTAL[:\s]+(\d+\.\d{2})',
        r'Total[:\s]+(\d+\.\d{2})',
    ]
    for pattern in total_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            total = float(match.group(1))
            break
    
    return {
        "items": items,
        "total": total,
        "raw_text": text,
    }

