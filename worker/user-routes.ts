import { Hono } from "hono";
import type { Env } from './core-utils';
import { ScopeEntity, TransactionEntity, BillEntity, UserEntity, UserSettingsEntity, PostEntity, CommentEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Post, Comment, User, UserSettings } from "../shared/types";
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
  // BLOG API
  app.get('/api/posts', async (c) => {
    await PostEntity.ensureSeed(c.env);
    const { items } = await PostEntity.list(c.env);
    return ok(c, items);
  });
  app.get('/api/posts/:id', async (c) => {
    const post = new PostEntity(c.env, c.req.param('id'));
    if (!(await post.exists())) return notFound(c);
    return ok(c, await post.getState());
  });
  app.post('/api/posts', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const data = await c.req.json();
    const newPost = { ...data, id: crypto.randomUUID(), authorId: userId, publishedAt: new Date().toISOString() };
    return ok(c, await PostEntity.create(c.env, newPost));
  });
  app.get('/api/comments/:postId', async (c) => {
    const { items } = await CommentEntity.list(c.env);
    const filtered = items.filter(it => it.postId === c.req.param('postId'));
    return ok(c, filtered);
  });
  app.post('/api/comments', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const { postId, text, userName } = await c.req.json();
    const comment = { id: crypto.randomUUID(), postId, userId, userName, text, createdAt: new Date().toISOString() };
    return ok(c, await CommentEntity.create(c.env, comment));
  });
  // SETTINGS
  app.get('/api/user-settings', async (c) => {
    const userId = getUserId(c);
    if (!userId) return ok(c, UserSettingsEntity.initialState);
    const settings = new UserSettingsEntity(c.env, userId);
    return ok(c, await settings.getState());
  });
  app.put('/api/user-settings', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Unauthorized');
    const partial = await c.req.json();
    const settings = new UserSettingsEntity(c.env, userId);
    await settings.patch(partial);
    return ok(c, await settings.getState());
  });
}