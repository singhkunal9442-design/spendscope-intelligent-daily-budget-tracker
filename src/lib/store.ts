import { create } from 'zustand';
import { produce } from 'immer';
import { isToday, parseISO, isSameMonth, startOfMonth, endOfMonth, format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Scope, Transaction, Bill, AuthCredentials, LoginResponse } from '@shared/types';
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
  scopes: ScopeWithIcon[];
  transactions: Transaction[];
  bills: Bill[];
  currentBalance: number;
  currentSalary: number;
  loading: boolean;
  initialized: boolean;
  currentCurrency: string;
  userId?: string;
  token?: string;
  initAuth: () => void;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: AuthCredentials) => Promise<void>;
  logout: () => void;
  loadData: () => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  setCurrentBalance: (balance: number) => void;
  setCurrentSalary: (salary: number) => void;
  addScope: (scope: Omit<Scope, 'id' | 'userId'>) => Promise<void>;
  updateScope: (id: string, dailyLimit: number) => Promise<void>;
  updateScopeFull: (id: string, data: Partial<Omit<Scope, 'id' | 'userId'>>) => Promise<void>;
  deleteScope: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'userId'>) => Promise<void>;
  updateTransaction: (id: string, changes: Partial<Omit<Transaction, 'id' | 'userId'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBill: (bill: Omit<Bill, 'id' | 'paid' | 'userId'>) => Promise<void>;
  updateBill: (id: string, changes: Partial<Omit<Bill, 'id' | 'userId'>>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
}
const getIcon = (iconName: string): lucideIcons.LucideIcon => {
  const Icon = (lucideIcons as any)[iconName];
  return Icon || lucideIcons.Circle;
};
export const useBudgetStore = create<BudgetState>((set, get) => ({
  scopes: [],
  transactions: [],
  bills: [],
  currentBalance: 0,
  currentSalary: 0,
  loading: false,
  initialized: false,
  currentCurrency: 'USD',
  userId: undefined,
  token: undefined,
  initAuth: () => {
    const token = localStorage.getItem('spendscope-token');
    const userId = localStorage.getItem('spendscope-userid');
    if (token && userId) {
      set({ token, userId });
    }
    set({ initialized: true });
  },
  login: async (credentials) => {
    const response = await api<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    localStorage.setItem('spendscope-token', response.token);
    localStorage.setItem('spendscope-userid', response.userId);
    set({ userId: response.userId, token: response.token });
    toast.success('Login successful!');
    get().loadData();
  },
  register: async (credentials) => {
    await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    await get().login(credentials);
  },
  logout: () => {
    localStorage.removeItem('spendscope-token');
    localStorage.removeItem('spendscope-userid');
    localStorage.removeItem('spendscope-onboarded');
    set({ userId: undefined, token: undefined, scopes: [], transactions: [], bills: [], initialized: false });
    toast.info("You have been logged out.");
  },
  loadData: async () => {
    const userId = get().userId;
    if (!userId || get().loading) return;
    set({ loading: true });
    const headers = { 'X-User-Id': userId };
    try {
      const [scopes, transactions, bills] = await Promise.all([
        api<Scope[]>('/api/scopes', { headers }),
        api<Transaction[]>('/api/transactions', { headers }),
        api<Bill[]>('/api/bills', { headers }),
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
        currentBalance: savedBalance ? parseFloat(savedBalance) : 0,
        currentSalary: savedSalary ? parseFloat(savedSalary) : 0,
      });
    } catch (error) {
      console.error("Failed to load data", error);
      toast.error("Could not load your budget data.");
    } finally {
      set({ loading: false });
    }
  },
  setCurrency: async (currency: string) => {
    if (!CURRENCY_PRESETS.includes(currency)) return;
    localStorage.setItem('spendscope-currency', currency);
    set({ currentCurrency: currency });
  },
  setCurrentBalance: (balance: number) => {
    localStorage.setItem('spendscope-balance', balance.toString());
    set({ currentBalance: balance });
    toast.success("Starting balance has been set.");
  },
  setCurrentSalary: (salary: number) => {
    localStorage.setItem('spendscope-salary', salary.toString());
    set({ currentSalary: salary });
    toast.success("Monthly salary has been updated.");
  },
  addScope: async (scope) => {
    const userId = get().userId;
    if (!userId) return;
    const headers = { 'X-User-Id': userId };
    try {
      const newScope = await api<Scope>('/api/scopes', { method: 'POST', headers, body: JSON.stringify(scope) });
      set(produce((state: BudgetState) => { state.scopes.push({ ...newScope, icon: getIcon(newScope.icon) }); }));
      toast.success(`Category "${newScope.name}" added.`);
    } catch (error) { console.error("Failed to add scope", error); toast.error("Failed to add new category."); }
  },
  updateScope: async (id, dailyLimit) => {
    const userId = get().userId;
    if (!userId) return;
    const headers = { 'X-User-Id': userId };
    const originalScopes = get().scopes;
    set(produce((state: BudgetState) => { const i = state.scopes.findIndex(s => s.id === id); if (i !== -1) state.scopes[i].dailyLimit = dailyLimit; }));
    try { await api<Scope>(`/api/scopes/${id}`, { method: 'PUT', headers, body: JSON.stringify({ dailyLimit }) }); } catch (error) { console.error("Failed to update scope", error); toast.error("Failed to save. Reverting."); set({ scopes: originalScopes }); }
  },
  updateScopeFull: async (id, data) => {
    const userId = get().userId;
    if (!userId) return;
    const headers = { 'X-User-Id': userId };
    const originalScopes = get().scopes;
    set(produce((state: BudgetState) => { const i = state.scopes.findIndex(s => s.id === id); if (i !== -1) { const u = { ...state.scopes[i], ...data }; const nI = data.icon ? getIcon(data.icon) : state.scopes[i].icon; state.scopes[i] = { ...u, icon: nI }; } }));
    try { await api<Scope>(`/api/scopes/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) }); toast.success(`Category "${data.name || 'Category'}" updated.`); } catch (error) { console.error("Failed to update scope", error); toast.error("Failed to save. Reverting."); set({ scopes: originalScopes }); }
  },
  deleteScope: async (id) => {
    const userId = get().userId;
    if (!userId) return;
    const headers = { 'X-User-Id': userId };
    const oS = get().scopes; const sTD = oS.find(s => s.id === id); if (!sTD) return;
    set(produce((state: BudgetState) => { state.scopes = state.scopes.filter(s => s.id !== id); }));
    try { await api(`/api/scopes/${id}`, { method: 'DELETE', headers }); toast.success(`Category "${sTD.name}" deleted.`); } catch (error) { console.error("Failed to delete scope", error); toast.error("Failed to delete. Reverting."); set({ scopes: oS }); }
  },
  addTransaction: async (transaction) => {
    const userId = get().userId;
    if (!userId) return;
    const headers = { 'X-User-Id': userId };
    const tempId = uuidv4(); const newTx: Transaction = { ...transaction, id: tempId, userId, date: new Date().toISOString() };
    set(produce((state: BudgetState) => { state.transactions.push(newTx); }));
    try { const savedTx = await api<Transaction>('/api/transactions', { method: 'POST', headers, body: JSON.stringify(transaction) }); set(produce((state: BudgetState) => { const i = state.transactions.findIndex(t => t.id === tempId); if (i !== -1) state.transactions[i] = savedTx; })); } catch (error) { console.error("Failed to add transaction", error); toast.error("Tx failed to save. Removing."); set(produce((state: BudgetState) => { state.transactions = state.transactions.filter(t => t.id !== tempId); })); }
  },
  updateTransaction: async (id, changes) => {
    const userId = get().userId;
    if (!userId) return;
    const headers = { 'X-User-Id': userId };
    const oT = get().transactions;
    set(produce((state: BudgetState) => { const i = state.transactions.findIndex(t => t.id === id); if (i !== -1) state.transactions[i] = { ...state.transactions[i], ...changes }; }));
    try { await api(`/api/transactions/${id}`, { method: 'PUT', headers, body: JSON.stringify(changes) }); } catch (error) { console.error("Failed to update transaction", error); toast.error("Failed to update. Reverting."); set({ transactions: oT }); }
  },
  deleteTransaction: async (id) => {
    const userId = get().userId;
    if (!userId) return;
    const headers = { 'X-User-Id': userId };
    const oT = get().transactions; const tTD = oT.find(t => t.id === id); if (!tTD) return;
    set(produce((state: BudgetState) => { state.transactions = state.transactions.filter(t => t.id !== id); }));
    try { await api(`/api/transactions/${id}`, { method: 'DELETE', headers }); toast.success(`Deleted transaction of ${formatCurrencyAmount(get().currentCurrency, tTD.amount)}.`); } catch (error) { console.error("Failed to delete transaction", error); toast.error("Failed to delete. Reverting."); set({ transactions: oT }); }
  },
  addBill: async (bill) => {
    const userId = get().userId;
    if (!userId) return;
    const headers = { 'X-User-Id': userId };
    const tempId = uuidv4(); const newBill: Bill = { ...bill, id: tempId, userId, paid: false };
    set(produce((state: BudgetState) => { state.bills.push(newBill); }));
    try { const savedBill = await api<Bill>('/api/bills', { method: 'POST', headers, body: JSON.stringify(bill) }); set(produce((state: BudgetState) => { const i = state.bills.findIndex(b => b.id === tempId); if (i !== -1) state.bills[i] = savedBill; })); toast.success(`Bill "${savedBill.name}" added.`); } catch (error) { console.error("Failed to add bill", error); toast.error("Failed to add bill. Removing."); set(produce((state: BudgetState) => { state.bills = state.bills.filter(b => b.id !== tempId); })); }
  },
  updateBill: async (id, changes) => {
    const userId = get().userId;
    if (!userId) return;
    const headers = { 'X-User-Id': userId };
    const oB = get().bills;
    set(produce((state: BudgetState) => { const i = state.bills.findIndex(b => b.id === id); if (i !== -1) state.bills[i] = { ...state.bills[i], ...changes }; }));
    try { await api(`/api/bills/${id}`, { method: 'PUT', headers, body: JSON.stringify(changes) }); } catch (error) { console.error("Failed to update bill", error); toast.error("Failed to update bill. Reverting."); set({ bills: oB }); }
  },
  deleteBill: async (id) => {
    const userId = get().userId;
    if (!userId) return;
    const headers = { 'X-User-Id': userId };
    const oB = get().bills; const bTD = oB.find(b => b.id === id); if (!bTD) return;
    set(produce((state: BudgetState) => { state.bills = state.bills.filter(b => b.id !== id); }));
    try { await api(`/api/bills/${id}`, { method: 'DELETE', headers }); toast.success(`Bill "${bTD.name}" deleted.`); } catch (error) { console.error("Failed to delete bill", error); toast.error("Failed to delete bill. Reverting."); set({ bills: oB }); }
  },
}));
// Selectors
export const useIsLoading = () => useBudgetStore(state => state.loading && !state.initialized);
export const useUserId = () => useBudgetStore(s => s.userId);
export const useSpentToday = (scopeId: string) => {
  const transactions = useBudgetStore(state => state.transactions);
  return useMemo(() => transactions.filter(t => t.scopeId === scopeId && isToday(parseISO(t.date))).reduce((s, t) => s + t.amount, 0), [transactions, scopeId]);
};
export const useSpentThisMonth = (scopeId?: string) => {
  const transactions = useBudgetStore(state => state.transactions);
  const filtered = useMemo(() => transactions.filter(t => isSameMonth(parseISO(t.date), new Date())), [transactions]);
  return useMemo(() => { if (scopeId) { return filtered.filter(t => t.scopeId === scopeId).reduce((s, t) => s + t.amount, 0); } return filtered.reduce((s, t) => s + t.amount, 0); }, [filtered, scopeId]);
};
export const useDaysInMonth = () => {
    const now = new Date();
    return endOfMonth(startOfMonth(now)).getDate();
};
export const useMonthlyBudget = () => {
  const scopes = useBudgetStore(state => state.scopes);
  const daysInMonth = useDaysInMonth();
  return useMemo(() => scopes.reduce((s, c) => s + (c.monthlyLimit ?? c.dailyLimit * daysInMonth), 0), [scopes, daysInMonth]);
};
export const useTransactionsForScope = (scopeId: string) => {
  const transactions = useBudgetStore(state => state.transactions);
  return useMemo(() => transactions.filter(t => t.scopeId === scopeId), [transactions, scopeId]);
};
export const useBills = () => useBudgetStore(s => s.bills);
export const useTotalBillsDue = () => {
  const bills = useBudgetStore(s => s.bills);
  return useMemo(() => bills.filter(b => !b.paid).reduce((sum, b) => sum + b.amount, 0), [bills]);
};
export const useTotalBillsPaid = () => {
  const bills = useBudgetStore(s => s.bills);
  return useMemo(() => bills.filter(b => b.paid).reduce((sum, b) => sum + b.amount, 0), [bills]);
};
export const useCurrentBalance = () => useBudgetStore(s => s.currentBalance);
export const useCurrentSalary = () => useBudgetStore(s => s.currentSalary);
export const useDailyTotals = () => {
  const transactions = useBudgetStore(state => state.transactions);
  return useMemo(() => {
    const now = new Date();
    const monthTotals = new Map<string, number>();
    transactions
      .filter(t => isSameMonth(parseISO(t.date), now))
      .forEach(t => {
        const dayKey = format(parseISO(t.date), 'yyyy-MM-dd');
        monthTotals.set(dayKey, (monthTotals.get(dayKey) || 0) + t.amount);
      });
    return monthTotals;
  }, [transactions]);
};