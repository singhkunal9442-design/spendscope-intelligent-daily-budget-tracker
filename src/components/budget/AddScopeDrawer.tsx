import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore } from '@/lib/store';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';
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
interface AddScopeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function AddScopeDrawer({ open, onOpenChange }: AddScopeDrawerProps) {
  const addScope = useBudgetStore(state => state.addScope);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ScopeFormData>({
    resolver: zodResolver(scopeSchema),
    defaultValues: {
      name: '',
      dailyLimit: 0,
      monthlyLimit: 0,
      icon: '',
      color: '',
    },
  });
  const onSubmit = async (data: ScopeFormData) => {
    const finalData = {
        ...data,
        monthlyLimit: data.monthlyLimit || data.dailyLimit * 30,
    };
    await addScope(finalData);
    toast.success(`Category "${data.name}" has been added.`);
    reset();
    onOpenChange(false);
  };
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="font-black tracking-tighter text-2xl">Add New Category</DrawerTitle>
            <DrawerDescription>Create a new spending category for your budget.</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 pb-0 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-label ml-1">Category Name</Label>
              <Controller name="name" control={control} render={({ field }) => <Input id="name" placeholder="e.g., Entertainment" {...field} className="h-12 rounded-2xl" />} />
              {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dailyLimit" className="text-label ml-1">Daily Limit</Label>
                    <Controller name="dailyLimit" control={control} render={({ field }) => (
                        <Input {...field} id="dailyLimit" type="number" step="0.01" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-12 rounded-2xl" />
                    )} />
                    {errors.dailyLimit && <p className="text-red-500 text-xs mt-1 ml-1">{errors.dailyLimit.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="monthlyLimit" className="text-label ml-1">Monthly (Opt.)</Label>
                    <Controller name="monthlyLimit" control={control} render={({ field }) => (
                        <Input {...field} id="monthlyLimit" type="number" step="0.01" placeholder="e.g., 300" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="h-12 rounded-2xl" />
                    )} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="icon" className="text-label ml-1">Icon</Label>
                    <Controller name="icon" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="Icon" /></SelectTrigger>
                            <SelectContent className="max-h-60">{iconPresets.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
                        </Select>
                    )} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="color" className="text-label ml-1">Color Theme</Label>
                    <Controller name="color" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="Color" /></SelectTrigger>
                            <SelectContent>{colorPresets.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}</SelectContent>
                        </Select>
                    )} />
                </div>
            </div>
            <DrawerFooter className="px-0 pb-8 pt-4">
              <Button type="submit" className="btn-premium h-14 w-full shadow-glow">
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Category
              </Button>
              <DrawerClose asChild><Button variant="outline" className="h-12 rounded-2xl">Cancel</Button></DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}