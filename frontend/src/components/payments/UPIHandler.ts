/**
 * UPI Deep Link Generator for Indian payment apps
 * Supports: Google Pay, PhonePe, Paytm, BHIM, and other UPI apps
 */

export interface UPIPaymentParams {
  pa: string;        // Payee VPA (UPI ID)
  pn: string;        // Payee Name
  am: number;        // Amount
  cu?: string;       // Currency (default: INR)
  tn?: string;       // Transaction Note
  tr?: string;       // Transaction Reference ID
}

export class UPIHandler {
  /**
   * Generate UPI deep link
   * Format: upi://pay?pa=receiver@upi&pn=Name&am=100&cu=INR&tn=Note
   */
  static generateUPILink(params: UPIPaymentParams): string {
    const queryParams = new URLSearchParams({
      pa: params.pa,
      pn: params.pn,
      am: params.am.toFixed(2),
      cu: params.cu || 'INR',
      ...(params.tn && { tn: params.tn }),
      ...(params.tr && { tr: params.tr }),
    });

    return `upi://pay?${queryParams.toString()}`;
  }

  /**
   * Generate payment link for specific apps
   */
  static generateAppLink(app: 'gpay' | 'phonepe' | 'paytm', params: UPIPaymentParams): string {
    const baseLink = this.generateUPILink(params);

    switch (app) {
      case 'gpay':
        return `gpay://upi/pay?${new URLSearchParams({
          pa: params.pa,
          pn: params.pn,
          am: params.am.toFixed(2),
          cu: params.cu || 'INR',
        })}`;
      
      case 'phonepe':
        return `phonepe://pay?${new URLSearchParams({
          pa: params.pa,
          pn: params.pn,
          am: params.am.toFixed(2),
          cu: params.cu || 'INR',
        })}`;
      
      case 'paytm':
        return baseLink; // Paytm uses standard UPI deep link
      
      default:
        return baseLink;
    }
  }

  /**
   * Check if device supports UPI payments
   */
  static isUPISupported(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('android') || userAgent.includes('iphone');
  }

  /**
   * Open UPI payment (tries to detect and open appropriate app)
   */
  static openPayment(params: UPIPaymentParams): void {
    const link = this.generateUPILink(params);
    
    if (this.isUPISupported()) {
      window.location.href = link;
    } else {
      alert('UPI payments are only supported on mobile devices with UPI apps installed.');
    }
  }
}
