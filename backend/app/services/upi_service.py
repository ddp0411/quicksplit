from urllib.parse import urlencode
from typing import Optional


class UPIService:
    """
    UPI deep link generation service
    Supports all Indian UPI payment apps
    Format: upi://pay?pa=receiver@upi&pn=Name&am=100&cu=INR
    """
    
    def generate_upi_link(
        self,
        upi_id: str,
        name: str,
        amount: float,
        note: Optional[str] = None,
        transaction_ref: Optional[str] = None
    ) -> str:
        """
        Generate UPI payment deep link
        
        Args:
            upi_id: Payee UPI ID (e.g., username@bank)
            name: Payee name
            amount: Payment amount in INR
            note: Optional transaction note
            transaction_ref: Optional transaction reference
        
        Returns:
            UPI deep link string
        """
        params = {
            'pa': upi_id,
            'pn': name,
            'am': f"{amount:.2f}",
            'cu': 'INR',
        }
        
        if note:
            params['tn'] = note
        
        if transaction_ref:
            params['tr'] = transaction_ref
        
        query_string = urlencode(params)
        return f"upi://pay?{query_string}"
    
    def generate_app_specific_link(
        self,
        app: str,
        upi_id: str,
        name: str,
        amount: float
    ) -> str:
        """
        Generate app-specific UPI link
        Supports: gpay, phonepe, paytm, bhim
        """
        params = {
            'pa': upi_id,
            'pn': name,
            'am': f"{amount:.2f}",
            'cu': 'INR',
        }
        
        app_schemes = {
            'gpay': 'gpay://upi/pay',
            'phonepe': 'phonepe://pay',
            'paytm': 'paytmmp://pay',
            'bhim': 'bhim://pay'
        }
        
        base_url = app_schemes.get(app, 'upi://pay')
        query_string = urlencode(params)
        
        return f"{base_url}?{query_string}"
    
    @staticmethod
    def validate_upi_id(upi_id: str) -> bool:
        """
        Validate UPI ID format
        Format: username@bankname
        """
        import re
        pattern = r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$'
        return bool(re.match(pattern, upi_id))
