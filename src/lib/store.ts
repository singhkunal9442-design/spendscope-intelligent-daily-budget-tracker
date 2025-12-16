import { create } from 'zustand';
import { produce } from 'immer';
import { isToday, parseISO, isSameMonth } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Scope, Transaction } from '@shared/types';
import * as lucideIcons from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
export type ScopeWithIcon = Omit<Scope, 'icon'> & {
  icon: lucideIcons.LucideIcon;
};
interface BudgetState {
  scopes: ScopeWithIcon[];
  transactions: Transaction[];
  loading: boolean;
  initialized: boolean;
  loadData: () => Promise<void>;
  addScope: (scope: Omit<Scope, 'id'>) => Promise<void>;
  updateScope: (id: string, dailyLimit: number) => Promise<void>;
  updateScopeFull: (id: string, data: Partial<Omit<Scope, 'id'>>) => Promise<void>;
  deleteScope: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
}
const getIcon = (iconName: string): lucideIcons.LucideIcon => {
  const Icon = (lucideIcons as any)[iconName];
  return Icon || lucideIcons.Circle;
};
export const useBudgetStore = create<BudgetState>((set, get) => ({
  scopes: [],
  transactions: [],
  loading: false,
  initialized: false,
  loadData: async () => {
    if (get().initialized || get().loading) return;
    set({ loading: true });
    try {
      const [scopes, transactions] = await Promise.all([
        api<Scope[]>('/api/scopes'),
        api<Transaction[]>('/api/transactions'),
      ]);
      const scopesWithIcons = scopes.map(s => ({ ...s, icon: getIcon(s.icon) }));
      set({ scopes: scopesWithIcons, transactions, initialized: true });
    } catch (error) {
      console.error("Failed to load data", error);
      toast.error("Could not load your budget data.");
    } finally {
      set({ loading: false });
    }
  },
  addScope: async (scope) => {
    try {
      const newScope = await api<Scope>('/api/scopes', {
        method: 'POST',
        body: JSON.stringify(scope),
      });
      set(produce((state: BudgetState) => {
        state.scopes.push({ ...newScope, icon: getIcon(newScope.icon) });
      }));
      toast.success(`Category "${newScope.name}" added.`);
    } catch (error) {
      console.error("Failed to add scope", error);
      toast.error("Failed to add new category.");
    }
  },
  updateScope: async (id: string, dailyLimit: number) => {
    const originalScopes = get().scopes;
    // Optimistic update
    set(produce((state: BudgetState) => {
      const index = state.scopes.findIndex((s) => s.id === id);
      if (index !== -1) {
        state.scopes[index].dailyLimit = dailyLimit;
      }
    }));
    try {
      await api<Scope>(`/api/scopes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ dailyLimit }),
      });
    } catch (error) {
      console.error("Failed to update scope", error);
      toast.error("Failed to save changes. Reverting.");
      set({ scopes: originalScopes }); // Revert on failure
    }
  },
  updateScopeFull: async (id: string, data: Partial<Omit<Scope, 'id'>>) => {
    const originalScopes = get().scopes;
    // Optimistic update
    set(produce((state: BudgetState) => {
      const index = state.scopes.findIndex((s) => s.id === id);
      if (index !== -1) {
        const updatedScope = { ...state.scopes[index], ...data };
        if (data.icon) {
          state.scopes[index] = { ...updatedScope, icon: getIcon(data.icon) };
        } else {
          state.scopes[index] = updatedScope;
        }
      }
    }));
    try {
      await api<Scope>(`/api/scopes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      toast.success(`Category "${data.name || 'Category'}" updated.`);
    } catch (error) {
      console.error("Failed to update scope", error);
      toast.error("Failed to save changes. Reverting.");
      set({ scopes: originalScopes }); // Revert on failure
    }
  },
  deleteScope: async (id: string) => {
    const originalScopes = get().scopes;
    const scopeToDelete = originalScopes.find(s => s.id === id);
    if (!scopeToDelete) return;
    // Optimistic update
    set(produce((state: BudgetState) => {
      state.scopes = state.scopes.filter(s => s.id !== id);
    }));
    try {
      await api(`/api/scopes/${id}`, { method: 'DELETE' });
      toast.success(`Category "${scopeToDelete.name}" deleted.`);
      // Transactions are preserved as orphans, UI handles this via fallbacks.
    } catch (error) {
      console.error("Failed to delete scope", error);
      toast.error("Failed to delete category. Reverting.");
      set({ scopes: originalScopes }); // Revert on failure
    }
  },
  addTransaction: async (transaction) => {
    const tempId = uuidv4();
    const newTransaction: Transaction = {
      ...transaction,
      id: tempId,
      date: new Date().toISOString(),
    };
    // Optimistic update
    set(produce((state: BudgetState) => {
      state.transactions.push(newTransaction);
    }));
    try {
      const savedTransaction = await api<Transaction>('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction),
      });
      // Replace temporary transaction with server-confirmed one
      set(produce((state: BudgetState) => {
        const index = state.transactions.findIndex((t) => t.id === tempId);
        if (index !== -1) {
          state.transactions[index] = savedTransaction;
        }
      }));
    } catch (error) {
      console.error("Failed to add transaction", error);
      toast.error("Transaction failed to save. Removing.");
      // Revert on failure
      set(produce((state: BudgetState) => {
        state.transactions = state.transactions.filter((t) => t.id !== tempId);
      }));
    }
  },
}));
// Selectors
export const useSpentToday = (scopeId: string) => {
  const transactions = useBudgetStore(state => state.transactions);
  return transactions
    .filter(
      (t) => t.scopeId === scopeId && isToday(parseISO(t.date))
    )
    .reduce((sum, t) => sum + t.amount, 0);
};
export const useSpentThisMonth = () => {
  const transactions = useBudgetStore(state => state.transactions);
  return transactions
    .filter(t => isSameMonth(parseISO(t.date), new Date()))
    .reduce((sum, t) => sum + t.amount, 0);
};
export const useMonthlyBudget = () => {
  const scopes = useBudgetStore(state => state.scopes);
  return scopes.reduce((sum, s) => sum + s.dailyLimit * 30, 0);
};
export const useMonthlyRemaining = () => {
  const budget = useMonthlyBudget();
  const spent = useSpentThisMonth();
  return budget - spent;
};