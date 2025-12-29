// UPI Handler utility
export class UPIHandler {
  static generateUPILink(upiId: string, amount: number, note?: string): string {
    const params = new URLSearchParams({
      pa: upiId,
      am: amount.toString(),
      cu: 'INR',
    });
    if (note) {
      params.append('tn', note);
    }
    return `upi://pay?${params.toString()}`;
  }

  static validateUPIId(upiId: string): boolean {
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    return upiRegex.test(upiId);
  }

  static openUPIApp(upiLink: string): void {
    window.location.href = upiLink;
  }
}

