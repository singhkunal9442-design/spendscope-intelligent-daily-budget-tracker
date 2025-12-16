import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore } from '@/lib/store';
import { AuthCredentials } from '@shared/types';
import { toast } from 'sonner';
import { Loader2, Info } from 'lucide-react';
const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});
interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const AuthForm = ({ isRegister = false }: { isRegister?: boolean }) => {
  const login = useBudgetStore(state => state.login);
  const register = useBudgetStore(state => state.register);
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<AuthCredentials>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' },
  });
  const onSubmit = async (data: AuthCredentials) => {
    setIsLoading(true);
    try {
      if (isRegister) {
        await register(data);
      } else {
        await login(data);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isRegister ? 'register' : 'login'}.`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor={isRegister ? 'reg-email' : 'login-email'}>Email</Label>
        <Controller
          name="email"
          control={control}
          render={({ field }) => <Input id={isRegister ? 'reg-email' : 'login-email'} type="email" placeholder="you@example.com" {...field} />}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor={isRegister ? 'reg-password' : 'login-password'}>Password</Label>
        <Controller
          name="password"
          control={control}
          render={({ field }) => <Input id={isRegister ? 'reg-password' : 'login-password'} type="password" placeholder="••••••••" {...field} />}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isRegister ? 'Create Account' : 'Sign In'}
        </Button>
      </DialogFooter>
    </form>
  );
};
export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glassmorphic" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to SpendScope</DialogTitle>
          <DialogDescription>Sign in or create an account to manage your budget.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="pt-4">
            <AuthForm />
          </TabsContent>
          <TabsContent value="register" className="pt-4">
            <AuthForm isRegister />
          </TabsContent>
        </Tabs>
        <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Demo Account:</strong><br />
            Email: <code className="font-mono">demo@demo.com</code><br />
            Password: <code className="font-mono">demo</code>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}