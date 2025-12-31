import { create } from 'zustand';
import { produce } from 'immer';
import { isToday, parseISO, isSameMonth, endOfMonth, format } from 'date-fns';
import { Scope, Transaction, Bill, AuthResponseData, UserSettings } from '@shared/types';
import * as lucideIcons from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { useMemo, useCallback } from 'react';
export const CURRENCY_PRESETS = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'AED'] as const;
export const formatCurrencyAmount = (currency: string, amount: number, locale = 'en-US') => {
  const safeLocale = typeof navigator !== 'undefined' ? navigator.language || locale : locale;
  try {
    return new Intl.NumberFormat(safeLocale, {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  } catch (e) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
};
export const useFormatAmount = () => {
  const currency = useBudgetStore(s => s.currentCurrency);
  return useCallback((amt: number) => formatCurrencyAmount(currency, amt), [currency]);
};
export type ScopeWithIcon = Omit<Scope, 'icon'> & {
  icon: lucideIcons.LucideIcon;
  monthlyLimit?: number;
};
interface BudgetState {
  user: { id: string; email: string } | null;
  token: string | null;
  scopes: ScopeWithIcon[];
  transactions: Transaction[];
  bills: Bill[];
  currentBalance: number;
  currentSalary: number;
  loading: boolean;
  currentCurrency: string;
  loadData: () => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  setCurrentBalance: (balance: number) => void;
  setCurrentSalary: (salary: number) => void;
  addScope: (scope: Omit<Scope, 'id'>) => Promise<void>;
  updateScope: (id: string, dailyLimit: number) => Promise<void>;
  updateScopeFull: (id: string, data: Partial<Omit<Scope, 'id'>>) => Promise<void>;
  deleteScope: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  updateTransaction: (id: string, changes: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBill: (bill: Omit<Bill, 'id' | 'paid'>) => Promise<void>;
  updateBill: (id: string, changes: Partial<Omit<Bill, 'id'>>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}
const getIcon = (iconName: string): lucideIcons.LucideIcon => {
  const Icon = (lucideIcons as any)[iconName];
  return Icon || lucideIcons.Circle;
};
const getSafeStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};
const savedToken = getSafeStorage('spendscope-token');
const savedUser = getSafeStorage('spendscope-user');
export const useBudgetStore = create<BudgetState>((set, get) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken,
  scopes: [],
  transactions: [],
  bills: [],
  currentBalance: 0,
  currentSalary: 0,
  loading: true,
  currentCurrency: 'USD',
  loadData: async () => {
    set({ loading: true });
    try {
      const [scopes, transactions, bills, settings] = await Promise.all([
        api<Scope[]>('/api/scopes'),
        api<Transaction[]>('/api/transactions'),
        api<Bill[]>('/api/bills'),
        api<UserSettings>('/api/user-settings'),
      ]);
      const scopesWithIcons = scopes.map(s => ({ ...s, icon: getIcon(s.icon) }));
      set({
        scopes: scopesWithIcons,
        transactions,
        bills,
        currentCurrency: settings.currentCurrency || 'USD',
        currentBalance: settings.currentBalance || 0,
        currentSalary: settings.currentSalary || 0,
      });
      // Local Fallback Sync
      localStorage.setItem('spendscope-currency', settings.currentCurrency);
      localStorage.setItem('spendscope-balance', settings.currentBalance.toString());
      localStorage.setItem('spendscope-salary', settings.currentSalary.toString());
    } catch (error) {
      console.error('[STORE] loadData failed:', error);
      toast.error("Could not load your budget data.");
    } finally {
      set({ loading: false });
    }
  },
  login: async (email, password) => {
    const prevUser = get().user;
    const prevToken = get().token;
    const tempUser = { id: 'temp', email } as { id: string; email: string };
    const tempToken = 'temp';
    localStorage.setItem('spendscope-token', tempToken);
    localStorage.setItem('spendscope-user', JSON.stringify(tempUser));
    set({ user: tempUser, token: tempToken });
    try {
      const res = await api<AuthResponseData>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('spendscope-token', res.token);
      localStorage.setItem('spendscope-user', JSON.stringify(res.user));
      set({ user: res.user, token: res.token });
      await get().loadData();
      toast.success("Welcome back!");
    } catch (error: any) {
      localStorage.setItem('spendscope-token', prevToken || '');
      localStorage.setItem('spendscope-user', prevUser ? JSON.stringify(prevUser) : '');
      set({ user: prevUser, token: prevToken });
      console.error('[STORE] Login failed:', error.message);
      toast.error(error.message);
    }
  },
  register: async (email, password) => {
    const prevUser = get().user;
    const prevToken = get().token;
    const tempUser = { id: 'temp', email } as { id: string; email: string };
    const tempToken = 'temp';
    localStorage.setItem('spendscope-token', tempToken);
    localStorage.setItem('spendscope-user', JSON.stringify(tempUser));
    set({ user: tempUser, token: tempToken });
    try {
      const res = await api<AuthResponseData>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('spendscope-token', res.token);
      localStorage.setItem('spendscope-user', JSON.stringify(res.user));
      set({ user: res.user, token: res.token });
      await get().loadData();
      toast.success("Account created successfully!");
    } catch (error: any) {
      localStorage.setItem('spendscope-token', prevToken || '');
      localStorage.setItem('spendscope-user', prevUser ? JSON.stringify(prevUser) : '');
      set({ user: prevUser, token: prevToken });
      console.error('[STORE] Register failed:', error.message);
      toast.error(error.message);
    }
  },
  logout: () => {
    localStorage.removeItem('spendscope-token');
    localStorage.removeItem('spendscope-user');
    set({ 
      user: null, 
      token: null, 
      scopes: [], 
      transactions: [], 
      bills: [],
      currentBalance: 0,
      currentSalary: 0,
      currentCurrency: 'USD'
    });
    toast.info("Logged out.");
  },
  setCurrency: async (currency: string) => {
    const prev = get().currentCurrency;
    set({ currentCurrency: currency });
    localStorage.setItem('spendscope-currency', currency);
    try {
      await api('/api/user-settings', { method: 'PUT', body: JSON.stringify({ currentCurrency: currency }) });
    } catch (e) {
      set({ currentCurrency: prev });
      toast.error("Failed to sync currency.");
    }
  },
  setCurrentBalance: async (balance: number) => {
    const prev = get().currentBalance;
    set({ currentBalance: balance });
    localStorage.setItem('spendscope-balance', balance.toString());
    try {
      await api('/api/user-settings', { method: 'PUT', body: JSON.stringify({ currentBalance: balance }) });
    } catch (e) {
      set({ currentBalance: prev });
      toast.error("Failed to sync balance.");
    }
  },
  setCurrentSalary: async (salary: number) => {
    const prev = get().currentSalary;
    set({ currentSalary: salary });
    localStorage.setItem('spendscope-salary', salary.toString());
    try {
      await api('/api/user-settings', { method: 'PUT', body: JSON.stringify({ currentSalary: salary }) });
    } catch (e) {
      set({ currentSalary: prev });
      toast.error("Failed to sync salary.");
    }
  },
  addScope: async (scope) => {
    const newScope = await api<Scope>('/api/scopes', { method: 'POST', body: JSON.stringify(scope) });
    set(produce((state: BudgetState) => { state.scopes.push({ ...newScope, icon: getIcon(newScope.icon) }); }));
  },
  updateScope: async (id, dailyLimit) => {
    const originalScopes = get().scopes;
    const syncedData = { dailyLimit, monthlyLimit: dailyLimit * 30 };
    set(produce((state: BudgetState) => { const i = state.scopes.findIndex(s => s.id === id); if (i !== -1) { state.scopes[i].dailyLimit = dailyLimit; state.scopes[i].monthlyLimit = dailyLimit * 30; } }));
    try { await api(`/api/scopes/${id}`, { method: 'PUT', body: JSON.stringify(syncedData) }); } catch (e) { set({ scopes: originalScopes }); }
  },
  updateScopeFull: async (id, data) => {
    const originalScopes = get().scopes;
    set(produce((state: BudgetState) => { const i = state.scopes.findIndex(s => s.id === id); if (i !== -1) { state.scopes[i] = { ...state.scopes[i], ...data, icon: data.icon ? getIcon(data.icon as any) : state.scopes[i].icon }; } }));
    try { await api(`/api/scopes/${id}`, { method: 'PUT', body: JSON.stringify(data) }); } catch (e) { set({ scopes: originalScopes }); }
  },
  deleteScope: async (id) => {
    const oS = get().scopes;
    set(produce((state: BudgetState) => { state.scopes = state.scopes.filter(s => s.id !== id); }));
    try { await api(`/api/scopes/${id}`, { method: 'DELETE' }); } catch (e) { set({ scopes: oS }); }
  },
  addTransaction: async (transaction) => {
    const res = await api<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(transaction) });
    set(produce((state: BudgetState) => { state.transactions.push(res); }));
  },
  updateTransaction: async (id, changes) => {
    const oT = get().transactions;
    set(produce((state: BudgetState) => { const i = state.transactions.findIndex(t => t.id === id); if (i !== -1) state.transactions[i] = { ...state.transactions[i], ...changes }; }));
    try { await api(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(changes) }); } catch (e) { set({ transactions: oT }); }
  },
  deleteTransaction: async (id) => {
    const oT = get().transactions;
    set(produce((state: BudgetState) => { state.transactions = state.transactions.filter(t => t.id !== id); }));
    try { await api(`/api/transactions/${id}`, { method: 'DELETE' }); } catch (e) { set({ transactions: oT }); }
  },
  addBill: async (bill) => {
    const res = await api<Bill>('/api/bills', { method: 'POST', body: JSON.stringify(bill) });
    set(produce((state: BudgetState) => { state.bills.push(res); }));
  },
  updateBill: async (id, changes) => {
    const oB = get().bills;
    set(produce((state: BudgetState) => { const i = state.bills.findIndex(b => b.id === id); if (i !== -1) state.bills[i] = { ...state.bills[i], ...changes }; }));
    try { await api(`/api/bills/${id}`, { method: 'PUT', body: JSON.stringify(changes) }); } catch (e) { set({ bills: oB }); }
  },
  deleteBill: async (id) => {
    const oB = get().bills;
    set(produce((state: BudgetState) => { state.bills = state.bills.filter(b => b.id !== id); }));
    try { await api(`/api/bills/${id}`, { method: 'DELETE' }); } catch (e) { set({ bills: oB }); }
  },
}));
export const useIsLoading = () => useBudgetStore(state => state.loading);
export const useAuthToken = () => useBudgetStore(state => state.token);
export const useAuthUser = () => useBudgetStore(state => state.user);
export const useScopes = () => useBudgetStore(state => state.scopes);
export const useTransactions = () => useBudgetStore(state => state.transactions);
export const useBills = () => useBudgetStore(state => state.bills);
export const useCurrentBalance = () => useBudgetStore(state => state.currentBalance);
export const useCurrentSalary = () => useBudgetStore(state => state.currentSalary);
export const useTransactionsForScope = (scopeId: string) => {
  const transactions = useTransactions();
  return useMemo(() => transactions.filter(t => t.scopeId === scopeId), [transactions, scopeId]);
};
export const useSpentToday = (scopeId: string) => {
  const transactions = useTransactions();
  return useMemo(() => transactions.filter(t => t.scopeId === scopeId && isToday(parseISO(t.date))).reduce((s, t) => s + t.amount, 0), [transactions, scopeId]);
};
export const useSpentThisMonth = (scopeId?: string) => {
  const transactions = useTransactions();
  return useMemo(() => {
    const filtered = transactions.filter(t => isSameMonth(parseISO(t.date), new Date()));
    if (scopeId) return filtered.filter(t => t.scopeId === scopeId).reduce((s, t) => s + t.amount, 0);
    return filtered.reduce((s, t) => s + t.amount, 0);
  }, [transactions, scopeId]);
};
export const useMonthlyRemaining = (scopeId: string) => {
  const scopes = useScopes();
  const spentThisMonth = useSpentThisMonth(scopeId);
  return useMemo(() => {
    const scope = scopes.find(s => s.id === scopeId);
    if (!scope) return 0;
    const limit = scope.monthlyLimit ?? (scope.dailyLimit * 30);
    return limit - spentThisMonth;
  }, [scopes, spentThisMonth, scopeId]);
};
export const useMonthlyBudget = () => {
  const scopes = useScopes();
  const daysInMonth = endOfMonth(new Date()).getDate();
  return useMemo(() => scopes.reduce((s, c) => s + (c.monthlyLimit ?? c.dailyLimit * daysInMonth), 0), [scopes, daysInMonth]);
};
export const useDailyTotals = () => {
  const transactions = useTransactions();
  return useMemo(() => {
    const now = new Date();
    const monthTotals = new Map<string, number>();
    transactions.filter(t => isSameMonth(parseISO(t.date), now)).forEach(t => {
        const dayKey = format(parseISO(t.date), 'yyyy-MM-dd');
        monthTotals.set(dayKey, (monthTotals.get(dayKey) || 0) + t.amount);
    });
    return monthTotals;
  }, [transactions]);
};