import { IndexedEntity, Entity } from "./core-utils";
import type { User, Scope, Transaction, Bill, UserSettings } from "../shared/types";
const DEMO_USER_ID = 'demo-user';
const SEED_USERS: User[] = [
  { id: DEMO_USER_ID, email: 'demo@demo.com', passwordHash: 'pbkdf2:demo' }
];
const SEED_SCOPES: Scope[] = [
  { id: 's1', name: 'Food & Dining', dailyLimit: 40, monthlyLimit: 1200, icon: 'Utensils', color: 'emerald' },
  { id: 's2', name: 'Transport', dailyLimit: 15, monthlyLimit: 450, icon: 'Car', color: 'sky' },
  { id: 's3', name: 'Entertainment', dailyLimit: 20, monthlyLimit: 600, icon: 'Gamepad2', color: 'violet' },
  { id: 's4', name: 'Shopping', dailyLimit: 30, monthlyLimit: 900, icon: 'ShoppingCart', color: 'amber' },
];
const SEED_BILLS: Bill[] = [
  { id: 'b1', name: 'Rent', amount: 1500, paid: true },
  { id: 'b2', name: 'Internet', amount: 60, paid: false },
  { id: 'b3', name: 'Netflix', amount: 15, paid: true },
];
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", email: "", passwordHash: "" };
  static seedData = SEED_USERS;
}
export class UserSettingsEntity extends Entity<UserSettings> {
  static readonly entityName = "user-settings";
  static readonly initialState: UserSettings = {
    currentBalance: 5000,
    currentSalary: 4000,
    currentCurrency: "USD",
    onboarded: true,
    theme: 'light'
  };
}
export class ScopeEntity extends IndexedEntity<Scope> {
  static readonly entityName = "scope";
  static readonly indexName = "scopes";
  static readonly initialState: Scope = { id: "", name: "", dailyLimit: 0, monthlyLimit: 0, icon: "Circle", color: "gray" };
  static seedData = SEED_SCOPES;
}
export class TransactionEntity extends IndexedEntity<Transaction> {
  static readonly entityName = "transaction";
  static readonly indexName = "transactions";
  static readonly initialState: Transaction = { id: "", scopeId: "", amount: 0, date: "" };
}
export class BillEntity extends IndexedEntity<Bill> {
  static readonly entityName = "bill";
  static readonly indexName = "bills";
  static readonly initialState: Bill = { id: "", name: "", amount: 0, paid: false };
  static seedData = SEED_BILLS;
}