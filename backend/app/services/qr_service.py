import qrcode
from io import BytesIO
import base64
from typing import Optional


class QRService:
    """
    QR Code generation service for UPI payments
    Generates QR codes that can be scanned by any UPI app
    """
    
    def generate_qr_base64(
        self,
        data: str,
        size: int = 300,
        error_correction: str = 'H'
    ) -> str:
        """
        Generate QR code as base64 string
        
        Args:
            data: Data to encode (usually UPI link)
            size: QR code size in pixels
            error_correction: Error correction level (L, M, Q, H)
        
        Returns:
            Base64 encoded PNG image string with data URI prefix
        """
        # Map error correction level
        error_levels = {
            'L': qrcode.constants.ERROR_CORRECT_L,
            'M': qrcode.constants.ERROR_CORRECT_M,
            'Q': qrcode.constants.ERROR_CORRECT_Q,
            'H': qrcode.constants.ERROR_CORRECT_H,
        }
        
        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,
            error_correction=error_levels.get(error_correction, qrcode.constants.ERROR_CORRECT_H),
            box_size=10,
            border=4,
        )
        
        # Add data
        qr.add_data(data)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Resize if needed
        if size:
            img = img.resize((size, size))
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    def save_qr_image(
        self,
        data: str,
        file_path: str,
        size: int = 300
    ) -> str:
        """
        Save QR code as image file
        
        Args:
            data: Data to encode
            file_path: Path to save image
            size: Image size
        
        Returns:
            File path where image was saved
        """
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        if size:
            img = img.resize((size, size))
        
        img.save(file_path)
        return file_path
