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
      <DialogContent className="sm:max-w-md glass-dark border-white/10 text-white rounded-[2rem]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-3xl font-black tracking-tighter">
            <div className="p-2 rounded-2xl bg-spendscope-500 shadow-glow">
              <PiggyBank className="w-8 h-8 text-white" />
            </div>
            Welcome!
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-base font-medium mt-2">
            Set your current financial baseline. This initializes your daily spending "Scope" for the month.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="balance" className="text-zinc-300 font-black uppercase tracking-widest text-[10px] ml-1">Starting Balance</Label>
              <Controller
                name="balance"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="balance"
                    type="number"
                    step="0.01"
                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 h-14 rounded-2xl text-xl font-black tracking-tighter"
                    placeholder="e.g. 1000"
                    value={field.value || ''}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              {errors.balance && <p className="text-red-400 text-sm mt-1">{errors.balance.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary" className="text-zinc-300 font-black uppercase tracking-widest text-[10px] ml-1">Monthly Salary</Label>
              <Controller
                name="salary"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="salary"
                    type="number"
                    step="0.01"
                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 h-14 rounded-2xl text-xl font-black tracking-tighter"
                    placeholder="e.g. 3000"
                    value={field.value || ''}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              {errors.salary && <p className="text-red-400 text-sm mt-1">{errors.salary.message}</p>}
            </div>
          </div>
          <DialogFooter className="pt-4 flex items-center justify-between gap-4">
            <Button type="button" variant="ghost" onClick={handleSkip} className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-2xl h-12 flex-1">
              Skip
            </Button>
            <Button type="submit" className="btn-premium h-14 px-8 flex-[2] text-lg shadow-glow">
              Get Started
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}