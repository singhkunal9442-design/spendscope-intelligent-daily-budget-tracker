import { create } from 'zustand';
import { produce } from 'immer';
import { Post, Comment, Scope, Transaction, Bill, UserPublic, UserSettings } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
interface BudgetState {
  user: UserPublic | null;
  token: string | null;
  posts: Post[];
  comments: Comment[];
  scopes: Scope[];
  transactions: Transaction[];
  bills: Bill[];
  settings: UserSettings;
  loading: boolean;
  // Actions
  loadData: () => Promise<void>;
  loadPosts: () => Promise<void>;
  loadComments: (postId: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
}
export const useBudgetStore = create<BudgetState>((set, get) => ({
  user: localStorage.getItem('spendscope-user') ? JSON.parse(localStorage.getItem('spendscope-user')!) : null,
  token: localStorage.getItem('spendscope-token'),
  posts: [],
  comments: [],
  scopes: [],
  transactions: [],
  bills: [],
  settings: {
    currentBalance: 0,
    currentSalary: 0,
    currentCurrency: 'USD',
    onboarded: false,
    theme: 'light'
  },
  loading: false,
  loadData: async () => {
    const token = get().token;
    if (!token) return;
    set({ loading: true });
    try {
      const [settings, scopes, transactions, bills] = await Promise.all([
        api<UserSettings>('/api/user-settings'),
        api<Scope[]>('/api/scopes'),
        api<Transaction[]>('/api/transactions'),
        api<Bill[]>('/api/bills')
      ]);
      set({ settings, scopes, transactions, bills });
    } catch (e) {
      console.error(e);
    } finally {
      set({ loading: false });
    }
  },
  loadPosts: async () => {
    try {
      const posts = await api<Post[]>('/api/posts');
      set({ posts });
    } catch (e) { console.error(e); }
  },
  loadComments: async (postId) => {
    try {
      const comments = await api<Comment[]>(`/api/comments/${postId}`);
      set({ comments });
    } catch (e) { console.error(e); }
  },
  login: async (email, password) => {
    const res = await api<{ user: UserPublic, token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('spendscope-token', res.token);
    localStorage.setItem('spendscope-user', JSON.stringify(res.user));
    set({ user: res.user, token: res.token });
    await get().loadData();
    toast.success("Welcome back");
  },
  register: async (email, password) => {
    const res = await api<{ user: UserPublic, token: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('spendscope-token', res.token);
    localStorage.setItem('spendscope-user', JSON.stringify(res.user));
    set({ user: res.user, token: res.token });
    await get().loadData();
    toast.success("Account created");
  },
  logout: () => {
    localStorage.removeItem('spendscope-token');
    localStorage.removeItem('spendscope-user');
    set({ user: null, token: null, scopes: [], transactions: [], bills: [] });
    toast.info("Logged out");
  },
  updateSettings: async (partial) => {
    const updated = await api<UserSettings>('/api/user-settings', { method: 'PUT', body: JSON.stringify(partial) });
    set({ settings: updated });
  },
  addComment: async (postId, text) => {
    const user = get().user;
    if (!user) return;
    const comment = await api<Comment>('/api/comments', { method: 'POST', body: JSON.stringify({ postId, text, userName: user.email }) });
    set(produce(s => { s.comments.push(comment); }));
  }
}));
// Primitive Selectors
export const useAuthUser = () => useBudgetStore(s => s.user);
export const useIsLoggedIn = () => useBudgetStore(s => !!s.token);
export const usePosts = () => useBudgetStore(s => s.posts);
export const useSettings = () => useBudgetStore(s => s.settings);
export const useLoading = () => useBudgetStore(s => s.loading);