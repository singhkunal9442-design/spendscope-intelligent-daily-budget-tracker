import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTransactions, useSpentToday, ScopeWithIcon, useFormatAmount } from '@/lib/store';
import { subDays, format, parseISO } from 'date-fns';
import { ScopeSparkline } from '@/components/charts/ScopeSparkline';
import { Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
interface ScopeCardProps {
  scope: ScopeWithIcon;
  onEdit: (scope: ScopeWithIcon) => void;
  isLoading?: boolean;
}
export function ScopeCardSkeleton() {
  return (
    <div className="relative p-6 rounded-[2rem] overflow-hidden glass shadow-glass">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-4 w-12 ml-auto" />
          <Skeleton className="h-6 w-16 ml-auto" />
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <div className="flex justify-between"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-12" /></div>
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  );
}
export function ScopeCard({ scope, onEdit, isLoading }: ScopeCardProps) {
  const spentToday = useSpentToday(scope.id);
  const transactions = useTransactions();
  const formatAmount = useFormatAmount();
  const sparkData = useMemo(() => {
    const now = new Date();
    const daily: Record<string, number> = {};
    transactions
      .filter(t => t.scopeId === scope.id)
      .forEach(t => {
        const day = format(parseISO(t.date), 'yyyy-MM-dd');
        daily[day] = (daily[day] || 0) + t.amount;
      });
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      const dayKey = format(date, 'yyyy-MM-dd');
      return { date: format(date, 'MMM d'), spent: daily[dayKey] || 0 };
    });
  }, [scope.id, transactions]);
  if (isLoading) return <ScopeCardSkeleton />;
  const remaining = scope.dailyLimit - spentToday;
  const percentage = scope.dailyLimit > 0 ? Math.min((spentToday / scope.dailyLimit) * 100, 100) : 0;
  const getProgressColor = () => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-spendscope-500';
    return `bg-${scope.color}-500`;
  };
  const Icon = scope.icon;
  return (
    <motion.div
      layout
      onClick={() => onEdit(scope)}
      whileHover={{ scale: 1.02, rotate: [0, 0.5, -0.5, 0] }}
      className="relative p-6 rounded-[2rem] overflow-hidden glass shadow-soft group hover:shadow-glow transition-all duration-300 cursor-pointer"
    >
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-2 glass rounded-xl text-muted-foreground hover:text-foreground">
          <Pencil className="w-4 h-4" />
        </div>
      </div>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-2xl transition-colors', `bg-${scope.color}-100 dark:bg-${scope.color}-900/50`)}>
              <Icon className={cn('w-6 h-6', `text-${scope.color}-600 dark:text-${scope.color}-400`)} />
            </div>
            <h3 className="text-lg font-bold text-foreground">{scope.name}</h3>
          </div>
          <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Limit: {formatAmount(scope.dailyLimit)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Spent</p>
          <p className="text-xl font-black text-foreground">{formatAmount(spentToday)}</p>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-sm font-bold">
          <span className="text-muted-foreground">Remaining Today</span>
          <motion.span
            className={cn('text-lg', remaining < 0 ? 'text-red-500' : 'text-spendscope-600')}
            animate={{ scale: [1, 1.1, 1] }}
            key={remaining}
          >
            {formatAmount(remaining)}
          </motion.span>
        </div>
        <Progress value={percentage} className={cn("h-2.5 rounded-full bg-muted/30 overflow-hidden", getProgressColor())} />
      </div>
      <div className="mt-4 h-12 w-full opacity-60 group-hover:opacity-100 transition-opacity">
        <ScopeSparkline data={sparkData} color={scope.color} />
      </div>
    </motion.div>
  );
}