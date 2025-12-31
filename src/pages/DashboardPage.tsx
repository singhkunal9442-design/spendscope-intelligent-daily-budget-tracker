import React, { useState, useEffect } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { useBudgetStore, useIsLoading, useFormatAmount, useBills, useScopes } from '@/lib/store';
import { ScopeCard, ScopeCardSkeleton } from '@/components/budget/ScopeCard';
import { BillCard, BillCardSkeleton } from '@/components/budget/BillCard';
import { AddExpenseDrawer } from '@/components/budget/AddExpenseDrawer';
import { AddBillDrawer } from '@/components/budget/AddBillDrawer';
import { AddScopeDrawer } from '@/components/budget/AddScopeDrawer';
import { EditScopeDrawer } from '@/components/budget/EditScopeDrawer';
import { EditBillDrawer } from '@/components/budget/EditBillDrawer';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { MonthlyOverviewCard, MonthlyOverviewCardSkeleton } from '@/components/budget/MonthlyOverviewCard';
import { CurrencySelector } from '@/components/CurrencySelector';
import { HelpTooltip } from '@/components/HelpTooltip';
import { Bill, ScopeWithIcon } from '@shared/types';
export function DashboardPage() {
  const scopes = useScopes();
  const bills = useBills();
  const loadData = useBudgetStore(state => state.loadData);
  const isLoading = useIsLoading();
  const formatAmount = useFormatAmount();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isAddBillDrawerOpen, setIsAddBillDrawerOpen] = useState(false);
  const [isAddScopeDrawerOpen, setIsAddScopeDrawerOpen] = useState(false);
  const [editingScope, setEditingScope] = useState<ScopeWithIcon | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  useEffect(() => {
    loadData();
  }, [loadData]);
  const totalLimit = scopes.reduce((sum, s) => sum + s.dailyLimit, 0);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', damping: 20, stiffness: 100 } 
    }
  };
  return (
    <div className="min-h-screen w-full bg-background text-foreground relative selection:bg-spendscope-500 selection:text-white">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <header className="fixed top-0 left-0 right-0 z-40 h-16 glass flex items-center justify-end px-6 md:px-12 gap-4">
        <CurrencySelector className="relative top-0 right-0" />
        <ThemeToggle className="relative top-0 right-0" />
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="flex flex-col gap-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 mb-4 bg-spendscope-500/10 px-4 py-2 rounded-full ring-1 ring-spendscope-500/20">
              <span className="text-spendscope-500 font-bold text-sm tracking-wide uppercase">Your Financial Scope</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground mb-4">
              Spend<span className="text-gradient-spendscope">Scope</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Total daily budget: <span className="text-spendscope-600 font-black">{formatAmount(totalLimit)}</span>
            </p>
          </motion.div>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loader" exit={{ opacity: 0 }}>
                <MonthlyOverviewCardSkeleton />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-16">
                  {[...Array(3)].map((_, i) => <ScopeCardSkeleton key={i} />)}
                </div>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-16"
              >
                <motion.div variants={itemVariants}>
                  <MonthlyOverviewCard />
                </motion.div>
                {scopes.length === 0 && bills.length === 0 ? (
                  <motion.div variants={itemVariants} className="text-center py-24 px-8 glass rounded-[3rem] border-2 border-dashed border-spendscope-500/30">
                    <Wallet className="mx-auto h-16 w-16 text-spendscope-500/50 mb-6" />
                    <h3 className="text-2xl font-black text-foreground mb-2">Welcome to SpendScope!</h3>
                    <p className="text-muted-foreground mb-8 text-lg">Your dashboard is empty. Head to Settings to configure your categories.</p>
                    <Button 
                      onClick={() => setIsAddScopeDrawerOpen(true)}
                      className="btn-spendscope"
                    >
                      Create First Category
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    {scopes.length > 0 && (
                      <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-4">
                          <h2 className="text-3xl font-black text-foreground">Daily Budgets</h2>
                          <HelpTooltip message="Manage your daily category limits. Cards turn amber and red as you reach your limit." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                          {scopes.map((scope) => (
                            <motion.div key={scope.id} variants={itemVariants}>
                              <ScopeCard scope={scope as any} onEdit={(s) => setEditingScope(s as any)} />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                    {bills.length > 0 && (
                      <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-4">
                          <h2 className="text-3xl font-black text-foreground text-center">Fixed Monthly Bills</h2>
                          <HelpTooltip message="Recurring monthly expenses. Mark them as paid to clear your monthly overview." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                          {bills.map((bill) => (
                            <motion.div key={bill.id} variants={itemVariants}>
                              <BillCard bill={bill} onEdit={setEditingBill} />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Button
        onClick={() => setIsAddDrawerOpen(true)}
        className="fixed bottom-10 right-10 h-20 w-20 rounded-full btn-spendscope shadow-glow z-50 p-0"
        size="icon"
      >
        <Plus className="h-10 w-10" />
        <span className="sr-only">Add Expense</span>
      </Button>
      <AddExpenseDrawer open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen} />
      <AddBillDrawer open={isAddBillDrawerOpen} onOpenChange={setIsAddBillDrawerOpen} />
      <AddScopeDrawer open={isAddScopeDrawerOpen} onOpenChange={setIsAddScopeDrawerOpen} />
      <EditScopeDrawer open={!!editingScope} onOpenChange={() => setEditingScope(null)} scope={editingScope as any} />
      <EditBillDrawer open={!!editingBill} onOpenChange={() => setEditingBill(null)} bill={editingBill} />
      <Toaster richColors position="top-center" />
    </div>
  );
}