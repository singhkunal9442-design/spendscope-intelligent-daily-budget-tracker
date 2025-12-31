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
import { Save, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
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
      <Card className={cn("relative p-5 rounded-3xl overflow-hidden shadow-glass", "backdrop-blur-xl bg-gradient-to-br from-card/60 to-muted/40 border border-border/20")}>
        <CardContent className="p-0 space-y-4">
          <div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
              <span className="text-muted-foreground/60">Daily Usage</span>
              <span className="text-foreground">{formatAmount(spentToday)} / {formatAmount(scope.dailyLimit)}</span>
            </div>
            <Progress value={percentage} className={cn("h-2.5 rounded-full overflow-hidden bg-muted/20", getProgressColorClass(percentage))} />
            <div className="flex justify-between items-center mt-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Available</span>
              <motion.span 
                className={cn('text-lg font-black tracking-tighter', remaining < 0 ? 'text-red-500' : 'text-emerald-500')} 
                animate={{ scale: [1, 1.05, 1] }} 
                transition={{ duration: 0.3 }} 
                key={remaining}
              >
                {formatAmount(remaining)}
              </motion.span>
            </div>
          </div>
          <div className="border-t border-border/10 pt-3">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Lifetime Spend</span>
                <span className="text-sm font-black tracking-tighter">{formatAmount(spentAllTime)}</span>
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
  const { control, handleSubmit, reset } = useForm<ScopeFormData>({
    resolver: zodResolver(scopeSchema),
  });
  const { control: miniControl, handleSubmit: miniHandleSubmit, reset: resetMiniForm, setValue: setMiniValue } = useForm<ExpenseMiniFormData>({
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
        icon: scope.iconName,
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
            <DrawerTitle className="font-black tracking-tighter text-2xl">Edit Category</DrawerTitle>
            <DrawerDescription>Update details for "{scope?.name || '...'}".</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pt-0 space-y-4">
            {scope ? <SpendingStats scope={scope} spentToday={spentToday} spentAllTime={spentAllTime} /> : <div className="h-24 w-full bg-muted animate-pulse rounded-2xl" />}
            <Accordion type="multiple" className="w-full space-y-2">
              <AccordionItem value="add-edit-tx" className="border-none">
                <Card className="backdrop-blur-xl bg-card/60 border-border/20 rounded-2xl overflow-hidden shadow-sm">
                  <AccordionTrigger className="p-4 text-xs font-black uppercase tracking-widest hover:no-underline">
                    <div className="flex items-center gap-2">
                      {editingTxId ? <Edit className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                      <span>{editingTxId ? 'Edit Expense' : 'Quick Add'}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0">
                    <form onSubmit={miniHandleSubmit(onMiniSubmit)} className="space-y-4">
                      <div className="grid gap-3">
                        <Controller name="amount" control={miniControl} render={({ field }) => (
                            <div className="space-y-1">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Amount</Label>
                              <Input {...field} type="number" step="0.01" placeholder="0.00" value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-12 rounded-2xl bg-muted/20 border-border/20" />
                            </div>
                        )} />
                        <Controller name="description" control={miniControl} render={({ field }) => (
                            <div className="space-y-1">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Note (Optional)</Label>
                              <Input {...field} placeholder="e.g. Snack" value={field.value || ''} className="h-12 rounded-2xl bg-muted/20 border-border/20" />
                            </div>
                        )} />
                      </div>
                      <Button type="submit" className="btn-premium w-full h-12 shadow-glow">
                        {editingTxId ? 'Update Expense' : 'Add Expense'}
                      </Button>
                      {editingTxId && <Button type="button" variant="ghost" className="w-full mt-2 rounded-2xl" onClick={() => setEditingTxId(null)}>Cancel Edit</Button>}
                    </form>
                  </AccordionContent>
                </Card>
              </AccordionItem>
              <AccordionItem value="recent-tx" className="border-none">
                <Card className="backdrop-blur-xl bg-card/60 border-border/20 rounded-2xl overflow-hidden shadow-sm">
                  <AccordionTrigger className="p-4 text-xs font-black uppercase tracking-widest hover:no-underline">
                    <span>Recent History</span>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0">
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                          <motion.div 
                            key={tx.id} 
                            layout 
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, x: -20 }}
                            className="group flex items-center justify-between p-3 bg-muted/40 rounded-2xl border border-border/10"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-sm font-black tracking-tighter">{formatAmount(tx.amount)}</p>
                              <p className="text-[10px] font-bold text-muted-foreground/60 truncate uppercase">{tx.description || format(parseISO(tx.date), 'p')}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted/60" onClick={() => setEditingTxId(tx.id)}><Edit className="w-3.5 h-3.5" /></Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-xl hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-3xl border-border/40 shadow-2xl">
                                  <AlertDialogHeader><AlertDialogTitle className="font-black tracking-tighter">Delete?</AlertDialogTitle><AlertDialogDescription className="font-medium">Delete this {formatAmount(tx.amount)} expense?</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter className="gap-2"><AlertDialogCancel className="rounded-2xl">No</AlertDialogCancel><AlertDialogAction onClick={() => deleteTransaction(tx.id)} className="bg-destructive hover:bg-destructive/90 rounded-2xl">Yes</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </motion.div>
                        )) : <p className="text-[10px] font-black text-muted-foreground/40 text-center py-4 uppercase tracking-widest">No recent transactions</p>}
                      </AnimatePresence>
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>
          </div>
          <form onSubmit={handleSubmit(onFullSubmit)} className="p-4 pt-0 flex-grow flex flex-col space-y-4">
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Category Name</Label>
                <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} className="h-12 rounded-2xl bg-muted/10 border-border/20" />} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyLimit" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Daily Limit</Label>
                  <Controller name="dailyLimit" control={control} render={({ field }) => (
                      <Input {...field} id="dailyLimit" type="number" step="0.01" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-12 rounded-2xl bg-muted/10 border-border/20" />
                  )} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyLimit" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Monthly Limit</Label>
                  <Controller name="monthlyLimit" control={control} render={({ field }) => (
                      <Input {...field} id="monthlyLimit" type="number" step="0.01" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-12 rounded-2xl bg-muted/10 border-border/20" />
                  )} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Icon</Label>
                  <Controller name="icon" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 rounded-2xl bg-muted/10 border-border/20"><SelectValue placeholder="Icon" /></SelectTrigger>
                      <SelectContent className="rounded-2xl max-h-[300px]">{iconPresets.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Theme</Label>
                  <Controller name="color" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 rounded-2xl bg-muted/10 border-border/20"><SelectValue placeholder="Color" /></SelectTrigger>
                      <SelectContent className="rounded-2xl">{colorPresets.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
            </div>
            <DrawerFooter className="flex-shrink-0 flex-row items-center gap-2 pt-6 border-t border-border/10">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.div variants={shakeVariants} whileHover="hover" className="mr-auto">
                    <Button size="icon" variant="ghost" className="h-12 w-12 text-destructive hover:bg-red-500/10 rounded-2xl" type="button">
                      <Trash2 className="w-6 h-6" />
                    </Button>
                  </motion.div>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl border-border/40 shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-black tracking-tighter text-2xl">Delete Category?</AlertDialogTitle>
                    <AlertDialogDescription className="font-medium">
                      Permanently remove "{scope?.name}"? History will be preserved but the category grid will update.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2 pt-4">
                    <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteScope} className="bg-destructive hover:bg-destructive/90 rounded-2xl">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DrawerClose asChild><Button variant="outline" className="rounded-2xl h-12">Cancel</Button></DrawerClose>
              <Button type="submit" className="btn-premium h-12 px-8 shadow-glow">
                <Save className="w-5 h-5 mr-2" />Save
              </Button>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}