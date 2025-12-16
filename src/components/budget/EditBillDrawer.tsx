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
  const onFullSubmit = async (data: BillFormData) => {
    if (!bill) return;
    await updateBill(bill.id, data);
    toast.success(`Bill "${data.name}" updated.`);
    onOpenChange(false);
  };
  const handleDeleteBill = async () => {
    if (!bill) return;
    await deleteBill(bill.id);
    toast.success(`Bill "${bill.name}" deleted.`);
    onOpenChange(false);
  };
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full w-full max-w-sm mt-0 ml-auto rounded-none border-l border-border/20">
        <div className="mx-auto w-full h-full flex flex-col bg-background">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle className="font-black tracking-tighter text-2xl">Edit Bill</DrawerTitle>
            <DrawerDescription>Update details for "{bill?.name || '...'}".</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit(onFullSubmit)} className="p-4 pt-0 flex-grow flex flex-col space-y-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-label ml-1">Bill Name</Label>
                <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} className="h-12 rounded-2xl" />} />
                {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-label ml-1">Monthly Amount</Label>
                <Controller name="amount" control={control} render={({ field }) => (
                  <Input {...field} id="amount" type="number" step="0.01" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-12 rounded-2xl" />
                )} />
                {errors.amount && <p className="text-red-500 text-xs mt-1 ml-1">{errors.amount.message}</p>}
              </div>
              <div className="flex items-center space-x-3 p-4 bg-muted/20 rounded-2xl border border-border/10">
                <Controller name="paid" control={control} render={({ field }) => (
                  <Checkbox id="paid" checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 rounded-lg" />
                )} />
                <Label htmlFor="paid" className="text-sm font-bold cursor-pointer">Mark as settled for this month</Label>
              </div>
            </div>
            <DrawerFooter className="flex-shrink-0 flex-row items-center gap-2 p-0 mt-auto pb-8">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.div variants={shakeVariants} whileHover="hover">
                    <Button size="icon" variant="ghost" className="h-12 w-12 text-destructive hover:bg-red-500/10 rounded-2xl" type="button">
                      <Trash2 className="w-6 h-6" />
                    </Button>
                  </motion.div>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem] shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-black tracking-tighter text-2xl">Delete Bill?</AlertDialogTitle>
                    <AlertDialogDescription className="font-medium">
                      This will permanently remove the "{bill?.name}" bill. History is kept for archives.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2 pt-4">
                    <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteBill} className="bg-destructive hover:bg-destructive/90 rounded-2xl">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button type="submit" className="btn-premium flex-1 h-14 shadow-glow">
                <Save className="w-4 h-4 mr-2" />Save Changes
              </Button>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}