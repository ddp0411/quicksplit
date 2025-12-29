# UPI service
from typing import Optional


def generate_upi_link(upi_id: str, amount: float, note: Optional[str] = None) -> str:
    """Generate UPI payment link."""
    params = {
        "pa": upi_id,
        "am": str(amount),
        "cu": "INR",
    }
    if note:
        params["tn"] = note
    
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    return f"upi://pay?{query_string}"


def validate_upi_id(upi_id: str) -> bool:
    """Validate UPI ID format."""
    import re
    upi_regex = r'^[\w.-]+@[\w.-]+$'
    return bool(re.match(upi_regex, upi_id))

