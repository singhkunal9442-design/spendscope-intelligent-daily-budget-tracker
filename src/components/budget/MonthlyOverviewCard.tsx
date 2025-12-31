import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Landmark, FileWarning, Wallet, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useFormatAmount, useSpentThisMonth, useCurrentBalance, useCurrentSalary, useMonthlyBudget, useTransactions } from '@/lib/store';
import { subDays, format, parseISO } from 'date-fns';
import { ScopeSparkline } from '@/components/charts/ScopeSparkline';
import { Skeleton } from '@/components/ui/skeleton';
export function MonthlyOverviewCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border bg-card shadow-sm animate-pulse space-y-6">
      <div className="flex items-center gap-3"><Skeleton className="h-6 w-6" /><Skeleton className="h-6 w-32" /></div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    </div>
  );
}
export function MonthlyOverviewCard() {
  const transactions = useTransactions();
  const formatAmount = useFormatAmount();
  const spentThisMonth = useSpentThisMonth();
  const currentBalance = useCurrentBalance();
  const currentSalary = useCurrentSalary();
  const monthlyBudget = useMonthlyBudget();
  const availableCash = currentBalance - spentThisMonth;
  const currentMonth = useMemo(() => format(new Date(), 'MMMM'), []);
  const sparkData = useMemo(() => {
    const now = new Date();
    const daily: Record<string, number> = {};
    transactions.forEach(t => {
      const day = format(parseISO(t.date), 'yyyy-MM-dd');
      daily[day] = (daily[day] || 0) + t.amount;
    });
    return Array.from({ length: 30 }, (_, i) => {
      const date = subDays(now, 29 - i);
      const dayKey = format(date, 'yyyy-MM-dd');
      return { date: format(date, 'MMM d'), spent: daily[dayKey] || 0 };
    });
  }, [transactions]);
  const percentage = currentBalance > 0 ? Math.min((spentThisMonth / currentBalance) * 100, 100) : 0;
  const stats = [
    { label: 'Starting', value: formatAmount(currentBalance), icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-500/5' },
    { label: 'Spent', value: formatAmount(spentThisMonth), icon: FileWarning, color: 'text-rose-500', bg: 'bg-rose-500/5' },
    { label: 'Salary', value: formatAmount(currentSalary), icon: Wallet, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
    { label: 'Budget', value: formatAmount(monthlyBudget), icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/5' },
    { label: 'Available', value: formatAmount(availableCash), icon: availableCash < 0 ? TrendingDown : TrendingUp, color: availableCash < 0 ? 'text-red-500' : 'text-emerald-500', bg: 'bg-emerald-500/5', isPrimary: true },
  ];
  return (
    <div className="p-8 rounded-3xl border border-border shadow-sm bg-card relative overflow-hidden">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-bold tracking-tight">{currentMonth} Overview</h2>
          </div>
          <div className="w-full md:w-64 h-10 opacity-30">
            <ScopeSparkline data={sparkData} color="emerald" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className={cn("p-4 rounded-2xl border border-border/40 bg-muted/20", stat.isPrimary && "border-emerald-500/30 bg-emerald-500/5")}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={cn("text-lg font-bold tracking-tight", stat.isPrimary && "text-emerald-600 dark:text-emerald-400")}>{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>Monthly Progress</span>
            <span className="text-foreground">{formatAmount(spentThisMonth)} / {formatAmount(currentBalance)}</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className={cn("h-full transition-all duration-700", percentage > 90 ? "bg-red-500" : "bg-emerald-500")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}