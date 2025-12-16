import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore } from '@/lib/store';
import { toast } from 'sonner';
const expenseSchema = z.object({
  scopeId: z.string().min(1, 'Please select a category'),
  amount: z.number().min(0.01, 'Amount must be positive'),
  description: z.string().optional(),
});
type ExpenseFormData = z.infer<typeof expenseSchema>;
interface AddExpenseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function AddExpenseDrawer({ open, onOpenChange }: AddExpenseDrawerProps) {
  const scopes = useBudgetStore(state => state.scopes);
  const addTransaction = useBudgetStore(state => state.addTransaction);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      scopeId: '',
      amount: 0,
      description: '',
    },
  });
  const onSubmit = (data: ExpenseFormData) => {
    addTransaction(data);
    const scopeName = scopes.find(s => s.id === data.scopeId)?.name || 'Category';
    toast.success(`$${data.amount.toFixed(2)} added to ${scopeName}${data.description ? ` - ${data.description}` : ''}`);
    reset();
    onOpenChange(false);
  };
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add Expense</DrawerTitle>
            <DrawerDescription>Log a new transaction for today.</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 pb-0 space-y-4">
            <div>
              <Label htmlFor="scopeId">Category</Label>
              <Controller
                name="scopeId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>{scopes.map((scope) => (<SelectItem key={scope.id} value={scope.id}>{scope.name}</SelectItem>))}</SelectContent>
                  </Select>
                )}
              />
              {errors.scopeId && <p className="text-red-500 text-sm mt-1">{errors.scopeId.message}</p>}
            </div>
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="amount" type="number" step="0.01" placeholder="e.g., 12.50" value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                )}
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="description" placeholder="e.g., Morning latte" value={field.value || ''} />
                )}
              />
            </div>
            <DrawerFooter>
              <Button type="submit">Add Transaction</Button>
              <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}