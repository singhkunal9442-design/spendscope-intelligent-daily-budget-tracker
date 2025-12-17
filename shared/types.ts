export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// SpendScope Application Types
export interface Scope {
  id: string;
  userId: string;
  name: string;
  dailyLimit: number;
  monthlyLimit?: number;
  icon: string; // Icon name from lucide-react
  color: string; // e.g., 'emerald', 'amber', 'rose'
}
export interface Transaction {
  id: string;
  userId: string;
  scopeId: string;
  amount: number;
  description?: string;
  date: string; // ISO string for date
}
export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  paid: boolean;
}
// Auth Types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
}
export interface AuthCredentials {
  email: string;
  password: string;
}
export interface LoginResponse {
  userId: string;
  token: string;
}