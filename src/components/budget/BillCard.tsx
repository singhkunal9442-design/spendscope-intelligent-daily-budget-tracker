import React from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useBudgetStore, useFormatAmount } from '@/lib/store';
import { Bill } from '@shared/types';
import { Banknote } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
}
export function BillCardSkeleton() {
  return (
    <div className="p-8 rounded-3xl border bg-card shadow-glass animate-pulse flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-6 w-6 rounded-lg" />
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
      whileHover={{ scale: 1.01, y: -2 }}
      className="group relative p-8 rounded-3xl bg-card border border-border/40 shadow-glass hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={cn(
            'p-4 rounded-2xl border border-border/10 transition-colors',
            bill.paid ? 'bg-emerald-500/10 border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'bg-muted/30 border-border/5'
          )}>
            <Banknote className={cn(
              'w-6 h-6',
              bill.paid ? 'text-emerald-500' : 'text-muted-foreground/60'
            )} />
          </div>
          <div>
            <h3 className="font-black text-xl text-foreground tracking-tighter leading-none mb-1.5">{bill.name}</h3>
            <div className="flex items-center gap-1.5">
              <span className="text-label">Amount</span>
              <span className="text-sm font-black text-foreground">{formatAmount(bill.amount)}</span>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all",
            bill.paid ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted/20 border-border/20"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            id={`paid-${bill.id}`}
            checked={bill.paid}
            onCheckedChange={handlePaidToggle}
            className="h-5 w-5 border-muted-foreground/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <Label htmlFor={`paid-${bill.id}`} className="text-label cursor-pointer select-none">
            {bill.paid ? 'Settled' : 'Unpaid'}
          </Label>
        </div>
      </div>
      {bill.paid && (
        <div className="absolute inset-0 bg-emerald-500/[0.03] pointer-events-none z-0" />
      )}
    </motion.div>
  );
}