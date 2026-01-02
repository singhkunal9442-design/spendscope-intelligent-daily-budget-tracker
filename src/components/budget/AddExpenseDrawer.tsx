import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore, useFormatAmount } from '@/lib/store';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
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
  const formatAmount = useFormatAmount();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      scopeId: '',
      amount: 0,
      description: '',
    },
  });
  const onSubmit = async (data: ExpenseFormData) => {
    await addTransaction(data);
    const scopeName = scopes.find(s => s.id === data.scopeId)?.name || 'Category';
    toast.success(`${formatAmount(data.amount)} added to ${scopeName}${data.description ? ` - ${data.description}` : ''}`);
    reset();
    onOpenChange(false);
  };
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="font-black tracking-tighter text-2xl">Add Expense</DrawerTitle>
            <DrawerDescription>Log a new transaction for today.</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 pb-0 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="scopeId" className="text-label ml-1">Category</Label>
              <Controller
                name="scopeId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>{scopes.map((scope) => (<SelectItem key={scope.id} value={scope.id}>{scope.name}</SelectItem>))}</SelectContent>
                  </Select>
                )}
              />
              {errors.scopeId && <p className="text-red-500 text-xs mt-1 ml-1">{errors.scopeId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-label ml-1">Amount</Label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="amount" type="number" step="0.01" placeholder="0.00" value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-12 rounded-2xl" />
                )}
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1 ml-1">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-label ml-1">Description (Optional)</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="description" placeholder="e.g., Lunch" value={field.value || ''} className="h-12 rounded-2xl" />
                )}
              />
            </div>
            <DrawerFooter className="gap-2 px-0 pb-8 pt-4">
              <Button type="submit" className="btn-premium h-14 w-full">
                <Plus className="w-5 h-5 mr-2" />
                Add Transaction
              </Button>
              <DrawerClose asChild><Button variant="outline" className="rounded-2xl h-12">Cancel</Button></DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}