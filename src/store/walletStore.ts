import { create } from "zustand";

export interface Transaction {
  id: number;
  type: "topup" | "deduction" | "refund";
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  status: string;
  createdAt: Date;
  certificateId?: number;
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  setBalance: (balance: number) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (tx: Transaction) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  transactions: [],
  setBalance: (balance) => set({ balance }),
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions],
      balance: parseFloat(tx.balanceAfter),
    })),
}));
