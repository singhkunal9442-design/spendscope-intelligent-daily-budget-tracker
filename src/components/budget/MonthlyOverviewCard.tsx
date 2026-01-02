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
    <div className="p-8 rounded-[2.5rem] border bg-card shadow-glass animate-pulse space-y-8">
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
  // Available Cash = Starting Balance - Spent so far this month
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
    { label: 'Starting Balance', value: formatAmount(currentBalance), icon: Landmark },
    { label: 'Total Spent', value: formatAmount(spentThisMonth), icon: FileWarning },
    { label: 'Salary', value: formatAmount(currentSalary), icon: Wallet },
    { label: 'Budget Cap', value: formatAmount(monthlyBudget), icon: Target },
    { label: 'Available Cash', value: formatAmount(availableCash), icon: availableCash < 0 ? TrendingDown : TrendingUp, isPrimary: true },
  ];
  return (
    <div className="p-8 md:p-12 rounded-[3rem] border border-border/50 shadow-glass bg-card/80 backdrop-blur-md relative overflow-hidden group">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-spendscope-500/10 border border-spendscope-500/20">
              <Calendar className="w-8 h-8 text-spendscope-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter">{currentMonth} Overview</h2>
              <p className="text-label mt-1">Real-time Financial Vitals</p>
            </div>
          </div>
          <div className="w-full md:w-80 h-16 opacity-30 group-hover:opacity-60 transition-all duration-700 hover:scale-105">
            <ScopeSparkline data={sparkData} color="emerald" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-5 rounded-3xl border border-border/20 transition-all duration-300",
                stat.isPrimary
                  ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                  : "bg-muted/10 hover:bg-muted/20"
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <stat.icon className={cn("w-4 h-4", stat.isPrimary ? "text-emerald-500" : "text-muted-foreground/60")} />
                <p className="text-label leading-none">{stat.label}</p>
              </div>
              <p className={cn(
                "text-2xl font-black tracking-tighter",
                stat.isPrimary ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
              )}>{stat.value}</p>
            </motion.div>
          ))}
        </div>
        <div className="space-y-5">
          <div className="flex justify-between items-end px-1">
            <div className="space-y-1">
              <p className="text-label">Spending Efficiency</p>
              <p className="text-sm font-bold text-muted-foreground">
                <span className="text-foreground">{formatAmount(spentThisMonth)}</span> utilized of <span className="text-foreground">{formatAmount(currentBalance)}</span>
              </p>
            </div>
            <p className="text-2xl font-black text-foreground tracking-tighter">{Math.round(percentage)}%</p>
          </div>
          <div className="h-4 w-full bg-muted/30 rounded-full overflow-hidden p-1 border border-border/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className={cn(
                "h-full rounded-full transition-all duration-1000 shadow-glow",
                percentage > 90 ? "bg-red-500" : "bg-gradient-to-r from-spendscope-500 to-emerald-500"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}