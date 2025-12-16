import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Scope } from '@/types/domain';
import { useSpentToday } from '@/lib/store';
interface ScopeCardProps {
  scope: Scope;
}
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
export function ScopeCard({ scope }: ScopeCardProps) {
  const spentToday = useSpentToday(scope.id);
  const remaining = scope.dailyLimit - spentToday;
  const percentage = scope.dailyLimit > 0 ? (spentToday / scope.dailyLimit) * 100 : 0;
  const getProgressColor = () => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };
  const Icon = scope.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative p-6 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border/20 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {typeof Icon === 'string' ? (
              <span className="text-2xl">{Icon}</span>
            ) : (
              <Icon className="w-6 h-6 text-muted-foreground" />
            )}
            <h3 className="text-lg font-semibold text-foreground">{scope.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Daily Limit: {currencyFormatter.format(scope.dailyLimit)}
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
          <span className={cn('font-bold', remaining < 0 ? 'text-red-500' : 'text-emerald-500')}>
            {currencyFormatter.format(remaining)}
          </span>
        </div>
        <Progress value={percentage} indicatorClassName={getProgressColor()} />
      </div>
    </motion.div>
  );
}