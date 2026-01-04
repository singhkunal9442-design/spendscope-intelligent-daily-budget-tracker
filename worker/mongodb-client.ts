import { MongoClient, Db } from 'mongodb';
/**
 * MongoDB client singleton for Cloudflare Workers.
 * Uses the MONGODB_URI environment secret.
 */
let clientInstance: MongoClient | null = null;
export interface Env {
  MONGODB_URI: string;
  GlobalDurableObject: DurableObjectNamespace;
}
export async function getMongoClient(env: Env): Promise<MongoClient> {
  if (clientInstance) return clientInstance;
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  try {
    // MongoDB driver 6.x+ supports Cloudflare Workers via standard fetch/socket APIs
    const client = new MongoClient(env.MONGODB_URI, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    await client.connect();
    clientInstance = client;
    return client;
  } catch (error) {
    console.error('[MONGODB] Connection failed:', error);
    throw error;
  }
}
export async function getDb(env: Env): Promise<Db> {
  const client = await getMongoClient(env);
  return client.db('spendscope');
}