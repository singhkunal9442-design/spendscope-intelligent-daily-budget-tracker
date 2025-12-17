import { Hono } from "hono";
import type { Env } from './core-utils';
import { ScopeEntity, TransactionEntity, BillEntity, UserEntity, hashPassword } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Scope, Transaction, Bill, AuthCredentials, LoginResponse, User } from "@shared/types";
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // AUTH API
  app.post('/api/auth/register', async (c) => {
    const { email, password } = await c.req.json<AuthCredentials>();
    if (!isStr(email) || !isStr(password)) return bad(c, 'Email and password are required.');
    await UserEntity.ensureSeed(c.env);
    const { items: users } = await UserEntity.list(c.env);
    if (users.some(u => u.email === email)) {
      return bad(c, 'An account with this email already exists.');
    }
    const passwordHash = await hashPassword(password);
    const newUser: User = { id: crypto.randomUUID(), email, passwordHash };
    const createdUser = await UserEntity.create(c.env, newUser);
    return ok(c, { userId: createdUser.id });
  });
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json<AuthCredentials>();
    if (!isStr(email) || !isStr(password)) return bad(c, 'Email and password are required.');
    await UserEntity.ensureSeed(c.env);
    const { items: users } = await UserEntity.list(c.env);
    const user = users.find(u => u.email === email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return bad(c, 'Invalid email or password.');
    }
    const token = crypto.randomUUID(); // Simple token for this phase
    return ok(c, { userId: user.id, token } as LoginResponse);
  });
  // SCOPES API
  app.get('/api/scopes', async (c) => {
    await ScopeEntity.ensureSeed(c.env);
    const { items } = await ScopeEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/scopes', async (c) => {
    const scopeData = (await c.req.json()) as Partial<Scope>;
    if (!isStr(scopeData.name) || typeof scopeData.dailyLimit !== 'number' || !isStr(scopeData.icon) || !isStr(scopeData.color)) {
      return bad(c, 'Invalid scope data');
    }
    const newScope: Scope = {
      id: crypto.randomUUID(),
      name: scopeData.name,
      dailyLimit: scopeData.dailyLimit,
      monthlyLimit: typeof scopeData.monthlyLimit === 'number' ? scopeData.monthlyLimit : scopeData.dailyLimit * 30,
      icon: scopeData.icon,
      color: scopeData.color,
    };
    const created = await ScopeEntity.create(c.env, newScope);
    return ok(c, created);
  });
  app.put('/api/scopes/:id', async (c) => {
    const id = c.req.param('id');
    const scopeData = (await c.req.json()) as Partial<Scope>;
    const scope = new ScopeEntity(c.env, id);
    if (!(await scope.exists())) {
      return notFound(c, 'Scope not found');
    }
    await scope.patch(scopeData);
    return ok(c, await scope.getState());
  });
  app.delete('/api/scopes/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const deleted = await ScopeEntity.delete(c.env, id);
    if (!deleted) return notFound(c);
    return ok(c, { deleted: true });
  });
  // TRANSACTIONS API
  app.get('/api/transactions', async (c) => {
    const { items } = await TransactionEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/transactions', async (c) => {
    const txData = (await c.req.json()) as Omit<Transaction, 'id' | 'date'>;
    if (!isStr(txData.scopeId) || typeof txData.amount !== 'number' || txData.amount <= 0) {
      return bad(c, 'Invalid transaction data');
    }
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      scopeId: txData.scopeId,
      amount: txData.amount,
      description: txData.description,
      date: new Date().toISOString(),
    };
    const created = await TransactionEntity.create(c.env, newTransaction);
    return ok(c, created);
  });
  app.put('/api/transactions/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const txData = (await c.req.json()) as Partial<Omit<Transaction, 'id'>>;
    // Basic validation
    if (txData.amount !== undefined && (typeof txData.amount !== 'number' || txData.amount <= 0)) {
        return bad(c, 'Invalid amount');
    }
    const transaction = new TransactionEntity(c.env, id);
    if (!(await transaction.exists())) {
      return notFound(c, 'Transaction not found');
    }
    await transaction.patch(txData);
    return ok(c, await transaction.getState());
  });
  app.delete('/api/transactions/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const deleted = await TransactionEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Transaction not found');
    return ok(c, { deleted: true });
  });
  // BILLS API
  app.get('/api/bills', async (c) => {
    await BillEntity.ensureSeed(c.env);
    const { items } = await BillEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/bills', async (c) => {
    const billData = (await c.req.json()) as Partial<Bill>;
    if (!isStr(billData.name) || typeof billData.amount !== 'number' || billData.amount <= 0) {
      return bad(c, 'Invalid bill data: name and positive amount required.');
    }
    const newBill: Bill = {
      id: crypto.randomUUID(),
      name: billData.name,
      amount: billData.amount,
      paid: billData.paid ?? false,
    };
    const created = await BillEntity.create(c.env, newBill);
    return ok(c, created);
  });
  app.put('/api/bills/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const billData = (await c.req.json()) as Partial<Bill>;
    const bill = new BillEntity(c.env, id);
    if (!(await bill.exists())) {
      return notFound(c, 'Bill not found');
    }
    await bill.patch(billData);
    return ok(c, await bill.getState());
  });
  app.delete('/api/bills/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const deleted = await BillEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Bill not found');
    return ok(c, { deleted: true });
  });
}