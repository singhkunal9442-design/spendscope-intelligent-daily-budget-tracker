import { IndexedEntity } from "./core-utils";
import type { Scope, Transaction } from "@shared/types";
// SEED DATA
const SEED_SCOPES: Scope[] = [
  { id: '1', name: 'Coffee', dailyLimit: 5, monthlyLimit: 150, icon: 'Coffee', color: 'emerald' },
  { id: '2', name: 'Groceries', dailyLimit: 30, monthlyLimit: 900, icon: 'ShoppingCart', color: 'sky' },
  { id: '3', name: 'Lunch', dailyLimit: 20, monthlyLimit: 600, icon: 'Utensils', color: 'amber' },
  { id: '4', name: 'Transport', dailyLimit: 15, monthlyLimit: 450, icon: 'Car', color: 'rose' },
  { id: '5', name: 'Rent', dailyLimit: 50, monthlyLimit: 1500, icon: 'Home', color: 'indigo' },
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
}