import React, { useEffect, useState, useMemo } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore, ScopeWithIcon, useFormatAmount, useTransactions } from '@/lib/store';
import { Save, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn, getScopeColorClasses } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, parseISO, isToday } from 'date-fns';
const iconPresets = ['Coffee', 'ShoppingCart', 'Utensils', 'Car', 'Home', 'CreditCard', 'DollarSign', 'Gift', 'Heart', 'Plane', 'BookOpen', 'Briefcase', 'Film', 'Gamepad2', 'Music'];
const colorPresets = ['emerald', 'sky', 'amber', 'rose', 'violet', 'indigo', 'cyan', 'fuchsia'];
const scopeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dailyLimit: z.number().min(0, 'Limit must be non-negative'),
  monthlyLimit: z.number().min(0, 'Limit must be non-negative').optional(),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
});
type ScopeFormData = z.infer<typeof scopeSchema>;
const expenseMiniSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be positive'),
  description: z.string().optional(),
});
type ExpenseMiniFormData = z.infer<typeof expenseMiniSchema>;
interface EditScopeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: ScopeWithIcon | null;
}
const SpendingStats = ({ scope, spentToday }: { scope: ScopeWithIcon; spentToday: number; }) => {
  const formatAmount = useFormatAmount();
  const colors = getScopeColorClasses(scope.color);
  const remaining = scope.dailyLimit - spentToday;
  const percentage = scope.dailyLimit > 0 ? Math.min((spentToday / scope.dailyLimit) * 100, 100) : 0;
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="relative p-5 rounded-3xl overflow-hidden glass shadow-glass border border-border/20">
        <CardContent className="p-0 space-y-4">
          <div>
            <div className="flex justify-between text-label mb-2">
              <span className="text-muted-foreground/60">Daily Usage</span>
              <span className="text-foreground">{formatAmount(spentToday)} / {formatAmount(scope.dailyLimit)}</span>
            </div>
            <div className="h-3 w-full bg-muted/20 rounded-full overflow-hidden p-0.5 border border-border/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className={cn("h-full rounded-full transition-all", percentage > 90 ? 'bg-red-500' : colors.bg)}
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-label">Available Scope</span>
              <motion.span
                className={cn('text-lg font-black tracking-tighter', remaining < 0 ? 'text-red-500' : 'text-emerald-500')}
                animate={{ scale: [1, 1.05, 1] }}
                key={remaining}
              >
                {formatAmount(remaining)}
              </motion.span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
export function EditScopeDrawer({ open, onOpenChange, scope }: EditScopeDrawerProps) {
  const updateScopeFull = useBudgetStore(state => state.updateScopeFull);
  const deleteScope = useBudgetStore(state => state.deleteScope);
  const addTransaction = useBudgetStore(state => state.addTransaction);
  const updateTransaction = useBudgetStore(state => state.updateTransaction);
  const formatAmount = useFormatAmount();
  const transactions = useTransactions();
  const transactionsForScope = useMemo(() =>
    transactions.filter(t => t.scopeId === scope?.id),
    [transactions, scope?.id]
  );
  const spentToday = useMemo(() =>
    transactionsForScope.filter(t => isToday(parseISO(t.date))).reduce((sum, t) => sum + t.amount, 0),
    [transactionsForScope]
  );
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const { control, handleSubmit, reset } = useForm<ScopeFormData>({
    resolver: zodResolver(scopeSchema),
  });
  const { control: miniControl, handleSubmit: miniHandleSubmit, reset: resetMiniForm, setValue: setMiniValue } = useForm<ExpenseMiniFormData>({
    resolver: zodResolver(expenseMiniSchema),
    defaultValues: { amount: 0, description: '' },
  });
  useEffect(() => {
    if (scope) {
      reset({
        name: scope.name,
        dailyLimit: scope.dailyLimit,
        monthlyLimit: scope.monthlyLimit ?? scope.dailyLimit * 30,
        icon: scope.iconName,
        color: scope.color,
      });
    }
  }, [scope, reset]);
  const onFullSubmit = async (data: ScopeFormData) => {
    if (!scope) return;
    await updateScopeFull(scope.id, data);
    toast.success("Category updated");
    onOpenChange(false);
  };
  const onMiniSubmit = async (data: ExpenseMiniFormData) => {
    if (!scope) return;
    if (editingTxId) {
      await updateTransaction(editingTxId, data);
      toast.success(`Updated expense`);
      setEditingTxId(null);
    } else {
      await addTransaction({ ...data, scopeId: scope.id });
      toast.success(`Logged ${formatAmount(data.amount)}`);
    }
    resetMiniForm();
  };
  const handleDeleteScope = async () => {
    if (!scope) return;
    await deleteScope(scope.id);
    toast.success(`Deleted category ${scope.name}`);
    onOpenChange(false);
  };
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full w-full max-w-sm mt-0 ml-auto rounded-none border-l border-border/20">
        <div className="mx-auto w-full h-full flex flex-col bg-background">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle className="font-black tracking-tighter text-2xl">Scope Settings</DrawerTitle>
            <DrawerDescription>Edit details for {scope?.name || '...'}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pt-0 space-y-4 overflow-y-auto pb-20">
            {scope && <SpendingStats scope={scope} spentToday={spentToday} />}
            <Accordion type="multiple" defaultValue={['recent-tx']} className="w-full space-y-2">
              <AccordionItem value="add-edit-tx" className="border-none">
                <Card className="glass rounded-2xl overflow-hidden shadow-sm">
                  <AccordionTrigger className="p-4 text-xs font-black uppercase tracking-widest hover:no-underline">
                    <div className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4" />
                      <span>Quick Add Expense</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0">
                    <form onSubmit={miniHandleSubmit(onMiniSubmit)} className="space-y-4">
                      <Controller name="amount" control={miniControl} render={({ field }) => (
                        <div className="space-y-1">
                          <Label className="text-label ml-1">Amount</Label>
                          <Input {...field} type="number" step="0.01" value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-12 rounded-2xl" />
                        </div>
                      )} />
                      <Controller name="description" control={miniControl} render={({ field }) => (
                        <div className="space-y-1">
                          <Label className="text-label ml-1">Note</Label>
                          <Input {...field} placeholder="Lunch, coffee, etc." value={field.value || ''} className="h-12 rounded-2xl" />
                        </div>
                      )} />
                      <Button type="submit" className="btn-premium w-full h-12 shadow-glow">
                        Log Expense
                      </Button>
                    </form>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>
            <form onSubmit={handleSubmit(onFullSubmit)} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label className="text-label ml-1">Name</Label>
                <Controller name="name" control={control} render={({ field }) => <Input {...field} className="h-12 rounded-2xl" />} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-label ml-1">Daily Limit</Label>
                  <Controller name="dailyLimit" control={control} render={({ field }) => <Input {...field} type="number" step="0.01" className="h-12 rounded-2xl" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />} />
                </div>
                <div className="space-y-2">
                  <Label className="text-label ml-1">Icon</Label>
                  <Controller name="icon" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="Icon" /></SelectTrigger>
                      <SelectContent className="max-h-[200px]">{iconPresets.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-label ml-1">Color Theme</Label>
                <Controller name="color" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="Color" /></SelectTrigger>
                    <SelectContent className="max-h-[200px]">{colorPresets.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>
              <div className="flex items-center gap-2 pt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-12 w-12 text-destructive hover:bg-red-500/10 rounded-2xl">
                      <Trash2 className="w-6 h-6" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-black tracking-tighter">Delete Category?</AlertDialogTitle>
                      <AlertDialogDescription>History is preserved. Confirm deletion of {scope?.name}?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteScope} className="bg-destructive hover:bg-destructive/90 rounded-2xl">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button type="submit" className="btn-premium flex-1 h-12">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}