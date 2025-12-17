import React, { useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore } from '@/lib/store';
import { Bill } from '@shared/types';
import { Save, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
const billSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().min(0.01, 'Amount must be positive'),
  paid: z.boolean(),
});
type BillFormData = z.infer<typeof billSchema>;
interface EditBillDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill | null;
}
const shakeVariants = {
  hover: {
    scale: [1, 1.1, 0.9, 1.05, 1],
    rotate: [0, 2, -2, 1, -1, 0],
    transition: { duration: 0.4 }
  }
};
export function EditBillDrawer({ open, onOpenChange, bill }: EditBillDrawerProps) {
  const updateBill = useBudgetStore(state => state.updateBill);
  const deleteBill = useBudgetStore(state => state.deleteBill);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
  });
  useEffect(() => {
    if (bill) {
      reset({
        name: bill.name,
        amount: bill.amount,
        paid: bill.paid,
      });
    } else {
      reset({ name: '', amount: 0, paid: false });
    }
  }, [bill, reset]);
  const onFullSubmit = (data: BillFormData) => {
    if (!bill) return;
    updateBill(bill.id, data);
    toast.success(`Bill "${data.name}" updated.`);
    onOpenChange(false);
  };
  const handleDeleteBill = () => {
    if (!bill) return;
    deleteBill(bill.id);
    toast.success(`Bill "${bill.name}" deleted.`);
    onOpenChange(false);
  };
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };
  return (
    <Drawer open={open} onOpenChange={handleOpenChange} direction="right">
      <DrawerContent className="h-full w-full max-w-sm mt-0 ml-auto rounded-none">
        <div className="mx-auto w-full h-full flex flex-col">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>Edit Bill</DrawerTitle>
            <DrawerDescription>Update details for "{bill?.name || '...'}".</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit(onFullSubmit)} className="p-4 pt-0 flex-grow flex flex-col space-y-4">
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
              <div>
                <Label htmlFor="name">Bill Name</Label>
                <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} />} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Controller name="amount" control={control} render={({ field }) => (
                  <Input {...field} id="amount" type="number" step="0.01" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                )} />
                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <Controller name="paid" control={control} render={({ field }) => (
                  <Checkbox id="paid" checked={field.value} onCheckedChange={field.onChange} />
                )} />
                <Label htmlFor="paid">Mark as paid for this month</Label>
              </div>
            </div>
            <DrawerFooter className="flex-shrink-0 flex-row items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.div variants={shakeVariants} whileHover="hover" className="mr-auto">
                    <Button size="lg" variant="ghost" className="h-10 w-10 text-destructive hover:text-destructive/80" type="button">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Bill?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the "{bill?.name}" bill. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteBill} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DrawerClose asChild><Button variant="outline"><X className="w-4 h-4 mr-2" />Cancel</Button></DrawerClose>
              <Button type="submit" className="bg-gradient-to-r from-primary to-slate-700 text-white hover:from-primary/90 transition-all hover:scale-105 active:scale-95">
                <Save className="w-4 h-4 mr-2" />Save Changes
              </Button>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}