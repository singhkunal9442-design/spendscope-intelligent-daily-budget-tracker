import { IndexedEntity, Entity } from "./core-utils";
import type { User, Scope, Transaction, Bill, UserSettings, Post, Comment } from "../shared/types";
const DEMO_USER_ID = 'demo-user';
const SEED_USERS: User[] = [
  { id: DEMO_USER_ID, email: 'demo@demo.com', passwordHash: 'pbkdf2:demo' }
];
const SEED_SCOPES: Scope[] = [
  { id: 's1', name: 'Food & Dining', dailyLimit: 40, monthlyLimit: 1200, icon: 'Utensils', color: 'emerald' },
  { id: 's2', name: 'Transport', dailyLimit: 15, monthlyLimit: 450, icon: 'Car', color: 'sky' },
  { id: 's3', name: 'Entertainment', dailyLimit: 20, monthlyLimit: 600, icon: 'Gamepad2', color: 'violet' },
  { id: 's4', name: 'Shopping', dailyLimit: 30, monthlyLimit: 900, icon: 'ShoppingCart', color: 'amber' },
];
const SEED_BILLS: Bill[] = [
  { id: 'b1', name: 'Rent', amount: 1500, paid: true },
  { id: 'b2', name: 'Internet', amount: 60, paid: false },
  { id: 'b3', name: 'Netflix', amount: 15, paid: true },
];
const SEED_POSTS: Post[] = [
  {
    id: 'p1',
    title: 'The Art of Financial Clarity',
    content: 'In an era of endless consumption, clarity is the ultimate luxury. SpendScope was designed to bring the Apple aesthetic to your ledger...',
    excerpt: 'Discover why minimal design leads to better financial decisions.',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=1200',
    authorId: DEMO_USER_ID,
    category: 'Philosophy',
    publishedAt: new Date().toISOString(),
    readTime: '5 min'
  },
  {
    id: 'p2',
    title: 'Building for the Future',
    content: 'Our transition to a unified blog and budget platform represents our commitment to holistic financial health...',
    excerpt: 'A deep dive into the SpendScope 2.0 architecture.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    authorId: DEMO_USER_ID,
    category: 'Updates',
    publishedAt: new Date().toISOString(),
    readTime: '3 min'
  }
];
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", email: "", passwordHash: "" };
  static seedData = SEED_USERS;
}
export class UserSettingsEntity extends Entity<UserSettings> {
  static readonly entityName = "user-settings";
  static readonly initialState: UserSettings = {
    currentBalance: 5000,
    currentSalary: 4000,
    currentCurrency: "USD",
    onboarded: true,
    theme: 'light'
  };
}
export class PostEntity extends IndexedEntity<Post> {
  static readonly entityName = "post";
  static readonly indexName = "posts";
  static readonly initialState: Post = { id: "", title: "", content: "", excerpt: "", image: "", authorId: "", category: "", publishedAt: "", readTime: "" };
  static seedData = SEED_POSTS;
}
export class CommentEntity extends IndexedEntity<Comment> {
  static readonly entityName = "comment";
  static readonly indexName = "comments";
  static readonly initialState: Comment = { id: "", postId: "", userId: "", userName: "", text: "", createdAt: "" };
}
export class ScopeEntity extends IndexedEntity<Scope> {
  static readonly entityName = "scope";
  static readonly indexName = "scopes";
  static readonly initialState: Scope = { id: "", name: "", dailyLimit: 0, monthlyLimit: 0, icon: "Circle", color: "gray" };
  static seedData = SEED_SCOPES;
}
export class TransactionEntity extends IndexedEntity<Transaction> {
  static readonly entityName = "transaction";
  static readonly indexName = "transactions";
  static readonly initialState: Transaction = { id: "", scopeId: "", amount: 0, date: "" };
}
export class BillEntity extends IndexedEntity<Bill> {
  static readonly entityName = "bill";
  static readonly indexName = "bills";
  static readonly initialState: Bill = { id: "", name: "", amount: 0, paid: false };
  static seedData = SEED_BILLS;
}