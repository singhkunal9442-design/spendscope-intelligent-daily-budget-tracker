import { Hono } from "hono";
import type { Env } from './core-utils';
import {
  ScopeEntity, TransactionEntity, BillEntity,
  UserEntity, UserSettingsEntity
} from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { User } from "../shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const getUserId = (c: any) => {
    const auth = c.req.header('Authorization');
    if (auth?.startsWith('Bearer tk_')) return auth.replace('Bearer tk_', '');
    return null;
  };
  // AUTH API
  app.post('/api/auth/register', async (c) => {
    const { email, password } = await c.req.json();
    if (!isStr(email) || !isStr(password)) return bad(c, 'Email and password required');
    const { items: users } = await UserEntity.list(c.env);
    if (users.some(u => u.email === email)) return bad(c, 'User already exists');
    const newUser: User = { id: crypto.randomUUID(), email, passwordHash: `hash:${password}` };
    await UserEntity.create(c.env, newUser);
    return ok(c, { user: { id: newUser.id, email: newUser.email }, token: `tk_${newUser.id}` });
  });
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    await UserEntity.ensureSeed(c.env);
    const { items: users } = await UserEntity.list(c.env);
    const user = users.find(u => u.email === email && (u.passwordHash === `hash:${password}` || u.passwordHash === `pbkdf2:${password}`));
    if (!user) return bad(c, 'Invalid credentials');
    return ok(c, { user: { id: user.id, email: user.email }, token: `tk_${user.id}` });
  });
  // BUDGETING API: SCOPES
  app.get('/api/scopes', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const { items } = await ScopeEntity.list(c.env);
    const userItems = items.filter(i => i.userId === userId || !i.userId); // Allow seeded ones initially
    return ok(c, userItems);
  });
  app.post('/api/scopes', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const data = await c.req.json();
    const newScope = { ...data, id: crypto.randomUUID(), userId };
    return ok(c, await ScopeEntity.create(c.env, newScope));
  });
  app.put('/api/scopes/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const inst = new ScopeEntity(c.env, c.req.param('id'));
    const state = await inst.getState();
    if (state.userId && state.userId !== userId) return bad(c, 'Forbidden');
    const data = await c.req.json();
    await inst.patch(data);
    return ok(c, await inst.getState());
  });
  app.delete('/api/scopes/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const inst = new ScopeEntity(c.env, c.req.param('id'));
    const state = await inst.getState();
    if (state.userId && state.userId !== userId) return bad(c, 'Forbidden');
    await ScopeEntity.delete(c.env, c.req.param('id'));
    return ok(c, { success: true });
  });
  // BUDGETING API: TRANSACTIONS
  app.get('/api/transactions', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const { items } = await TransactionEntity.list(c.env);
    return ok(c, items.filter(t => t.userId === userId));
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
    return ok(c, await TransactionEntity.create(c.env, newTx));
  });
  app.put('/api/transactions/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const inst = new TransactionEntity(c.env, c.req.param('id'));
    const state = await inst.getState();
    if (state.userId !== userId) return bad(c, 'Forbidden');
    const data = await c.req.json();
    await inst.patch(data);
    return ok(c, await inst.getState());
  });
  app.delete('/api/transactions/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const inst = new TransactionEntity(c.env, c.req.param('id'));
    const state = await inst.getState();
    if (state.userId !== userId) return bad(c, 'Forbidden');
    await TransactionEntity.delete(c.env, c.req.param('id'));
    return ok(c, { success: true });
  });
  // BUDGETING API: BILLS
  app.get('/api/bills', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const { items } = await BillEntity.list(c.env);
    return ok(c, items.filter(b => b.userId === userId || !b.userId));
  });
  app.post('/api/bills', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const data = await c.req.json();
    const newBill = { ...data, id: crypto.randomUUID(), userId, paid: false };
    return ok(c, await BillEntity.create(c.env, newBill));
  });
  app.put('/api/bills/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const inst = new BillEntity(c.env, c.req.param('id'));
    const state = await inst.getState();
    if (state.userId && state.userId !== userId) return bad(c, 'Forbidden');
    const data = await c.req.json();
    await inst.patch(data);
    return ok(c, await inst.getState());
  });
  app.delete('/api/bills/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const inst = new BillEntity(c.env, c.req.param('id'));
    const state = await inst.getState();
    if (state.userId && state.userId !== userId) return bad(c, 'Forbidden');
    await BillEntity.delete(c.env, c.req.param('id'));
    return ok(c, { success: true });
  });
  // SETTINGS
  app.get('/api/user-settings', async (c) => {
    const userId = getUserId(c);
    if (!userId) return ok(c, UserSettingsEntity.initialState);
    const settings = new UserSettingsEntity(c.env, userId);
    const state = await settings.getState();
    return ok(c, { ...state, userId });
  });
  app.put('/api/user-settings', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const partial = await c.req.json();
    const settings = new UserSettingsEntity(c.env, userId);
    await settings.patch({ ...partial, userId });
    return ok(c, await settings.getState());
  });
}