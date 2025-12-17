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
const onboardingSchema = z.object({
  balance: z.number().min(0, 'Balance must be non-negative'),
  salary: z.number().min(0, 'Salary must be non-negative'),
});
type OnboardingFormData = z.infer<typeof onboardingSchema>;
interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}
export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const setCurrentBalance = useBudgetStore(state => state.setCurrentBalance);
  const setCurrentSalary = useBudgetStore(state => state.setCurrentSalary);
  const { control, handleSubmit, formState: { errors } } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { balance: 0, salary: 0 },
  });
  const onSubmit = (data: OnboardingFormData) => {
    setCurrentBalance(data.balance);
    setCurrentSalary(data.salary);
    onClose();
  };
  const handleSkip = () => {
    setCurrentBalance(0);
    setCurrentSalary(0);
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <DialogContent className="sm:max-w-md glassmorphic" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><PiggyBank className="w-6 h-6 text-primary" /> Welcome to SpendScope!</DialogTitle>
          <DialogDescription>
            Set your starting balance and monthly salary for the most accurate overview. You can skip this and set it later in Settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="balance">Starting Balance</Label>
              <Controller
                name="balance"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 1000"
                    value={field.value || ''}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              {errors.balance && <p className="text-red-500 text-sm mt-1">{errors.balance.message}</p>}
            </div>
            <div>
              <Label htmlFor="salary">Monthly Salary</Label>
              <Controller
                name="salary"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="salary"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 3000"
                    value={field.value || ''}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary.message}</p>}
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={handleSkip}>Skip</Button>
            <Button type="submit">Save and Continue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}