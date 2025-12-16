import { create } from 'zustand';
import { produce } from 'immer';
import { isToday, parseISO } from 'date-fns';
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
  updateScope: (scope: Scope) => Promise<void>;
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
    // Optimistic update can be added here
    try {
      const newScope = await api<Scope>('/api/scopes', {
        method: 'POST',
        body: JSON.stringify(scope),
      });
      set(produce((state: BudgetState) => {
        state.scopes.push({ ...newScope, icon: getIcon(newScope.icon) });
      }));
    } catch (error) {
      console.error("Failed to add scope", error);
      toast.error("Failed to add new category.");
    }
  },
  updateScope: async (updatedScope) => {
    const originalScopes = get().scopes;
    const scopeWithIconName = { ...updatedScope, icon: updatedScope.icon.displayName || 'Circle' };
    // Optimistic update
    set(produce((state: BudgetState) => {
      const index = state.scopes.findIndex((s) => s.id === updatedScope.id);
      if (index !== -1) {
        state.scopes[index] = { ...updatedScope, icon: getIcon(updatedScope.icon.displayName || 'Circle') };
      }
    }));
    try {
      await api<Scope>(`/api/scopes/${updatedScope.id}`, {
        method: 'PUT',
        body: JSON.stringify(scopeWithIconName),
      });
    } catch (error) {
      console.error("Failed to update scope", error);
      toast.error("Failed to save changes. Reverting.");
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