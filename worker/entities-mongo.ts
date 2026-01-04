import { getDb, Env } from './mongodb-client';
import {
  User, Scope, Transaction, Bill, UserSettings
} from '../shared/types';
import { MOCK_USERS } from '../shared/mock-data';
/**
 * MongoDB Data Access Layer.
 * Maps MongoDB's _id to the application's string 'id'.
 */
function mapId<T>(doc: any): T | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  // If the doc has an 'id' field already (which our frontend-generated ones do), 
  // we prioritize that. Otherwise, we convert _id to id.
  return { 
    id: doc.id || _id?.toString(), 
    ...rest 
  } as T;
}
function mapList<T>(docs: any[]): T[] {
  return (docs || []).map(d => mapId<T>(d) as T);
}
export const MongoUser = {
  async findById(env: Env, id: string) {
    const db = await getDb(env);
    const user = await db.collection('users').findOne({ id });
    return mapId<User>(user);
  },
  async findByEmail(env: Env, email: string) {
    const db = await getDb(env);
    const user = await db.collection('users').findOne({ email });
    return mapId<User>(user);
  },
  async list(env: Env) {
    const db = await getDb(env);
    const users = await db.collection('users').find().toArray();
    return mapList<User>(users);
  },
  async create(env: Env, user: User) {
    const db = await getDb(env);
    await db.collection('users').insertOne({ ...user });
    return user;
  }
};
export const MongoScope = {
  async list(env: Env, userId: string) {
    const db = await getDb(env);
    const scopes = await db.collection('scopes').find({
      $or: [{ userId }, { userId: { $exists: false } }]
    }).toArray();
    return mapList<Scope>(scopes);
  },
  async create(env: Env, scope: Scope) {
    const db = await getDb(env);
    await db.collection('scopes').insertOne({ ...scope });
    return scope;
  },
  async update(env: Env, id: string, userId: string, data: Partial<Scope>) {
    const db = await getDb(env);
    const res = await db.collection('scopes').findOneAndUpdate(
      { id, userId },
      { $set: data },
      { returnDocument: 'after' }
    );
    return mapId<Scope>(res);
  },
  async delete(env: Env, id: string, userId: string) {
    const db = await getDb(env);
    const res = await db.collection('scopes').deleteOne({ id, userId });
    return res.deletedCount > 0;
  }
};
export const MongoTransaction = {
  async list(env: Env, userId: string) {
    const db = await getDb(env);
    const txs = await db.collection('transactions').find({ userId }).toArray();
    return mapList<Transaction>(txs);
  },
  async create(env: Env, tx: Transaction) {
    const db = await getDb(env);
    await db.collection('transactions').insertOne({ ...tx });
    return tx;
  },
  async update(env: Env, id: string, userId: string, data: Partial<Transaction>) {
    const db = await getDb(env);
    const res = await db.collection('transactions').findOneAndUpdate(
      { id, userId },
      { $set: data },
      { returnDocument: 'after' }
    );
    return mapId<Transaction>(res);
  },
  async delete(env: Env, id: string, userId: string) {
    const db = await getDb(env);
    const res = await db.collection('transactions').deleteOne({ id, userId });
    return res.deletedCount > 0;
  }
};
export const MongoBill = {
  async list(env: Env, userId: string) {
    const db = await getDb(env);
    const bills = await db.collection('bills').find({
      $or: [{ userId }, { userId: { $exists: false } }]
    }).toArray();
    return mapList<Bill>(bills);
  },
  async create(env: Env, bill: Bill) {
    const db = await getDb(env);
    await db.collection('bills').insertOne({ ...bill });
    return bill;
  },
  async update(env: Env, id: string, userId: string, data: Partial<Bill>) {
    const db = await getDb(env);
    const res = await db.collection('bills').findOneAndUpdate(
      { id, userId },
      { $set: data },
      { returnDocument: 'after' }
    );
    return mapId<Bill>(res);
  },
  async delete(env: Env, id: string, userId: string) {
    const db = await getDb(env);
    const res = await db.collection('bills').deleteOne({ id, userId });
    return res.deletedCount > 0;
  }
};
export const MongoSettings = {
  async get(env: Env, userId: string) {
    const db = await getDb(env);
    const settings = await db.collection('userSettings').findOne({ userId });
    return mapId<UserSettings>(settings);
  },
  async update(env: Env, userId: string, data: Partial<UserSettings>) {
    const db = await getDb(env);
    const res = await db.collection('userSettings').findOneAndUpdate(
      { userId },
      { $set: { ...data, userId } },
      { upsert: true, returnDocument: 'after' }
    );
    return mapId<UserSettings>(res);
  }
};
export async function seedDatabase(env: Env) {
  const db = await getDb(env);
  const userCount = await db.collection('users').countDocuments();
  if (userCount === 0) {
    console.log('[MONGODB] Seeding initial data...');
    const demoUserId = 'u1';
    const users = [
      { id: demoUserId, email: 'demo@spendscope.app', passwordHash: 'hash:demo' }
    ];
    await db.collection('users').insertMany(users);
    const demoScopes: Scope[] = [
      { id: 's1', userId: demoUserId, name: 'Food', dailyLimit: 30, monthlyLimit: 900, icon: 'Utensils', color: 'emerald' },
      { id: 's2', userId: demoUserId, name: 'Transport', dailyLimit: 15, monthlyLimit: 450, icon: 'Car', color: 'sky' }
    ];
    await db.collection('scopes').insertMany(demoScopes);
    const demoBills: Bill[] = [
      { id: 'b1', userId: demoUserId, name: 'Rent', amount: 1200, paid: false },
      { id: 'b2', userId: demoUserId, name: 'Spotify', amount: 15, paid: true }
    ];
    await db.collection('bills').insertMany(demoBills);
    await db.collection('userSettings').insertOne({
      userId: demoUserId,
      currentBalance: 5000,
      currentSalary: 4000,
      currentCurrency: 'USD',
      onboarded: true,
      theme: 'light'
    });
    console.log('[MONGODB] Seeding completed.');
  }
}