// Form validators
export const validators = {
  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Invalid email format';
    return null;
  },

  password: (value: string): string | null => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return null;
  },

  required: (value: string): string | null => {
    if (!value || value.trim() === '') return 'This field is required';
    return null;
  },

  amount: (value: string): string | null => {
    const amount = parseFloat(value);
    if (isNaN(amount)) return 'Invalid amount';
    if (amount <= 0) return 'Amount must be greater than 0';
    return null;
  },
};

