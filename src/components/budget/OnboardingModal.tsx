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
    localStorage.setItem('spendscope-onboarded', 'true');
    onClose();
  };
  const handleSkip = () => {
    setCurrentBalance(0);
    setCurrentSalary(0);
    localStorage.setItem('spendscope-onboarded', 'true');
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <DialogContent className="sm:max-w-md glass-dark border-white/10 text-white" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
            <PiggyBank className="w-8 h-8 text-spendscope-500" /> 
            Welcome to SpendScope!
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-base">
            Set your starting balance and monthly salary for the most accurate overview. You can change this later in Settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="balance" className="text-zinc-200 font-bold">Starting Balance</Label>
              <Controller
                name="balance"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="balance"
                    type="number"
                    step="0.01"
                    className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 h-12 text-lg"
                    placeholder="e.g., 1000"
                    value={field.value || ''}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              {errors.balance && <p className="text-red-400 text-sm mt-1">{errors.balance.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary" className="text-zinc-200 font-bold">Monthly Salary</Label>
              <Controller
                name="salary"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="salary"
                    type="number"
                    step="0.01"
                    className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 h-12 text-lg"
                    placeholder="e.g., 3000"
                    value={field.value || ''}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              {errors.salary && <p className="text-red-400 text-sm mt-1">{errors.salary.message}</p>}
            </div>
          </div>
          <DialogFooter className="pt-4 flex items-center justify-between w-full">
            <Button type="button" variant="ghost" onClick={handleSkip} className="text-zinc-400 hover:text-white hover:bg-white/5">
              Skip for now
            </Button>
            <Button type="submit" className="btn-spendscope px-8">
              Save and Get Started
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}