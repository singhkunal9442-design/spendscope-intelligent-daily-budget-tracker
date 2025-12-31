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
import { HelpTooltip } from '@/components/HelpTooltip';
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
        staggerChildren: 0.05,
        ease: "easeOut"
      }
    }
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 relative min-h-screen bg-background text-foreground">
        <header className="fixed top-0 left-0 right-0 z-40 h-16 glass flex items-center justify-end px-6 md:px-12 gap-4">
          <CurrencySelector className="relative top-0 right-0" />
          <ThemeToggle className="relative top-0 right-0" />
        </header>
        <main className="pt-16 pb-32">
          <div className="flex flex-col gap-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-2">
                Spend<span className="text-spendscope-500">Scope</span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium">
                Daily Budget: <span className="text-foreground font-bold">{formatAmount(totalLimit)}</span>
              </p>
            </motion.div>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loader" exit={{ opacity: 0 }} className="space-y-10">
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
                  className="flex flex-col gap-12"
                >
                  <motion.div variants={itemVariants}>
                    <MonthlyOverviewCard />
                  </motion.div>
                  {scopes.length === 0 && bills.length === 0 ? (
                    <motion.div variants={itemVariants} className="text-center py-20 glass rounded-3xl border border-dashed border-border">
                      <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-bold mb-2">Welcome to SpendScope</h3>
                      <p className="text-muted-foreground mb-6">Create your first category to start tracking.</p>
                      <Button onClick={() => setIsAddScopeDrawerOpen(true)} className="btn-spendscope">
                        New Category
                      </Button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
                          <Button variant="outline" size="sm" onClick={() => setIsAddScopeDrawerOpen(true)}>
                            <PlusCircle className="w-4 h-4 mr-2" /> New
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
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold tracking-tight">Monthly Bills</h2>
                          <Button variant="outline" size="sm" onClick={() => setIsAddBillDrawerOpen(true)}>
                            <PlusCircle className="w-4 h-4 mr-2" /> New
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
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-spendscope-500 hover:bg-spendscope-600 text-white shadow-lg z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
        <AddExpenseDrawer open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen} />
        <AddBillDrawer open={isAddBillDrawerOpen} onOpenChange={setIsAddBillDrawerOpen} />
        <AddScopeDrawer open={isAddScopeDrawerOpen} onOpenChange={setIsAddScopeDrawerOpen} />
        <EditScopeDrawer open={!!editingScope} onOpenChange={() => setEditingScope(null)} scope={editingScope} />
        <EditBillDrawer open={!!editingBill} onOpenChange={() => setEditingBill(null)} bill={editingBill} />
        <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />
        <Toaster richColors position="top-center" />
      </div>
    </div>
  );
}