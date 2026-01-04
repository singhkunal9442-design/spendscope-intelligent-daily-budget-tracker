import { getDb, Env } from './mongodb-client';
import { 
  User, Scope, Transaction, Bill, UserSettings, 
  MOCK_USERS, MOCK_CHATS, MOCK_CHAT_MESSAGES 
} from '../shared/types';
/**
 * MongoDB Data Access Layer.
 * Maps MongoDB's _id to the application's string 'id'.
 */
function mapId<T extends { _id?: any }>(doc: T | null): any {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}
export const MongoUser = {
  async findById(env: Env, id: string) {
    const db = await getDb(env);
    const user = await db.collection('users').findOne({ id });
    return user as unknown as User | null;
  },
  async findByEmail(env: Env, email: string) {
    const db = await getDb(env);
    return await db.collection('users').findOne({ email }) as unknown as User | null;
  },
  async list(env: Env) {
    const db = await getDb(env);
    return await db.collection('users').find().toArray() as unknown as User[];
  },
  async create(env: Env, user: User) {
    const db = await getDb(env);
    await db.collection('users').insertOne(user);
    return user;
  }
};
export const MongoScope = {
  async list(env: Env, userId: string) {
    const db = await getDb(env);
    // Allow seeded ones (no userId) or user-specific ones
    return await db.collection('scopes').find({ 
      $or: [{ userId }, { userId: { $exists: false } }] 
    }).toArray() as unknown as Scope[];
  },
  async create(env: Env, scope: Scope) {
    const db = await getDb(env);
    await db.collection('scopes').insertOne(scope);
    return scope;
  },
  async update(env: Env, id: string, userId: string, data: Partial<Scope>) {
    const db = await getDb(env);
    const res = await db.collection('scopes').findOneAndUpdate(
      { id, userId },
      { $set: data },
      { returnDocument: 'after' }
    );
    return res as unknown as Scope;
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
    return await db.collection('transactions').find({ userId }).toArray() as unknown as Transaction[];
  },
  async create(env: Env, tx: Transaction) {
    const db = await getDb(env);
    await db.collection('transactions').insertOne(tx);
    return tx;
  },
  async update(env: Env, id: string, userId: string, data: Partial<Transaction>) {
    const db = await getDb(env);
    const res = await db.collection('transactions').findOneAndUpdate(
      { id, userId },
      { $set: data },
      { returnDocument: 'after' }
    );
    return res as unknown as Transaction;
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
    return await db.collection('bills').find({ 
      $or: [{ userId }, { userId: { $exists: false } }] 
    }).toArray() as unknown as Bill[];
  },
  async create(env: Env, bill: Bill) {
    const db = await getDb(env);
    await db.collection('bills').insertOne(bill);
    return bill;
  },
  async update(env: Env, id: string, userId: string, data: Partial<Bill>) {
    const db = await getDb(env);
    const res = await db.collection('bills').findOneAndUpdate(
      { id, userId },
      { $set: data },
      { returnDocument: 'after' }
    );
    return res as unknown as Bill;
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
    return await db.collection('userSettings').findOne({ userId }) as unknown as UserSettings | null;
  },
  async update(env: Env, userId: string, data: Partial<UserSettings>) {
    const db = await getDb(env);
    const res = await db.collection('userSettings').findOneAndUpdate(
      { userId },
      { $set: { ...data, userId } },
      { upsert: true, returnDocument: 'after' }
    );
    return res as unknown as UserSettings;
  }
};
export async function seedDatabase(env: Env) {
  const db = await getDb(env);
  const userCount = await db.collection('users').countDocuments();
  if (userCount === 0) {
    console.log('[MONGODB] Seeding initial data...');
    // Seed demo users from shared mock data
    // Note: In real app, we'd hash these passwords properly if they aren't already
    const users = [
      { id: 'u1', email: 'demo@spendscope.app', passwordHash: 'hash:demo' }
    ];
    await db.collection('users').insertMany(users);
    const demoScopes: Scope[] = [
      { id: 's1', userId: 'u1', name: 'Food', dailyLimit: 30, monthlyLimit: 900, icon: 'Utensils', color: 'emerald' },
      { id: 's2', userId: 'u1', name: 'Transport', dailyLimit: 15, monthlyLimit: 450, icon: 'Car', color: 'sky' }
    ];
    await db.collection('scopes').insertMany(demoScopes);
    const demoBills: Bill[] = [
      { id: 'b1', userId: 'u1', name: 'Rent', amount: 1200, paid: false },
      { id: 'b2', userId: 'u1', name: 'Spotify', amount: 15, paid: true }
    ];
    await db.collection('bills').insertMany(demoBills);
    await db.collection('userSettings').insertOne({
      userId: 'u1',
      currentBalance: 5000,
      currentSalary: 4000,
      currentCurrency: 'USD',
      onboarded: true,
      theme: 'light'
    });
  }
}