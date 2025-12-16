import React, { useState } from 'react';
import { useBudgetStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, Save } from 'lucide-react';
import { Scope } from '@shared/types';
import { toast } from 'sonner';
export function CategoryManager() {
  const scopes = useBudgetStore(state => state.scopes);
  const updateScope = useBudgetStore(state => state.updateScope);
  const [editingScopeId, setEditingScopeId] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState<number>(0);
  const handleEdit = (scope: Scope) => {
    setEditingScopeId(scope.id);
    setNewLimit(scope.dailyLimit);
  };
  const handleSave = (scope: Scope) => {
    if (newLimit < 0) {
      toast.error("Daily limit cannot be negative.");
      return;
    }
    const scopeToUpdate = { ...scope, dailyLimit: newLimit };
    updateScope(scopeToUpdate);
    setEditingScopeId(null);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Scopes</CardTitle>
        <CardDescription>Set the daily spending limit for each category.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scopes.map((scope) => (
            <div key={scope.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <scope.icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{scope.name}</span>
              </div>
              <div className="flex items-center gap-4">
                {editingScopeId === scope.id ? (
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={newLimit}
                      onChange={(e) => setNewLimit(parseFloat(e.target.value) || 0)}
                      className="w-28 h-9 pl-6"
                      step="1"
                      min="0"
                    />
                  </div>
                ) : (
                  <span className="font-mono text-sm">${scope.dailyLimit.toFixed(2)}</span>
                )}
                {editingScopeId === scope.id ? (
                  <Button size="icon" variant="ghost" onClick={() => handleSave(scope)}>
                    <Save className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(scope)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}