import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore } from '@/lib/store';
import { PiggyBank } from 'lucide-react';
const balanceSchema = z.object({
  balance: z.number().min(0, 'Balance must be non-negative'),
});
type BalanceFormData = z.infer<typeof balanceSchema>;
interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}
export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const setCurrentBalance = useBudgetStore(state => state.setCurrentBalance);
  const { control, handleSubmit, formState: { errors } } = useForm<BalanceFormData>({
    resolver: zodResolver(balanceSchema),
    defaultValues: { balance: 0 },
  });
  const onSubmit = (data: BalanceFormData) => {
    setCurrentBalance(data.balance);
    onClose();
  };
  const handleSkip = () => {
    setCurrentBalance(0);
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <DialogContent className="sm:max-w-[425px] glassmorphic" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><PiggyBank className="w-6 h-6 text-primary" /> Welcome to SpendScope!</DialogTitle>
          <DialogDescription>
            Set your starting monthly balance to get the most accurate overview. You can skip this and set it later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="balance" className="text-right">Balance</Label>
            <div className="col-span-3">
              <Controller
                name="balance"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="balance"
                    type="number"
                    step="0.01"
                    className="w-full"
                    placeholder="e.g., 1000"
                    value={field.value || ''}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              {errors.balance && <p className="text-red-500 text-sm mt-1 col-span-4 text-right">{errors.balance.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleSkip}>Skip</Button>
            <Button type="submit">Save Balance</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}