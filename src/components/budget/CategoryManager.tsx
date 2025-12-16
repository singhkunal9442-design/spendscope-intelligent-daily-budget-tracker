import React, { useState } from 'react';
import { useBudgetStore, ScopeWithIcon } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, Save, Trash2, PlusCircle, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import * as lucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
const iconPresets = ['Coffee', 'ShoppingCart', 'Utensils', 'Car', 'Home', 'CreditCard', 'DollarSign', 'Gift', 'Heart', 'Plane', 'BookOpen', 'Briefcase', 'Film', 'Gamepad2', 'Music'];
const colorPresets = ['emerald', 'sky', 'amber', 'rose', 'violet', 'indigo', 'cyan', 'fuchsia'];
const scopeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dailyLimit: z.number().min(0, 'Limit must be non-negative'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
});
type ScopeFormData = z.infer<typeof scopeSchema>;
const EditScopeForm = ({ scope, onSave, onCancel }: { scope: ScopeWithIcon, onSave: (data: ScopeFormData) => void, onCancel: () => void }) => {
  const { control, handleSubmit } = useForm<ScopeFormData>({
    resolver: zodResolver(scopeSchema),
    defaultValues: {
      name: scope.name,
      dailyLimit: scope.dailyLimit,
      icon: scope.icon.displayName || 'Circle',
      color: scope.color,
    },
  });
  return (
    <form onSubmit={handleSubmit(onSave)} className="p-3 bg-muted/50 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller name="name" control={control} render={({ field }) => <Input placeholder="Category Name" {...field} />} />
        <Controller name="dailyLimit" control={control} render={({ field }) => <Input type="number" placeholder="Daily Limit" {...field} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />} />
        <Controller name="icon" control={control} render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger><SelectValue placeholder="Select Icon" /></SelectTrigger>
            <SelectContent>{iconPresets.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
          </Select>
        )} />
        <Controller name="color" control={control} render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger><SelectValue placeholder="Select Color" /></SelectTrigger>
            <SelectContent>{colorPresets.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}</SelectContent>
          </Select>
        )} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X className="w-4 h-4 mr-1" />Cancel</Button>
        <Button type="submit" size="sm" className="bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600"><Save className="w-4 h-4 mr-1" />Save</Button>
      </div>
    </form>
  );
};
export function CategoryManager() {
  const scopes = useBudgetStore(state => state.scopes);
  const transactions = useBudgetStore(state => state.transactions);
  const addScope = useBudgetStore(state => state.addScope);
  const updateScopeFull = useBudgetStore(state => state.updateScopeFull);
  const deleteScope = useBudgetStore(state => state.deleteScope);
  const [editingScopeId, setEditingScopeId] = useState<string | null>(null);
  const { control, handleSubmit, reset } = useForm<ScopeFormData>({
    resolver: zodResolver(scopeSchema),
    defaultValues: { name: '', dailyLimit: 0, icon: '', color: '' },
  });
  const handleAddNewScope = (data: ScopeFormData) => {
    addScope(data);
    reset();
  };
  const handleSave = (scopeId: string, data: ScopeFormData) => {
    updateScopeFull(scopeId, data);
    setEditingScopeId(null);
  };
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleAddNewScope)} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <Controller name="name" control={control} render={({ field }) => <Input placeholder="Category Name" {...field} />} />
            <Controller name="dailyLimit" control={control} render={({ field }) => <Input type="number" placeholder="Daily Limit" {...field} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />} />
            <Controller name="icon" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select Icon" /></SelectTrigger>
                <SelectContent>{iconPresets.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
              </Select>
            )} />
            <Controller name="color" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select Color" /></SelectTrigger>
                <SelectContent>{colorPresets.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}</SelectContent>
              </Select>
            )} />
            <Button type="submit" className="md:col-span-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 transition-all hover:scale-105 active:scale-95"><PlusCircle className="w-4 h-4 mr-2" />Add Category</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>Set the daily spending limit for each category.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {scopes.map((scope) => (
              editingScopeId === scope.id ? (
                <EditScopeForm key={scope.id} scope={scope} onSave={(data) => handleSave(scope.id, data)} onCancel={() => setEditingScopeId(null)} />
              ) : (
                <div key={scope.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-1.5 rounded-md', `bg-${scope.color}-100 dark:bg-${scope.color}-900/50`)}>
                      <scope.icon className={cn('w-5 h-5', `text-${scope.color}-600 dark:text-${scope.color}-400`)} />
                    </div>
                    <div>
                      <span className="font-medium">{scope.name}</span>
                      <p className="text-sm text-muted-foreground">${scope.dailyLimit.toFixed(2)} / day</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setEditingScopeId(scope.id)} className="hover:text-primary transition-colors"><Edit className="w-4 h-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the "{scope.name}" category.
                            The {transactions.filter(t => t.scopeId === scope.id).length} transactions in this category will be preserved but uncategorized.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteScope(scope.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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