import { Hono } from "hono";
import type { Env } from './core-utils';
import { ScopeEntity, TransactionEntity, BillEntity, UserEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Scope, Transaction, Bill, User } from "../shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  try {
    // AUTH API
    app.post('/api/auth/register', async (c) => {
      const { email, password } = await c.req.json();
      if (!isStr(email) || !isStr(password)) return bad(c, 'Email and password required');
      const { items: users } = await UserEntity.list(c.env);
      if (users.some(u => u.email === email)) return bad(c, 'User already exists');
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        passwordHash: `hash:${password}` // Simplified for demo
      };
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
      if (!(await scope.exists())) return notFound(c, 'Scope not found');
      await scope.patch(scopeData);
      return ok(c, await scope.getState());
    });
    app.delete('/api/scopes/:id', async (c) => {
      const id = c.req.param('id');
      const deleted = await ScopeEntity.delete(c.env, id);
      if (!deleted) return notFound(c);
      return ok(c, { deleted: true });
    });
    // TRANSACTIONS API
    app.get('/api/transactions', async (c) => {
      await TransactionEntity.ensureSeed(c.env);
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
      const txData = (await c.req.json()) as Partial<Omit<Transaction, 'id'>>;
      const transaction = new TransactionEntity(c.env, id);
      if (!(await transaction.exists())) return notFound(c, 'Transaction not found');
      await transaction.patch(txData);
      return ok(c, await transaction.getState());
    });
    app.delete('/api/transactions/:id', async (c) => {
      const id = c.req.param('id');
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
      if (!isStr(billData.name) || typeof billData.amount !== 'number') {
        return bad(c, 'Invalid bill data');
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
      const billData = (await c.req.json()) as Partial<Bill>;
      const bill = new BillEntity(c.env, id);
      if (!(await bill.exists())) return notFound(c, 'Bill not found');
      await bill.patch(billData);
      return ok(c, await bill.getState());
    });
    app.delete('/api/bills/:id', async (c) => {
      const id = c.req.param('id');
      const deleted = await BillEntity.delete(c.env, id);
      if (!deleted) return notFound(c, 'Bill not found');
      return ok(c, { deleted: true });
    });
  } catch (e: any) {
    if (!e.message?.includes('matcher is already built')) throw e;
  }
}