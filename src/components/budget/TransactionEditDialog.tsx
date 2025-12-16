import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore } from '@/lib/store';
import { Transaction } from '@shared/types';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
const transactionEditSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be positive'),
  description: z.string().optional(),
});
type TransactionEditFormData = z.infer<typeof transactionEditSchema>;
interface TransactionEditDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function TransactionEditDialog({ transaction, open, onOpenChange }: TransactionEditDialogProps) {
  const updateTransaction = useBudgetStore(state => state.updateTransaction);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TransactionEditFormData>({
    resolver: zodResolver(transactionEditSchema),
  });
  useEffect(() => {
    if (transaction) {
      reset({
        amount: transaction.amount,
        description: transaction.description || '',
      });
    } else {
      reset({ amount: 0, description: '' });
    }
  }, [transaction, reset]);
  const onSubmit = (data: TransactionEditFormData) => {
    if (!transaction) return;
    updateTransaction(transaction.id, data);
    toast.success('Transaction updated successfully.');
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glassmorphic">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Make changes to your transaction here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3">
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="amount"
                    type="number"
                    step="0.01"
                    className="w-full"
                    value={field.value || ''}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1 col-span-4 text-right">{errors.amount.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <div className="col-span-3">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="description"
                    className="w-full"
                    placeholder="e.g., Lunch with team"
                    value={field.value || ''}
                  />
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}