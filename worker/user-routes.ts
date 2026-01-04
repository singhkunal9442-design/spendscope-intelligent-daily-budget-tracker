import { Hono } from "hono";
import type { Env } from './mongodb-client';
import {
  MongoScope, MongoTransaction, MongoBill,
  MongoUser, MongoSettings, seedDatabase
} from "./entities-mongo";
import { ok, bad, isStr } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Helper to extract userId from token
  const getUserId = (c: any) => {
    const auth = c.req.header('Authorization');
    if (auth?.startsWith('Bearer tk_')) return auth.replace('Bearer tk_', '');
    return null;
  };
  // HEALTH & SEED
  app.get('/api/health', async (c) => {
    try {
      await seedDatabase(c.env);
      return ok(c, { status: 'healthy', database: 'mongodb', timestamp: new Date().toISOString() });
    } catch (e) {
      return bad(c, `Database connection failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  });
  // AUTH API
  app.post('/api/auth/register', async (c) => {
    const { email, password } = await c.req.json();
    if (!isStr(email) || !isStr(password)) return bad(c, 'Email and password required');
    const existing = await MongoUser.findByEmail(c.env, email);
    if (existing) return bad(c, 'User already exists');
    const newUser = { id: crypto.randomUUID(), email, passwordHash: `hash:${password}` };
    await MongoUser.create(c.env, newUser);
    return ok(c, { user: { id: newUser.id, email: newUser.email }, token: `tk_${newUser.id}` });
  });
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    const user = await MongoUser.findByEmail(c.env, email);
    if (!user || (user.passwordHash !== `hash:${password}` && user.passwordHash !== `pbkdf2:${password}`)) {
      return bad(c, 'Invalid credentials');
    }
    return ok(c, { user: { id: user.id, email: user.email }, token: `tk_${user.id}` });
  });
  // SCOPES API
  app.get('/api/scopes', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const items = await MongoScope.list(c.env, userId);
    return ok(c, items);
  });
  app.post('/api/scopes', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const data = await c.req.json();
    const newScope = { ...data, id: crypto.randomUUID(), userId };
    return ok(c, await MongoScope.create(c.env, newScope));
  });
  app.put('/api/scopes/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const data = await c.req.json();
    const updated = await MongoScope.update(c.env, c.req.param('id'), userId, data);
    return ok(c, updated);
  });
  app.delete('/api/scopes/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    await MongoScope.delete(c.env, c.req.param('id'), userId);
    return ok(c, { success: true });
  });
  // TRANSACTIONS API
  app.get('/api/transactions', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const items = await MongoTransaction.list(c.env, userId);
    return ok(c, items);
  });
  app.post('/api/transactions', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const data = await c.req.json();
    const newTx = {
      ...data,
      id: crypto.randomUUID(),
      userId,
      date: data.date || new Date().toISOString()
    };
    return ok(c, await MongoTransaction.create(c.env, newTx));
  });
  app.put('/api/transactions/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const data = await c.req.json();
    const updated = await MongoTransaction.update(c.env, c.req.param('id'), userId, data);
    return ok(c, updated);
  });
  app.delete('/api/transactions/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    await MongoTransaction.delete(c.env, c.req.param('id'), userId);
    return ok(c, { success: true });
  });
  // BILLS API
  app.get('/api/bills', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const items = await MongoBill.list(c.env, userId);
    return ok(c, items);
  });
  app.post('/api/bills', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const data = await c.req.json();
    const newBill = { ...data, id: crypto.randomUUID(), userId, paid: false };
    return ok(c, await MongoBill.create(c.env, newBill));
  });
  app.put('/api/bills/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const data = await c.req.json();
    const updated = await MongoBill.update(c.env, c.req.param('id'), userId, data);
    return ok(c, updated);
  });
  app.delete('/api/bills/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    await MongoBill.delete(c.env, c.req.param('id'), userId);
    return ok(c, { success: true });
  });
  // SETTINGS API
  app.get('/api/user-settings', async (c) => {
    const userId = getUserId(c);
    if (!userId) return ok(c, { 
        userId: "", currentBalance: 0, currentSalary: 0, 
        currentCurrency: 'USD', onboarded: false, theme: 'light' 
    });
    const state = await MongoSettings.get(c.env, userId);
    if (!state) {
        return ok(c, { 
            userId, currentBalance: 0, currentSalary: 0, 
            currentCurrency: 'USD', onboarded: false, theme: 'light' 
        });
    }
    return ok(c, state);
  });
  app.put('/api/user-settings', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const partial = await c.req.json();
    const updated = await MongoSettings.update(c.env, userId, partial);
    return ok(c, updated);
  });
}