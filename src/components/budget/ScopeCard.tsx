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
    <div className="p-6 rounded-2xl border bg-card shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-10 w-full rounded-md" />
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
    if (percentage > 70) return 'bg-amber-500';
    return `bg-${scope.color}-500`;
  };
  const Icon = scope.icon;
  return (
    <motion.div
      layout
      onClick={() => onEdit(scope)}
      whileHover={{ scale: 1.01 }}
      className="group relative p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-1.5 bg-muted rounded-md text-muted-foreground hover:text-foreground border shadow-sm">
          <Pencil className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={cn('p-2.5 rounded-xl shadow-sm border border-border/10', `bg-${scope.color}-50 dark:bg-${scope.color}-950/30`)}>
            <Icon className={cn('w-5 h-5', `text-${scope.color}-600 dark:text-${scope.color}-400`)} />
          </div>
          <div>
            <h3 className="font-bold text-foreground leading-tight">{scope.name}</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Limit: {formatAmount(scope.dailyLimit)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Spent</p>
          <p className="font-bold text-foreground">{formatAmount(spentToday)}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-muted-foreground">Remaining</span>
          <span className={cn(remaining < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400')}>
            {formatAmount(remaining)}
          </span>
        </div>
        <Progress value={percentage} className={cn("h-1.5 bg-muted/50 rounded-full", getProgressColor())} />
      </div>
      <div className="mt-4 h-10 w-full opacity-40 group-hover:opacity-80 transition-opacity">
        <ScopeSparkline data={sparkData} color={scope.color} />
      </div>
    </motion.div>
  );
}