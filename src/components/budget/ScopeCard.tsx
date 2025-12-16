import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useBudgetStore, useSpentToday, ScopeWithIcon } from '@/lib/store';
import { subDays, format, parseISO } from 'date-fns';
import { ScopeSparkline } from '@/components/charts/ScopeSparkline';
import { Pencil } from 'lucide-react';
interface ScopeCardProps {
  scope: ScopeWithIcon;
  onEdit: (scope: ScopeWithIcon) => void;
}
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
export function ScopeCard({ scope, onEdit }: ScopeCardProps) {
  const spentToday = useSpentToday(scope.id);
  const transactions = useBudgetStore(state => state.transactions);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative p-6 rounded-2xl overflow-hidden shadow-lg group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer",
        "backdrop-blur-xl bg-gradient-to-br from-card/60 to-muted/40 border border-border/20"
      )}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0, scale: 0 }}
        whileHover={{ opacity: 1, scale: 1 }}
        className="absolute top-3 right-3 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100"
      >
        <Pencil className="w-3 h-3" />
        Edit
      </motion.div>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', `bg-${scope.color}-100 dark:bg-${scope.color}-900/50`)}>
              <Icon className={cn('w-6 h-6', `text-${scope.color}-600 dark:text-${scope.color}-400`)} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{scope.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Limit: {currencyFormatter.format(scope.dailyLimit)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Spent</p>
          <p className="text-lg font-bold text-foreground">
            {currencyFormatter.format(spentToday)}
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-muted-foreground">Remaining</span>
          <motion.span
            className={cn('font-bold', remaining < 0 ? 'text-red-500' : `text-${scope.color}-600 dark:text-${scope.color}-400`)}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
            key={remaining}
          >
            {currencyFormatter.format(remaining)}
          </motion.span>
        </div>
        <Progress value={percentage} className={cn("h-2", getProgressColor())} />
      </div>
      <div className="mt-4 h-10 w-full">
        <ScopeSparkline data={sparkData} color={scope.color} />
      </div>
    </motion.div>
  );
}