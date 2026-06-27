import { axiosClient } from './axiosClient';
import type { UserMini } from './friendsAPI';

export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Drink', emoji: '🍔' },
  { value: 'transport', label: 'Transportation', emoji: '🚗' },
  { value: 'utilities', label: 'Utilities', emoji: '💡' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'medical', label: 'Medical', emoji: '🏥' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'rent', label: 'Rent & Mortgage', emoji: '🏠' },
  { value: 'other', label: 'Other', emoji: '📦' },
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]['value'];
export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export interface ExpenseShare {
  id: number;
  user: UserMini;
  amount_owed: number;
  is_settled: boolean;
  settled_at: string | null;
}

export interface Comment {
  id: number;
  user: UserMini;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  group: string | null;
  group_name: string | null;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paid_by: UserMini;
  split_type: SplitType;
  date: string;
  notes: string;
  is_recurring: boolean;
  recurring_frequency: string;
  created_by: UserMini;
  shares: ExpenseShare[];
  comments: Comment[];
  your_share?: number;
  created_at: string;
  updated_at: string;
}

export interface ExpenseListItem {
  id: string;
  group: string | null;
  group_name: string | null;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paid_by: UserMini;
  split_type: SplitType;
  date: string;
  your_share: number;
  created_at: string;
}

export interface ShareInput {
  user_id: string;
  value: number;
}

export interface CreateExpenseRequest {
  group_id?: string | null;
  description: string;
  amount: number;
  currency?: string;
  category: ExpenseCategory;
  paid_by_user_id: string;
  split_type: SplitType;
  date: string;
  notes?: string;
  is_recurring?: boolean;
  recurring_frequency?: string;
  participant_ids?: string[]; // for equal splits
  shares?: ShareInput[];       // for exact / percentage / shares splits
}

export const expensesAPI = {
  getExpenses: async (params?: { group_id?: string; with_user?: string; limit?: number; offset?: number }): Promise<ExpenseListItem[]> => {
    const res = await axiosClient.get<ExpenseListItem[]>('/expenses/', { params });
    return res.data;
  },

  createExpense: async (data: CreateExpenseRequest): Promise<Expense> => {
    const res = await axiosClient.post<Expense>('/expenses/', data);
    return res.data;
  },

  getExpense: async (id: string): Promise<Expense> => {
    const res = await axiosClient.get<Expense>(`/expenses/${id}/`);
    return res.data;
  },

  updateExpense: async (id: string, data: Partial<CreateExpenseRequest>): Promise<Expense> => {
    const res = await axiosClient.patch<Expense>(`/expenses/${id}/`, data);
    return res.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await axiosClient.delete(`/expenses/${id}/`);
  },

  getComments: async (expenseId: string): Promise<Comment[]> => {
    const res = await axiosClient.get<Comment[]>(`/expenses/${expenseId}/comments/`);
    return res.data;
  },

  addComment: async (expenseId: string, content: string): Promise<Comment> => {
    const res = await axiosClient.post<Comment>(`/expenses/${expenseId}/comments/`, { content });
    return res.data;
  },
};
