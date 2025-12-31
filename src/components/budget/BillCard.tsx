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
    <div className="relative p-6 rounded-[2rem] overflow-hidden glass shadow-glass">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
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
      onClick={() => onEdit(bill)}
      whileHover={{ scale: 1.02 }}
      className="relative p-6 rounded-[2rem] overflow-hidden glass shadow-soft group hover:shadow-glow transition-all duration-300 cursor-pointer"
    >
      <div className="relative z-10">
        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="p-2 glass rounded-xl text-muted-foreground hover:text-foreground">
            <Pencil className="w-4 h-4" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={cn(
              'p-3 rounded-2xl transition-colors', 
              bill.paid ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-spendscope-50 dark:bg-spendscope-500/10'
            )}>
              <Banknote className={cn(
                'w-6 h-6', 
                bill.paid ? 'text-emerald-600 dark:text-emerald-400' : 'text-spendscope-500'
              )} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{bill.name}</h3>
              <p className="text-sm font-black text-muted-foreground">{formatAmount(bill.amount)}</p>
            </div>
          </div>
          <div 
            className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox 
              id={`paid-${bill.id}`} 
              checked={bill.paid} 
              onCheckedChange={handlePaidToggle} 
              className="h-5 w-5 border-2 border-spendscope-500 data-[state=checked]:bg-spendscope-500" 
            />
            <Label htmlFor={`paid-${bill.id}`} className="text-sm font-bold cursor-pointer">
              Paid
            </Label>
          </div>
        </div>
      </div>
      {bill.paid && (
        <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-[2px] rounded-[2rem] pointer-events-none z-0" />
      )}
    </motion.div>
  );
}