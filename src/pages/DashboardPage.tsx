import React, { useState, useEffect } from 'react';
import { Plus, Wallet, PlusCircle } from 'lucide-react';
import { useBudgetStore, useIsLoading, useFormatAmount, useBills, useScopes, type ScopeWithIcon } from '@/lib/store';
import { ScopeCard, ScopeCardSkeleton } from '@/components/budget/ScopeCard';
import { BillCard, BillCardSkeleton } from '@/components/budget/BillCard';
import { AddExpenseDrawer } from '@/components/budget/AddExpenseDrawer';
import { AddBillDrawer } from '@/components/budget/AddBillDrawer';
import { AddScopeDrawer } from '@/components/budget/AddScopeDrawer';
import { EditScopeDrawer } from '@/components/budget/EditScopeDrawer';
import { EditBillDrawer } from '@/components/budget/EditBillDrawer';
import { OnboardingModal } from '@/components/budget/OnboardingModal';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { MonthlyOverviewCard, MonthlyOverviewCardSkeleton } from '@/components/budget/MonthlyOverviewCard';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Bill } from '@shared/types';
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    loadData();
    const onboarded = localStorage.getItem('spendscope-onboarded');
    if (!onboarded) {
      setShowOnboarding(true);
    }
  }, [loadData]);
  const totalLimit = React.useMemo(() =>
    scopes.reduce((sum, s) => sum + s.dailyLimit, 0),
  [scopes]);
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        ease: "easeOut"
      }
    }
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: "circOut"
      }
    }
  };
  return (
    <div className="relative min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-background/50 backdrop-blur-lg border-b border-border/10 flex items-center justify-end px-6 md:px-12 gap-2">
        <CurrencySelector className="relative top-0 right-0" />
        <ThemeToggle className="relative top-0 right-0" />
      </header>
      <main className="pt-10 pb-32">
        <div className="flex flex-col gap-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h1 className="text-5xl font-black tracking-tighter text-foreground">
              Spend<span className="text-spendscope-500">Scope</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="text-label">Daily Budget</span>
              <span className="text-lg font-black">{formatAmount(totalLimit)}</span>
            </div>
          </motion.div>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loader" exit={{ opacity: 0 }} className="space-y-12">
                <MonthlyOverviewCardSkeleton />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  <motion.div variants={itemVariants} className="text-center py-24 glass rounded-3xl border border-dashed border-border/60">
                    <Wallet className="mx-auto h-16 w-16 text-muted-foreground/30 mb-6" />
                    <h3 className="text-2xl font-black mb-3">Initialize Your Scope</h3>
                    <p className="text-muted-foreground mb-8 max-w-xs mx-auto">Create your first category to start tracking your daily spending limits.</p>
                    <Button onClick={() => setIsAddScopeDrawerOpen(true)} className="btn-spendscope">
                      New Category
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <div className="space-y-8">
                      <div className="flex items-end justify-between px-2">
                        <div>
                          <h2 className="text-3xl font-black tracking-tighter">Categories</h2>
                          <p className="text-label mt-1">Daily Allowance</p>
                        </div>
                        <Button variant="ghost" size="sm" className="font-bold text-spendscope-600 dark:text-spendscope-400" onClick={() => setIsAddScopeDrawerOpen(true)}>
                          <PlusCircle className="w-4 h-4 mr-2" /> Add New
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {scopes.map((scope) => (
                          <motion.div key={scope.id} variants={itemVariants}>
                            <ScopeCard scope={scope} onEdit={setEditingScope} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div className="flex items-end justify-between px-2">
                        <div>
                          <h2 className="text-3xl font-black tracking-tighter">Monthly Bills</h2>
                          <p className="text-label mt-1">Fixed Recurring Expenses</p>
                        </div>
                        <Button variant="ghost" size="sm" className="font-bold text-spendscope-600 dark:text-spendscope-400" onClick={() => setIsAddBillDrawerOpen(true)}>
                          <PlusCircle className="w-4 h-4 mr-2" /> Add New
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {bills.map((bill) => (
                          <motion.div key={bill.id} variants={itemVariants}>
                            <BillCard bill={bill} onEdit={setEditingBill} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Button
        onClick={() => setIsAddDrawerOpen(true)}
        className="fixed bottom-10 right-10 h-16 w-16 rounded-full bg-spendscope-500 hover:bg-spendscope-600 text-white shadow-2xl shadow-spendscope-500/40 z-50 transition-transform active:scale-90"
        size="icon"
      >
        <Plus className="h-8 w-8" />
      </Button>
      <AddExpenseDrawer open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen} />
      <AddBillDrawer open={isAddBillDrawerOpen} onOpenChange={setIsAddBillDrawerOpen} />
      <AddScopeDrawer open={isAddScopeDrawerOpen} onOpenChange={setIsAddScopeDrawerOpen} />
      <EditScopeDrawer open={!!editingScope} onOpenChange={() => setEditingScope(null)} scope={editingScope} />
      <EditBillDrawer open={!!editingBill} onOpenChange={() => setEditingBill(null)} bill={editingBill} />
      <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <Toaster richColors position="top-center" />
    </div>
  );
}