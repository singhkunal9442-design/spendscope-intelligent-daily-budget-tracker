import React, { useEffect, useState, useMemo } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore, ScopeWithIcon, useFormatAmount, useTransactionsForScope } from '@/lib/store';
import { Save, X, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getScopeColorClasses } from '@/lib/utils';
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
const shakeVariants = {
  hover: {
    scale: [1, 1.1, 0.9, 1.05, 1],
    rotate: [0, 2, -2, 1, -1, 0],
    transition: { duration: 0.4 }
  }
};
const SpendingStats = ({ scope, spentToday, spentAllTime }: { scope: ScopeWithIcon; spentToday: number; spentAllTime: number; }) => {
  const formatAmount = useFormatAmount();
  const colors = getScopeColorClasses(scope.color);
  const remaining = scope.dailyLimit - spentToday;
  const percentage = scope.dailyLimit > 0 ? Math.min((spentToday / scope.dailyLimit) * 100, 100) : 0;
  const getProgressColorClass = (p: number) => {
    if (p > 90) return 'bg-red-500';
    if (p > 70) return 'bg-amber-500';
    return colors.bg;
  };
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={cn("relative p-4 rounded-2xl overflow-hidden shadow-md", "backdrop-blur-xl bg-gradient-to-br from-card/60 to-muted/40 border border-border/20")}>
        <CardContent className="p-0 space-y-3">
          <div>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Spent Today</span>
              <span className="font-bold text-foreground">{formatAmount(spentToday)} / {formatAmount(scope.dailyLimit)}</span>
            </div>
            <Progress value={percentage} className={cn("h-2 mt-1", getProgressColorClass(percentage))} />
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
                <span className="font-bold">{formatAmount(spentAllTime)}</span>
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
  const deleteTransaction = useBudgetStore(state => state.deleteTransaction);
  const formatAmount = useFormatAmount();
  const transactionsForScope = useTransactionsForScope(scope?.id ?? '');
  const recentTransactions = useMemo(() => {
    return [...transactionsForScope]
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
      .slice(0, 5);
  }, [transactionsForScope]);
  const spentToday = useMemo(() => {
    return transactionsForScope
      .filter(t => isToday(parseISO(t.date)))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactionsForScope]);
  const spentAllTime = useMemo(() => {
    return transactionsForScope.reduce((sum, t) => sum + t.amount, 0);
  }, [transactionsForScope]);
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
  const handleDeleteScope = () => {
    if (!scope) return;
    deleteScope(scope.id);
    toast.success(`Category "${scope.name}" deleted.`);
    onOpenChange(false);
  };
  return (
    <Drawer open={open} onOpenChange={handleOpenChange} direction="right">
      <DrawerContent className="h-full w-full max-w-sm mt-0 ml-auto rounded-none border-l border-border/20">
        <div className="mx-auto w-full h-full flex flex-col bg-background">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>Edit Category</DrawerTitle>
            <DrawerDescription>Update details for "{scope?.name || '...'}".</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pt-0 space-y-4">
            {scope ? <SpendingStats scope={scope} spentToday={spentToday} spentAllTime={spentAllTime} /> : <div className="h-24 w-full bg-muted animate-pulse rounded-2xl" />}
            <Accordion type="multiple" className="w-full space-y-2">
              <AccordionItem value="add-edit-tx" className="border-none">
                <Card className="backdrop-blur-xl bg-card/60 border-border/20 rounded-2xl">
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
                          <Controller name="amount" control={miniControl} render={({ field }) => (
                              <Input {...field} id="mini-amount" type="number" step="0.01" placeholder="Amount" value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-10 rounded-xl" />
                          )} />
                        </div>
                        <div>
                          <Controller name="description" control={miniControl} render={({ field }) => (
                              <Input {...field} id="mini-desc" placeholder="Note" value={field.value || ''} className="h-10 rounded-xl" />
                          )} />
                        </div>
                      </div>
                      <Button type="submit" size="sm" className="btn-premium w-full h-10">
                        {editingTxId ? 'Update Expense' : 'Add Expense'}
                      </Button>
                      {editingTxId && <Button type="button" size="sm" variant="ghost" className="w-full mt-2 rounded-xl" onClick={() => setEditingTxId(null)}>Cancel Edit</Button>}
                    </form>
                  </AccordionContent>
                </Card>
              </AccordionItem>
              <AccordionItem value="recent-tx" className="border-none">
                <Card className="backdrop-blur-xl bg-card/60 border-border/20 rounded-2xl">
                  <AccordionTrigger className="p-3 text-sm font-medium hover:no-underline">
                    <span>Recent Transactions</span>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0">
                    <div className="space-y-2">
                      <AnimatePresence>
                        {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                          <motion.div key={tx.id} layout className="group flex items-center justify-between p-2 bg-muted/50 rounded-xl">
                            <div className="min-w-0 pr-2">
                              <p className="text-sm font-medium">{formatAmount(tx.amount)}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{tx.description || format(parseISO(tx.date), 'p')}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingTxId(tx.id)}><Edit className="w-4 h-4" /></Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                  <AlertDialogHeader><AlertDialogTitle>Delete?</AlertDialogTitle><AlertDialogDescription>Delete this {formatAmount(tx.amount)} expense?</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter><AlertDialogCancel className="rounded-xl">No</AlertDialogCancel><AlertDialogAction onClick={() => deleteTransaction(tx.id)} className="bg-destructive hover:bg-destructive/90 rounded-xl">Yes</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </motion.div>
                        )) : <p className="text-xs text-muted-foreground text-center py-2">Empty.</p>}
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
                <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} className="rounded-xl" />} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dailyLimit">Daily Limit</Label>
                  <Controller name="dailyLimit" control={control} render={({ field }) => (
                      <Input {...field} id="dailyLimit" type="number" step="0.01" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="rounded-xl" />
                  )} />
                </div>
                <div>
                  <Label htmlFor="monthlyLimit">Monthly Limit</Label>
                  <Controller name="monthlyLimit" control={control} render={({ field }) => (
                      <Input {...field} id="monthlyLimit" type="number" step="0.01" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="rounded-xl" />
                  )} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Controller name="icon" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Icon" /></SelectTrigger>
                      <SelectContent className="rounded-xl">{iconPresets.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Controller name="color" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Color" /></SelectTrigger>
                      <SelectContent className="rounded-xl">{colorPresets.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
            </div>
            <DrawerFooter className="flex-shrink-0 flex-row items-center gap-2 pt-4 border-t border-border/10">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.div variants={shakeVariants} whileHover="hover" className="mr-auto">
                    <Button size="icon" variant="ghost" className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl" type="button">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Delete "{scope?.name}"? Transactions will be preserved.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteScope} className="bg-destructive hover:bg-destructive/90 rounded-xl">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DrawerClose asChild><Button variant="outline" className="rounded-xl">Cancel</Button></DrawerClose>
              <Button type="submit" className="btn-premium h-11 px-6">
                <Save className="w-4 h-4 mr-2" />Save
              </Button>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}