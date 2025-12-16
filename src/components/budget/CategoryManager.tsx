import React, { useState } from 'react';
import { useBudgetStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, Save, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import * as lucideIcons from 'lucide-react';
const iconPresets = ['Coffee', 'ShoppingCart', 'Utensils', 'Car', 'Home', 'CreditCard', 'DollarSign', 'Gift', 'Heart', 'Plane'];
const colorPresets = ['emerald', 'sky', 'amber', 'rose', 'violet', 'indigo'];
const newScopeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dailyLimit: z.coerce.number().min(0, 'Limit must be non-negative'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
});
type NewScopeFormData = z.infer<typeof newScopeSchema>;
export function CategoryManager() {
  const scopes = useBudgetStore(state => state.scopes);
  const addScope = useBudgetStore(state => state.addScope);
  const updateScope = useBudgetStore(state => state.updateScope);
  const deleteScope = useBudgetStore(state => state.deleteScope);
  const [editingScopeId, setEditingScopeId] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState<number>(0);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<NewScopeFormData>({
    resolver: zodResolver(newScopeSchema),
    defaultValues: { name: '', dailyLimit: 0, icon: '', color: '' },
  });
  const handleAddNewScope = (data: NewScopeFormData) => {
    addScope(data);
    reset();
  };
  const handleEdit = (scope: { id: string; dailyLimit: number }) => {
    setEditingScopeId(scope.id);
    setNewLimit(scope.dailyLimit);
  };
  const handleSave = (scopeId: string) => {
    if (newLimit < 0) {
      toast.error("Daily limit cannot be negative.");
      return;
    }
    updateScope(scopeId, newLimit);
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
            <Controller name="dailyLimit" control={control} render={({ field }) => <Input type="number" placeholder="Daily Limit" {...field} />} />
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
            <Button type="submit" className="md:col-span-2"><PlusCircle className="w-4 h-4 mr-2" />Add Category</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>Set the daily spending limit for each category.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scopes.map((scope) => {
              const Icon = (lucideIcons as any)[scope.icon.displayName || 'Circle'];
              return (
                <div key={scope.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{scope.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingScopeId === scope.id ? (
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input type="number" value={newLimit} onChange={(e) => setNewLimit(parseFloat(e.target.value) || 0)} className="w-28 h-9 pl-6" step="1" min="0" />
                      </div>
                    ) : (
                      <span className="font-mono text-sm">${scope.dailyLimit.toFixed(2)}</span>
                    )}
                    {editingScopeId === scope.id ? (
                      <Button size="icon" variant="ghost" onClick={() => handleSave(scope.id)}><Save className="w-4 h-4" /></Button>
                    ) : (
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(scope)}><Edit className="w-4 h-4" /></Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete the "{scope.name}" category and its associated data.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteScope(scope.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}