import React, { useEffect, useState, useMemo } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore, ScopeWithIcon, useFormatAmount } from '@/lib/store';
import { Save, X, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
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
const SpendingStats = ({ scope, spentToday, spentAllTime }: { scope: ScopeWithIcon; spentToday: number; spentAllTime: number; }) => {
  const formatAmount = useFormatAmount();
  const remaining = scope.dailyLimit - spentToday;
  const percentage = scope.dailyLimit > 0 ? Math.min((spentToday / scope.dailyLimit) * 100, 100) : 0;
  const allTimeSpent = spentAllTime;
  const getProgressColor = (p: number) => {
    if (p > 90) return 'bg-red-500';
    if (p > 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={cn("relative p-4 rounded-xl overflow-hidden shadow-md", "backdrop-blur-xl bg-gradient-to-br from-card/60 to-muted/40 border border-border/20")}>
        <CardContent className="p-0 space-y-3">
          <div>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Spent Today</span>
              <span className="font-bold text-foreground">{formatAmount(spentToday)} / {formatAmount(scope.dailyLimit)}</span>
            </div>
            <Progress value={percentage} className={cn("h-2 mt-1", getProgressColor(percentage))} />
            <div className="flex justify-between text-sm font-medium pt-1">
              <span className="text-muted-foreground">Remaining Today</span>
              <motion.span className={cn('font-bold', remaining < 0 ? 'text-red-500' : 'text-emerald-500')} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.3 }} key={remaining}>
                {formatAmount(remaining)}
              </motion.span>
            </div>
          </div>
          <div className="border-t border-border/50 pt-2">
             <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Lifetime Spent</span>
                <span className="font-bold">{formatAmount(allTimeSpent)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
const SpendingStatsSkeleton = () => (
  <Card className={cn("relative p-4 rounded-xl overflow-hidden", "backdrop-blur-xl bg-gradient-to-br from-card/60 to-muted/40 border border-border/20")}>
    <CardContent className="p-0 space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-24" /></div>
        <Skeleton className="h-2 w-full" />
        <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></div>
      </div>
      <div className="border-t border-border/50 pt-2 mt-3">
        <div className="flex justify-between"><Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-20" /></div>
      </div>
    </CardContent>
  </Card>
);
export function EditScopeDrawer({ open, onOpenChange, scope }: EditScopeDrawerProps) {
  const updateScopeFull = useBudgetStore(state => state.updateScopeFull);
  const addTransaction = useBudgetStore(state => state.addTransaction);
  const updateTransaction = useBudgetStore(state => state.updateTransaction);
  const deleteTransaction = useBudgetStore(state => state.deleteTransaction);
  const transactions = useBudgetStore(state => state.transactions);
  const formatAmount = useFormatAmount();
  const recentTransactions = useMemo(() => {
    if (!scope?.id) return [];
    return transactions
      .filter(t => t.scopeId === scope.id)
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
      .slice(0, 5);
  }, [transactions, scope?.id]);
  const spentToday = useMemo(() => {
    if (!scope?.id) return 0;
    return transactions
      .filter(t => t.scopeId === scope.id && isToday(parseISO(t.date)))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, scope?.id]);
  const spentAllTime = useMemo(() => {
    if (!scope?.id) return 0;
    return transactions
      .filter(t => t.scopeId === scope.id)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, scope?.id]);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ScopeFormData>({
    resolver: zodResolver(scopeSchema),
  });
  const { control: miniControl, handleSubmit: miniHandleSubmit, reset: resetMiniForm, setValue: setMiniValue, formState: { errors: miniErrors } } = useForm<ExpenseMiniFormData>({
    resolver: zodResolver(expenseMiniSchema),
    defaultValues: { amount: 0, description: '' },
  });
  const editingTx = useMemo(() => {
    return recentTransactions.find(tx => tx.id === editingTxId) || null;
  }, [editingTxId, recentTransactions]);
  useEffect(() => {
    if (editingTx) {
      setMiniValue('amount', editingTx.amount);
      setMiniValue('description', editingTx.description || '');
    } else {
      resetMiniForm();
    }
  }, [editingTx, setMiniValue, resetMiniForm]);
  useEffect(() => {
    if (scope) {
      reset({
        name: scope.name,
        dailyLimit: scope.dailyLimit,
        monthlyLimit: scope.monthlyLimit ?? scope.dailyLimit * 30,
        icon: (scope.icon as any).displayName || 'Circle',
        color: scope.color,
      });
    } else {
      reset({ name: '', dailyLimit: 0, monthlyLimit: 0, icon: '', color: '' });
    }
  }, [scope, reset]);
  const onFullSubmit = (data: ScopeFormData) => {
    if (!scope) return;
    updateScopeFull(scope.id, data);
    onOpenChange(false);
  };
  const onMiniSubmit = (data: ExpenseMiniFormData) => {
    if (!scope) return;
    if (editingTxId) {
      updateTransaction(editingTxId, data);
      toast.success(`Transaction updated.`);
      setEditingTxId(null);
    } else {
      addTransaction({ ...data, scopeId: scope.id });
      toast.success(`${formatAmount(data.amount)} added to ${scope.name}`);
    }
    resetMiniForm();
  };
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      resetMiniForm();
      setEditingTxId(null);
    }
    onOpenChange(isOpen);
  };
  return (
    <Drawer open={open} onOpenChange={handleOpenChange} direction="right">
      <DrawerContent className="h-full w-full max-w-sm mt-0 ml-auto rounded-none">
        <div className="mx-auto w-full h-full flex flex-col">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>Edit Category</DrawerTitle>
            <DrawerDescription>Update details for "{scope?.name || '...'}".</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pt-0 space-y-4">
            {scope ? <SpendingStats scope={scope} spentToday={spentToday} spentAllTime={spentAllTime} /> : <SpendingStatsSkeleton />}
            <Accordion type="multiple" className="w-full space-y-2">
              <AccordionItem value="add-edit-tx" className="border-none">
                <Card className="backdrop-blur-xl bg-card/60 border-border/20">
                  <AccordionTrigger className="p-3 text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-2">
                      {editingTxId ? <Edit className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                      <span>{editingTxId ? 'Edit Expense' : 'Quick Add Expense'}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0">
                    <form onSubmit={miniHandleSubmit(onMiniSubmit)} className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="mini-amount" className="sr-only">Amount</Label>
                          <Controller name="amount" control={miniControl} render={({ field }) => (
                              <Input {...field} id="mini-amount" type="number" step="0.01" placeholder="Amount" value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          )} />
                          {miniErrors.amount && <p className="text-red-500 text-xs mt-1">{miniErrors.amount.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor="mini-desc" className="sr-only">Description</Label>
                          <Controller name="description" control={miniControl} render={({ field }) => (
                              <Input {...field} id="mini-desc" placeholder="Description (opt.)" value={field.value || ''} />
                          )} />
                        </div>
                      </div>
                      <Button type="submit" size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 transition-all hover:scale-105 active:scale-95">{editingTxId ? 'Update Expense' : 'Add Expense'}</Button>
                      {editingTxId && <Button type="button" size="sm" variant="ghost" className="w-full" onClick={() => setEditingTxId(null)}>Cancel Edit</Button>}
                    </form>
                  </AccordionContent>
                </Card>
              </AccordionItem>
              <AccordionItem value="recent-tx" className="border-none">
                <Card className="backdrop-blur-xl bg-card/60 border-border/20">
                  <AccordionTrigger className="p-3 text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span>Recent Transactions</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0">
                    <div className="space-y-2">
                      <AnimatePresence>
                        {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                          <motion.div key={tx.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium">{formatAmount(tx.amount)}</p>
                              <p className="text-xs text-muted-foreground">{tx.description || format(parseISO(tx.date), 'p')}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 bg-muted/50 rounded-md backdrop-blur transition-all">
                              <motion.div whileHover={{ scale: 1.1, rotate: [0, 2, -2, 0] }}>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTxId(tx.id)}><Edit className="w-4 h-4" /></Button>
                              </motion.div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <motion.div whileHover={{ scale: 1.1, rotate: [0, 2, -2, 0] }}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></Button>
                                  </motion.div>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>Delete this transaction of {formatAmount(tx.amount)}?</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteTransaction(tx.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </motion.div>
                        )) : <p className="text-xs text-muted-foreground text-center py-2">No recent transactions.</p>}
                      </AnimatePresence>
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>
          </div>
          <form onSubmit={handleSubmit(onFullSubmit)} className="p-4 pt-0 flex-grow flex flex-col space-y-4">
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} />} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dailyLimit">Daily Limit</Label>
                  <Controller name="dailyLimit" control={control} render={({ field }) => (
                      <Input {...field} id="dailyLimit" type="number" step="0.01" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                  )} />
                  {errors.dailyLimit && <p className="text-red-500 text-sm mt-1">{errors.dailyLimit.message}</p>}
                </div>
                <div>
                  <Label htmlFor="monthlyLimit">Monthly Limit</Label>
                  <Controller name="monthlyLimit" control={control} render={({ field }) => (
                      <Input {...field} id="monthlyLimit" type="number" step="0.01" placeholder="e.g., 150" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                  )} />
                  {errors.monthlyLimit && <p className="text-red-500 text-sm mt-1">{errors.monthlyLimit.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Controller name="icon" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select Icon" /></SelectTrigger>
                    <SelectContent>{iconPresets.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.icon && <p className="text-red-500 text-sm mt-1">{errors.icon.message}</p>}
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Controller name="color" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select Color" /></SelectTrigger>
                    <SelectContent>{colorPresets.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>}
              </div>
            </div>
            <DrawerFooter className="flex-shrink-0">
              <Button type="submit" className="bg-gradient-to-r from-primary to-slate-700 text-white hover:from-primary/90 transition-all hover:scale-105 active:scale-95">
                <Save className="w-4 h-4 mr-2" />Save Changes
              </Button>
              <DrawerClose asChild><Button variant="outline"><X className="w-4 h-4 mr-2" />Cancel</Button></DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}