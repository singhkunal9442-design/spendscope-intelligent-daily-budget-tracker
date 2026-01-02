import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { produce } from 'immer';
import {
  Scope, Transaction, Bill,
  UserPublic, UserSettings, CURRENCY_PRESETS
} from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import * as LucideIcons from 'lucide-react';
import { format, parseISO, isToday, isSameMonth } from 'date-fns';
import { useMemo } from 'react';
export { CURRENCY_PRESETS };
export type LucideIconName = keyof typeof LucideIcons;
export interface ScopeWithIcon extends Omit<Scope, 'icon'> {
  icon: LucideIcons.LucideIcon;
  iconName: string;
}
export const getIcon = (name: string): LucideIcons.LucideIcon => {
  const Icon = (LucideIcons as any)[name];
  return Icon || LucideIcons.Circle;
};
interface BudgetState {
  user: UserPublic | null;
  token: string | null;
  scopes: Scope[];
  transactions: Transaction[];
  bills: Bill[];
  settings: UserSettings;
  loading: boolean;
  loadData: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  addTransaction: (data: Partial<Transaction>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addScope: (data: Partial<Scope>) => Promise<void>;
  updateScopeFull: (id: string, data: Partial<Scope>) => Promise<void>;
  deleteScope: (id: string) => Promise<void>;
  addBill: (data: Partial<Bill>) => Promise<void>;
  updateBill: (id: string, data: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  setCurrentBalance: (balance: number) => Promise<void>;
  setCurrentSalary: (salary: number) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
}
export const useBudgetStore = create<BudgetState>((set, get) => ({
  user: localStorage.getItem('spendscope-user') ? JSON.parse(localStorage.getItem('spendscope-user')!) : null,
  token: localStorage.getItem('spendscope-token'),
  scopes: [],
  transactions: [],
  bills: [],
  settings: {
    userId: "",
    currentBalance: 0,
    currentSalary: 0,
    currentCurrency: 'USD',
    onboarded: false,
    theme: 'light'
  },
  loading: false,
  loadData: async () => {
    if (!get().token) return;
    set({ loading: true });
    try {
      const [settings, scopes, transactions, bills] = await Promise.all([
        api<UserSettings>('/api/user-settings'),
        api<Scope[]>('/api/scopes'),
        api<Transaction[]>('/api/transactions'),
        api<Bill[]>('/api/bills')
      ]);
      set({ settings, scopes, transactions, bills });
    } catch (e) {
      console.error("[STORE] Data load failed:", e);
    } finally {
      set({ loading: false });
    }
  },
  login: async (email, password) => {
    const res = await api<{ user: UserPublic, token: string }>('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password })
    });
    localStorage.setItem('spendscope-token', res.token);
    localStorage.setItem('spendscope-user', JSON.stringify(res.user));
    set({ user: res.user, token: res.token });
    await get().loadData();
    toast.success("Welcome back");
  },
  register: async (email, password) => {
    const res = await api<{ user: UserPublic, token: string }>('/api/auth/register', {
      method: 'POST', body: JSON.stringify({ email, password })
    });
    localStorage.setItem('spendscope-token', res.token);
    localStorage.setItem('spendscope-user', JSON.stringify(res.user));
    set({ user: res.user, token: res.token });
    await get().loadData();
    toast.success("Account created");
  },
  logout: () => {
    localStorage.removeItem('spendscope-token');
    localStorage.removeItem('spendscope-user');
    set({ user: null, token: null, scopes: [], transactions: [], bills: [] });
    toast.info("Logged out");
  },
  addTransaction: async (data) => {
    const res = await api<Transaction>('/api/transactions', {
      method: 'POST', body: JSON.stringify(data)
    });
    set(produce(s => { s.transactions.push(res); }));
  },
  updateTransaction: async (id, data) => {
    const res = await api<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT', body: JSON.stringify(data)
    });
    set(produce(s => {
      const idx = s.transactions.findIndex((t: Transaction) => t.id === id);
      if (idx !== -1) s.transactions[idx] = res;
    }));
  },
  deleteTransaction: async (id) => {
    await api(`/api/transactions/${id}`, { method: 'DELETE' });
    set(produce(s => {
      s.transactions = s.transactions.filter((t: Transaction) => t.id !== id);
    }));
  },
  addScope: async (data) => {
    const res = await api<Scope>('/api/scopes', {
      method: 'POST', body: JSON.stringify(data)
    });
    set(produce(s => { s.scopes.push(res); }));
  },
  updateScopeFull: async (id, data) => {
    const res = await api<Scope>(`/api/scopes/${id}`, {
      method: 'PUT', body: JSON.stringify(data)
    });
    set(produce(s => {
      const idx = s.scopes.findIndex((sc: Scope) => sc.id === id);
      if (idx !== -1) s.scopes[idx] = res;
    }));
  },
  deleteScope: async (id) => {
    await api(`/api/scopes/${id}`, { method: 'DELETE' });
    set(produce(s => {
      s.scopes = s.scopes.filter((sc: Scope) => sc.id !== id);
    }));
  },
  addBill: async (data) => {
    const res = await api<Bill>('/api/bills', {
      method: 'POST', body: JSON.stringify(data)
    });
    set(produce(s => { s.bills.push(res); }));
  },
  updateBill: async (id, data) => {
    const currentBills = get().bills;
    const billToUpdate = currentBills.find(b => b.id === id);
    // Logic: If 'paid' status changes, adjust 'currentBalance'
    if (billToUpdate && typeof data.paid === 'boolean' && data.paid !== billToUpdate.paid) {
      const balanceAdjustment = data.paid ? -billToUpdate.amount : billToUpdate.amount;
      const newBalance = get().settings.currentBalance + balanceAdjustment;
      // Optimistic balance update
      get().updateSettings({ currentBalance: newBalance });
    }
    const res = await api<Bill>(`/api/bills/${id}`, {
      method: 'PUT', body: JSON.stringify(data)
    });
    set(produce(s => {
      const idx = s.bills.findIndex((b: Bill) => b.id === id);
      if (idx !== -1) s.bills[idx] = res;
    }));
  },
  deleteBill: async (id) => {
    await api(`/api/bills/${id}`, { method: 'DELETE' });
    set(produce(s => {
      s.bills = s.bills.filter((b: Bill) => b.id !== id);
    }));
  },
  updateSettings: async (partial) => {
    // Optimistic Update
    const oldSettings = get().settings;
    set({ settings: { ...oldSettings, ...partial } });
    try {
      const updated = await api<UserSettings>('/api/user-settings', {
        method: 'PUT', body: JSON.stringify(partial)
      });
      set({ settings: updated });
    } catch (e) {
      // Revert on error
      set({ settings: oldSettings });
      throw e;
    }
  },
  setCurrentBalance: async (balance) => {
    await get().updateSettings({ currentBalance: balance, onboarded: true });
  },
  setCurrentSalary: async (salary) => {
    await get().updateSettings({ currentSalary: salary });
  },
  setCurrency: async (currency) => {
    await get().updateSettings({ currentCurrency: currency });
  }
}));
export const useAuthUser = () => useBudgetStore(s => s.user);
export const useIsLoggedIn = () => useBudgetStore(s => !!s.token);
export const useIsLoading = () => useBudgetStore(s => s.loading);
export const useSettings = () => useBudgetStore(useShallow(s => s.settings));
export const useTransactions = () => useBudgetStore(useShallow(s => s.transactions));
export const useBills = () => useBudgetStore(useShallow(s => s.bills));
export const useScopes = (): ScopeWithIcon[] => {
  const rawScopes = useBudgetStore(useShallow(s => s.scopes));
  return useMemo(() => rawScopes.map(s => ({
    ...s,
    icon: getIcon(s.icon),
    iconName: s.icon
  })), [rawScopes]);
};
export const useCurrentCurrency = () => useBudgetStore(s => s.settings.currentCurrency);
export const useCurrentBalance = () => useBudgetStore(s => s.settings.currentBalance);
export const useCurrentSalary = () => useBudgetStore(s => s.settings.currentSalary);
export const useFormatAmount = () => {
  const currency = useCurrentCurrency();
  return useMemo(() => (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  }, [currency]);
};
export const useSpentToday = (scopeId?: string) => {
  const transactions = useBudgetStore(useShallow(s => s.transactions));
  return useMemo(() => transactions
    .filter(t => isToday(parseISO(t.date)) && (!scopeId || t.scopeId === scopeId))
    .reduce((sum, t) => sum + t.amount, 0), [transactions, scopeId]);
};
export const useSpentThisMonth = (scopeId?: string) => {
  const transactions = useBudgetStore(useShallow(s => s.transactions));
  return useMemo(() => {
    const now = new Date();
    return transactions
      .filter(t => isSameMonth(parseISO(t.date), now) && (!scopeId || t.scopeId === scopeId))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, scopeId]);
};
export const useMonthlyBudget = () => {
  const rawScopes = useBudgetStore(useShallow(s => s.scopes));
  return useMemo(() => rawScopes.reduce((sum, s) => sum + (s.monthlyLimit || s.dailyLimit * 30), 0), [rawScopes]);
};
export const useUnpaidBillsTotal = () => {
  const bills = useBudgetStore(useShallow(s => s.bills));
  return useMemo(() => bills
    .filter(b => !b.paid)
    .reduce((sum, b) => sum + b.amount, 0), [bills]);
};
export const useDailyTotals = () => {
  const transactions = useBudgetStore(useShallow(s => s.transactions));
  return useMemo(() => {
    const totals = new Map<string, number>();
    transactions.forEach(t => {
      const dayKey = format(parseISO(t.date), 'yyyy-MM-dd');
      totals.set(dayKey, (totals.get(dayKey) || 0) + t.amount);
    });
    return totals;
  }, [transactions]);
};