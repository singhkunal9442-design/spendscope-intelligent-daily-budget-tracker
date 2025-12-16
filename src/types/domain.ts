import { LucideIcon } from "lucide-react";
export interface Scope {
  id: string;
  name: string;
  dailyLimit: number;
  icon: LucideIcon | string; // Allow for custom icons later
  color: string; // e.g., 'emerald', 'amber', 'rose'
}
export interface Transaction {
  id: string;
  scopeId: string;
  amount: number;
  description?: string;
  date: string; // ISO string for date
}