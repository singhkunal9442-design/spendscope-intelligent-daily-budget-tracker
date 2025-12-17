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
  const onSubmit = (data: ScopeFormData) => {
    const finalData = {
        ...data,
        monthlyLimit: data.monthlyLimit || data.dailyLimit * 30,
    };
    addScope(finalData);
    toast.success(`Category "${data.name}" has been added.`);
    reset();
    onOpenChange(false);
  };
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add New Category</DrawerTitle>
            <DrawerDescription>Create a new spending category for your budget.</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 pb-0 space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Controller name="name" control={control} render={({ field }) => <Input id="name" placeholder="e.g., Entertainment" {...field} />} />
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
                    <Label htmlFor="monthlyLimit">Monthly (Opt.)</Label>
                    <Controller name="monthlyLimit" control={control} render={({ field }) => (
                        <Input {...field} id="monthlyLimit" type="number" step="0.01" placeholder="e.g., 300" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    )} />
                    {errors.monthlyLimit && <p className="text-red-500 text-sm mt-1">{errors.monthlyLimit.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            <DrawerFooter>
              <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 transition-all hover:scale-105 active:scale-95">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Category
              </Button>
              <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}