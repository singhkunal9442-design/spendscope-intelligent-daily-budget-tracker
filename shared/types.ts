export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// SpendScope Application Types
export interface Scope {
  id: string;
  name: string;
  dailyLimit: number;
  icon: string; // Icon name from lucide-react
  color: string; // e.g., 'emerald', 'amber', 'rose'
}
export interface Transaction {
  id: string;
  scopeId: string;
  amount: number;
  description?: string;
  date: string; // ISO string for date
}