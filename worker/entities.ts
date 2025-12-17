import { IndexedEntity, Env } from "./core-utils";
import type { Scope, Transaction, Bill, User } from "@shared/types";
// Password Hashing Helper
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  // Convert ArrayBuffer to Base64 string for storage
  return btoa(String.fromCharCode(...new Uint8Array(data)));
}
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
// USER ENTITY: For authentication
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", email: "", passwordHash: "" };
  static async ensureSeed(env: Env): Promise<void> {
    const idx = new IndexedEntity.Index<string>(env, this.indexName);
    const ids = await idx.list();
    if (ids.length === 0) {
      const demoPassHash = await hashPassword('demo');
      const demoUser: User = { id: 'demo-user', email: 'demo@demo.com', passwordHash: demoPassHash };
      await this.create(env, demoUser);
    }
  }
}
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
// BILL ENTITY: one DO instance per fixed bill
export class BillEntity extends IndexedEntity<Bill> {
  static readonly entityName = "bill";
  static readonly indexName = "bills";
  static readonly initialState: Bill = { id: "", name: "", amount: 0, paid: false };
  static seedData = SEED_BILLS;
}