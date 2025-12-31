import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore } from '@/lib/store';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
const billSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().min(0.01, 'Amount must be positive'),
});
type BillFormData = z.infer<typeof billSchema>;
interface AddBillDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function AddBillDrawer({ open, onOpenChange }: AddBillDrawerProps) {
  const addBill = useBudgetStore(state => state.addBill);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      name: '',
      amount: 0,
    },
  });
  const onSubmit = (data: BillFormData) => {
    addBill({ name: data.name, amount: data.amount });
    toast.success(`Bill "${data.name}" added.`);
    reset();
    onOpenChange(false);
  };
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Quick Add Bill</DrawerTitle>
            <DrawerDescription>Add a new recurring monthly bill.</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 pb-0 space-y-4">
            <div>
              <Label htmlFor="name">Bill Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="name" placeholder="e.g., Rent" className="rounded-xl" />
                )}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="amount" type="number" step="0.01" placeholder="0.00" value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="rounded-xl" />
                )}
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
            </div>
            <DrawerFooter className="gap-2">
              <Button type="submit" className="btn-premium h-12 w-full">
                <Plus className="w-5 h-5 mr-2" />
                Add Bill
              </Button>
              <DrawerClose asChild><Button variant="outline" className="rounded-2xl h-12">Cancel</Button></DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}