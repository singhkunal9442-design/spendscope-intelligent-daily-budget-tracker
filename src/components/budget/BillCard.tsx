import React from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useBudgetStore, useFormatAmount } from '@/lib/store';
import { Bill } from '@shared/types';
import { Banknote } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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
  const handlePaidToggle = async (checked: boolean) => {
    // Optimistic toast feedback
    const amountStr = formatAmount(bill.amount);
    try {
      // updateBill in store now handles currentBalance adjustment via updateSettings
      await updateBill(bill.id, { paid: checked });
      if (checked) {
        toast.success(`Bill Settled: ${amountStr} deducted from live balance`);
      } else {
        toast.info(`Bill Unmarked: ${amountStr} restored to live balance`);
      }
    } catch (e) {
      toast.error("Failed to sync bill status with balance");
    }
  };
  return (
    <motion.div
      layout
      onClick={() => onEdit(bill)}
      whileHover={{ scale: 1.01, y: -2 }}
      className={cn(
        "group relative p-8 rounded-3xl bg-card border transition-all duration-300 cursor-pointer overflow-hidden",
        bill.paid 
          ? "border-emerald-500/20 shadow-inner bg-emerald-500/[0.02] opacity-80" 
          : "border-border/40 shadow-glass hover:shadow-xl"
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={cn(
            'p-4 rounded-2xl border transition-all duration-500',
            bill.paid 
              ? 'bg-emerald-500/20 border-emerald-500/30 shadow-lg shadow-emerald-500/10 grayscale-0' 
              : 'bg-muted/30 border-border/10 grayscale'
          )}>
            <Banknote className={cn(
              'w-6 h-6 transition-colors',
              bill.paid ? 'text-emerald-500' : 'text-muted-foreground/40'
            )} />
          </div>
          <div>
            <h3 className={cn(
              "font-black text-xl tracking-tighter leading-none mb-1.5 transition-colors",
              bill.paid ? "text-muted-foreground" : "text-foreground"
            )}>{bill.name}</h3>
            <div className="flex items-center gap-1.5">
              <span className="text-label">Monthly</span>
              <span className={cn(
                "text-sm font-black transition-colors",
                bill.paid ? "text-muted-foreground/60" : "text-foreground"
              )}>{formatAmount(bill.amount)}</span>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all z-10",
            bill.paid 
              ? "bg-emerald-500/10 border-emerald-500/20" 
              : "bg-muted/20 border-border/20 hover:border-spendscope-500/40"
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
      {/* Decorative background for settled bills */}
      {bill.paid && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-emerald-500/[0.03] pointer-events-none z-0" 
        />
      )}
    </motion.div>
  );
}