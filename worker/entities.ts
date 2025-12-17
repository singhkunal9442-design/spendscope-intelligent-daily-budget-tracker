import { IndexedEntity, Env, Index } from "./core-utils";
import type { Scope, Transaction, Bill, User } from "@shared/types";
// Password Hashing Helper
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  // Convert ArrayBuffer to Base64 string for storage
  return btoa(String.fromCharCode(...new Uint8Array(data)));
}
// SEED DATA
const DEMO_USER_ID = 'demo-user';
const SEED_SCOPES: Scope[] = [
  { id: '1', userId: DEMO_USER_ID, name: 'Coffee', dailyLimit: 5, monthlyLimit: 150, icon: 'Coffee', color: 'emerald' },
  { id: '2', userId: DEMO_USER_ID, name: 'Groceries', dailyLimit: 30, monthlyLimit: 900, icon: 'ShoppingCart', color: 'sky' },
  { id: '3', userId: DEMO_USER_ID, name: 'Lunch', dailyLimit: 20, monthlyLimit: 600, icon: 'Utensils', color: 'amber' },
  { id: '4', userId: DEMO_USER_ID, name: 'Transport', dailyLimit: 15, monthlyLimit: 450, icon: 'Car', color: 'rose' },
  { id: '5', userId: DEMO_USER_ID, name: 'Rent', dailyLimit: 50, monthlyLimit: 1500, icon: 'Home', color: 'indigo' },
];
const SEED_BILLS: Bill[] = [
    { id: 'b1', userId: DEMO_USER_ID, name: 'Rent', amount: 1500, paid: false },
    { id: 'b2', userId: DEMO_USER_ID, name: 'Utilities', amount: 200, paid: true },
    { id: 'b3', userId: DEMO_USER_ID, name: 'Internet', amount: 60, paid: false },
];
const SEED_TRANSACTIONS: Transaction[] = [
    { id: 't1', userId: DEMO_USER_ID, scopeId: '1', amount: 4.50, description: 'Morning Latte', date: new Date().toISOString() },
    { id: 't2', userId: DEMO_USER_ID, scopeId: '3', amount: 15.75, description: 'Team Lunch', date: new Date().toISOString() },
];
// USER ENTITY: For authentication
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", email: "", passwordHash: "" };
  static async ensureSeed(env: Env): Promise<void> {
    // This custom seed method handles async password hashing.
    const idx = new Index<string>(env, this.indexName);
    const ids = await idx.list();
    if (ids.length === 0) {
      const demoPassHash = await hashPassword('demo');
      const demoUser: User = { id: DEMO_USER_ID, email: 'demo@demo.com', passwordHash: demoPassHash };
      await this.create(env, demoUser);
    }
  }
}
// SCOPE ENTITY: one DO instance per scope/category
export class ScopeEntity extends IndexedEntity<Scope> {
  static readonly entityName = "scope";
  static readonly indexName = "scopes";
  static readonly initialState: Scope = { id: "", userId: "", name: "", dailyLimit: 0, monthlyLimit: 0, icon: "Circle", color: "gray" };
  static seedData = SEED_SCOPES;
}
// TRANSACTION ENTITY: one DO instance per transaction
export class TransactionEntity extends IndexedEntity<Transaction> {
  static readonly entityName = "transaction";
  static readonly indexName = "transactions";
  static readonly initialState: Transaction = { id: "", userId: "", scopeId: "", amount: 0, date: "" };
  static seedData = SEED_TRANSACTIONS;
}
// BILL ENTITY: one DO instance per fixed bill
export class BillEntity extends IndexedEntity<Bill> {
  static readonly entityName = "bill";
  static readonly indexName = "bills";
  static readonly initialState: Bill = { id: "", userId: "", name: "", amount: 0, paid: false };
  static seedData = SEED_BILLS;
}