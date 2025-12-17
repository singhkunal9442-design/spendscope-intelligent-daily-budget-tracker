import React, { useState } from 'react';
import { useBudgetStore } from '@/lib/store';
import { Bill } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, Save, Trash2, PlusCircle, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { useFormatAmount } from '@/lib/store';
const billSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().min(0.01, 'Amount must be positive'),
});
type BillFormData = z.infer<typeof billSchema>;
const shakeVariants = {
  hover: {
    scale: [1, 1.1, 0.9, 1.05, 1],
    rotate: [0, 2, -2, 1, -1, 0],
    transition: { duration: 0.4 }
  }
};
const EditBillForm = ({ bill, onSave, onCancel }: { bill: Bill, onSave: (data: BillFormData) => void, onCancel: () => void }) => {
  const { control, handleSubmit } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: { name: bill.name, amount: bill.amount },
  });
  return (
    <form onSubmit={handleSubmit(onSave)} className="p-3 bg-muted/50 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller name="name" control={control} render={({ field }) => <Input placeholder="Bill Name" {...field} />} />
        <Controller name="amount" control={control} render={({ field }) => <Input type="number" placeholder="Amount" {...field} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X className="w-4 h-4 mr-1" />Cancel</Button>
        <Button type="submit" size="sm" className="bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 transition-all hover:scale-105 active:scale-95"><Save className="w-4 h-4 mr-1" />Save Changes</Button>
      </div>
    </form>
  );
};
export function BillManager() {
  const bills = useBudgetStore(state => state.bills);
  const addBill = useBudgetStore(state => state.addBill);
  const updateBill = useBudgetStore(state => state.updateBill);
  const deleteBill = useBudgetStore(state => state.deleteBill);
  const formatAmount = useFormatAmount();
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const { control, handleSubmit, reset } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: { name: '', amount: 0 },
  });
  const handleAddNewBill = (data: BillFormData) => {
    addBill(data);
    reset();
  };
  const handleSave = (billId: string, data: BillFormData) => {
    updateBill(billId, data);
    setEditingBillId(null);
  };
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Bill</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleAddNewBill)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <Controller name="name" control={control} render={({ field }) => <Input placeholder="Bill Name (e.g., Rent)" {...field} />} />
            <Controller name="amount" control={control} render={({ field }) => <Input type="number" placeholder="Monthly Amount" {...field} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />} />
            <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 transition-all hover:scale-105 active:scale-95"><PlusCircle className="w-4 h-4 mr-2" />Add Bill</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Manage Fixed Bills</CardTitle>
          <CardDescription>Edit or remove your recurring monthly bills.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bills.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                <PlusCircle className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Add your first fixed bill above.</p>
              </motion.div>
            )}
            {bills.map((bill) => (
              editingBillId === bill.id ? (
                <EditBillForm key={bill.id} bill={bill} onSave={(data) => handleSave(bill.id, data)} onCancel={() => setEditingBillId(null)} />
              ) : (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/60 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-[1.02]">
                  <div>
                    <span className="font-medium">{bill.name}</span>
                    <p className="text-sm text-muted-foreground">{formatAmount(bill.amount)} / month</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-100">
                    <Button size="lg" variant="ghost" onClick={() => setEditingBillId(bill.id)} className="h-10 w-10 min-w-[40px] rounded-lg hover:text-primary transition-colors"><Edit className="w-4 h-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <motion.div variants={shakeVariants} whileHover="hover">
                          <Button size="lg" variant="ghost" className="h-10 w-10 min-w-[40px] rounded-lg text-red-500 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></Button>
                        </motion.div>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete the "{bill.name}" bill.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteBill(bill.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}