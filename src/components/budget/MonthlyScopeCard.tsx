import React, { useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { cn, getScopeColorClasses } from '@/lib/utils';
import { useTransactions, useSpentThisMonth, ScopeWithIcon, useFormatAmount } from '@/lib/store';
import { subDays, format, parseISO } from 'date-fns';
import { ScopeSparkline } from '@/components/charts/ScopeSparkline';
import { Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
interface MonthlyScopeCardProps {
  scope: ScopeWithIcon;
  onEdit: (scope: ScopeWithIcon) => void;
  isLoading?: boolean;
}
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 20 } as const
  },
  exit: { opacity: 0, y: -20 }
};
export function MonthlyScopeCardSkeleton() {
  return (
    <div className={cn(
      "relative p-6 rounded-2xl overflow-hidden",
      "backdrop-blur-xl bg-gradient-to-br from-card/60 to-muted/40 border border-border/20"
    )}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
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
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  );
}
export function MonthlyScopeCard({ scope, onEdit, isLoading }: MonthlyScopeCardProps) {
  const spentThisMonth = useSpentThisMonth(scope.id);
  const transactions = useTransactions();
  const formatAmount = useFormatAmount();
  const colors = getScopeColorClasses(scope.color);
  const sparkData = useMemo(() => {
    const now = new Date();
    const daily: Record<string, number> = {};
    transactions
      .filter(t => t.scopeId === scope.id)
      .forEach(t => {
        const day = format(parseISO(t.date), 'yyyy-MM-dd');
        daily[day] = (daily[day] || 0) + t.amount;
      });
    return Array.from({ length: 30 }, (_, i) => {
      const date = subDays(now, 29 - i);
      const dayKey = format(date, 'yyyy-MM-dd');
      return { date: format(date, 'MMM d'), spent: daily[dayKey] || 0 };
    });
  }, [scope.id, transactions]);
  if (isLoading) {
    return <MonthlyScopeCardSkeleton />;
  }
  const monthlyLimit = scope.monthlyLimit ?? scope.dailyLimit * 30;
  const remaining = monthlyLimit - spentThisMonth;
  const percentage = monthlyLimit > 0 ? Math.min((spentThisMonth / monthlyLimit) * 100, 100) : 0;
  const getProgressColor = () => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-spendscope-500 shadow-[0_0_8px_rgba(243,128,32,0.4)]';
    return colors.bg;
  };
  const Icon = scope.icon;
  return (
    <motion.div
      layout
      onClick={() => onEdit(scope)}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "relative p-6 rounded-2xl overflow-hidden shadow-lg group hover:shadow-glow hover:-translate-y-1 transition-all duration-300 cursor-pointer",
        "backdrop-blur-xl bg-gradient-to-br from-card/60 to-muted/40 border border-border/20"
      )}
    >
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/90 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 shadow-lg">
        <Pencil className="w-3 h-3" />
        Edit
      </div>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg shadow-sm', colors.lightBg)}>
              <Icon className={cn('w-6 h-6', colors.text)} />
            </div>
            <h3 className="text-lg font-bold text-foreground tracking-tight">{scope.name}</h3>
          </div>
          <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
            Monthly: {formatAmount(monthlyLimit)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Total Spent</p>
          <p className="text-lg font-bold text-foreground tracking-tighter">
            {formatAmount(spentThisMonth)}
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-sm font-bold">
          <span className="text-muted-foreground">Remaining</span>
          <motion.span
            className={cn('font-black tracking-tighter', remaining < 0 ? 'text-red-500' : 'text-emerald-500')}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
            key={remaining}
          >
            {formatAmount(remaining)}
          </motion.span>
        </div>
        <Progress value={percentage} className={cn("h-2 rounded-full bg-muted/30 overflow-hidden", getProgressColor())} />
      </div>
      <div className="mt-4 h-10 w-full opacity-60 group-hover:opacity-100 transition-opacity">
        <ScopeSparkline data={sparkData} color={scope.color} />
      </div>
    </motion.div>
  );
}