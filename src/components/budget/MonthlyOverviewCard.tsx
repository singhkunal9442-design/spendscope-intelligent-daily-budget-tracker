import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, PiggyBank, Banknote, Landmark, FileWarning } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useBudgetStore, useFormatAmount, useMonthlyBudget, useSpentThisMonth, useCurrentBalance, useTotalBillsDue, useTotalBillsPaid } from '@/lib/store';
import { subDays, format, parseISO } from 'date-fns';
import { ScopeSparkline } from '@/components/charts/ScopeSparkline';
import { Skeleton } from '@/components/ui/skeleton';
export function MonthlyOverviewCardSkeleton() {
  return (
    <div className={cn(
      "relative p-6 rounded-2xl overflow-hidden shadow-lg mb-12",
      "backdrop-blur-xl bg-gradient-to-br from-card/60 to-muted/40 border border-border/20"
    )}>
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-center gap-3"><Skeleton className="h-7 w-7" /><Skeleton className="h-8 w-1/2" /></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4"><Skeleton className="h-20 rounded-lg" /><Skeleton className="h-20 rounded-lg" /><div className="col-span-2 sm:col-span-1"><Skeleton className="h-20 rounded-lg" /></div></div>
          <div className="pt-2"><Skeleton className="h-3 w-full" /></div>
        </div>
        <div className="w-full md:w-1/3 h-24 md:h-auto md:self-stretch"><Skeleton className="h-full w-full" /></div>
      </div>
    </div>
  );
}
export function MonthlyOverviewCard() {
  const transactions = useBudgetStore(state => state.transactions);
  const formatAmount = useFormatAmount();
  const monthlyBudget = useMonthlyBudget();
  const spentThisMonth = useSpentThisMonth();
  const currentBalance = useCurrentBalance();
  const totalBillsDue = useTotalBillsDue();
  const totalBillsPaid = useTotalBillsPaid();
  const totalIncome = monthlyBudget + currentBalance;
  const totalOutgoings = spentThisMonth + totalBillsDue + totalBillsPaid;
  const remaining = totalIncome - totalOutgoings;
  const sparkData = useMemo(() => {
    const now = new Date();
    const daily: Record<string, number> = {};
    transactions.forEach(t => { const day = format(parseISO(t.date), 'yyyy-MM-dd'); daily[day] = (daily[day] || 0) + t.amount; });
    return Array.from({ length: 30 }, (_, i) => { const date = subDays(now, 29 - i); const dayKey = format(date, 'yyyy-MM-dd'); return { date: format(date, 'MMM d'), spent: daily[dayKey] || 0 }; });
  }, [transactions]);
  const percentage = totalIncome > 0 ? Math.min((totalOutgoings / totalIncome) * 100, 100) : 0;
  const getProgressColor = () => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        "relative p-6 rounded-2xl overflow-hidden shadow-lg group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 mb-12",
        "backdrop-blur-xl bg-gradient-to-br from-card/60 to-muted/40 border border-border/20"
      )}
    >
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3"><Calendar className="w-6 h-6 text-primary" /><h2 className="text-2xl font-bold text-foreground">Monthly Overview</h2></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center md:text-left">
            <div className="p-3 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-2"><Landmark className="w-4 h-4" /> Balance</p><p className="text-xl font-bold text-foreground">{formatAmount(currentBalance)}</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-2"><PiggyBank className="w-4 h-4" /> Budgets</p><p className="text-xl font-bold text-foreground">{formatAmount(monthlyBudget)}</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-2"><FileWarning className="w-4 h-4" /> Bills Due</p><p className="text-xl font-bold text-foreground">{formatAmount(totalBillsDue)}</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-2"><Banknote className="w-4 h-4" /> Spent</p><p className="text-xl font-bold text-foreground">{formatAmount(spentThisMonth + totalBillsPaid)}</p></div>
            <div className="p-3 rounded-lg bg-muted/50 col-span-2 sm:col-span-2"><p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-2"><TrendingUp className="w-4 h-4" /> Net Remaining</p><p className={cn("text-xl font-bold", remaining < 0 ? 'text-red-500' : 'text-emerald-500')}>{formatAmount(remaining)}</p></div>
          </div>
          <div className="pt-2">
            <Progress value={percentage} className={cn("h-3", getProgressColor())} />
          </div>
        </div>
        <div className="w-full md:w-1/3 h-24 md:h-auto md:self-stretch"><ScopeSparkline data={sparkData} color="emerald" /></div>
      </div>
    </motion.div>
  );
}