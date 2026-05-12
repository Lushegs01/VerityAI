import { create } from "zustand";

interface User {
  id: number;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: string;
  fullName: string | null;
  companyName: string | null;
  companyType: string | null;
  phone?: string | null;
  walletBalance: string;
  plan: string;
  verificationCount: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** When true, useAuth skips the trpc session query and trusts the local user. */
  isDemo: boolean;
  setUser: (user: User | null) => void;
  setAuth: (user: User) => void;
  loginAsDemo: (email: string, name?: string, company?: string) => void;
  /** Demo-only: credit (positive amount) or debit (negative) the local wallet balance. */
  adjustDemoBalance: (deltaNgn: number) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const DEMO_STORAGE_KEY = "verity-demo-user";

function readDemoUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeDemoUser(user: User | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const persistedDemoUser = readDemoUser();

export const useAuthStore = create<AuthState>((set) => ({
  user: persistedDemoUser,
  isAuthenticated: !!persistedDemoUser,
  isLoading: !persistedDemoUser,
  isDemo: !!persistedDemoUser,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuth: (user) => set({ user, isAuthenticated: true, isLoading: false, isDemo: false }),
  loginAsDemo: (email, name, company) => {
    const user: User = {
      id: 1,
      name: name || email.split("@")[0],
      email,
      avatar: null,
      role: "user",
      fullName: name || email.split("@")[0],
      companyName: company || null,
      companyType: "corporate",
      phone: null,
      walletBalance: "12500.00",
      plan: "pro",
      verificationCount: 28,
    };
    writeDemoUser(user);
    set({ user, isAuthenticated: true, isLoading: false, isDemo: true });
  },
  adjustDemoBalance: (deltaNgn) =>
    set((state) => {
      if (!state.user) return state;
      const current = parseFloat(state.user.walletBalance || "0");
      const next = Math.max(0, current + deltaNgn);
      const updated: User = {
        ...state.user,
        walletBalance: next.toFixed(2),
      };
      writeDemoUser(updated);
      return { user: updated };
    }),
  logout: () => {
    writeDemoUser(null);
    set({ user: null, isAuthenticated: false, isDemo: false });
  },
  setLoading: (loading) => set({ isLoading: loading }),
}));
