import React, { useState, useEffect } from 'react';
import { Plus, Wallet, LogOut } from 'lucide-react';
import { useBudgetStore, ScopeWithIcon, useIsLoading, useFormatAmount, useBills, useUserId } from '@/lib/store';
import { ScopeCard, ScopeCardSkeleton } from '@/components/budget/ScopeCard';
import { BillCard, BillCardSkeleton } from '@/components/budget/BillCard';
import { AddExpenseDrawer } from '@/components/budget/AddExpenseDrawer';
import { AddBillDrawer } from '@/components/budget/AddBillDrawer';
import { AddScopeDrawer } from '@/components/budget/AddScopeDrawer';
import { EditScopeDrawer } from '@/components/budget/EditScopeDrawer';
import { EditBillDrawer } from '@/components/budget/EditBillDrawer';
import { OnboardingModal } from '@/components/budget/OnboardingModal';
import { LoginGate } from '@/components/budget/LoginGate';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { MonthlyOverviewCard, MonthlyOverviewCardSkeleton } from '@/components/budget/MonthlyOverviewCard';
import { MonthlyScopeCard, MonthlyScopeCardSkeleton } from '@/components/budget/MonthlyScopeCard';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Bill } from '@shared/types';
export function DashboardPage() {
  const scopes = useBudgetStore(state => state.scopes);
  const bills = useBills();
  const initialized = useBudgetStore(state => state.initialized);
  const initAuth = useBudgetStore(state => state.initAuth);
  const loadData = useBudgetStore(state => state.loadData);
  const logout = useBudgetStore(state => state.logout);
  const isLoading = useIsLoading();
  const formatAmount = useFormatAmount();
  const userId = useUserId();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isAddBillDrawerOpen, setIsAddBillDrawerOpen] = useState(false);
  const [isAddScopeDrawerOpen, setIsAddScopeDrawerOpen] = useState(false);
  const [editingScope, setEditingScope] = useState<ScopeWithIcon | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (!initialized) {
      initAuth();
    }
  }, [initialized, initAuth]);
  useEffect(() => {
    if (userId) {
      const hasOnboarded = localStorage.getItem('spendscope-onboarded') === 'true';
      if (!hasOnboarded) {
        setShowOnboarding(true);
      }
      loadData();
    }
  }, [userId, loadData]);
  const handleOnboardingClose = () => {
    localStorage.setItem('spendscope-onboarded', 'true');
    setShowOnboarding(false);
  };
  if (!initialized) {
    // Render a minimal loading state while checking auth, prevents flicker
    return <div className="min-h-screen w-full bg-background" />;
  }
  if (!userId) {
    return <LoginGate />;
  }
  const totalLimit = scopes.reduce((sum, s) => sum + s.dailyLimit, 0);
  const containerVariants = { visible: { transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } } };
  return (
    <div className="min-h-screen w-full bg-background text-foreground relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <ThemeToggle className="fixed top-4 right-4 z-50" />
      <CurrencySelector className="fixed top-4 right-20 z-50" />
      <Button onClick={logout} variant="ghost" size="icon" title="Logout" className="fixed top-4 right-44 sm:right-48 z-50">
        <LogOut className="h-5 w-5" />
      </Button>
      <OnboardingModal open={showOnboarding} onClose={handleOnboardingClose} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="text-center mb-12">
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Daily SpendScope</motion.h1>
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">Your real-time guide to daily spending. Total daily budget: <span className="text-gradient font-bold">{formatAmount(totalLimit)}</span></motion.p>
          </div>
          <AnimatePresence>
            {isLoading ? (
              <motion.div key="loader" exit={{ opacity: 0 }}>
                <MonthlyOverviewCardSkeleton />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-16">
                  {[...Array(3)].map((_, i) => <ScopeCardSkeleton key={i} />)}
                </div>
              </motion.div>
            ) : (
              <>
                <MonthlyOverviewCard />
                {scopes.length === 0 && bills.length === 0 ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 px-4 border-2 border-dashed rounded-lg mt-16">
                    <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold text-foreground">Welcome to SpendScope!</h3>
                    <p className="mt-2 text-muted-foreground">Go to Settings to add your first category or bill.</p>
                  </motion.div>
                ) : (
                  <>
                    {scopes.length > 0 && (
                      <>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-bold text-foreground mb-8 mt-16 text-center">Daily Budgets</motion.h2>
                        <motion.div key="scopes" initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {scopes.map((scope) => (<motion.div key={scope.id} variants={itemVariants}><ScopeCard scope={scope} onEdit={setEditingScope} /></motion.div>))}
                        </motion.div>
                        <div className="flex flex-col xs:flex-row gap-3 md:justify-end mt-6 md:mt-8 lg:mt-10 items-end">
                            <motion.div key="daily-fab" initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 50 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }} className="h-14 w-14 md:h-12 md:w-12">
                              <Button onClick={() => setIsAddDrawerOpen(true)} className="h-full w-full rounded-full bg-secondary/80 hover:bg-secondary/90 text-secondary-foreground shadow-lg border-2 border-border/30 backdrop-blur-sm hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300" size="lg" aria-label="Add Daily Expense">
                                <Plus className="h-5 w-5" />
                              </Button>
                            </motion.div>
                        </div>
                      </>
                    )}
                    {bills.length > 0 && (
                      <>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-bold text-foreground mb-8 mt-16 text-center">Fixed Monthly Bills</motion.h2>
                        <motion.div key="bills" initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {bills.map((bill) => (<motion.div key={bill.id} variants={itemVariants}><BillCard bill={bill} onEdit={setEditingBill} /></motion.div>))}
                        </motion.div>
                        <div className="flex flex-col xs:flex-row gap-3 md:justify-end mt-6 md:mt-8 lg:mt-10 items-end">
                            <motion.div key="bills-fab" initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 50 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }} className="h-14 w-14 md:h-12 md:w-12">
                              <Button onClick={() => setIsAddBillDrawerOpen(true)} className="h-full w-full rounded-full bg-secondary/80 hover:bg-secondary/90 text-secondary-foreground shadow-lg border-2 border-border/30 backdrop-blur-sm hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300" size="lg" aria-label="Add Bill">
                                <Plus className="h-5 w-5" />
                              </Button>
                            </motion.div>
                        </div>
                      </>
                    )}
                    {scopes.length > 0 && (
                      <>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-3xl font-bold text-foreground mb-8 mt-16 text-center">Monthly Budget Overview</motion.h2>
                        <motion.div key="monthly-scopes" initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {scopes.map((scope) => (<motion.div key={scope.id} variants={itemVariants}><MonthlyScopeCard scope={scope} onEdit={setEditingScope} /></motion.div>))}
                        </motion.div>
                        <div className="flex flex-col xs:flex-row gap-3 md:justify-end mt-6 md:mt-8 lg:mt-10 items-end">
                            <motion.div key="monthly-fab" initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 50 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }} className="h-14 w-14 md:h-12 md:w-12">
                              <Button onClick={() => setIsAddScopeDrawerOpen(true)} className="h-full w-full rounded-full bg-secondary/80 hover:bg-secondary/90 text-secondary-foreground shadow-lg border-2 border-border/30 backdrop-blur-sm hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300" size="lg" aria-label="Add Category">
                                <Plus className="h-5 w-5" />
                              </Button>
                            </motion.div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Button onClick={() => setIsAddDrawerOpen(true)} className="fixed bottom-8 sm:bottom-6 right-6 h-16 w-16 min-h-[64px] sm:h-14 sm:w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 animate-pulse" size="icon"><Plus className="h-8 w-8" /><span className="sr-only">Add Expense</span></Button>
      <AddExpenseDrawer open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen} />
      <AddBillDrawer open={isAddBillDrawerOpen} onOpenChange={setIsAddBillDrawerOpen} />
      <AddScopeDrawer open={isAddScopeDrawerOpen} onOpenChange={setIsAddScopeDrawerOpen} />
      <EditScopeDrawer open={!!editingScope} onOpenChange={() => setEditingScope(null)} scope={editingScope} />
      <EditBillDrawer open={!!editingBill} onOpenChange={() => setEditingBill(null)} bill={editingBill} />
      <Toaster richColors />
    </div>
  );
}