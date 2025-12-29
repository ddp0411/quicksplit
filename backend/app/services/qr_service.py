# QR service
try:
    import qrcode
except ImportError:
    qrcode = None

import io
import base64
from typing import Optional
from app.services.upi_service import generate_upi_link


def generate_qr_code(upi_id: str, amount: float, note: Optional[str] = None) -> str:
    """Generate QR code as base64 string."""
    if not qrcode:
        raise ImportError("qrcode is required for QR code generation")
    
    upi_link = generate_upi_link(upi_id, amount, note)
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(upi_link)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

