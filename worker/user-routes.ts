import { Hono } from "hono";
import type { Env } from './core-utils';
import { ScopeEntity, TransactionEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Scope, Transaction } from "@shared/types";
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
}