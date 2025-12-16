import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBudgetStore } from '@/lib/store';
import { Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});
type AuthFormData = z.infer<typeof authSchema>;
export function LoginForm() {
  const login = useBudgetStore(s => s.login);
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema)
  });
  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch (e) {
      console.error('[AUTH] Login failed:', e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 md:p-10 rounded-[2.5rem] glass-dark shadow-2xl border border-white/10"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tighter text-white mb-2">Welcome Back</h2>
        <p className="text-zinc-400 font-medium">Access your financial dashboard</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label 
            htmlFor="email" 
            className="text-white font-black uppercase tracking-widest text-[10px] ml-1 block"
          >
            Email Address
          </Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="name@example.com" 
            {...register('email')}
            className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-spendscope-500 focus:ring-spendscope-500/20 text-lg transition-all"
          />
          {errors.email && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label 
            htmlFor="password" 
            className="text-white font-black uppercase tracking-widest text-[10px] ml-1 block"
          >
            Secure Password
          </Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            {...register('password')}
            className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-spendscope-500 focus:ring-spendscope-500/20 text-lg transition-all"
          />
          {errors.password && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.password.message}</p>}
        </div>
        <Button 
          type="submit" 
          className="w-full h-14 btn-premium shadow-glow text-lg mt-4" 
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
export function SignupForm() {
  const registerAction = useBudgetStore(s => s.register);
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema)
  });
  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    try {
      await registerAction(data.email, data.password);
    } catch (e) {
      console.error('[AUTH] Registration failed:', e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 md:p-10 rounded-[2.5rem] glass-dark shadow-2xl border border-white/10"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tighter text-white mb-2">Create Account</h2>
        <p className="text-zinc-400 font-medium">Start tracking your scope today</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label 
            htmlFor="email-signup" 
            className="text-white font-black uppercase tracking-widest text-[10px] ml-1 block"
          >
            Email Address
          </Label>
          <Input 
            id="email-signup" 
            type="email" 
            placeholder="name@example.com" 
            {...register('email')}
            className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-spendscope-500 focus:ring-spendscope-500/20 text-lg transition-all"
          />
          {errors.email && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label 
            htmlFor="password-signup" 
            className="text-white font-black uppercase tracking-widest text-[10px] ml-1 block"
          >
            New Password
          </Label>
          <Input 
            id="password-signup" 
            type="password" 
            placeholder="••••••••" 
            {...register('password')}
            className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-spendscope-500 focus:ring-spendscope-500/20 text-lg transition-all"
          />
          {errors.password && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.password.message}</p>}
        </div>
        <Button 
          type="submit" 
          className="w-full h-14 btn-premium shadow-glow text-lg mt-4" 
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <>
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}