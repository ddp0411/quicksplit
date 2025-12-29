// UPI utilities
export const generateUPILink = (upiId: string, amount: number, note?: string): string => {
  const params = new URLSearchParams({
    pa: upiId,
    am: amount.toString(),
    cu: 'INR',
  });
  if (note) {
    params.append('tn', note);
  }
  return `upi://pay?${params.toString()}`;
};

export const validateUPIId = (upiId: string): boolean => {
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  return upiRegex.test(upiId);
};

