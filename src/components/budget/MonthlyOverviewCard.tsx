import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  TrendingUp, 
  Landmark, 
  FileWarning, 
  Wallet, 
  Target 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  useBudgetStore, 
  useFormatAmount, 
  useSpentThisMonth, 
  useCurrentBalance, 
  useCurrentSalary, 
  useMonthlyBudget 
} from '@/lib/store';
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          <div className="pt-2"><Skeleton className="h-3 w-full" /></div>
        </div>
      </div>
    </div>
  );
}
export function MonthlyOverviewCard() {
  const transactions = useBudgetStore(state => state.transactions);
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
  const getProgressColor = () => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
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
      label: 'Monthly Budgets', 
      value: formatAmount(monthlyBudget), 
      icon: Target, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50 dark:bg-amber-900/10' 
    },
    { 
      label: 'Available Cash', 
      value: formatAmount(availableCash), 
      icon: TrendingUp, 
      color: availableCash < 0 ? 'text-red-500' : 'text-emerald-500', 
      bg: availableCash < 0 ? 'bg-red-50 dark:bg-red-900/10' : 'bg-emerald-50 dark:bg-emerald-900/10',
      isPrimary: true
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        "relative p-6 rounded-3xl overflow-hidden shadow-soft group hover:shadow-glow transition-all duration-500 mb-12",
        "backdrop-blur-xl bg-gradient-to-br from-card/80 to-muted/40 border border-border/20"
      )}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Overview</h2>
          </div>
          <div className="w-full md:w-64 h-12">
            <ScopeSparkline data={sparkData} color="emerald" />
          </div>
        </div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              className={cn(
                "p-4 rounded-2xl border border-border/10 transition-all duration-300 hover:scale-105",
                stat.bg,
                stat.isPrimary && "col-span-2 sm:col-span-1 md:col-span-1 border-primary/20"
              )}
            >
              <div className="flex flex-col gap-2">
                <div className={cn("p-1.5 rounded-lg w-fit", stat.color, "bg-background/40")}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80">{stat.label}</p>
                  <p className={cn(
                    "text-lg font-bold truncate",
                    stat.isPrimary ? "text-xl" : "text-foreground"
                  )}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div className="pt-2">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" />
              Spent vs. Starting ({currentMonth})
            </span>
            <span>{formatAmount(spentThisMonth)} / {formatAmount(currentBalance)}</span>
          </div>
          <Progress value={percentage} className={cn("h-2.5 rounded-full overflow-hidden bg-muted/30", getProgressColor())} />
        </div>
      </div>
    </motion.div>
  );
}