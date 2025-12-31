import { create } from 'zustand';

interface Participant {
  id: string;
  name: string;
  amount: number;
  upiId?: string;
}

interface SplitState {
  billTotal: number;
  participants: Participant[];
  setBillTotal: (total: number) => void;
  addParticipant: (name: string, upiId?: string) => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  calculateSplit: () => void;
  reset: () => void;
}

export const useSplitStore = create<SplitState>((set, get) => ({
  billTotal: 0,
  participants: [],
  
  setBillTotal: (total) => set({ billTotal: total }),
  
  addParticipant: (name, upiId) =>
    set((state) => ({
      participants: [
        ...state.participants,
        {
          id: crypto.randomUUID(),
          name,
          amount: 0,
          upiId,
        },
      ],
    })),
  
  removeParticipant: (id) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== id),
    })),
  
  updateParticipant: (id, updates) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  
  calculateSplit: () => {
    const { billTotal, participants } = get();
    if (participants.length === 0) return;
    
    const baseAmount = Math.floor(billTotal / participants.length);
    const remainder = billTotal - baseAmount * participants.length;
    
    set({
      participants: participants.map((p, index) => ({
        ...p,
        amount: baseAmount + (index < remainder ? 1 : 0),
      })),
    });
  },
  
  reset: () => set({ billTotal: 0, participants: [] }),
}));
