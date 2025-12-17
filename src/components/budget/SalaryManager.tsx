import React from 'react';
import { useBudgetStore, useCurrentSalary, useFormatAmount } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, Save } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
const salarySchema = z.object({
  salary: z.number().min(0, 'Salary must be a non-negative number'),
});
type SalaryFormData = z.infer<typeof salarySchema>;
export function SalaryManager() {
  const currentSalary = useCurrentSalary();
  const setCurrentSalary = useBudgetStore(state => state.setCurrentSalary);
  const formatAmount = useFormatAmount();
  const { control, handleSubmit, formState: { errors } } = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      salary: currentSalary,
    },
  });
  const handleUpdateSalary = (data: SalaryFormData) => {
    setCurrentSalary(data.salary);
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Salary</CardTitle>
          <CardDescription>Set your estimated monthly salary or income to improve budget calculations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleUpdateSalary)} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-grow w-full">
                <Controller
                  name="salary"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 3000"
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        className="pl-10"
                      />
                    </div>
                  )}
                />
                {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary.message}</p>}
              </div>
              <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-primary to-slate-700 text-white hover:from-primary/90 transition-all hover:scale-105 active:scale-95">
                <Save className="w-4 h-4 mr-2" />
                Update Salary
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Current monthly salary is set to: <span className="font-bold text-foreground">{formatAmount(currentSalary)}</span>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}