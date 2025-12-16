import React, { useState } from 'react';
import { useBudgetStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Save, PlusCircle } from 'lucide-react';
import { Scope } from '@/types/domain';
export function CategoryManager() {
  const { scopes, updateScope } = useBudgetStore();
  const [editingScopeId, setEditingScopeId] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState<number>(0);
  const handleEdit = (scope: Scope) => {
    setEditingScopeId(scope.id);
    setNewLimit(scope.dailyLimit);
  };
  const handleSave = (scope: Scope) => {
    updateScope({ ...scope, dailyLimit: newLimit });
    setEditingScopeId(null);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Scopes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scopes.map((scope) => (
            <div key={scope.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {typeof scope.icon !== 'string' && <scope.icon className="w-5 h-5 text-muted-foreground" />}
                <span className="font-medium">{scope.name}</span>
              </div>
              <div className="flex items-center gap-4">
                {editingScopeId === scope.id ? (
                  <Input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(parseFloat(e.target.value))}
                    className="w-24 h-9"
                  />
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
        {/* Add new scope functionality can be added here */}
      </CardContent>
    </Card>
  );
}