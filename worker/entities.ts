import { IndexedEntity, Env } from "./core-utils";
import type { Scope, Transaction, Bill } from "@shared/types";
// SEED DATA
const SEED_SCOPES: Scope[] = [
  { id: '1', name: 'Coffee', dailyLimit: 5, monthlyLimit: 150, icon: 'Coffee', color: 'emerald' },
  { id: '2', name: 'Groceries', dailyLimit: 30, monthlyLimit: 900, icon: 'ShoppingCart', color: 'sky' },
  { id: '3', name: 'Lunch', dailyLimit: 20, monthlyLimit: 600, icon: 'Utensils', color: 'amber' },
  { id: '4', name: 'Transport', dailyLimit: 15, monthlyLimit: 450, icon: 'Car', color: 'rose' },
  { id: '5', name: 'Rent', dailyLimit: 50, monthlyLimit: 1500, icon: 'Home', color: 'indigo' },
];
const SEED_BILLS: Bill[] = [
    { id: 'b1', name: 'Rent', amount: 1500, paid: false },
    { id: 'b2', name: 'Utilities', amount: 200, paid: true },
    { id: 'b3', name: 'Internet', amount: 60, paid: false },
];
const SEED_TRANSACTIONS: Transaction[] = [
    { id: 't1', scopeId: '1', amount: 4.50, description: 'Morning Latte', date: new Date().toISOString() },
    { id: 't2', scopeId: '3', amount: 15.75, description: 'Team Lunch', date: new Date().toISOString() },
];
// SCOPE ENTITY: one DO instance per scope/category
export class ScopeEntity extends IndexedEntity<Scope> {
  static readonly entityName = "scope";
  static readonly indexName = "scopes";
  static readonly initialState: Scope = { id: "", name: "", dailyLimit: 0, monthlyLimit: 0, icon: "Circle", color: "gray" };
  static seedData = SEED_SCOPES;
}
// TRANSACTION ENTITY: one DO instance per transaction
export class TransactionEntity extends IndexedEntity<Transaction> {
  static readonly entityName = "transaction";
  static readonly indexName = "transactions";
  static readonly initialState: Transaction = { id: "", scopeId: "", amount: 0, date: "" };
  static seedData = SEED_TRANSACTIONS;
}
// BILL ENTITY: one DO instance per fixed bill
export class BillEntity extends IndexedEntity<Bill> {
  static readonly entityName = "bill";
  static readonly indexName = "bills";
  static readonly initialState: Bill = { id: "", name: "", amount: 0, paid: false };
  static seedData = SEED_BILLS;
}