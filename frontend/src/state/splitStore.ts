// Split store
import { create } from 'zustand';

interface SplitData {
  id: string;
  totalAmount: number;
  participants: Array<{ id: string; name: string; amount: number }>;
  items: Array<{ name: string; price: number; assignedTo: string[] }>;
}

interface SplitStore {
  splitData: SplitData | null;
  setSplitData: (data: SplitData) => void;
  clearSplitData: () => void;
}

export const useSplitStore = create<SplitStore>((set) => ({
  splitData: null,
  setSplitData: (data) => set({ splitData: data }),
  clearSplitData: () => set({ splitData: null }),
}));

