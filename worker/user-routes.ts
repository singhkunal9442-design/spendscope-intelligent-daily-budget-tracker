import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ScopeEntity, TransactionEntity, BillEntity, UserSettingsEntity } from './entities';
import { ok, bad, isStr } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const getUserId = (c: any) => {
    const auth = c.req.header('Authorization');
    if (auth?.startsWith('Bearer tk_')) return auth.replace('Bearer tk_', '');
    return null;
  };
  // HEALTH & SEED
  app.get('/api/health', async (c) => {
    await Promise.all([
      UserEntity.ensureSeed(c.env),
      ScopeEntity.ensureSeed(c.env),
      BillEntity.ensureSeed(c.env)
    ]);
    return ok(c, {
      status: 'healthy',
      storage: 'durable-objects',
      timestamp: new Date().toISOString()
    });
  });
  // AUTH API
  app.post('/api/auth/register', async (c) => {
    const {email,password}=await c.req.json();
    if(!isStr(email)||!isStr(password)) return bad(c, 'Credentials required');
    await UserEntity.ensureSeed(c.env);
    const {items:users}=await UserEntity.list(c.env) || {items:[]};
    if(users.some(u=>u.email===email)) return bad(c, 'Account exists');
    const newUser={id:crypto.randomUUID(),email,passwordHash:`hash:${password}`};
    await UserEntity.create(c.env,newUser);
    return ok(c, {user:{id:newUser.id,email:newUser.email}, token:`tk_${newUser.id}`});
  });
  app.post('/api/auth/login', async (c) => {
    const {email,password}=await c.req.json();
    await UserEntity.ensureSeed(c.env);
    const {items:users}=await UserEntity.list(c.env) || {items:[]};
    const user=users.find(u=>u.email===email && u.passwordHash===`hash:${password}`);
    if(!user) return bad(c, 'Invalid credentials');
    return ok(c, {user:{id:user.id,email:user.email},token:`tk_${user.id}`});
  });
  // SCOPES API - Enforced Isolation
  app.get('/api/scopes', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const {items}=await ScopeEntity.list(c.env) || {items:[]};
    return ok(c, items.filter(i=>i.userId===userId));
  });
  app.post('/api/scopes', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const data=await c.req.json();
    const newScope={...data, id: data.id || crypto.randomUUID(), userId};
    return ok(c, await ScopeEntity.create(c.env,newScope));
  });
  app.put('/api/scopes/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const inst=new ScopeEntity(c.env,c.req.param('id'));
    const current=await inst.getState();
    if(!current) return bad(c, 'Not found');
    if(current.userId && current.userId!==userId) return bad(c, 'Forbidden');
    const data=await c.req.json();
    await inst.patch(data);
    return ok(c, await inst.getState());
  });
  app.delete('/api/scopes/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const inst=new ScopeEntity(c.env,c.req.param('id'));
    const current=await inst.getState();
    if(!current) return bad(c, 'Not found');
    if(current.userId && current.userId!==userId) return bad(c, 'Forbidden');
    await ScopeEntity.delete(c.env,c.req.param('id'));
    return ok(c, { success: true });
  });
  // TRANSACTIONS API - Enforced Isolation
  app.get('/api/transactions', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const {items}=await TransactionEntity.list(c.env) || {items:[]};
    return ok(c, items.filter(i=>i.userId===userId));
  });
  app.post('/api/transactions', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const data = await c.req.json();
    const newTx = {
      ...data,
      id: data.id || crypto.randomUUID(),
      userId,
      date: data.date || new Date().toISOString()
    };
    return ok(c, await TransactionEntity.create(c.env, newTx));
  });
  app.put('/api/transactions/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const inst=new TransactionEntity(c.env,c.req.param('id'));
    const current=await inst.getState();
    if(!current) return bad(c, 'Not found');
    if(current.userId && current.userId!==userId) return bad(c, 'Forbidden');
    const data=await c.req.json();
    await inst.patch(data);
    return ok(c, await inst.getState());
  });
  app.delete('/api/transactions/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const inst=new TransactionEntity(c.env,c.req.param('id'));
    const current=await inst.getState();
    if(!current) return bad(c, 'Not found');
    if(current.userId && current.userId!==userId) return bad(c, 'Forbidden');
    await TransactionEntity.delete(c.env,c.req.param('id'));
    return ok(c, { success: true });
  });
  // BILLS API - Enforced Isolation
  app.get('/api/bills', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const {items}=await BillEntity.list(c.env) || {items:[]};
    return ok(c, items.filter(i=>i.userId===userId));
  });
  app.post('/api/bills', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const data = await c.req.json();
    const newBill = { ...data, id: data.id || crypto.randomUUID(), userId, paid: data.paid ?? false };
    return ok(c, await BillEntity.create(c.env, newBill));
  });
  app.put('/api/bills/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const inst=new BillEntity(c.env,c.req.param('id'));
    const current=await inst.getState();
    if(!current) return bad(c, 'Not found');
    if(current.userId && current.userId!==userId) return bad(c, 'Forbidden');
    const data=await c.req.json();
    await inst.patch(data);
    return ok(c, await inst.getState());
  });
  app.delete('/api/bills/:id', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const inst=new BillEntity(c.env,c.req.param('id'));
    const current=await inst.getState();
    if(!current) return bad(c, 'Not found');
    if(current.userId && current.userId!==userId) return bad(c, 'Forbidden');
    await BillEntity.delete(c.env,c.req.param('id'));
    return ok(c, { success: true });
  });
  // SETTINGS API - Enforced Isolation
  app.get('/api/user-settings', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const settings=new UserSettingsEntity(c.env,userId);
    return ok(c, await settings.getState());
  });
  app.put('/api/user-settings', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const settings=new UserSettingsEntity(c.env,userId);
    const partial=await c.req.json();
    await settings.patch(partial);
    return ok(c, await settings.getState());
  });
}