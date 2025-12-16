import React, { useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore, ScopeWithIcon, useSpentToday, useSpentAllTime } from '@/lib/store';
import { Save, X, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
const iconPresets = ['Coffee', 'ShoppingCart', 'Utensils', 'Car', 'Home', 'CreditCard', 'DollarSign', 'Gift', 'Heart', 'Plane', 'BookOpen', 'Briefcase', 'Film', 'Gamepad2', 'Music'];
const colorPresets = ['emerald', 'sky', 'amber', 'rose', 'violet', 'indigo', 'cyan', 'fuchsia'];
const scopeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dailyLimit: z.number().min(0, 'Limit must be non-negative'),
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
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
const SpendingStats = ({ scope }: { scope: ScopeWithIcon }) => {
  const spentToday = useSpentToday(scope.id);
  const allTimeSpent = useSpentAllTime(scope.id);
  const remaining = scope.dailyLimit - spentToday;
  const percentage = scope.dailyLimit > 0 ? Math.min((spentToday / scope.dailyLimit) * 100, 100) : 0;
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
              <span className="font-bold text-foreground">{currencyFormatter.format(spentToday)} / {currencyFormatter.format(scope.dailyLimit)}</span>
            </div>
            <Progress value={percentage} className={cn("h-2 mt-1", getProgressColor(percentage))} />
            <div className="flex justify-between text-sm font-medium pt-1">
              <span className="text-muted-foreground">Remaining Today</span>
              <motion.span className={cn('font-bold', remaining < 0 ? 'text-red-500' : 'text-emerald-500')} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.3 }} key={remaining}>
                {currencyFormatter.format(remaining)}
              </motion.span>
            </div>
          </div>
          <div className="border-t border-border/50 pt-2">
             <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Lifetime Spent</span>
                <span className="font-bold">{currencyFormatter.format(allTimeSpent)}</span>
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
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ScopeFormData>({
    resolver: zodResolver(scopeSchema),
  });
  const { control: miniControl, handleSubmit: miniHandleSubmit, reset: resetMiniForm, formState: { errors: miniErrors } } = useForm<ExpenseMiniFormData>({
    resolver: zodResolver(expenseMiniSchema),
    defaultValues: { amount: 0, description: '' },
  });
  useEffect(() => {
    if (scope) {
      reset({
        name: scope.name,
        dailyLimit: scope.dailyLimit,
        icon: (scope.icon as any).displayName || 'Circle',
        color: scope.color,
      });
    } else {
      reset({ name: '', dailyLimit: 0, icon: '', color: '' });
    }
  }, [scope, reset]);
  const onFullSubmit = (data: ScopeFormData) => {
    if (!scope) return;
    updateScopeFull(scope.id, data);
    onOpenChange(false);
  };
  const onMiniSubmit = (data: ExpenseMiniFormData) => {
    if (!scope) return;
    addTransaction({ ...data, scopeId: scope.id });
    toast.success(`${data.amount.toFixed(2)} added to ${scope.name}`);
    resetMiniForm();
  };
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      resetMiniForm();
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
            {scope ? <SpendingStats scope={scope} /> : <SpendingStatsSkeleton />}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="quick-add" className="border-none">
                <Card className="backdrop-blur-xl bg-card/60 border-border/20">
                  <AccordionTrigger className="p-3 text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4" />
                      <span>Quick Add Expense</span>
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
                      <Button type="submit" size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 transition-all hover:scale-105 active:scale-95">Add Expense</Button>
                    </form>
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
              <div>
                <Label htmlFor="dailyLimit">Daily Limit ($)</Label>
                <Controller name="dailyLimit" control={control} render={({ field }) => (
                    <Input {...field} id="dailyLimit" type="number" step="0.01" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                )} />
                {errors.dailyLimit && <p className="text-red-500 text-sm mt-1">{errors.dailyLimit.message}</p>}
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