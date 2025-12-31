import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Landmark, FileWarning, Wallet, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFormatAmount, useSpentThisMonth, useCurrentBalance, useCurrentSalary, useMonthlyBudget, useTransactions } from '@/lib/store';
import { subDays, format, parseISO } from 'date-fns';
import { ScopeSparkline } from '@/components/charts/ScopeSparkline';
import { Skeleton } from '@/components/ui/skeleton';
export function MonthlyOverviewCardSkeleton() {
  return (
    <div className="p-8 rounded-3xl border bg-card shadow-glass animate-pulse space-y-8">
      <div className="flex justify-between items-center"><Skeleton className="h-8 w-40" /><Skeleton className="h-10 w-32 rounded-lg" /></div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
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
    { label: 'Starting', value: formatAmount(currentBalance), icon: Landmark },
    { label: 'Total Spent', value: formatAmount(spentThisMonth), icon: FileWarning },
    { label: 'Salary', value: formatAmount(currentSalary), icon: Wallet },
    { label: 'Monthly Budget', value: formatAmount(monthlyBudget), icon: Target },
    { label: 'Available', value: formatAmount(availableCash), icon: availableCash < 0 ? TrendingDown : TrendingUp, isPrimary: true },
  ];
  return (
    <div className="p-10 rounded-[2.5rem] border border-border/50 shadow-glass bg-card/80 backdrop-blur-md relative overflow-hidden group">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-spendscope-500" />
            <h2 className="text-2xl font-black tracking-tighter">{currentMonth} Overview</h2>
          </div>
          <div className="w-full md:w-80 h-14 opacity-40 group-hover:opacity-60 transition-opacity">
            <ScopeSparkline data={sparkData} color="emerald" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={cn(
              "p-5 rounded-2xl border border-border/40 transition-all duration-300",
              stat.isPrimary ? "bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5" : "bg-muted/10 hover:bg-muted/20"
            )}>
              <p className="text-label mb-2">{stat.label}</p>
              <p className={cn(
                "text-2xl font-black tracking-tighter",
                stat.isPrimary ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
              )}>{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <div className="space-y-1">
              <p className="text-label">Monthly Efficiency</p>
              <p className="text-sm font-bold text-muted-foreground">
                <span className="text-foreground">{formatAmount(spentThisMonth)}</span> used of <span className="text-foreground">{formatAmount(currentBalance)}</span>
              </p>
            </div>
            <p className="text-lg font-black text-foreground">{Math.round(percentage)}%</p>
          </div>
          <div className="h-3 w-full bg-muted/40 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                percentage > 90 ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]" : "bg-spendscope-500 shadow-[0_0_12px_rgba(243,128,32,0.4)]"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}