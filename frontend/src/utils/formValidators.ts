import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const participantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  upiId: z.string().regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/, 'Invalid UPI ID').optional(),
});

export const splitSchema = z.object({
  totalAmount: z.number().positive('Amount must be positive'),
  participants: z.array(participantSchema).min(1, 'At least one participant required'),
});
