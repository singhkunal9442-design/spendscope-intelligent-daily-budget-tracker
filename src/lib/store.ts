import { create } from 'zustand';
import { produce } from 'immer';
import { isToday, parseISO, isSameMonth, startOfMonth, endOfMonth, format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Scope, Transaction, Bill } from '@shared/types';
import * as lucideIcons from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { useMemo, useCallback } from 'react';
export const CURRENCY_PRESETS = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'AED'];
export const formatCurrencyAmount = (currency: string, amount: number, locale = navigator.language || 'en-US') => {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch (e) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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
const savedToken = localStorage.getItem('spendscope-token');
const savedUser = localStorage.getItem('spendscope-user');
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
      const [scopes, transactions, bills] = await Promise.all([
        api<Scope[]>('/api/scopes'),
        api<Transaction[]>('/api/transactions'),
        api<Bill[]>('/api/bills'),
      ]);
      const scopesWithIcons = scopes.map(s => ({ ...s, icon: getIcon(s.icon) }));
      const savedCurrency = localStorage.getItem('spendscope-currency');
      const savedBalance = localStorage.getItem('spendscope-balance');
      const savedSalary = localStorage.getItem('spendscope-salary');
      set({
        scopes: scopesWithIcons,
        transactions,
        bills,
        currentCurrency: savedCurrency && CURRENCY_PRESETS.includes(savedCurrency) ? savedCurrency : 'USD',
        currentBalance: savedBalance ? parseFloat(savedBalance) : 5000,
        currentSalary: savedSalary ? parseFloat(savedSalary) : 3000,
      });
    } catch (error) {
      toast.error("Could not load your budget data.");
    } finally {
      set({ loading: false });
    }
  },
  login: async (email, password) => {
    const res = await api<any>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('spendscope-token', res.token);
    localStorage.setItem('spendscope-user', JSON.stringify(res.user));
    set({ user: res.user, token: res.token });
    toast.success("Welcome back!");
  },
  register: async (email, password) => {
    const res = await api<any>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('spendscope-token', res.token);
    localStorage.setItem('spendscope-user', JSON.stringify(res.user));
    set({ user: res.user, token: res.token });
    toast.success("Account created successfully!");
  },
  logout: () => {
    localStorage.removeItem('spendscope-token');
    localStorage.removeItem('spendscope-user');
    set({ user: null, token: null, scopes: [], transactions: [], bills: [] });
    toast.info("Logged out.");
  },
  setCurrency: async (currency: string) => {
    localStorage.setItem('spendscope-currency', currency);
    set({ currentCurrency: currency });
  },
  setCurrentBalance: (balance: number) => {
    localStorage.setItem('spendscope-balance', balance.toString());
    set({ currentBalance: balance });
  },
  setCurrentSalary: (salary: number) => {
    localStorage.setItem('spendscope-salary', salary.toString());
    set({ currentSalary: salary });
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
// Selectors
export const useIsLoading = () => useBudgetStore(state => state.loading);
export const useAuthToken = () => useBudgetStore(state => state.token);
export const useAuthUser = () => useBudgetStore(state => state.user);
export const useSpentToday = (scopeId: string) => {
  const transactions = useBudgetStore(state => state.transactions);
  return useMemo(() => transactions.filter(t => t.scopeId === scopeId && isToday(parseISO(t.date))).reduce((s, t) => s + t.amount, 0), [transactions, scopeId]);
};
export const useSpentThisMonth = (scopeId?: string) => {
  const transactions = useBudgetStore(state => state.transactions);
  return useMemo(() => {
    const filtered = transactions.filter(t => isSameMonth(parseISO(t.date), new Date()));
    if (scopeId) return filtered.filter(t => t.scopeId === scopeId).reduce((s, t) => s + t.amount, 0);
    return filtered.reduce((s, t) => s + t.amount, 0);
  }, [transactions, scopeId]);
};
export const useDaysInMonth = () => endOfMonth(new Date()).getDate();
export const useMonthlyBudget = () => {
  const scopes = useBudgetStore(state => state.scopes);
  const daysInMonth = useDaysInMonth();
  return useMemo(() => scopes.reduce((s, c) => s + (c.monthlyLimit ?? c.dailyLimit * daysInMonth), 0), [scopes, daysInMonth]);
};
export const useBills = () => useBudgetStore(s => s.bills);
export const useCurrentBalance = () => useBudgetStore(s => s.currentBalance);
export const useCurrentSalary = () => useBudgetStore(s => s.currentSalary);
export const useDailyTotals = () => {
  const transactions = useBudgetStore(state => state.transactions);
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