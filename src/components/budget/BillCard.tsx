import React from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useBudgetStore, useFormatAmount } from '@/lib/store';
import { Bill } from '@shared/types';
import { Banknote, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
}
export function BillCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border bg-card shadow-sm animate-pulse flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-5 w-5 rounded" />
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
      onClick={() => onEdit(bill)}
      whileHover={{ scale: 1.01 }}
      className="group relative p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-1.5 bg-muted rounded-md text-muted-foreground hover:text-foreground border shadow-sm">
          <Pencil className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={cn(
            'p-3 rounded-xl border border-border/10',
            bill.paid ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-muted/50'
          )}>
            <Banknote className={cn(
              'w-5 h-5',
              bill.paid ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <h3 className="font-bold text-foreground leading-tight">{bill.name}</h3>
            <p className="text-sm font-bold text-muted-foreground">{formatAmount(bill.amount)}</p>
          </div>
        </div>
        <div
          className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-xl border border-border/10"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            id={`paid-${bill.id}`}
            checked={bill.paid}
            onCheckedChange={handlePaidToggle}
            className="h-4 w-4 border-muted-foreground/30"
          />
          <Label htmlFor={`paid-${bill.id}`} className="text-xs font-bold cursor-pointer text-muted-foreground uppercase">
            Paid
          </Label>
        </div>
      </div>
      {bill.paid && (
        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none z-0" />
      )}
    </motion.div>
  );
}