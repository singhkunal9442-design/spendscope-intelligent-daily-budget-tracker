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
export interface AuthResponse {
  success: boolean;
  user?: Omit<User, 'passwordHash'>;
  token?: string;
  error?: string;
}
export interface Scope {
  id: string;
  name: string;
  dailyLimit: number;
  monthlyLimit?: number;
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
}
export type UserPublic = Pick<User, 'id' | 'email'>;
export type AuthResponseData = { user: UserPublic; token: string; };