export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  email: string;
  passwordHash: string;
}
export interface UserPublic {
  id: string;
  email: string;
}
export interface AuthResponseData {
  user: UserPublic;
  token: string;
}
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  authorId: string;
  category: string;
  publishedAt: string;
  readTime: string;
}
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}
export interface Scope {
  id: string;
  name: string;
  dailyLimit: number;
  monthlyLimit: number;
  icon: string;
  color: string;
}
export interface Transaction {
  id: string;
  scopeId: string;
  amount: number;
  description?: string;
  date: string;
}
export interface Bill {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
}
export interface UserSettings {
  currentBalance: number;
  currentSalary: number;
  currentCurrency: string;
  onboarded: boolean;
  theme: 'light' | 'dark';
}
export const CURRENCY_PRESETS = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'AED'] as const;