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
    <div className="p-8 rounded-3xl border bg-card shadow-glass animate-pulse space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-12 w-full rounded-xl" />
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
    if (percentage > 90) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]';
    if (percentage > 70) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
    return `bg-${scope.color}-500 shadow-[0_0_8px_rgba(var(--${scope.color}-rgb),0.3)]`;
  };
  const Icon = scope.icon;
  return (
    <motion.div
      layout
      onClick={() => onEdit(scope)}
      whileHover={{ scale: 1.01, y: -2 }}
      className="group relative p-8 rounded-3xl bg-card border border-border/40 shadow-glass hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-2 bg-muted/80 backdrop-blur rounded-xl text-muted-foreground hover:text-foreground border border-border/20 shadow-sm">
          <Pencil className="w-4 h-4" />
        </div>
      </div>
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className={cn(
            'p-3.5 rounded-2xl shadow-sm border border-border/10',
            `bg-${scope.color}-50/50 dark:bg-${scope.color}-950/30`
          )}>
            <Icon className={cn('w-6 h-6', `text-${scope.color}-600 dark:text-${scope.color}-400`)} />
          </div>
          <div>
            <h3 className="font-black text-xl text-foreground tracking-tighter leading-none mb-1.5">{scope.name}</h3>
            <div className="flex items-center gap-1.5">
              <span className="text-label">Limit</span>
              <span className="text-xs font-black text-muted-foreground/80">{formatAmount(scope.dailyLimit)}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-label mb-1">Spent Today</p>
          <p className="font-black text-xl tracking-tighter text-foreground">{formatAmount(spentToday)}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-label">Remaining</span>
          <span className={cn(
            'text-lg font-black tracking-tighter',
            remaining < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
          )}>
            {formatAmount(remaining)}
          </span>
        </div>
        <Progress value={percentage} className={cn("h-2 bg-muted/30 rounded-full", getProgressColor())} />
      </div>
      <div className="mt-6 h-12 w-full opacity-70 group-hover:opacity-100 transition-opacity">
        <ScopeSparkline data={sparkData} color={scope.color} />
      </div>
    </motion.div>
  );
}