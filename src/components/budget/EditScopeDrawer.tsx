import React, { useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore, ScopeWithIcon } from '@/lib/store';
import { Save, X } from 'lucide-react';
import * as lucideIcons from 'lucide-react';
const iconPresets = ['Coffee', 'ShoppingCart', 'Utensils', 'Car', 'Home', 'CreditCard', 'DollarSign', 'Gift', 'Heart', 'Plane', 'BookOpen', 'Briefcase', 'Film', 'Gamepad2', 'Music'];
const colorPresets = ['emerald', 'sky', 'amber', 'rose', 'violet', 'indigo', 'cyan', 'fuchsia'];
const scopeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dailyLimit: z.number().min(0, 'Limit must be non-negative'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
});
type ScopeFormData = z.infer<typeof scopeSchema>;
interface EditScopeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: ScopeWithIcon | null;
}
export function EditScopeDrawer({ open, onOpenChange, scope }: EditScopeDrawerProps) {
  const updateScopeFull = useBudgetStore(state => state.updateScopeFull);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ScopeFormData>({
    resolver: zodResolver(scopeSchema),
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
  const onSubmit = (data: ScopeFormData) => {
    if (!scope) return;
    updateScopeFull(scope.id, data);
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
            <DrawerTitle>Edit Category</DrawerTitle>
            <DrawerDescription>Update the details for "{scope?.name}".</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 flex-grow flex flex-col space-y-4">
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} />} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="dailyLimit">Daily Limit ($)</Label>
                <Controller
                  name="dailyLimit"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="dailyLimit" type="number" step="0.01" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                  )}
                />
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
              <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 transition-all hover:scale-105 active:scale-95">
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