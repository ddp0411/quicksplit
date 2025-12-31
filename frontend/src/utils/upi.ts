export const formatUPIId = (upiId: string): string => {
  return upiId.trim().toLowerCase();
};

export const validateUPIId = (upiId: string): boolean => {
  // UPI ID format: username@bankname
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return regex.test(upiId);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const parseAmount = (input: string): number | null => {
  const cleaned = input.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};
