import React from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useBudgetStore, useFormatAmount } from '@/lib/store';
import { Bill } from '@shared/types';
import { Banknote, CheckCircle2, Circle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
}
export function BillCardSkeleton() {
  return (
    <div className={cn(
      "relative p-6 rounded-2xl overflow-hidden",
      "backdrop-blur-xl bg-gradient-to-br from-card/60 to-muted/40 border border-border/20"
    )}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-6 rounded-md" />
      </div>
    </div>
  );
}
export function BillCard({ bill, onEdit }: BillCardProps) {
  const updateBill = useBudgetStore(state => state.updateBill);
  const formatAmount = useFormatAmount();
  const handlePaidToggle = (checked: boolean) => {
    updateBill(bill.id, { paid: checked });
  };
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative p-6 rounded-2xl overflow-hidden shadow-lg group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300",
        "backdrop-blur-xl bg-gradient-to-br from-card/60 to-muted/40 border border-border/20",
        bill.paid && "opacity-60"
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={cn('p-2 rounded-lg', bill.paid ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-rose-100 dark:bg-rose-900/50')}>
            <Banknote className={cn('w-6 h-6', bill.paid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{bill.name}</h3>
            <p className="text-sm font-bold text-muted-foreground">{formatAmount(bill.amount)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id={`paid-${bill.id}`} checked={bill.paid} onCheckedChange={handlePaidToggle} className="h-6 w-6" />
          <Label htmlFor={`paid-${bill.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {bill.paid ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-muted-foreground" />}
          </Label>
        </div>
      </div>
      {bill.paid && (
        <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px] rounded-2xl" />
      )}
    </motion.div>
  );
}