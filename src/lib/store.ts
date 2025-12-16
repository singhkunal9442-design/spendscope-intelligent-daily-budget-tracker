import { create } from 'zustand';
import { produce } from 'immer';
import { isToday, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Scope, Transaction } from '@/types/domain';
import { Coffee, ShoppingCart, Utensils, Car, Home } from 'lucide-react';
interface BudgetState {
  scopes: Scope[];
  transactions: Transaction[];
  addScope: (scope: Omit<Scope, 'id'>) => void;
  updateScope: (scope: Scope) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}
const initialScopes: Scope[] = [
  { id: '1', name: 'Coffee', dailyLimit: 5, icon: Coffee, color: 'emerald' },
  { id: '2', name: 'Groceries', dailyLimit: 30, icon: ShoppingCart, color: 'sky' },
  { id: '3', name: 'Lunch', dailyLimit: 20, icon: Utensils, color: 'amber' },
  { id: '4', name: 'Transport', dailyLimit: 15, icon: Car, color: 'rose' },
  { id: '5', name: 'Rent', dailyLimit: 50, icon: Home, color: 'indigo' },
];
export const useBudgetStore = create<BudgetState>((set) => ({
  scopes: initialScopes,
  transactions: [],
  addScope: (scope) =>
    set(
      produce((state: BudgetState) => {
        state.scopes.push({ ...scope, id: uuidv4() });
      })
    ),
  updateScope: (updatedScope) =>
    set(
      produce((state: BudgetState) => {
        const index = state.scopes.findIndex((s) => s.id === updatedScope.id);
        if (index !== -1) {
          state.scopes[index] = updatedScope;
        }
      })
    ),
  addTransaction: (transaction) =>
    set(
      produce((state: BudgetState) => {
        state.transactions.push({
          ...transaction,
          id: uuidv4(),
          date: new Date().toISOString(),
        });
      })
    ),
}));
// Selectors
export const selectScopes = (state: BudgetState) => state.scopes;
export const selectTransactions = (state: BudgetState) => state.transactions;
export const useSpentToday = (scopeId: string) => {
  const transactions = useBudgetStore(selectTransactions);
  return transactions
    .filter(
      (t) =>
        t.scopeId === scopeId && isToday(parseISO(t.date))
    )
    .reduce((sum, t) => sum + t.amount, 0);
};