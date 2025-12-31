import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Landmark,
  FileWarning,
  Wallet,
  Target
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  useFormatAmount,
  useSpentThisMonth,
  useCurrentBalance,
  useCurrentSalary,
  useMonthlyBudget,
  useTransactions
} from '@/lib/store';
import { subDays, format, parseISO } from 'date-fns';
import { ScopeSparkline } from '@/components/charts/ScopeSparkline';
import { Skeleton } from '@/components/ui/skeleton';
export function MonthlyOverviewCardSkeleton() {
  return (
    <div className="relative p-6 rounded-[2rem] overflow-hidden glass shadow-glass mb-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-center gap-3"><Skeleton className="h-7 w-7" /><Skeleton className="h-8 w-1/2" /></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <div className="pt-2"><Skeleton className="h-3 w-full" /></div>
        </div>
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
  const isOverBudget = spentThisMonth > monthlyBudget && monthlyBudget > 0;
  const getProgressColor = () => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-spendscope-500 shadow-glow';
    return 'bg-emerald-500';
  };
  const stats = [
    {
      label: 'Starting Balance',
      value: formatAmount(currentBalance),
      icon: Landmark,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/10'
    },
    {
      label: `Spent ${currentMonth}`,
      value: formatAmount(spentThisMonth),
      icon: FileWarning,
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-900/10'
    },
    {
      label: 'Monthly Salary',
      value: formatAmount(currentSalary),
      icon: Wallet,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-900/10'
    },
    {
      label: 'Budget Limit',
      value: formatAmount(monthlyBudget),
      icon: Target,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/10'
    },
    {
      label: 'Available Cash',
      value: formatAmount(availableCash),
      icon: availableCash < 0 ? TrendingDown : TrendingUp,
      color: availableCash < 0 ? 'text-red-500' : 'text-spendscope-500',
      bg: availableCash < 0 ? 'bg-red-50 dark:bg-red-900/10' : 'bg-spendscope-50 dark:bg-spendscope-500/10',
      isPrimary: true
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] overflow-hidden glass shadow-glass group hover:shadow-glow transition-all duration-500 mb-12 border-2 border-white/40 dark:border-white/5"
    >
      <div className="flex flex-col gap-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-spendscope-500/10 ring-1 ring-spendscope-500/20">
              <Calendar className="w-7 h-7 text-spendscope-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-foreground tracking-tight">Overview</h2>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{currentMonth} Spending Velocity</p>
            </div>
          </div>
          <div className="w-full md:w-80 h-16 opacity-80 group-hover:opacity-100 transition-opacity">
            <ScopeSparkline data={sparkData} color="emerald" />
          </div>
        </div>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 10 },
                visible: { opacity: 1, scale: 1, y: 0 }
              }}
              className={cn(
                "p-5 rounded-3xl border border-border/10 transition-all duration-300 hover:scale-105 shadow-sm",
                stat.bg,
                stat.isPrimary && "col-span-2 sm:col-span-1 md:col-span-1 border-spendscope-500/30 ring-2 ring-spendscope-500/10 bg-gradient-to-br from-spendscope-500/5 to-transparent shadow-glow"
              )}
            >
              <div className="flex flex-col gap-3">
                <div className={cn("p-2 rounded-xl w-fit", stat.color, "bg-background/60 shadow-sm")}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground/80 mb-1">{stat.label}</p>
                  <p className={cn(
                    "text-xl font-black tracking-tighter truncate",
                    stat.isPrimary ? "text-2xl text-spendscope-600 dark:text-spendscope-400" : "text-foreground"
                  )}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div className="pt-4 space-y-3">
          <div className="flex justify-between items-end text-sm font-black text-muted-foreground">
            <span className="flex items-center gap-2">
              {isOverBudget ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-spendscope-500" />
              )}
              <span className="uppercase tracking-widest text-[10px]">Budget Progress</span>
            </span>
            <span className="font-mono text-foreground tracking-tighter text-lg">
              {formatAmount(spentThisMonth)} <span className="text-muted-foreground/40 font-normal">/</span> {formatAmount(currentBalance)}
            </span>
          </div>
          <div className="relative h-3 w-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn("h-full rounded-full transition-all duration-1000", getProgressColor())} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}