import React, { useState } from 'react';
import { useBudgetStore, useScopes, type ScopeWithIcon } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, Save, Trash2, PlusCircle, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn, getScopeColorClasses } from '@/lib/utils';
import { motion } from 'framer-motion';
const iconPresets = ['Coffee', 'ShoppingCart', 'Utensils', 'Car', 'Home', 'CreditCard', 'DollarSign', 'Gift', 'Heart', 'Plane', 'BookOpen', 'Briefcase', 'Film', 'Gamepad2', 'Music'];
const colorPresets = ['emerald', 'sky', 'amber', 'rose', 'violet', 'indigo', 'cyan', 'fuchsia'];
const scopeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dailyLimit: z.number().min(0, 'Limit must be non-negative'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
});
type ScopeFormData = z.infer<typeof scopeSchema>;
const shakeVariants = {
  hover: {
    scale: [1, 1.1, 0.9, 1.05, 1],
    rotate: [0, 2, -2, 1, -1, 0],
    transition: { duration: 0.4 }
  }
};
const EditScopeForm = ({ scope, onSave, onCancel }: { scope: ScopeWithIcon, onSave: (data: ScopeFormData) => void, onCancel: () => void }) => {
  const { control, handleSubmit } = useForm<ScopeFormData>({
    resolver: zodResolver(scopeSchema),
    defaultValues: {
      name: scope.name,
      dailyLimit: scope.dailyLimit,
      icon: scope.iconName,
      color: scope.color,
    },
  });
  return (
    <form onSubmit={handleSubmit(onSave)} className="p-6 bg-muted/30 border border-border/10 rounded-3xl space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller name="name" control={control} render={({ field }) => <Input placeholder="Category Name" {...field} className="h-12 rounded-2xl" />} />
        <Controller name="dailyLimit" control={control} render={({ field }) => <Input type="number" placeholder="Daily Limit" {...field} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value) || 0)} className="h-12 rounded-2xl" />} />
        <Controller name="icon" control={control} render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="Select Icon" /></SelectTrigger>
            <SelectContent className="max-h-60">{iconPresets.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
          </Select>
        )} />
        <Controller name="color" control={control} render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="Select Color" /></SelectTrigger>
            <SelectContent>{colorPresets.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}</SelectContent>
          </Select>
        )} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="rounded-xl h-10 px-4">Cancel</Button>
        <Button type="submit" size="sm" className="btn-premium h-10 px-8"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
      </div>
    </form>
  );
};
export function CategoryManager() {
  const scopes = useScopes();
  const addScope = useBudgetStore(state => state.addScope);
  const updateScopeFull = useBudgetStore(state => state.updateScopeFull);
  const deleteScope = useBudgetStore(state => state.deleteScope);
  const [editingScopeId, setEditingScopeId] = useState<string | null>(null);
  const { control, handleSubmit, reset } = useForm<ScopeFormData>({
    resolver: zodResolver(scopeSchema),
    defaultValues: { name: '', dailyLimit: 0, icon: 'Circle', color: 'emerald' },
  });
  const handleAddNewScope = async (data: ScopeFormData) => {
    await addScope(data);
    reset();
  };
  const handleSave = async (scopeId: string, data: ScopeFormData) => {
    await updateScopeFull(scopeId, data);
    setEditingScopeId(null);
  };
  return (
    <div className="space-y-8">
      <Card className="rounded-[2.5rem] border-border/40 shadow-glass overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="font-black tracking-tighter text-3xl">Add Category</CardTitle>
          <CardDescription>Define a new spending scope with a daily limit.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleAddNewScope)} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-label ml-1">Name</label>
              <Controller name="name" control={control} render={({ field }) => <Input placeholder="e.g. Dining" {...field} className="h-12 rounded-2xl" />} />
            </div>
            <div className="space-y-2">
              <label className="text-label ml-1">Daily Allowance</label>
              <Controller name="dailyLimit" control={control} render={({ field }) => <Input type="number" placeholder="0.00" {...field} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value) || 0)} className="h-12 rounded-2xl" />} />
            </div>
            <div className="space-y-2">
              <label className="text-label ml-1">Icon</label>
              <Controller name="icon" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="Icon" /></SelectTrigger>
                  <SelectContent className="max-h-60">{iconPresets.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-2">
              <label className="text-label ml-1">Color Theme</label>
              <Controller name="color" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="Color" /></SelectTrigger>
                  <SelectContent>{colorPresets.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
            <Button type="submit" className="md:col-span-2 btn-premium h-14 w-full shadow-glow text-lg">
              <PlusCircle className="w-6 h-6 mr-2" />Add New Category
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="rounded-[2.5rem] border-border/40 shadow-glass overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="font-black tracking-tighter text-3xl">Manage Scopes</CardTitle>
          <CardDescription>Adjust your active spending categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(!scopes || scopes.length === 0) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 border-2 border-dashed border-border/20 rounded-3xl">
                <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground/60 font-black uppercase tracking-widest text-xs">No active scopes found</p>
              </motion.div>
            )}
            {(scopes || []).map((scope) => {
              const colors = getScopeColorClasses(scope.color);
              const Icon = scope.icon;
              return editingScopeId === scope.id ? (
                <EditScopeForm key={scope.id} scope={scope} onSave={(data) => handleSave(scope.id, data)} onCancel={() => setEditingScopeId(null)} />
              ) : (
                <div key={scope.id} className="group flex items-center justify-between p-4 bg-muted/10 hover:bg-muted/30 backdrop-blur-sm rounded-2xl border border-border/10 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={cn('p-3 rounded-2xl border shadow-sm transition-all duration-300', colors.lightBg, colors.border, colors.glow)}>
                      <Icon className={cn('w-6 h-6', colors.text)} />
                    </div>
                    <div>
                      <span className="font-black text-lg tracking-tight">{scope.name}</span>
                      <p className="text-label">${scope.dailyLimit.toFixed(2)} / day</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" onClick={() => setEditingScopeId(scope.id)} className="h-10 w-10 rounded-xl hover:bg-muted/50 transition-colors"><Edit className="w-4 h-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <motion.div variants={shakeVariants} whileHover="hover">
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></Button>
                        </motion.div>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2.5rem] border-border/40 shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-black tracking-tighter text-2xl">Delete Scope?</AlertDialogTitle>
                          <AlertDialogDescription className="font-medium text-muted-foreground">
                            This will remove "{scope.name}" from your active dashboard. Historic ledger data remains for reporting.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2 pt-4">
                          <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteScope(scope.id)} className="bg-destructive hover:bg-destructive/90 rounded-2xl">Confirm Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}