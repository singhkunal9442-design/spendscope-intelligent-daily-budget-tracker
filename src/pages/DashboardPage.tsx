import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Wallet } from 'lucide-react';
import { useBudgetStore } from '@/lib/store';
import { ScopeCard } from '@/components/budget/ScopeCard';
import { AddExpenseDrawer } from '@/components/budget/AddExpenseDrawer';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { MonthlyOverviewCard } from '@/components/budget/MonthlyOverviewCard';
export function DashboardPage() {
  const scopes = useBudgetStore(state => state.scopes);
  const loadData = useBudgetStore(state => state.loadData);
  const initialized = useBudgetStore(state => state.initialized);
  const loading = useBudgetStore(state => state.loading);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  useEffect(() => {
    loadData();
  }, [loadData]);
  const totalLimit = scopes.reduce((sum, s) => sum + s.dailyLimit, 0);
  return (
    <div className="min-h-screen w-full bg-background text-foreground relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <ThemeToggle className="fixed top-4 right-4 z-50" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Daily SpendScope
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Your real-time guide to daily spending. Total daily budget: <span className="text-gradient font-bold">${totalLimit.toFixed(2)}</span>
            </p>
          </div>
          <AnimatePresence>
            {!initialized || loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col justify-center items-center py-20 space-y-4"
              >
                <div className="flex items-center gap-3 text-primary">
                  <Wallet className="h-10 w-10" />
                  <Loader2 className="h-10 w-10 animate-spin" />
                </div>
                <p className="text-muted-foreground">Loading your budget...</p>
              </motion.div>
            ) : (
              <>
                <MonthlyOverviewCard />
                <motion.div
                  key="scopes"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.1 } },
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {scopes.map((scope) => (
                    <motion.div key={scope.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                      <ScopeCard scope={scope} />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 animate-pulse"
        size="icon"
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">Add Expense</span>
      </Button>
      <AddExpenseDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      <Toaster richColors />
    </div>
  );
}