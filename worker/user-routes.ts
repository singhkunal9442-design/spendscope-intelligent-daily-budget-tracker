import { Hono } from "hono";
import type { Env } from './core-utils';
import { ScopeEntity, TransactionEntity, BillEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Scope, Transaction, Bill } from "../shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
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
    if (!isStr(id)) return bad(c, 'Invalid ID');
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
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const txData = (await c.req.json()) as Partial<Omit<Transaction, 'id'>>;
    if (txData.amount !== undefined && (typeof txData.amount !== 'number' || txData.amount <= 0)) {
        return bad(c, 'Invalid amount');
    }
    const transaction = new TransactionEntity(c.env, id);
    if (!(await transaction.exists())) return notFound(c, 'Transaction not found');
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
    if (!(await bill.exists())) return notFound(c, 'Bill not found');
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