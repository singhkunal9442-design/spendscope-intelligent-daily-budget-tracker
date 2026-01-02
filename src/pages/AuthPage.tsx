import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudgetStore } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm, SignupForm } from '@/components/auth/AuthForms';
import { Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
export function AuthPage() {
  const navigate = useNavigate();
  const user = useBudgetStore(s => s.user);
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
      {/* Premium Mesh Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-mesh opacity-40" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-spendscope-500/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full animate-pulse delay-1000" />
      </div>
      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6 mb-12"
        >
          <div className="p-5 rounded-[2.5rem] bg-gradient-to-br from-spendscope-500 to-orange-600 text-white shadow-glow">
            <Wallet className="w-12 h-12" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gradient-orange py-2">
            SpendScope
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-white/5 border border-white/10 p-1.5 backdrop-blur-xl mb-6">
              <TabsTrigger 
                value="login" 
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-black font-black tracking-tight text-white transition-all py-3"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-black font-black tracking-tight text-white transition-all py-3"
              >
                Join Now
              </TabsTrigger>
            </TabsList>
            <AnimateTabsContent value="login">
              <LoginForm />
            </AnimateTabsContent>
            <AnimateTabsContent value="signup">
              <SignupForm />
            </AnimateTabsContent>
          </Tabs>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-sm font-bold tracking-widest uppercase text-zinc-500 max-w-xs"
        >
          Financial Intelligence Refined.
        </motion.p>
      </div>
    </div>
  );
}
function AnimateTabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsContent value={value} className="mt-0 outline-none focus-visible:ring-0">
      <motion.div
        initial={{ opacity: 0, x: value === 'login' ? -10 : 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </TabsContent>
  );
}