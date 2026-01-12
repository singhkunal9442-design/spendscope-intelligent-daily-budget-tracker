import { User, Scope, Transaction, Bill, UserSettings } from '../shared/types';
import { MOCK_USERS } from '../shared/mock-data';
import { Entity, IndexedEntity } from './core-utils';

export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = 'user';
  static readonly indexName = 'users';
  static readonly initialState: User = {
    id: '',
    email: '',
    passwordHash: ''
  };
  static readonly seedData = MOCK_USERS;
}

export class ScopeEntity extends IndexedEntity<Scope> {
  static readonly entityName = 'scope';
  static readonly indexName = 'scopes';
  static readonly initialState: Scope = {
    id: '',
    userId: '',
    name: '',
    dailyLimit: 0,
    monthlyLimit: 0,
    icon: '',
    color: ''
  };
  static readonly seedData = [
    {
      id: 's1',
      userId: 'u1',
      name: 'Food',
      dailyLimit: 30,
      monthlyLimit: 900,
      icon: 'Utensils',
      color: 'emerald'
    },
    {
      id: 's2',
      userId: 'u1',
      name: 'Transport',
      dailyLimit: 15,
      monthlyLimit: 450,
      icon: 'Car',
      color: 'sky'
    }
  ] as const;
}

export class TransactionEntity extends IndexedEntity<Transaction> {
  static readonly entityName = 'transaction';
  static readonly indexName = 'transactions';
  static readonly initialState: Transaction = {
    id: '',
    userId: '',
    scopeId: '',
    amount: 0,
    date: ''
  };
  static readonly seedData: Transaction[] = [];
}

export class BillEntity extends IndexedEntity<Bill> {
  static readonly entityName = 'bill';
  static readonly indexName = 'bills';
  static readonly initialState: Bill = {
    id: '',
    userId: '',
    name: '',
    amount: 0,
    paid: false
  };
  static readonly seedData = [
    {
      id: 'b1',
      userId: 'u1',
      name: 'Rent',
      amount: 1200,
      paid: false
    },
    {
      id: 'b2',
      userId: 'u1',
      name: 'Spotify',
      amount: 15,
      paid: true
    }
  ] as const;
}

export class UserSettingsEntity extends Entity<UserSettings> {
  static readonly entityName = 'userSettings';
  static readonly initialState: UserSettings = {
    userId: '',
    currentBalance: 0,
    currentSalary: 0,
    currentCurrency: 'USD',
    onboarded: false,
    theme: 'light'
  };
}